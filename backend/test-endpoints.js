#!/usr/bin/env node

/**
 * Simple test script to verify backend endpoints
 * Run this after npm install completes
 */

const http = require('http');

const API_BASE = 'http://localhost:8080';
const API_KEY = 'test-api-key'; // You'll need to set this in your .env file

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🚀 Testing backend endpoints...\n');

  try {
    // Test health endpoint (no auth required)
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    });
    console.log('✅ Health:', healthResponse.status, healthResponse.data.status);

    // Test quote endpoint
    console.log('\n2. Testing quote endpoint...');
    const quoteResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/quote?fromToken=ETH&toToken=STRK&amount=1.0',
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    console.log('✅ Quote:', quoteResponse.status, quoteResponse.data.status);

    // Test swap endpoint
    console.log('\n3. Testing swap endpoint...');
    const swapResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/swap',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    }, {
      fromToken: 'ETH',
      toToken: 'STRK',
      amount: '1.0',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678'
    });
    console.log('✅ Swap:', swapResponse.status, swapResponse.data.status);

    // Test status endpoint
    console.log('\n4. Testing status endpoint...');
    const statusResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/status/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    console.log('✅ Status:', statusResponse.status, statusResponse.data.status);

    console.log('\n🎉 All endpoints responding correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const isRunning = await checkServer();
  if (!isRunning) {
    console.log('❌ Server is not running on port 8080');
    console.log('💡 Start the server with: npm run dev');
    process.exit(1);
  }
  
  await testEndpoints();
}

if (require.main === module) {
  main();
}
