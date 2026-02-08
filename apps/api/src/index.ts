import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
    logger: true
});

// Register CORS
await fastify.register(cors, {
    origin: true // Allow all origins in development
});

// Health check endpoint
fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get('/', async () => {
    return { message: 'recheDraw API', version: '1.0.0' };
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
        console.log('🚀 API Server running on http://localhost:3001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
