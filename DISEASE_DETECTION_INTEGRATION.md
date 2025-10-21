# Disease Detection Lambda Integration

## Overview
The disease detection feature uses AWS Lambda with an ONNX model to predict plant diseases from uploaded images.

## Architecture Flow

```
Frontend (DiseaseDetection.jsx)
    ↓ Upload image + select field + select crop
Backend (fieldImageController.js)
    ↓ Process & send to Lambda
AWS Lambda (app_lambda.py)
    ↓ ONNX model prediction
Backend ← Response
    ↓ Save to database
Frontend ← Display result
```

## Request Format

### Frontend to Backend
```javascript
POST /api/images/upload-and-predict
Content-Type: multipart/form-data

{
  field_id: number,
  crop_id: number (optional),
  image: File
}
```

### Backend to Lambda
```javascript
POST https://fecil5ew47tajxpqobh45lar640pwlmv.lambda-url.us-east-1.on.aws/
Content-Type: application/json

{
  "image": "base64_encoded_image_string",
  "plant": "tomato|potato|maize|grape|apple|pepper|cherry|...",
  "mode": "predict"
}
```

### Lambda Response
```json
{
  "prediction": "Tomato___Early_blight",
  "confidence": 0.95
}
```

## Crop to Plant Mapping

The backend maps database crop names to Lambda plant names:

| Database Crop | Lambda Plant |
|--------------|-------------|
| Rice | rice (fallback) |
| Wheat | wheat (fallback) |
| Cotton | cotton (fallback) |
| Maize / Corn | maize / corn |
| Sugarcane | sugarcane (fallback) |
| Soybean | soybean |
| Groundnut | groundnut (fallback) |
| Tomato | tomato |
| Potato | potato |
| Grape | grape |
| Apple | apple |
| Pepper / Bell Pepper | pepper |
| Cherry | cherry |
| Blueberry | blueberry |
| Peach | peach |
| Raspberry | raspberry |
| Squash | squash |
| Strawberry | strawberry |
| Orange | orange |

**Note:** Crops marked as "fallback" are not in the model's training data. The Lambda will still process them but may return less accurate results.

## Supported Disease Classes

The Lambda model can detect 38 disease classes across 14 plant types:

### Apple (4 classes)
- Apple___Apple_scab
- Apple___Black_rot
- Apple___Cedar_apple_rust
- Apple___healthy

### Blueberry (1 class)
- Blueberry___healthy

### Cherry (2 classes)
- Cherry_(including_sour)___Powdery_mildew
- Cherry_(including_sour)___healthy

### Corn/Maize (4 classes)
- Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot
- Corn_(maize)___Common_rust_
- Corn_(maize)___Northern_Leaf_Blight
- Corn_(maize)___healthy

### Grape (4 classes)
- Grape___Black_rot
- Grape___Esca_(Black_Measles)
- Grape___Leaf_blight_(Isariopsis_Leaf_Spot)
- Grape___healthy

### Orange (1 class)
- Orange___Haunglongbing_(Citrus_greening)

### Peach (2 classes)
- Peach___Bacterial_spot
- Peach___healthy

### Pepper (2 classes)
- Pepper,_bell___Bacterial_spot
- Pepper,_bell___healthy

### Potato (3 classes)
- Potato___Early_blight
- Potato___Late_blight
- Potato___healthy

### Raspberry (1 class)
- Raspberry___healthy

### Soybean (1 class)
- Soybean___healthy

### Squash (1 class)
- Squash___Powdery_mildew

### Strawberry (2 classes)
- Strawberry___Leaf_scorch
- Strawberry___healthy

### Tomato (10 classes)
- Tomato___Bacterial_spot
- Tomato___Early_blight
- Tomato___Late_blight
- Tomato___Leaf_Mold
- Tomato___Septoria_leaf_spot
- Tomato___Spider_mites Two-spotted_spider_mite
- Tomato___Target_Spot
- Tomato___Tomato_Yellow_Leaf_Curl_Virus
- Tomato___Tomato_mosaic_virus
- Tomato___healthy

## Enhanced Features

### 1. Crop Selection
- User selects field → Shows only **currently growing crops** (current year)
- Filters out past crops (already harvested) and future crops (not yet planted)
- User must select specific crop before uploading image
- Crop selection ensures accurate disease detection with proper plant context

### 2. Current Crops Display
- Shows crop name, area, year, and season
- **Only displays crops for current year** (actively growing)
- Color-coded season badges (Kharif/Rabi/Whole Year)
- Real-time loading state
- Clear messaging when no current crops exist

### 3. Error Handling
- File type validation (JPEG/PNG only)
- Field verification check
- Crop verification check
- Lambda response validation
- Network error handling
- User-friendly error messages

### 4. Image Upload
- Drag & drop support
- File preview
- Size limits (10MB)
- Format validation

### 5. S3 Integration
- Images stored in S3 bucket
- Signed URLs for secure access
- 24-hour URL expiry
- Private bucket configuration

### 6. Database Records
- `field_images` table stores uploaded images
- `disease_detections` table stores predictions
- Links to fields and farmers
- Timestamp tracking
- History tracking

## Testing the Integration

### 1. Check Lambda Status
```bash
curl -X POST https://fecil5ew47tajxpqobh45lar640pwlmv.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"image":"test","plant":"tomato","mode":"predict"}'
```

### 2. Test Backend Endpoint
```bash
# Upload test image through Postman
POST http://localhost:5000/api/images/upload-and-predict
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
Body:
  - field_id: 1
  - crop_id: 5
  - image: [select file]
```

### 3. Monitor Backend Logs
```bash
# Backend will log:
# - "Crop: Tomato -> Plant for Lambda: tomato"
# - "Sending prediction request to Lambda..."
# - "Lambda response: {prediction: '...', confidence: 0.xx}"
```

## Troubleshooting

### Issue: "No verified crop found"
**Solution:** Ensure the field has at least one verified crop entry in `crop_data` table.

### Issue: Lambda timeout
**Solution:** 
- Check Lambda function logs in AWS CloudWatch
- Verify Lambda has enough memory (recommend 1GB+)
- Ensure ONNX model file exists in Lambda layer

### Issue: Low confidence scores
**Solution:**
- Ensure image is clear and well-lit
- Crop should be one of the 14 supported types
- Image should show disease symptoms clearly

### Issue: "Could not detect disease"
**Solution:**
- Verify crop name mapping is correct
- Check Lambda logs for errors
- Ensure image format is valid (JPEG/PNG)

## Environment Variables

### Backend (.env)
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=farmfi-images-2025
```

### Lambda
```env
ONNX_MODEL_PATH=/opt/models/pretrained_model.onnx
```

## Future Enhancements

1. **Batch Prediction**: Upload multiple images at once
2. **Treatment Recommendations**: Add disease-specific treatment advice
3. **Severity Detection**: Classify disease severity (mild/moderate/severe)
4. **Crop-Specific Models**: Train separate models for Indian crops (rice, wheat, cotton)
5. **Real-time Detection**: Live camera feed analysis
6. **Historical Trends**: Track disease patterns over time
7. **Weather Integration**: Correlate diseases with weather conditions
8. **Notification System**: Alert farmers of detected diseases

## API Documentation

### Upload and Predict
**Endpoint:** `POST /api/images/upload-and-predict`

**Authentication:** Required (Bearer token)

**Request:**
```javascript
multipart/form-data
- field_id: integer (required) - ID of the field
- crop_id: integer (optional) - ID of specific crop to analyze
- image: file (required) - Image file (JPEG/PNG, max 10MB)
```

**Response Success (200):**
```json
{
  "success": true,
  "image_url": "https://farmfi-images-2025.s3.amazonaws.com/...",
  "prediction": "Tomato___Early_blight",
  "confidence": 0.95,
  "crop": "Tomato"
}
```

**Response Error (400/403/500):**
```json
{
  "error": "Error message description"
}
```

### Get Prediction History
**Endpoint:** `GET /api/images/history`

**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "image_id": 1,
    "image_url": "https://...",
    "captured_at": "2025-10-21T10:30:00Z",
    "field_id": 5,
    "field_name": "North Field",
    "disease_name": "Tomato___Early_blight",
    "confidence_score": 0.95,
    "detected_at": "2025-10-21T10:30:05Z",
    "recommendations": "Apply fungicide..."
  }
]
```

## Security Considerations

1. **S3 Bucket:** Private bucket with signed URLs
2. **Lambda URL:** Function URL with no authentication (consider adding API key)
3. **Image Validation:** Server-side file type and size checks
4. **Field Verification:** Only approved and verified fields
5. **JWT Authentication:** All endpoints protected with JWT
6. **SQL Injection:** Using parameterized queries with `@vercel/postgres`

## Performance Optimization

1. **Image Compression:** Consider compressing images before upload
2. **Lambda Cold Start:** Keep Lambda warm with scheduled pings
3. **S3 Caching:** Use CloudFront for faster image delivery
4. **Database Indexing:** Index on `field_id`, `farmer_id`, `detected_at`
5. **Connection Pooling:** Reuse database connections

---

**Last Updated:** October 21, 2025
**Version:** 1.0.0
