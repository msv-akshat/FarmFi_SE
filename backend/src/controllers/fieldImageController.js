import sql from '../config/db.js';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'farmfi-images-2025';

export const uploadAndPredict = async (req, res, next) => {
  try {
    const { field_id } = req.body;
    if (!field_id || !req.file) {
      return res.status(400).json({ error: "Field or image missing." });
    }

    // Accept only JPEG/PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Only JPG and PNG images are accepted." });
    }

    const [field] = await sql`
      SELECT id FROM fields WHERE id = ${field_id} AND status = 'approved' AND verified = true
    `;
    if (!field) return res.status(403).json({ error: "Field not approved/verified" });

    // Lookup latest verified crop for field
    const [cropRow] = await sql`
      SELECT c.name
      FROM crop_data cd
      JOIN crops c ON cd.crop_id = c.id
      WHERE cd.field_id = ${field_id}
        AND cd.verified = TRUE
      ORDER BY cd.crop_year DESC, cd.updated_at DESC
      LIMIT 1
    `;
    const cropName = cropRow?.name?.toLowerCase();
    if (!cropName) {
      return res.status(400).json({ error: "No crop found for this field. Please add crop data first." });
    }

    // Upload image to S3 (for logs/history)
    const s3Key = `images/${Date.now()}_${req.file.originalname}`;
    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();
    const s3Url = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

    // Save image record
    const [img] = await sql`
      INSERT INTO field_images (field_id, image_url, image_type)
      VALUES (${field_id}, ${s3Url}, 'leaf')
      RETURNING id
    `;
    const image_id = img.id;

    // Prepare base64 payload for Lambda
    const imageBase64 = req.file.buffer.toString('base64');
    const lambdaPayload = {
      image: imageBase64,
      plant: cropName,
      mode: 'predict'
    };

    // Predict with Lambda (send image data directly)
    const lambdaRes = await fetch('https://fecil5ew47tajxpqobh45lar640pwlmv.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lambdaPayload)
    });
    const body = await lambdaRes.json();
    const prediction = body?.prediction || 'Unknown';
    const confidence = body?.confidence || 0;

    await sql`
      INSERT INTO disease_detections (image_id, disease_name, confidence_score)
      VALUES (${image_id}, ${prediction}, ${confidence})
    `;

    // Create a signed S3 URL for live preview (private bucket)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Expires: 24 * 60 * 60 // 1 day validity
    });

    res.json({ success: true, image_url: signedUrl, prediction, confidence, crop: cropName });
  } catch (err) {
    console.error("uploadAndPredict error:", err);
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const rows = await sql`
    SELECT fi.image_url, fi.captured_at, f.field_name, dd.disease_name, dd.confidence_score, dd.detected_at
    FROM field_images fi
    JOIN fields f ON fi.field_id = f.id
    JOIN disease_detections dd ON dd.image_id = fi.id
    WHERE f.status = 'approved' AND f.verified = true
    ORDER BY dd.detected_at DESC
    `;

    // For each image, generate a signed URL
    const signedRows = rows.map(row => {
      const key = row.image_url.split('.com/')[1]; // Get just the path part
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: S3_BUCKET,
        Key: key,
        Expires: 24 * 60 * 60 // URL valid for 1 day
      });
      return { ...row, image_url: signedUrl };
    });

    res.json(signedRows);
  } catch (err) {
    console.error("getHistory error:", err);
    next(err);
  }
};
