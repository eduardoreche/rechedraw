import { useState } from "react";
import { FolderOpen, Plus, Trash2, Edit2, Check, X, LayoutGrid, List } from "lucide-react";
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

    // View Mode Persistence
    const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
        return (localStorage.getItem("rechedraw-sidebar-view-mode") as "list" | "grid") || "list";
    });

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // Update view mode and save to localStorage
    const handleSetViewMode = (mode: "list" | "grid") => {
        setViewMode(mode);
        localStorage.setItem("rechedraw-sidebar-view-mode", mode);
    };

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

    // Filter workspaces
    const filteredWorkspaces = workspaces?.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out shadow-lg flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="p-4 border-b bg-muted/30">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" /> Workspaces
                    </h2>
                    <div className="flex gap-1">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSetViewMode("list")}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSetViewMode("grid")}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Input
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 p-2">
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : (
                    <div className={cn(
                        viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-1"
                    )}>
                        {filteredWorkspaces?.length === 0 ? (
                            <div className="text-center text-muted-foreground p-4 text-sm">
                                No workspaces found
                            </div>
                        ) : (
                            filteredWorkspaces?.map((ws: Workspace) => (
                                <div
                                    key={ws.id}
                                    className={cn(
                                        "group rounded-md cursor-pointer transition-all border",
                                        viewMode === "list"
                                            ? "flex items-center justify-between p-2 hover:bg-accent border-transparent hover:border-border"
                                            : "flex flex-col p-2 hover:bg-accent hover:border-primary/50 relative overflow-hidden",
                                        currentWorkspaceId === ws.id && "bg-accent/80 text-accent-foreground font-medium border-primary/20"
                                    )}
                                    onClick={() => onSelectWorkspace(ws.id)}
                                >
                                    {/* Grid View Thumbnail */}
                                    {viewMode === "grid" && (
                                        <div className="aspect-video w-full bg-muted/50 rounded overflow-hidden mb-2 relative border border-border/50">
                                            {ws.thumbnail ? (
                                                <img src={ws.thumbnail} alt={ws.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                    <FolderOpen className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                                            {/* List View Content */}
                                            <div className={cn("flex items-center gap-2 truncate flex-1", viewMode === "grid" && "w-full")}>
                                                {viewMode === "list" && ws.thumbnail && (
                                                    <img src={ws.thumbnail} alt="" className="h-6 w-8 object-cover rounded border border-border/50 bg-muted" />
                                                )}
                                                <span className="truncate text-sm">{ws.name}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className={cn(
                                                "flex items-center gap-1 transition-opacity",
                                                viewMode === "list" ? "opacity-0 group-hover:opacity-100" : "absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm rounded shadow-sm"
                                            )}>
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
                            ))
                        )}
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
