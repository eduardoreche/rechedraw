
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDrawingsByWorkspace, createDrawing, saveDrawing } from '../db/queries';

export function useDrawings(workspaceId: number | null) {
    return useQuery({
        queryKey: ['drawings', workspaceId],
        queryFn: () => (workspaceId ? getDrawingsByWorkspace(workspaceId) : Promise.resolve([])),
        enabled: !!workspaceId,
    });
}

export function useCreateDrawing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, name, data }: { workspaceId: number; name: string; data: any }) =>
            createDrawing(workspaceId, name, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['drawings', variables.workspaceId] });
        },
    });
}

export function useSaveDrawing() {
    // queryClient not needed if we don't invalidate

    return useMutation({
        mutationFn: ({ id, data, preview }: { id: number; data: any; preview?: string }) =>
            saveDrawing(id, data, preview),
        // We might not want to invalidate immediately to avoid refetching while editing
        // but if we do, we need to be careful about state syncing.
        // For now, let's NOT invalidate query for 'drawing' content to avoid re-render loops
        // if we are driving the editor from this state directly.
        // Typically, editor state is local, and we just save to DB.
        onSuccess: () => {
            // Optional: invalidate if we show last modified time
        }
    });
}
