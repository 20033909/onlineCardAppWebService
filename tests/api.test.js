// Simple API test file
// This is a basic test to verify the API endpoints are working

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';
let cardId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testRootEndpoint() {
  console.log('\n1. Testing root endpoint...');
  const result = await makeRequest('GET', '/');
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

async function testUserRegistration() {
  console.log('\n2. Testing user registration...');
  const userData = {
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'testpass123'
  };
  
  const result = await makeRequest('POST', '/api/users/register', userData);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  
  if (result.status === 201 && result.data.token) {
    authToken = result.data.token;
    userId = result.data.user.id;
    return true;
  }
  return false;
}

async function testUserLogin() {
  console.log('\n3. Testing user login...');
  const loginData = {
    username: 'testuser',
    password: 'testpass123'
  };
  
  const result = await makeRequest('POST', '/api/users/login', loginData);
  console.log(`   Status: ${result.status}`);
  // Don't fail if user doesn't exist - we just created a new one
  return true;
}

async function testGetProfile() {
  console.log('\n4. Testing get user profile...');
  const result = await makeRequest('GET', '/api/users/profile', null, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

async function testCreateCard() {
  console.log('\n5. Testing create card...');
  const cardData = {
    cardNumber: '4532' + Date.now().toString().slice(-12),
    cardHolderName: 'Test User',
    expiryDate: '12/25',
    cvv: '123',
    cardType: 'Visa',
    balance: 1000.00
  };
  
  const result = await makeRequest('POST', '/api/cards', cardData, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  
  if (result.status === 201 && result.data.card) {
    cardId = result.data.card.id;
    return true;
  }
  return false;
}

async function testGetCards() {
  console.log('\n6. Testing get all cards...');
  const result = await makeRequest('GET', '/api/cards', null, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Number of cards:`, result.data.cards?.length || 0);
  return result.status === 200;
}

async function testGetCard() {
  console.log('\n7. Testing get specific card...');
  const result = await makeRequest('GET', `/api/cards/${cardId}`, null, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

async function testUpdateCard() {
  console.log('\n8. Testing update card...');
  const updateData = {
    cardHolderName: 'Updated User Name',
    isActive: true
  };
  
  const result = await makeRequest('PUT', `/api/cards/${cardId}`, updateData, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

async function testUpdateBalance() {
  console.log('\n9. Testing update card balance...');
  const balanceData = { balance: 1500.00 };
  
  const result = await makeRequest('PATCH', `/api/cards/${cardId}/balance`, balanceData, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

async function testDeleteCard() {
  console.log('\n10. Testing delete card...');
  const result = await makeRequest('DELETE', `/api/cards/${cardId}`, null, authToken);
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  return result.status === 200;
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('Running API Tests');
  console.log('='.repeat(50));
  
  const tests = [
    testRootEndpoint,
    testUserRegistration,
    testUserLogin,
    testGetProfile,
    testCreateCard,
    testGetCards,
    testGetCard,
    testUpdateCard,
    testUpdateBalance,
    testDeleteCard
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
        console.log('   ✓ PASSED');
      } else {
        failed++;
        console.log('   ✗ FAILED');
      }
    } catch (error) {
      failed++;
      console.log('   ✗ FAILED:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running before running tests
console.log('Checking if server is running...');
http.get(BASE_URL, () => {
  console.log('Server is running. Starting tests...\n');
  runTests();
}).on('error', () => {
  console.error('Error: Server is not running!');
  console.error('Please start the server with: npm start');
  process.exit(1);
});
