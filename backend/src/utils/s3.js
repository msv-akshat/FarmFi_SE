import AWS from 'aws-sdk';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
});

/**
 * Generate a temporary signed URL for a private S3 object
 * @param {string} key - The S3 object key (file path)
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {string} Signed URL
 */
export const generateSignedUrl = (key, expiresIn = 3600) => {
  try {
    // Remove bucket URL prefix if present
    const cleanKey = key.replace(/^https?:\/\/[^\/]+\//, '');
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: cleanKey,
      Expires: expiresIn // 1 hour default
    };

    const signedUrl = s3.getSignedUrl('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Generate signed URLs for multiple S3 objects
 * @param {string[]} keys - Array of S3 object keys
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Object} Object mapping original keys to signed URLs
 */
export const generateSignedUrls = (keys, expiresIn = 3600) => {
  const signedUrls = {};
  
  keys.forEach(key => {
    if (key) {
      try {
        signedUrls[key] = generateSignedUrl(key, expiresIn);
      } catch (error) {
        console.error(`Error generating signed URL for ${key}:`, error);
        signedUrls[key] = null;
      }
    }
  });
  
  return signedUrls;
};

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Destination file name
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} S3 object key
 */
export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    // ACL: 'private' // Ensure bucket is private
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Key; // Return the key, not the location
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (key) => {
  const cleanKey = key.replace(/^https?:\/\/[^\/]+\//, '');
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: cleanKey
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

export default {
  generateSignedUrl,
  generateSignedUrls,
  uploadToS3,
  deleteFromS3
};
