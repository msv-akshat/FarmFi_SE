// Quick test of S3 signed URL endpoints
// Run this in browser console after logging in

async function testS3Endpoints() {
  const baseUrl = 'http://localhost:5000/api';
  
  // Test data - replace with actual S3 key from your database
  const testKey = 'disease-predictions/test-image.jpg';
  
  console.log('🧪 Testing S3 Signed URL Endpoints\n');
  
  // Test 1: Single signed URL
  console.log('1️⃣ Testing single signed URL generation...');
  try {
    const response = await fetch(`${baseUrl}/s3/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        key: testKey,
        expiresIn: 3600
      })
    });
    
    const data = await response.json();
    console.log('✅ Single URL Response:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test 2: Multiple signed URLs
  console.log('\n2️⃣ Testing multiple signed URLs generation...');
  try {
    const response = await fetch(`${baseUrl}/s3/signed-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        keys: [testKey, 'disease-predictions/another-image.jpg'],
        expiresIn: 3600
      })
    });
    
    const data = await response.json();
    console.log('✅ Multiple URLs Response:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test 3: Proxy URL (GET)
  console.log('\n3️⃣ Testing proxy URL (will redirect)...');
  const proxyUrl = `${baseUrl}/s3/image/${encodeURIComponent(testKey)}`;
  console.log('🔗 Proxy URL:', proxyUrl);
  console.log('💡 Open this URL in a new tab to test the redirect');
  
  console.log('\n✅ All tests complete!');
}

// Run the tests
testS3Endpoints();
