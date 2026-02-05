/**
 * Presentation Mode Module
 * 
 * A self-contained presentation system for Excalidraw clones.
 * Transforms Excalidraw frames into slides with navigation controls.
 * 
 * Features:
 * - Frame-based slides
 * - Drag-and-drop slide reordering
 * - Keyboard navigation
 * - Fullscreen support
 * - Dark mode compatible
 * - Laser pointer during presentations
 */

export { usePresentation } from "./usePresentation";
export { PresentationControls } from "./PresentationControls";
export { SlidesSidebar } from "./SlidesSidebar";

// Re-export types for convenience
export type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
export type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
