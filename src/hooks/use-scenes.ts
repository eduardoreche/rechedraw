
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScenesByDrawing, createScene, saveScene } from '../db/queries';

export function useScenes(drawingId: number | null) {
    return useQuery({
        queryKey: ['scenes', drawingId],
        queryFn: () => (drawingId ? getScenesByDrawing(drawingId) : Promise.resolve([])),
        enabled: !!drawingId,
    });
}

export function useCreateScene() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drawingId, name, data }: { drawingId: number; name: string; data: any }) =>
            createScene(drawingId, name, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['scenes', variables.drawingId] });
        },
    });
}

export function useSaveScene() {
    // queryClient not needed if we don't invalidate

    return useMutation({
        mutationFn: ({ id, data, preview }: { id: number; data: any; preview?: string }) =>
            saveScene(id, data, preview),
        // We might not want to invalidate immediately to avoid refetching while editing
        // but if we do, we need to be careful about state syncing.
        // For now, let's NOT invalidate query for 'scene' content to avoid re-render loops
        // if we are driving the editor from this state directly.
        // Typically, editor state is local, and we just save to DB.
        onSuccess: () => {
            // Optional: invalidate if we show last modified time
        }
    });
}
