
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDrawings, createDrawing, deleteDrawing, updateDrawing } from '../db/queries';

export function useDrawings() {
    return useQuery({
        queryKey: ['drawings'],
        queryFn: getDrawings,
    });
}

export function useCreateDrawing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, isPermanent = false }: { name: string; isPermanent?: boolean }) =>
            createDrawing(name, isPermanent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drawings'] });
        },
    });
}

export function useUpdateDrawing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updates }: { id: number; name?: string; thumbnail?: string }) => updateDrawing(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drawings'] });
        },
    });
}

export function useDeleteDrawing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteDrawing,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drawings'] });
        },
    });
}
