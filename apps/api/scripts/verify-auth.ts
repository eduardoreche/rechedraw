
import { strict as assert } from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function verifyAuth() {
    console.log('🚀 Starting Auth Verification...');

    // 1. Register User
    console.log('\n--- Registering User ---');
    const userEmail = `auth-test-${Date.now()}@example.com`;
    const password = 'securePassword123';

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password, name: 'Auth User' })
    });

    const registerJson = await registerRes.json();
    console.log('Register Response:', registerJson);

    assert.ok(registerJson.success);
    assert.ok(registerJson.data.token);
    assert.equal(registerJson.data.user.email, userEmail);
    // Ensure password is not returned
    assert.strictEqual(registerJson.data.user.password, undefined);

    const token = registerJson.data.token;

    // 2. Login User
    console.log('\n--- Logging In ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password })
    });

    const loginJson = await loginRes.json();
    console.log('Login Response:', loginJson);

    assert.ok(loginJson.success);
    assert.ok(loginJson.data.token);
    assert.equal(loginJson.data.user.email, userEmail);

    // 3. Access Protected Route (Me)
    console.log('\n--- Accessing /auth/me ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const meJson = await meRes.json();
    console.log('Me Response:', meJson);

    assert.ok(meJson.success);
    assert.equal(meJson.data.email, userEmail);
    assert.equal(meJson.data.id, registerJson.data.user.id);

    // 4. Test Invalid Token
    console.log('\n--- Testing Invalid Token ---');
    const invalidRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer invalid-token`
        }
    });

    const invalidJson = await invalidRes.json();
    console.log('Invalid Token Response:', invalidJson);
    assert.equal(invalidRes.status, 401);
    assert.ok(!invalidJson.success);

    // 5. Check Swagger JSON availability
    console.log('\n--- Checking Swagger Docs ---');
    const swaggerRes = await fetch(`http://localhost:3001/documentation/json`);
    assert.equal(swaggerRes.status, 200);
    const swaggerJson = await swaggerRes.json();
    console.log('Swagger Info:', swaggerJson.info);
    assert.equal(swaggerJson.info.title, 'recheDraw API');

    console.log('\n✅ Auth & Swagger Verification Successful!');
}

verifyAuth().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
