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
5. **Excalidraw UI**
    * Make sure you never touch original excalidraw ui, try to position new features and buttons using their api OR by css, html tricks.
6. **README.md**
    * Always keep the README.md file updated with the latest information about the project.
7. **Monorepo**
    * Always keep the monorepo structure updated with the latest information about the project.
8. **API**
    * Always keep the api structure updated with the latest information about the project.
9. **Git**
    Use this commit message format:
```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          devtools
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

### Type

Must be one of the following:

| Type         | Description                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **build**    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| **ci**       | Changes to our CI configuration files and scripts (examples: Github Actions, SauceLabs)             |
| **docs**     | Documentation only changes                                                                          |
| **feat**     | A new feature                                                                                       |
| **fix**      | A bug fix                                                                                           |
| **perf**     | A code change that improves performance                                                             |
| **refactor** | A code change that neither fixes a bug nor adds a feature                                           |
| **test**     | Adding missing tests or correcting existing tests                                                   |
* create branches for each work you're doing, merge then to main when finished - squash merge

## 4. Current Features
* ✅ **Full Excalidraw Canvas**: Complete drawing tools and library support.
* ✅ **Workspace Management**:
    * Create, Read, Update, Delete (CRUD) workspaces.
    * **Search** workspaces by name.
    * **List/Grid View** toggle for workspace dashboard.
    * Persisted preferences (view mode).
* ✅ **Presentation Mode**:
    * Slide navigation and ordering.
    * Fullscreen mode.
    * Sidebar for slide management.
* ✅ **Local Saving**: Robust persistence using IndexedDB (Dexie.js) + LocalStorage backup.
* ✅ **UI/UX**:
    * Dark/Light mode sync with system/canvas.
    * Responsive Sidebar (Collapsible).

## 5. Roadmap (Prioritized)
**Current Focus:** 🏗️ **Advanced Diagramming & Cloud Sync**

1.  **Diagram Layouts (Next Priority)** 
    * Implement Flow Chart Diagrams
    * Implement Data Flow Diagrams
    * Implement Entity Relationship Diagrams
    * Implement UML Diagrams
    * Implement BPMN Diagrams
    * Implement C4 Diagrams
    * Implement ArchiMate Diagrams
    * Implement SysML Diagrams
2.  **Version History:**
    * Implement a "Time Travel" mechanism to revert drawings.
    * *Strategy:* Delta updates or snapshotting stored locally.
3.  **Cloud Sync:**
    * Future integration with Supabase/Firebase.