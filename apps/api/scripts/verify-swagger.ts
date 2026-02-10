import { strict as assert } from 'assert';

const BASE_URL = 'http://localhost:3001';

async function verifySwagger() {
    console.log('🚀 Verifying Swagger Documentation...');

    const res = await fetch(`${BASE_URL}/documentation/json`);
    console.log('Swagger Status:', res.status);
    const doc = await res.json();
    console.log('Swagger Doc Preview:', JSON.stringify(doc).slice(0, 200));

    assert.equal(doc.openapi, '3.0.3');
    assert.equal(doc.info.title, 'RecheDraw API');

    // Check if /api/auth/register has requestBody schema
    const registerPath = doc.paths['/api/auth/register'];
    assert.ok(registerPath, 'Path /api/auth/register should exist');
    assert.ok(registerPath.post, 'POST method for register should exist');
    assert.ok(registerPath.post.requestBody, 'Request body for register should exist');

    // Check schema content directly or reference
    const content = registerPath.post.requestBody.content['application/json'];
    assert.ok(content, 'application/json content should exist');
    assert.ok(content.schema, 'Schema should exist');

    console.log('✅ Swagger Schema Verification Successful!');
}

verifySwagger().catch(err => {
    console.error('Swagger Verification Failed:', err);
    process.exit(1);
});
