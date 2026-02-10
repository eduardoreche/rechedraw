
import { strict as assert } from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function verifyApi() {
    console.log('🚀 Starting API Verification...');

    // 1. Health Check
    console.log('\n--- Checking Health ---');
    const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
    console.log('Health:', health);
    assert.equal(health.status, 'ok');

    // 2. Create User
    console.log('\n--- Creating User ---');
    const userEmail = `test${Date.now()}@example.com`;
    // Generate a unique email every time
    const userData = { email: userEmail, password: 'password123', name: 'Test User' };

    const userRes = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const userJson = await userRes.json();
    console.log('Create User Response:', userJson);

    if (!userJson.success) {
        console.error('Failed to create user:', userJson);
        process.exit(1);
    }

    const userId = userJson.data.id;
    assert.ok(userId, 'User ID should exist');
    assert.equal(userJson.data.email, userEmail);

    // 3. Create Drawing
    console.log('\n--- Creating Drawing ---');
    const drawingData = {
        userId,
        name: 'My Test Drawing',
        slug: `drawing-${Date.now()}`
    };

    const drawingRes = await fetch(`${BASE_URL}/drawings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
    const userDrawingsRes = await fetch(`${BASE_URL}/users/${userId}/drawings`);
    const userDrawingsJson = await userDrawingsRes.json();
    console.log('User Drawings:', userDrawingsJson);

    assert.ok(userDrawingsJson.success);
    assert.ok(Array.isArray(userDrawingsJson.data));
    assert.ok(userDrawingsJson.data.length >= 1);
    assert.equal(userDrawingsJson.data[0].id, drawingId);

    // 6. Cleanup (Optional, testing delete)
    console.log('\n--- Cleaning Up ---');
    const deleteRes = await fetch(`${BASE_URL}/users/${userId}`, { method: 'DELETE' });
    assert.equal(deleteRes.status, 204);

    // Verify Cascade
    const getDrawingRes = await fetch(`${BASE_URL}/drawings/${drawingId}`);
    assert.equal(getDrawingRes.status, 404);

    console.log('\n✅ API Verification Successful!');
}

verifyApi().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
