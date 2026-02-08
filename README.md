# RecheDraw

**RecheDraw** is an enhanced, open-source fork of Excalidraw designed to bring advanced features like workspaces and cloud sync to everyone, while serving as a testbed for AI-assisted software development.

## 🚀 Vision & Goals

- **"Excalidraw+" for Everyone:** We are building advanced features (like Workspaces and Cloud Sync) that are usually behind a paywall, but keeping them open-source.
- **AI Research Lab:** This project serves as a testbed for AI-assisted software development. The code quality and architectural decisions are as important as the features themselves.

## ✨ Current Features

- ✅ **Full Excalidraw Canvas**: Complete drawing tools and library support.
- ✅ **Workspace Management**:
    - Create, Read, Update, Delete (CRUD) workspaces.
    - **Search** workspaces by name.
    - **List/Grid View** toggle for workspace dashboard.
    - Persisted preferences (view mode).
- ✅ **Presentation Mode**:
    - Slide navigation and ordering.
    - Fullscreen mode.
    - Sidebar for slide management.
- ✅ **Local Saving**: Robust persistence using IndexedDB (Dexie.js) + LocalStorage backup.
- ✅ **UI/UX**:
    - Dark/Light mode sync with system/canvas.
    - Responsive Sidebar (Collapsible).

## 🛠 Tech Stack

- **Core:** React.js / TypeScript (Strict Mode)
- **Engine:** `@excalidraw/excalidraw`
- **UI Framework:** `shadcn/ui` (Radix Primitives + Tailwind)
- **Styling:** Tailwind CSS
- **State/Storage:** LocalStorage / IndexedDB (Local-First philosophy)

## 🏁 Getting Started

To get the project up and running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/eduardoreche/rechedraw.git
    cd rechedraw
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

## 📜 Development Rules (The "Constitution")

For contributors and AI agents alike, we adhere to these core principles:

1.  **Prioritize Local-First:** Always implement features using browser storage (IndexedDB/LocalStorage) *first*. Cloud sync is an optional add-on.
2.  **UI Consistency:**
    - Use `shadcn/ui` components for all application UI (modals, sidebars, settings).
    - Ensure new UI elements blend with the "Hand-Drawn" aesthetic where appropriate.
3.  **Code Structure:**
    - **Isolation:** New features (e.g., "Workspaces") must be isolated in their own directories (e.g., `src/features/workspaces`).
    - **No Spaghettification:** Avoid modifying the core `excalidraw` package files directly; wrap them or use provided APIs.
4.  **Testing:**
    - Write unit tests for logic.
    - Write component tests for UI.

## 🗺 Roadmap

Our current focus is on **Advanced Diagramming & Cloud Sync**.

1.  **Diagram Layouts (Next Priority)**
    - Implement Flow Chart Diagrams
    - Implement Data Flow Diagrams
    - Implement Entity Relationship Diagrams
    - Implement UML Diagrams
    - Implement BPMN Diagrams
    - Implement C4 Diagrams
    - Implement ArchiMate Diagrams
    - Implement SysML Diagrams
2.  **Version History:**
    - "Time Travel" mechanism to revert drawings.
    - *Strategy:* Delta updates or snapshotting stored locally.
3.  **Cloud Sync:**
    - Future integration with Supabase/Firebase.

---

*This project is built with ❤️ and AI assistance.*
