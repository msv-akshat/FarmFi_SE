import { useState, useEffect } from 'react';
import { useS3SignedUrl, getS3ProxyUrl } from '../hooks/useS3SignedUrl';

/**
 * Component to display images from private S3 bucket with signed URLs
 * @param {Object} props
 * @param {string} props.s3Key - S3 object key
 * @param {string} props.alt - Alt text for image
 * @param {string} props.className - CSS classes
 * @param {boolean} props.useProxy - Use proxy URL instead of generating signed URL (faster)
 * @param {string} props.fallback - Fallback image URL
 */
export default function S3Image({ 
  s3Key, 
  alt = 'Image', 
  className = '', 
  useProxy = false,
  fallback = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image',
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(fallback);
  const [imgError, setImgError] = useState(false);
  
  const { signedUrls, loading } = useS3SignedUrl(useProxy ? null : s3Key);

  useEffect(() => {
    if (!s3Key) {
      setImgSrc(fallback);
      return;
    }

    if (useProxy) {
      // Use proxy URL - server will redirect to signed URL
      setImgSrc(getS3ProxyUrl(s3Key));
    } else if (signedUrls[s3Key]) {
      // Use generated signed URL
      setImgSrc(signedUrls[s3Key]);
    }
  }, [s3Key, signedUrls, useProxy, fallback]);

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(fallback);
    }
  };

  if (loading && !useProxy) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
