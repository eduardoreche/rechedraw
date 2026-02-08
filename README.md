# RecheDraw

**RecheDraw** is an enhanced, open-source fork of Excalidraw designed to bring advanced features like workspaces and cloud sync to everyone, while serving as a testbed for AI-assisted software development.

## 🚀 Vision & Goals

- **"Excalidraw+" for Everyone:** We are building advanced features (like Workspaces and Cloud Sync) that are usually behind a paywall, but keeping them open-source.
- **AI Research Lab:** This project serves as a testbed for AI-assisted software development. The code quality and architectural decisions are as important as the features themselves.

## ✨ Current Features

- ✅ **Full Excalidraw Canvas**: Complete drawing tools and library support.
- ✅ **Local Saving**: Basic single-file persistence.
- ✅ **Presentation Mode**: Present your diagrams seamlessly.

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

Our current focus is on **Workspace Management**.

1.  **Workspace Management (High Priority):**
    - Create a "Project/Folder" structure to group multiple drawings.
    - Robust IndexedDB schema for metadata.
2.  **Version History:**
    - "Time Travel" mechanism to revert drawings.
3.  **Cloud Sync:**
    - Future integration with Supabase/Firebase.

---

*This project is built with ❤️ and AI assistance.*
