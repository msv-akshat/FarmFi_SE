# S3 Private Image Handling - Implementation Guide

## 🎯 Overview
Your S3 bucket is private, so images need temporary signed URLs to be viewed. This implementation provides three ways to handle S3 images:

---

## 📦 Backend Implementation

### 1. **S3 Utility Functions** (`backend/src/utils/s3.js`)

```javascript
import { generateSignedUrl } from '../utils/s3.js';

// Generate a single signed URL (expires in 1 hour by default)
const signedUrl = generateSignedUrl('path/to/image.jpg', 3600);

// Generate multiple signed URLs
const urls = generateSignedUrls(['image1.jpg', 'image2.jpg'], 3600);
```

### 2. **API Endpoints** (`/api/s3/...`)

#### Generate Single Signed URL
```http
POST /api/s3/signed-url
Content-Type: application/json

{
  "key": "disease-predictions/image.jpg",
  "expiresIn": 3600  // Optional, default 3600 (1 hour)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "disease-predictions/image.jpg",
    "signedUrl": "https://farmfi-images-2025.s3.amazonaws.com/...",
    "expiresIn": 3600
  }
}
```

#### Generate Multiple Signed URLs
```http
POST /api/s3/signed-urls
Content-Type: application/json

{
  "keys": ["image1.jpg", "image2.jpg"],
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrls": {
      "image1.jpg": "https://...",
      "image2.jpg": "https://..."
    },
    "expiresIn": 3600
  }
}
```

#### Proxy Image (Redirect to Signed URL)
```http
GET /api/s3/image/{encodedKey}
```
This endpoint redirects to a signed URL (expires in 5 minutes).

---

## 🎨 Frontend Implementation

### 1. **Using the S3Image Component** (Recommended)

```jsx
import S3Image from '../components/S3Image';

// Simple usage with proxy (fastest, recommended)
<S3Image 
  s3Key="disease-predictions/image.jpg"
  alt="Disease detection"
  className="w-32 h-32 rounded-lg object-cover"
  useProxy={true}
/>

// With signed URL generation
<S3Image 
  s3Key={prediction.image_url}
  alt="Crop disease"
  className="w-full h-64 object-cover"
  useProxy={false}  // Generates signed URL client-side
/>

// With custom fallback
<S3Image 
  s3Key={field.image_url}
  alt="Field image"
  fallback="https://placehold.co/400x300?text=No+Image"
  useProxy={true}
/>
```

**Props:**
- `s3Key` (string): S3 object key
- `alt` (string): Image alt text
- `className` (string): CSS classes
- `useProxy` (boolean): Use proxy URL (faster) or generate signed URL
- `fallback` (string): Fallback image URL
- `...props`: Any other img attributes

### 2. **Using the useS3SignedUrl Hook**

```jsx
import useS3SignedUrl from '../hooks/useS3SignedUrl';

function MyComponent() {
  const imageKeys = ['image1.jpg', 'image2.jpg'];
  const { signedUrls, loading, error } = useS3SignedUrl(imageKeys);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {imageKeys.map(key => (
        <img key={key} src={signedUrls[key]} alt="Image" />
      ))}
    </div>
  );
}
```

### 3. **Using Proxy URLs Directly**

```jsx
import { getS3ProxyUrl } from '../hooks/useS3SignedUrl';

function MyComponent({ s3Key }) {
  const proxyUrl = getS3ProxyUrl(s3Key);
  
  return <img src={proxyUrl} alt="Image" />;
}
```

---

## 🔄 Updated Components

The following components have been updated to use `S3Image`:

1. **PredictionsList.jsx** - Disease prediction thumbnails
2. **FieldView.jsx** - Field disease predictions
3. **CropView.jsx** - Crop disease predictions

---

## 🎯 Which Method to Use?

### Use **Proxy Method** (`useProxy={true}`) when:
- ✅ You need quick loading
- ✅ Single image display
- ✅ Don't need to cache URLs
- ✅ **RECOMMENDED for most cases**

### Use **Signed URL Generation** (`useProxy={false}`) when:
- ✅ Displaying multiple images at once
- ✅ Need longer expiration times
- ✅ Want to cache URLs in state

### Use **Direct API Calls** when:
- ✅ Need custom logic
- ✅ Batch processing
- ✅ Background operations

---

## 🔐 Security Features

1. **Private S3 Bucket**: Images are not publicly accessible
2. **Temporary URLs**: Signed URLs expire (default: 1 hour)
3. **Server-side Generation**: Keys and secrets never exposed to client
4. **Authentication**: API endpoints can be protected with JWT middleware if needed

---

## 🧪 Testing

### Browser Console Test:
```javascript
// After logging in, run in browser console:
const response = await fetch('http://localhost:5000/api/s3/signed-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    key: 'disease-predictions/test.jpg',
    expiresIn: 3600
  })
});
const data = await response.json();
console.log(data);
```

### Test File:
Open `http://localhost:5173/test-s3.js` in browser console after logging in.

---

## 📝 Environment Variables Required

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=farmfi-images-2025
```

---

## 🚀 Example Usage in Your App

### Disease Detection Upload:
```jsx
// After uploading to S3, save the KEY (not the full URL)
const s3Key = await uploadToS3(imageBuffer, fileName, contentType);

// Save to database
await sql`
  INSERT INTO disease_predictions (image_url, ...)
  VALUES (${s3Key}, ...)  // Save key, not full URL
`;

// Display with S3Image component
<S3Image s3Key={s3Key} useProxy={true} />
```

---

## ⚡ Performance Tips

1. **Use Proxy URLs** for single images (faster, less API calls)
2. **Batch Generate URLs** when displaying multiple images
3. **Set Appropriate Expiration**: 
   - Short expiration (5 min) for temporary views
   - Long expiration (1 hour) for persistent displays
4. **Cache Signed URLs** in component state when needed

---

## 🐛 Troubleshooting

### Images not loading?
- Check S3 bucket permissions
- Verify AWS credentials in `.env`
- Check S3 key format (should be relative path, not full URL)
- Check browser console for errors

### CORS errors?
- Add CORS policy to S3 bucket
- Ensure backend CORS is configured

### 401 Unauthorized?
- Check JWT token in localStorage
- Verify authentication middleware on protected routes

---

## ✅ Done!

Your app now supports private S3 images with temporary signed URLs! 🎉
