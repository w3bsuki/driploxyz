#!/usr/bin/env node

/**
 * Simple test to verify login endpoint behavior
 * This tests the production login endpoint to see what's happening
 */

const PRODUCTION_URL = 'https://driplo-turbo-1.vercel.app'; // Update with your actual URL

async function testLogin() {
  console.log('🔍 Testing login endpoint behavior...');
  console.log('Production URL:', PRODUCTION_URL);
  
  try {
    // Test with form data like a real browser would send
    const formData = new FormData();
    formData.append('email', 'test@example.com'); 
    formData.append('password', 'testpass123');
    
    console.log('\n📤 Sending login request...');
    
    const response = await fetch(`${PRODUCTION_URL}/login`, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    console.log('\n📥 Response received:');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\n📄 Response body preview (first 500 chars):');
    console.log(responseText.slice(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Look for specific patterns
    if (responseText.includes('submitting')) {
      console.log('\n⚠️  Found "submitting" in response - form might be stuck in loading state');
    }
    
    if (responseText.includes('message')) {
      console.log('\n✅ Found "message" in response - form messages might be working');
    }
    
    if (responseText.includes('success')) {
      console.log('\n🎉 Found "success" in response - success handling might be working');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing login:', error.message);
  }
}

testLogin();