import { useMemo, useCallback, useRef } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { exportToBlob } from "@excalidraw/excalidraw";
import {
    loadSceneFromLocalStorage,
    loadAppState,
    sanitizeAppState,
    saveAppState,
} from "../utils/storage";
import { useUpdateDrawing } from "./use-drawings";

interface UsePersistenceProps {
    currentDrawingId: number | null;
    activeScene: any;
    saveSceneMutation: any;
}

export const usePersistence = ({
    currentDrawingId,
    activeScene,
    saveSceneMutation,
}: UsePersistenceProps) => {
    const saveTimeoutRef = useRef<number | null>(null);
    const updateDrawing = useUpdateDrawing();

    // Memoize the initial data to avoid re-renders
    const initialData = useMemo(() => {
        if (!currentDrawingId) return null;

        // Try to load from localStorage first (synchronous/fast)
        const localData = loadSceneFromLocalStorage(currentDrawingId);
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
        if (activeScene) {
            return {
                elements: (activeScene.data as any)?.elements || [],
                appState: {
                    ...loadAppState(),
                    ...((activeScene.data as any)?.appState || {}),
                },
                files: (activeScene.data as any)?.files || null,
            };
        }

        return {
            elements: [],
            appState: loadAppState(),
        };
    }, [currentDrawingId, activeScene]);

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
                if (activeScene && currentDrawingId) {
                    try {
                        const dataToSave = {
                            elements,
                            appState: sanitizeAppState(appState),
                            files,
                        };

                        // Save scene data
                        await saveSceneMutation.mutateAsync({
                            id: activeScene.id,
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
                                        updateDrawing.mutate({
                                            id: currentDrawingId,
                                            thumbnail: base64data
                                        });
                                    };
                                }
                            } catch (thumbnailError) {
                                console.error("Failed to generate thumbnail:", thumbnailError);
                            }
                        }
                    } catch (error) {
                        console.error("Failed to save scene:", error);
                    }
                }
            }, 500); // 500ms debounce
        },
        [activeScene, currentDrawingId, saveSceneMutation, updateDrawing]
    );

    return {
        initialData,
        saveDebounced,
        saveTimeoutRef,
    };
};
