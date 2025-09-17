// Test script to simulate Plaid account connection and verify transaction sync
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

// Simulate the account connection process
async function testPlaidConnection() {
  console.log('🧪 Testing Plaid Account Connection and Transaction Sync...\n');

  try {
    // Step 1: Check if we're in demo mode
    console.log('1. Checking demo mode status...');
    const demoResponse = await fetch(`${BASE_URL}/api/v1/user/demo-mode`);
    const demoData = await demoResponse.json();
    console.log('Demo mode status:', demoData);

    // Step 2: Simulate account connection (this would normally come from Plaid Link)
    console.log('\n2. Simulating account connection...');
    const mockPlaidData = {
      public_token: 'public-sandbox-test-token',
      metadata: {
        institution: {
          institution_id: 'ins_test',
          name: 'Test Bank'
        },
        accounts: [
          {
            id: 'test-account-1',
            name: 'Test Checking',
            mask: '0000',
            type: 'depository',
            subtype: 'checking'
          }
        ]
      },
      type: 0
    };

    const connectionResponse = await fetch(`${BASE_URL}/api/v1/plaid/set_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPlaidData)
    });

    const connectionResult = await connectionResponse.json();
    console.log('Connection result:', connectionResult);

    // Step 3: Check if transactions were synced
    console.log('\n3. Checking transaction count after connection...');
    
    // Wait a moment for transaction sync to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactionResponse = await fetch(`${BASE_URL}/api/v1/plaid/transactions/all`);
    const transactionResult = await transactionResponse.json();
    console.log('Transaction sync result:', transactionResult);

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPlaidConnection();
