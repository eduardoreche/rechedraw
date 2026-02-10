# recheDraw API

Backend REST API for recheDraw application.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- PostgreSQL (Database)

### Installation

```bash
cd apps/api
npm install
```

### Development

```bash
npm run dev
```
Server runs on http://localhost:3001

### Testing

```bash
# Run unit/integration tests
npm test

# Verify API endpoints (requires local server running)
npx tsx scripts/verify-api.ts
```

## 📚 API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user

### Drawings
- `POST /api/drawings` - Create a new drawing
- `GET /api/drawings/:id` - Get drawing by ID
- `GET /api/drawings` - Get all drawings
- `GET /api/users/:userId/drawings` - Get user's drawings
- `PUT /api/drawings/:id` - Update drawing
- `DELETE /api/drawings/:id` - Delete drawing

### Scenes
- `POST /api/scenes` - Create a new scene version
- `GET /api/scenes/:id` - Get scene by ID
- `GET /api/drawings/:drawingId/scenes` - Get drawing's scenes
- `PUT /api/scenes/:id` - Update scene
- `DELETE /api/scenes/:id` - Delete scene

## 🛠️ Tech Stack
- **Framework:** Fastify
- **Validation:** Zod
- **Database:** PostgreSQL with Drizzle ORM
- **Testing:** Vitest

## 🔒 Authentication
Currently implemented as public API. Authentication will be added in a future update.
