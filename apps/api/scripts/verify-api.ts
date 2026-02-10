
import { strict as assert } from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function verifyApi() {
    console.log('🚀 Starting API Verification...');

    // 1. Health Check
    console.log('\n--- Checking Health ---');
    const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
    console.log('Health:', health);
    assert.equal(health.status, 'ok');

    // 2. Register User (to get token)
    console.log('\n--- Registering User ---');
    const userEmail = `test${Date.now()}@example.com`;
    const userData = { email: userEmail, password: 'password123', name: 'Test User' };

    const userRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const userJson = await userRes.json();
    console.log('Register User Response:', userJson);

    if (!userJson.success) {
        console.error('Failed to register user:', userJson);
        process.exit(1);
    }

    const userId = userJson.data.user.id;
    const token = userJson.data.token;
    assert.ok(userId, 'User ID should exist');
    assert.ok(token, 'Token should exist');
    assert.equal(userJson.data.user.email, userEmail);

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. Create Drawing
    console.log('\n--- Creating Drawing ---');
    const drawingData = {
        userId,
        name: 'My Test Drawing',
        slug: `drawing-${Date.now()}`
    };

    const drawingRes = await fetch(`${BASE_URL}/drawings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(drawingData)
    });

    const drawingJson = await drawingRes.json();
    console.log('Create Drawing Response:', drawingJson);

    if (!drawingJson.success) {
        console.error('Failed to create drawing:', drawingJson);
        process.exit(1);
    }

    const drawingId = drawingJson.data.id;
    assert.ok(drawingId, 'Drawing ID should exist');
    assert.equal(drawingJson.data.userId, userId);

    // 4. Create Scene
    console.log('\n--- Creating Scene ---');
    const sceneData = {
        drawingId,
        name: 'Version 1',
        data: { elements: [{ type: 'rectangle', x: 10, y: 10 }] }
    };

    const sceneRes = await fetch(`${BASE_URL}/scenes`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(sceneData)
    });

    const sceneJson = await sceneRes.json();
    console.log('Create Scene Response:', sceneJson);

    if (!sceneJson.success) {
        console.error('Failed to create scene:', sceneJson);
        process.exit(1);
    }

    const sceneId = sceneJson.data.id;
    assert.ok(sceneId, 'Scene ID should exist');
    assert.equal(sceneJson.data.drawingId, drawingId);

    // 5. Verify User's Drawings
    console.log('\n--- Verifying User Drawings ---');
    const userDrawingsRes = await fetch(`${BASE_URL}/users/${userId}/drawings`, {
        headers: authHeaders // Use headers, though technically GET might be public? No we made it protected.
    });
    const userDrawingsJson = await userDrawingsRes.json();
    console.log('User Drawings:', userDrawingsJson);

    assert.ok(userDrawingsJson.success);
    assert.ok(Array.isArray(userDrawingsJson.data));
    assert.ok(userDrawingsJson.data.length >= 1);
    assert.equal(userDrawingsJson.data[0].id, drawingId);

    // 6. Cleanup (Optional, testing delete)
    console.log('\n--- Cleaning Up ---');
    const deleteRes = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (deleteRes.status !== 204) {
        const errorBody = await deleteRes.json();
        console.error('Delete User Failed:', deleteRes.status, errorBody);
    }
    assert.equal(deleteRes.status, 204);

    // Verify Cascade
    // Protected route, so we need token to check it? 
    // If we return 404, that's fine. If we return 401, that's also fine but we want to verify it's GONE.
    // The user deletion invalidates the user... but the TOKEN is JWT, stateless. It works until expiry.
    // However, does `authenticate` check if user exists in DB?
    // In `auth.ts`, I commented out: `// const user = await request.di.users.findById(payload.userId);`
    // So the token is still valid even if user is deleted!
    // So we can use the same token to check if drawing exists.

    const getDrawingRes = await fetch(`${BASE_URL}/drawings/${drawingId}`, {
        headers: authHeaders
    });
    // Should be 404 because cascade deleted it
    assert.equal(getDrawingRes.status, 404);

    console.log('\n✅ API Verification Successful!');
}

verifyApi().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
