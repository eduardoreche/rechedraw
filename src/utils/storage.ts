import type { AppState } from "@excalidraw/excalidraw/types";

export const SLIDE_ORDER_KEY = "rechedraw-slide-order";
export const APPSTATE_KEY = "rechedraw-appstate";
export const LAST_WORKSPACE_KEY = "rechedraw-last-workspace-id";
export const DRAWING_DATA_KEY = "rechedraw-drawing-data";

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

// Save/load drawing data to/from localStorage
export const saveDrawingToLocalStorage = (workspaceId: number | string, data: { elements: readonly any[]; appState: any; files: any }) => {
    try {
        localStorage.setItem(`${DRAWING_DATA_KEY}-${workspaceId}`, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save drawing to localStorage:", error);
    }
};

export const loadDrawingFromLocalStorage = (workspaceId: number | string) => {
    try {
        const saved = localStorage.getItem(`${DRAWING_DATA_KEY}-${workspaceId}`);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("Failed to load drawing from localStorage:", error);
        return null;
    }
};

// Load last workspace ID from localStorage
export const loadLastWorkspaceId = (): number | null => {
    try {
        const data = localStorage.getItem(LAST_WORKSPACE_KEY);
        if (data) {
            return parseInt(data, 10);
        }
    } catch (error) {
        console.error("Failed to load last workspace ID:", error);
    }
    return null;
};

// Save last workspace ID to localStorage
export const saveLastWorkspaceId = (workspaceId: number) => {
    try {
        localStorage.setItem(LAST_WORKSPACE_KEY, workspaceId.toString());
    } catch (error) {
        console.error("Failed to save last workspace ID:", error);
    }
};
