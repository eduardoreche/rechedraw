import { useMemo, useCallback, useRef } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { exportToBlob } from "@excalidraw/excalidraw";
import {
    loadDrawingFromLocalStorage,
    loadAppState,
    sanitizeAppState,
    saveAppState,
} from "../utils/storage";
import { useUpdateWorkspace } from "./use-workspaces";

interface UsePersistenceProps {
    currentWorkspaceId: number | null;
    activeDrawing: any;
    saveDrawingMutation: any;
}

export const usePersistence = ({
    currentWorkspaceId,
    activeDrawing,
    saveDrawingMutation,
}: UsePersistenceProps) => {
    const saveTimeoutRef = useRef<number | null>(null);
    const updateWorkspace = useUpdateWorkspace();

    // Memoize the initial data to avoid re-renders
    const initialData = useMemo(() => {
        if (!currentWorkspaceId) return null;

        // Try to load from localStorage first (synchronous/fast)
        const localData = loadDrawingFromLocalStorage(currentWorkspaceId);
        if (localData) {
            return {
                elements: localData.elements || [],
                appState: {
                    ...loadAppState(),
                    ...(localData.appState || {}),
                },
                files: localData.files || null,
            };
        }

        // Fallback to database data if available
        if (activeDrawing) {
            return {
                elements: (activeDrawing.data as any)?.elements || [],
                appState: {
                    ...loadAppState(),
                    ...((activeDrawing.data as any)?.appState || {}),
                },
                files: (activeDrawing.data as any)?.files || null,
            };
        }

        return {
            elements: [],
            appState: loadAppState(),
        };
    }, [currentWorkspaceId, activeDrawing]);

    // Debounced save to database
    const saveDebounced = useCallback(
        (
            elements: readonly ExcalidrawElement[],
            appState: AppState,
            files: BinaryFiles
        ) => {
            if (saveTimeoutRef.current) {
                window.clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = window.setTimeout(async () => {
                if (activeDrawing && currentWorkspaceId) {
                    try {
                        const dataToSave = {
                            elements,
                            appState: sanitizeAppState(appState),
                            files,
                        };

                        // Save drawing data
                        await saveDrawingMutation.mutateAsync({
                            id: activeDrawing.id,
                            data: dataToSave,
                        });

                        // Also save AppState to localStorage
                        saveAppState(appState);

                        // Generate and save thumbnail
                        if (elements.length > 0) {
                            try {
                                const exportAppState = {
                                    ...appState,
                                    viewBackgroundColor: appState.theme === 'dark' && appState.viewBackgroundColor === '#ffffff'
                                        ? '#121212'
                                        : appState.viewBackgroundColor
                                };

                                const blob = await exportToBlob({
                                    elements,
                                    appState: exportAppState,
                                    files,
                                    mimeType: "image/png",
                                });

                                if (blob) {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onloadend = () => {
                                        const base64data = reader.result as string;
                                        updateWorkspace.mutate({
                                            id: currentWorkspaceId,
                                            thumbnail: base64data
                                        });
                                    };
                                }
                            } catch (thumbnailError) {
                                console.error("Failed to generate thumbnail:", thumbnailError);
                            }
                        }
                    } catch (error) {
                        console.error("Failed to save drawing:", error);
                    }
                }
            }, 500); // 500ms debounce
        },
        [activeDrawing, currentWorkspaceId, saveDrawingMutation, updateWorkspace]
    );

    return {
        initialData,
        saveDebounced,
        saveTimeoutRef,
    };
};
