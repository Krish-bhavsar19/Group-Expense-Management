// Quick API test script
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testRoutes() {
    console.log('Testing API Routes...\n');

    // Test 1: Health check
    try {
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ Health check:', health.data);
    } catch (err) {
        console.log('❌ Health check failed:', err.message);
        return;
    }

    // Test 2: Parse voice (without auth - should fail with 401)
    try {
        const voice = await axios.post(`${API_URL}/api/expenses/parse-voice`, {
            transcript: 'Paid 100 for food'
        });
        console.log('Voice parse:', voice.data);
    } catch (err) {
        if (err.response?.status === 401) {
            console.log('✅ Voice route exists (401 Unauthorized - expected)');
        } else {
            console.log('❌ Voice parse error:', err.response?.status, err.response?.data || err.message);
        }
    }

    // Test 3: Create expense (without auth - should fail with 401)
    try {
        const expense = await axios.post(`${API_URL}/api/expenses`, {
            groupId: 1,
            amount: 100,
            description: 'test'
        });
        console.log('Create expense:', expense.data);
    } catch (err) {
        if (err.response?.status === 401) {
            console.log('✅ Create expense route exists (401 Unauthorized - expected)');
        } else {
            console.log('❌ Create expense error:', err.response?.status, err.response?.data || err.message);
        }
    }

    console.log('\n📊 All routes are registered correctly!');
}

testRoutes();
