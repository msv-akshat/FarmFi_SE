import express from 'express';
import { generateSignedUrl, generateSignedUrls } from '../utils/s3.js';

const router = express.Router();

/**
 * Generate a single signed URL
 * POST /api/s3/signed-url
 * Body: { key: "path/to/file.jpg", expiresIn: 3600 }
 */
router.post('/signed-url', (req, res) => {
  try {
    const { key, expiresIn = 3600 } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'S3 key is required'
      });
    }

    const signedUrl = generateSignedUrl(key, expiresIn);

    res.json({
      success: true,
      data: {
        key,
        signedUrl,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
});

/**
 * Generate multiple signed URLs
 * POST /api/s3/signed-urls
 * Body: { keys: ["path/to/file1.jpg", "path/to/file2.jpg"], expiresIn: 3600 }
 */
router.post('/signed-urls', (req, res) => {
  try {
    const { keys, expiresIn = 3600 } = req.body;

    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        message: 'Keys array is required'
      });
    }

    const signedUrls = generateSignedUrls(keys, expiresIn);

    res.json({
      success: true,
      data: {
        signedUrls,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URLs',
      error: error.message
    });
  }
});

/**
 * Proxy endpoint to serve image with signed URL
 * GET /api/s3/image/:encoded_key
 */
router.get('/image/:encodedKey', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.encodedKey);
    const signedUrl = generateSignedUrl(key, 300); // 5 minutes

    // Redirect to signed URL
    res.redirect(signedUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve image',
      error: error.message
    });
  }
});

export default router;
