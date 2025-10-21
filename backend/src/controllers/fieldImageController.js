import sql from '../config/db.js';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'farmfi-images-2025';

// Mapping from database crop names to Lambda plant names
const CROP_TO_PLANT_MAPPING = {
  'rice': 'rice', // Not in model but fallback
  'wheat': 'wheat', // Not in model but fallback
  'cotton': 'cotton', // Not in model but fallback
  'maize': 'maize',
  'corn': 'corn',
  'sugarcane': 'sugarcane', // Not in model but fallback
  'soybean': 'soybean',
  'groundnut': 'groundnut', // Not in model but fallback
  'tomato': 'tomato',
  'potato': 'potato',
  'grape': 'grape',
  'apple': 'apple',
  'pepper': 'pepper',
  'bell pepper': 'pepper',
  'cherry': 'cherry',
  'blueberry': 'blueberry',
  'peach': 'peach',
  'raspberry': 'raspberry',
  'squash': 'squash',
  'strawberry': 'strawberry',
  'orange': 'orange'
};

const mapCropToPlant = (cropName) => {
  const normalized = cropName.toLowerCase().trim();
  return CROP_TO_PLANT_MAPPING[normalized] || normalized;
};

export const uploadAndPredict = async (req, res, next) => {
  try {
    const { field_id, crop_id } = req.body;
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

    // Get crop name - use provided crop_id if available, otherwise get latest crop
    let cropRow;
    if (crop_id) {
      [cropRow] = await sql`
        SELECT c.name
        FROM crop_data cd
        JOIN crops c ON cd.crop_id = c.id
        WHERE cd.id = ${crop_id}
          AND cd.field_id = ${field_id}
          AND cd.verified = TRUE
        LIMIT 1
      `;
    } else {
      // Fallback to latest crop if no crop_id provided
      [cropRow] = await sql`
        SELECT c.name
        FROM crop_data cd
        JOIN crops c ON cd.crop_id = c.id
        WHERE cd.field_id = ${field_id}
          AND cd.verified = TRUE
        ORDER BY cd.crop_year DESC, cd.updated_at DESC
        LIMIT 1
      `;
    }

    if (!cropRow?.name) {
      return res.status(400).json({ error: "No verified crop found for this field. Please add crop data first." });
    }

    const cropName = cropRow.name;
    const plantName = mapCropToPlant(cropName);
    console.log(`Crop: ${cropName} -> Plant for Lambda: ${plantName}`);

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
      plant: plantName,
      mode: 'predict'
    };

    console.log(`Sending prediction request to Lambda for crop: ${cropName} (plant: ${plantName})`);

    // Predict with Lambda (send image data directly)
    const lambdaRes = await fetch('https://fecil5ew47tajxpqobh45lar640pwlmv.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lambdaPayload)
    });

    if (!lambdaRes.ok) {
      console.error('Lambda response error:', lambdaRes.status, lambdaRes.statusText);
      return res.status(500).json({ error: "Disease detection service failed. Please try again." });
    }

    const body = await lambdaRes.json();
    console.log('Lambda response:', body);

    if (body.error) {
      console.error('Lambda returned error:', body.error);
      return res.status(500).json({ error: body.error });
    }

    const prediction = body?.prediction || 'Unknown';
    const confidence = body?.confidence || 0;

    if (!prediction || prediction === 'Unknown') {
      return res.status(500).json({ error: "Could not detect disease. Please try with a clearer image." });
    }

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
    console.log('🔍 getHistory called, user:', req.user);
    console.log('   Farmer ID:', req.user?.id);
    
    const rows = await sql`
    SELECT 
      fi.id as image_id,
      fi.image_url, 
      fi.captured_at, 
      f.id as field_id,
      f.field_name, 
      dd.disease_name, 
      dd.confidence_score, 
      dd.detected_at,
      dd.suggested_action as recommendations
    FROM field_images fi
    JOIN fields f ON fi.field_id = f.id
    JOIN disease_detections dd ON dd.image_id = fi.id
    WHERE f.farmer_id = ${req.user.id}
    ORDER BY dd.detected_at DESC
    `;
    
    console.log(`   Query returned ${rows.length} rows`);

    // If no predictions yet, return empty array
    if (rows.length === 0) {
      return res.json([]);
    }

    // For each image, generate a signed URL
    const signedRows = rows.map(row => {
      try {
        // Extract the S3 key from the full URL
        const key = row.image_url.includes('.com/') 
          ? row.image_url.split('.com/')[1] 
          : row.image_url;
        
        const signedUrl = s3.getSignedUrl('getObject', {
          Bucket: S3_BUCKET,
          Key: key,
          Expires: 24 * 60 * 60 // URL valid for 1 day
        });
        return { ...row, image_url: signedUrl };
      } catch (urlError) {
        console.error('Error generating signed URL:', urlError);
        // Return row with original URL if signing fails
        return row;
      }
    });
    
    console.log(`   Returning ${signedRows.length} signed rows`);
    res.json(signedRows);
  } catch (err) {
    console.error("getHistory error:", err);
    console.error("Error details:", err.message);
    // Return empty array instead of error to prevent frontend crash
    res.json([]);
  }
};
