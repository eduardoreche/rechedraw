# Project: recheDraw

## 1. Project Vision & Goals
**Type:** Enhanced Open-Source Fork of Excalidraw.
**Core Philosophy:**
* **"Excalidraw+" for everyone:** We are building advanced features (like Workspaces and Cloud Sync) that are usually behind a paywall, but keeping them open-source.
* **AI Research Lab:** This project serves as a testbed for AI-assisted software development. The code quality and architectural decisions are as important as the features themselves.

## 2. Tech Stack (Frontend Only)
* **Core:** React.js (Latest) / TypeScript (Strict Mode)
* **Engine:** `@excalidraw/excalidraw` (Core Library)
* **UI Framework:** `shadcn/ui` (Radix Primitives + Tailwind)
* **Styling:** Tailwind CSS (Primary) / CSS-in-JS (Legacy/Core)
* **State/Storage:**
    * **Primary:** LocalStorage / Browser-based IndexedDB (Dexie.js or similar recommended if complexity grows).
    * **Future:** Supabase/Firebase (Abstraction layer required).

## 3. Development Rules (The "Constitution")
> **CRITICAL:** The AI Agent must adhere to these rules at all times.

1.  **Prioritize Local-First:** Always implement features using browser storage (IndexedDB/LocalStorage) *first*. Cloud sync should be an optional add-on layer, not a hard dependency.
2.  **UI Consistency:**
    * Use **shadcn/ui** components for all *application UI* (modals, sidebars, settings).
    * Ensure new UI elements blend with the "Hand-Drawn" aesthetic where appropriate, but prioritize usability.
3.  **Code Structure:**
    * **Isolation:** New features (e.g., "Workspaces") must be isolated in their own directories (e.g., `src/features/workspaces`).
    * **No Spaghettification:** Do not modify the core `excalidraw` package files unless absolutely necessary. Wrap them or use provided APIs.
4.  **Testing:**
    * Write unit tests (Vitest/Jest) for logic.
    * Write component tests for UI.
5. **README.md**
    * Always keep the README.md file updated with the latest information about the project.

## 4. Current Features
* ✅ Full Excalidraw Canvas (Tools, Library).
* ✅ Local Saving (Basic single-file persistence).
* ✅ Presentation Mode.

## 5. Roadmap (Prioritized)
**Current Focus:** 🏗️ **Workspace Management**

1.  **Workspace Management (High Priority):**
    * Create a "Project/Folder" structure to group multiple drawings.
    * *Implementation Hint:* Needs a robust IndexDB schema to store metadata (Project Name, ID) and link it to drawing data blobs.
2.  **Version History:**
    * Implement a "Time Travel" mechanism to revert drawings.
    * *Strategy:* Delta updates or snapshotting stored locally.
3.  **Cloud Sync:**
    * Future integration with Supabase/Firebase.t