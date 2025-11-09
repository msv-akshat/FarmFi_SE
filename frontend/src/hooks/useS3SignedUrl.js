import { useState, useEffect } from 'react';
import api from '../config/api';

/**
 * Custom hook to generate and manage S3 signed URLs
 * @param {string|string[]} s3Keys - S3 key(s) to generate signed URLs for
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Object} { signedUrls, loading, error, refresh }
 */
export const useS3SignedUrl = (s3Keys, expiresIn = 3600) => {
  const [signedUrls, setSignedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateUrls = async () => {
    if (!s3Keys) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isArray = Array.isArray(s3Keys);
      const keys = isArray ? s3Keys.filter(k => k) : [s3Keys].filter(k => k);

      if (keys.length === 0) {
        setSignedUrls({});
        setLoading(false);
        return;
      }

      if (keys.length === 1) {
        // Single URL
        const response = await api.post('/s3/signed-url', {
          key: keys[0],
          expiresIn
        });

        if (response.data.success) {
          setSignedUrls({ [keys[0]]: response.data.data.signedUrl });
        }
      } else {
        // Multiple URLs
        const response = await api.post('/s3/signed-urls', {
          keys,
          expiresIn
        });

        if (response.data.success) {
          setSignedUrls(response.data.data.signedUrls);
        }
      }
    } catch (err) {
      console.error('Error generating signed URLs:', err);
      setError(err.message || 'Failed to generate signed URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateUrls();
  }, [JSON.stringify(s3Keys)]);

  return {
    signedUrls,
    loading,
    error,
    refresh: generateUrls
  };
};

/**
 * Get a proxy URL for an S3 image (server will redirect to signed URL)
 * @param {string} s3Key - S3 object key
 * @returns {string} Proxy URL
 */
export const getS3ProxyUrl = (s3Key) => {
  if (!s3Key) return '';
  const encodedKey = encodeURIComponent(s3Key);
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/s3/image/${encodedKey}`;
};

export default useS3SignedUrl;
