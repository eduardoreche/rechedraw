# recheDraw

An open-source fork of [Excalidraw](https://excalidraw.com) with enhanced features for managing multiple drawings, presentation mode, and persistent storage.

## Features

- 🎨 **Multiple Drawings**: Organize your work with separate drawing canvases
- 📊 **Presentation Mode**: Present your diagrams using frame-based slides
- 💾 **Local-First Storage**: All data persists locally using IndexedDB
- 🌓 **Dark Mode**: Automatically syncs with Excalidraw's theme
- 🔄 **Auto-Save**: Changes are saved automatically as you draw

## Project Structure

This is a Turborepo monorepo containing:

```
rechedraw/
├── apps/
│   ├── web/              # Frontend (Vite + React + Excalidraw)
│   └── api/              # Backend (Fastify API)
├── packages/             # Shared packages (future)
├── turbo.json           # Turborepo configuration
└── package.json         # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eduardoreche/rechedraw.git
cd rechedraw
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start both:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

The Turborepo TUI will show both applications running in separate panels.

### Available Scripts

- `npm run dev` - Start both apps in development mode with TUI
- `npm run build` - Build all apps for production
- `npm run lint` - Lint all apps

## Apps

### Frontend (`apps/web`)

Built with:
- Vite + React + TypeScript
- Excalidraw
- Dexie.js (IndexedDB)
- TailwindCSS
- shadcn/ui components

### Backend (`apps/api`)

Built with:
- Fastify
- TypeScript
- CORS support

API Endpoints:
- `GET /` - API information
- `GET /api/health` - Health check

## Development

Each app can also be run individually:

```bash
# Frontend only
cd apps/web
npm run dev

# Backend only
cd apps/api
npm run dev
```

## Development Principles

1. **Local-First**: Browser storage (IndexedDB/LocalStorage) is prioritized
2. **UI Consistency**: Use shadcn/ui components for application UI
3. **Code Isolation**: New features should be isolated in dedicated directories
4. **No Core Modifications**: Avoid modifying Excalidraw core files directly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built on top of [Excalidraw](https://github.com/excalidraw/excalidraw) - an amazing open-source whiteboard tool.

---

*Built with ❤️ and AI assistance.*
