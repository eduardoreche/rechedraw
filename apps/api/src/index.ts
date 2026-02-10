import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import diPlugin from './plugins/di';
import { errorHandler } from './middleware/error-handler';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import { drawingRoutes } from './routes/drawing.routes';
import { sceneRoutes } from './routes/scene.routes';

const fastify = Fastify({
    logger: true
});

// Register DI plugin
await fastify.register(diPlugin);

// Register CORS
await fastify.register(cors, {
    origin: true // Allow all origins in development
});

// Register Swagger
await fastify.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'recheDraw API',
            description: 'Backend API for recheDraw',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header'
                }
            }
        },
        security: [{ apiKey: [] }]
    }
});

await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
});

// Register error handler
fastify.setErrorHandler(errorHandler);

// Register Routes
// Explicitly register with prefixes if needed, or inside the route files
console.log('Registering auth routes plugin...');
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(userRoutes);
await fastify.register(drawingRoutes);
await fastify.register(sceneRoutes);

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

