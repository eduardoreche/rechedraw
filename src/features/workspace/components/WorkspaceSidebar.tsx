
import { useState } from "react";
import { FolderOpen, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useWorkspaces,
    useCreateWorkspace,
    useDeleteWorkspace,
    useUpdateWorkspace,
} from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";

import type { Workspace } from "@/db/index";

interface WorkspaceSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentWorkspaceId: number | null;
    onSelectWorkspace: (id: number) => void;
}

export function WorkspaceSidebar({
    isOpen,
    onClose,
    currentWorkspaceId,
    onSelectWorkspace,
}: WorkspaceSidebarProps) {
    const { data: workspaces, isLoading } = useWorkspaces();
    const createWorkspace = useCreateWorkspace();
    const deleteWorkspace = useDeleteWorkspace();
    const updateWorkspace = useUpdateWorkspace();

    const [isCreating, setIsCreating] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    const handleCreate = async () => {
        if (!newWorkspaceName.trim()) return;
        try {
            const id = await createWorkspace.mutateAsync({ name: newWorkspaceName });
            setNewWorkspaceName("");
            setIsCreating(false);
            onSelectWorkspace(id);
        } catch (e) {
            console.error("Failed to create workspace", e);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) return;
        try {
            await updateWorkspace.mutateAsync({ id, name: editName });
            setEditingId(null);
        } catch (e) {
            console.error("Failed to update workspace", e);
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this workspace?")) {
            await deleteWorkspace.mutateAsync(id);
            if (currentWorkspaceId === id) {
                onSelectWorkspace(0); // Deselect or handle gracefully
            }
        }
    };

    return (
        <div
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out shadow-lg flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" /> Workspaces
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-2">
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : (
                    <div className="space-y-1">
                        {workspaces?.map((ws: Workspace) => (
                            <div
                                key={ws.id}
                                className={cn(
                                    "group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors",
                                    currentWorkspaceId === ws.id && "bg-accent/80 text-accent-foreground font-medium"
                                )}
                                onClick={() => onSelectWorkspace(ws.id)}
                            >
                                {editingId === ws.id ? (
                                    <div className="flex items-center gap-1 w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                        <Input
                                            value={editName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                                            className="h-7 text-xs"
                                            autoFocus
                                            onKeyDown={(e: React.KeyboardEvent) => {
                                                if (e.key === 'Enter') handleUpdate(ws.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                        />
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdate(ws.id)}>
                                            <Check className="h-3 w-3 text-green-500" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                                            <X className="h-3 w-3 text-red-500" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 truncate flex-1">
                                            <span className="truncate">{ws.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    setEditingId(ws.id);
                                                    setEditName(ws.name);
                                                }}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-destructive hover:text-destructive"
                                                onClick={(e) => handleDelete(e, ws.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t bg-muted/30">
                {isCreating ? (
                    <div className="space-y-2">
                        <Input
                            placeholder="Workspace Name"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreate();
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={handleCreate}>
                                Create
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsCreating(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="w-full"
                        variant="default"
                        onClick={() => setIsCreating(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Workspace
                    </Button>
                )}
            </div>
        </div>
    );
}
