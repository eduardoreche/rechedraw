import type { AppState } from "@excalidraw/excalidraw/types";

export const SLIDE_ORDER_KEY = "rechedraw-slide-order";
export const APPSTATE_KEY = "rechedraw-appstate";
export const LAST_DRAWING_KEY = "rechedraw-last-drawing-id";
export const SCENE_DATA_KEY = "rechedraw-scene-data";

// Helper to sanitize appState for saving
export const sanitizeAppState = (appState: AppState) => {
    const { collaborators, ...rest } = appState as any;
    return rest;
};

// Load slide order from localStorage
export const loadSlideOrder = (): string[] => {
    try {
        const data = localStorage.getItem(SLIDE_ORDER_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load slide order from localStorage:", error);
    }
    return [];
};

// Save slide order to localStorage
export const saveSlideOrder = (frameIds: string[]) => {
    try {
        localStorage.setItem(SLIDE_ORDER_KEY, JSON.stringify(frameIds));
    } catch (error) {
        console.error("Failed to save slide order to localStorage:", error);
    }
};

// Load AppState from localStorage
export const loadAppState = (): Partial<AppState> | null => {
    try {
        const data = localStorage.getItem(APPSTATE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load AppState from localStorage:", error);
    }
    return null;
};

// Save AppState to localStorage
export const saveAppState = (appState: Partial<AppState>) => {
    try {
        // Only save relevant properties
        const stateToSave = {
            theme: appState.theme,
            viewBackgroundColor: appState.viewBackgroundColor,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
            gridSize: appState.gridSize,
        };
        localStorage.setItem(APPSTATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save AppState to localStorage:", error);
    }
};

// Save/load scene data to/from localStorage
export const saveSceneToLocalStorage = (drawingId: number | string, data: { elements: readonly any[]; appState: any; files: any }) => {
    try {
        localStorage.setItem(`${SCENE_DATA_KEY}-${drawingId}`, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save scene to localStorage:", error);
    }
};

export const loadSceneFromLocalStorage = (drawingId: number | string) => {
    try {
        const saved = localStorage.getItem(`${SCENE_DATA_KEY}-${drawingId}`);
        // Migration support: check old key if new one doesn't exist
        // The old key used "drawing-data" prefix and workspaceId.
        if (!saved) {
            const oldSaved = localStorage.getItem(`rechedraw-drawing-data-${drawingId}`);
            if (oldSaved) {
                // Migrate to new key
                localStorage.setItem(`${SCENE_DATA_KEY}-${drawingId}`, oldSaved);
                return JSON.parse(oldSaved);
            }
        }
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("Failed to load scene from localStorage:", error);
        return null;
    }
};

// Load last drawing ID from localStorage
export const loadLastDrawingId = (): number | null => {
    try {
        const data = localStorage.getItem(LAST_DRAWING_KEY);
        if (data) {
            return parseInt(data, 10);
        }
        // Fallback to old key
        const oldData = localStorage.getItem("rechedraw-last-workspace-id");
        if (oldData) {
            const id = parseInt(oldData, 10);
            saveLastDrawingId(id); // Migrate
            return id;
        }
    } catch (error) {
        console.error("Failed to load last drawing ID:", error);
    }
    return null;
};

// Save last drawing ID to localStorage
export const saveLastDrawingId = (drawingId: number) => {
    try {
        localStorage.setItem(LAST_DRAWING_KEY, drawingId.toString());
    } catch (error) {
        console.error("Failed to save last drawing ID:", error);
    }
};
