import sql from '../config/db.js';
import AWS from 'aws-sdk';
import axios from 'axios';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'farmfi-images-2025';
const LAMBDA_URL = process.env.LAMBDA_URL;

// Process image upload, call Lambda, save prediction
export const processImagePrediction = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_id, crop_id } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    if (!field_id || !crop_id) {
      return res.status(400).json({ success: false, message: 'field_id and crop_id are required' });
    }

    // Validate crop belongs to farmer and is approved
    const crop = await sql`
      SELECT c.*, ct.crop_name
      FROM crop_data c
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      WHERE c.id = ${parseInt(crop_id)} 
      AND c.farmer_id = ${farmerId}
      AND c.field_id = ${parseInt(field_id)}
      AND c.status = 'admin_approved'
    `;

    if (crop.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid crop or crop not approved' 
      });
    }

    // Upload image to S3
    const timestamp = Date.now();
    const fileName = `predictions/${farmerId}_${crop_id}_${timestamp}.jpg`;
    
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: imageFile.buffer,
      ContentType: imageFile.mimetype,
      ACL: 'public-read'
    };

    const s3Result = await s3.upload(s3Params).promise();
    const imageUrl = s3Result.Location;

    // Call Lambda for disease detection
    if (!LAMBDA_URL) {
      // If no Lambda URL, return a mock response for testing
      console.warn('No LAMBDA_URL configured, using mock prediction');
      
      const mockPrediction = {
        predicted_disease: 'Tomato___Early_blight',
        confidence: 0.87,
        severity: 'medium',
        recommendations: 'Apply fungicide and remove affected leaves. Monitor closely.'
      };

      // Save prediction
      const result = await sql`
        INSERT INTO disease_predictions (
          farmer_id, field_id, crop_id, image_url, predicted_disease,
          confidence, recommendations, severity
        ) VALUES (
          ${farmerId}, ${parseInt(field_id)}, ${parseInt(crop_id)}, ${imageUrl}, ${mockPrediction.predicted_disease},
          ${mockPrediction.confidence}, ${mockPrediction.recommendations}, ${mockPrediction.severity}
        )
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Prediction saved successfully (mock mode)',
        data: result[0]
      });
    }

    // Call Lambda with image URL
    const lambdaPayload = {
      image_url: imageUrl,
      plant: crop[0].crop_name.toLowerCase()
    };

    const lambdaResponse = await axios.post(LAMBDA_URL, lambdaPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 second timeout
    });

    const prediction = lambdaResponse.data;
    
    // Determine severity based on confidence
    let severity = 'low';
    if (prediction.confidence > 0.85) severity = 'high';
    else if (prediction.confidence > 0.70) severity = 'medium';

    // Generate recommendations based on disease
    const recommendations = generateRecommendations(prediction.prediction, severity);

    // Save prediction to database
    const result = await sql`
      INSERT INTO disease_predictions (
        farmer_id, field_id, crop_id, image_url, predicted_disease,
        confidence, recommendations, severity
      ) VALUES (
        ${farmerId}, ${parseInt(field_id)}, ${parseInt(crop_id)}, ${imageUrl}, ${prediction.prediction},
        ${prediction.confidence}, ${recommendations}, ${severity}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Disease detection completed successfully',
      data: result[0]
    });

  } catch (error) {
    console.error('Process image prediction error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process image prediction'
    });
  }
};

// Helper function to generate recommendations
function generateRecommendations(disease, severity) {
  const recommendations = {
    high: [
      'Immediate action required.',
      'Apply appropriate fungicide/pesticide.',
      'Remove severely affected plants to prevent spread.',
      'Consult with agricultural extension officer.',
      'Ensure proper drainage and air circulation.'
    ],
    medium: [
      'Monitor the crop closely.',
      'Apply preventive fungicide spray.',
      'Remove affected leaves/parts.',
      'Improve field hygiene and sanitation.',
      'Maintain optimal watering schedule.'
    ],
    low: [
      'Continue regular monitoring.',
      'Maintain good crop hygiene.',
      'Ensure proper nutrition and watering.',
      'Apply organic preventive measures.',
      'Keep field clean and weed-free.'
    ]
  };

  const baseRecs = recommendations[severity] || recommendations.medium;
  return baseRecs.join(' ');
}
