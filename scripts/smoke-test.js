
#!/usr/bin/env node

/**
 * API Smoke Tests for Auth Guards
 * Node.js version with enhanced features
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173/api',
  jwtToken: process.env.JWT_TOKEN || '',
  timeout: parseInt(process.env.TIMEOUT) || 5000,
  verbose: process.env.VERBOSE === 'true'
};

// Test results tracking
let totalTests = 0;
let failedTests = 0;
const results = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: config.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(path, expectedCode, description, useAuth = false) {
  totalTests++;
  
  try {
    const url = `${config.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (useAuth && config.jwtToken) {
      headers['Authorization'] = `Bearer ${config.jwtToken}`;
    }
    
    const response = await makeRequest(url, { headers });
    const success = response.statusCode === expectedCode;
    
    const result = {
      path,
      description,
      expected: expectedCode,
      actual: response.statusCode,
      success
    };
    
    results.push(result);
    
    if (success) {
      log(`✅ ${path} (${description}): ${response.statusCode}`, 'green');
    } else {
      log(`❌ ${path} (${description}): got ${response.statusCode}, expected ${expectedCode}`, 'red');
      failedTests++;
    }
    
    if (config.verbose) {
      log(`   Headers: ${JSON.stringify(response.headers)}`, 'blue');
    }
    
  } catch (error) {
    log(`❌ ${path} (${description}): Error - ${error.message}`, 'red');
    results.push({
      path,
      description,
      expected: expectedCode,
      actual: 'ERROR',
      success: false,
      error: error.message
    });
    failedTests++;
  }
}

async function runTests() {
  log('🚀 Starting API Smoke Tests', 'blue');
  log(`Base URL: ${config.baseUrl}`);
  log(`JWT Token: ${config.jwtToken ? 'Provided' : 'Not provided'}`);
  log('----------------------------------------');

  // Public endpoints
  log('\n📂 Testing Public Endpoints', 'yellow');
  await testEndpoint('/health', 200, 'Health check endpoint');
  await testEndpoint('/public/info', 200, 'Public information endpoint');

  // Auth endpoints (no auth required)
  log('\n🔐 Testing Auth Endpoints', 'yellow');
  await testEndpoint('/auth/login', 405, 'Login endpoint (POST only)');
  await testEndpoint('/auth/register', 405, 'Register endpoint (POST only)');
  await testEndpoint('/auth/verify-email', 405, 'Email verification (POST only)');

  // Protected endpoints
  log('\n🛡️  Testing Protected Endpoints', 'yellow');
  
  if (config.jwtToken) {
    // With authentication - expect success
    await testEndpoint('/users/me', 200, 'Current user profile', true);
    await testEndpoint('/users', 200, 'Users list', true);
    await testEndpoint('/tenants', 200, 'Tenants list', true);
    await testEndpoint('/clients', 200, 'Clients list', true);
    await testEndpoint('/sessions', 200, 'Sessions list', true);
    await testEndpoint('/documents', 200, 'Documents list', true);
    await testEndpoint('/branding', 200, 'Branding settings', true);
    await testEndpoint('/roles', 200, 'Roles list', true);
    await testEndpoint('/user-roles', 200, 'User roles list', true);
    await testEndpoint('/page-permissions', 200, 'Page permissions list', true);
    await testEndpoint('/configurations', 200, 'Configurations list', true);
  } else {
    // Without authentication - expect 401/403
    await testEndpoint('/users/me', 401, 'Current user profile (requires auth)');
    await testEndpoint('/users', 401, 'Users list (requires auth)');
    await testEndpoint('/tenants', 401, 'Tenants list (requires auth)');
    await testEndpoint('/clients', 401, 'Clients list (requires auth)');
    await testEndpoint('/sessions', 401, 'Sessions list (requires auth)');
    await testEndpoint('/documents', 401, 'Documents list (requires auth)');
    await testEndpoint('/branding', 401, 'Branding settings (requires auth)');
    await testEndpoint('/roles', 401, 'Roles list (requires auth)');
    await testEndpoint('/user-roles', 401, 'User roles list (requires auth)');
    await testEndpoint('/page-permissions', 401, 'Page permissions (requires auth)');
    await testEndpoint('/configurations', 401, 'Configurations (requires auth)');
  }

  // Summary
  log('\n----------------------------------------');
  log('📊 Test Summary', 'blue');
  log(`Total tests: ${totalTests}`);
  log(`Passed: ${totalTests - failedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  if (failedTests === 0) {
    log('\n🎉 All smoke tests passed!', 'green');
    process.exit(0);
  } else {
    log(`\n💥 ${failedTests} test(s) failed`, 'red');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
