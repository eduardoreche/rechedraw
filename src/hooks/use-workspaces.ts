
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '../db/queries';

export function useWorkspaces() {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: getWorkspaces,
    });
}

export function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, isPermanent = false }: { name: string; isPermanent?: boolean }) =>
            createWorkspace(name, isPermanent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });
}

export function useUpdateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updates }: { id: number; name?: string; thumbnail?: string }) => updateWorkspace(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });
}

export function useDeleteWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWorkspace,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });
}
