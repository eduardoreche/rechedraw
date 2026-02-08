import { useState } from "react";
import { FolderOpen, Plus, Trash2, Edit2, Check, X, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useDrawings,
    useCreateDrawing,
    useDeleteDrawing,
    useUpdateDrawing,
} from "@/hooks/use-drawings";
import { cn } from "@/lib/utils";

import type { Drawing } from "@/db/index";

interface DrawingSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentDrawingId: number | null;
    onSelectDrawing: (id: number) => void;
}

export function DrawingSidebar({
    isOpen,
    onClose,
    currentDrawingId,
    onSelectDrawing,
}: DrawingSidebarProps) {
    const { data: drawings, isLoading } = useDrawings();
    const createDrawing = useCreateDrawing();
    const deleteDrawing = useDeleteDrawing();
    const updateDrawing = useUpdateDrawing();

    const [isCreating, setIsCreating] = useState(false);
    const [newDrawingName, setNewDrawingName] = useState("");
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
        if (!newDrawingName.trim()) return;
        try {
            const id = await createDrawing.mutateAsync({ name: newDrawingName });
            setNewDrawingName("");
            setIsCreating(false);
            onSelectDrawing(id);
        } catch (e) {
            console.error("Failed to create drawing", e);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) return;
        try {
            await updateDrawing.mutateAsync({ id, name: editName });
            setEditingId(null);
        } catch (e) {
            console.error("Failed to update drawing", e);
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this drawing?")) {
            await deleteDrawing.mutateAsync(id);
            if (currentDrawingId === id) {
                onSelectDrawing(0); // Deselect or handle gracefully
            }
        }
    };

    // Filter drawings
    const filteredDrawings = drawings?.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <FolderOpen className="h-5 w-5" /> Drawings
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
                        placeholder="Search drawings..."
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
                        {filteredDrawings?.length === 0 ? (
                            <div className="text-center text-muted-foreground p-4 text-sm">
                                No drawings found
                            </div>
                        ) : (
                            filteredDrawings?.map((d: Drawing) => (
                                <div
                                    key={d.id}
                                    className={cn(
                                        "group rounded-md cursor-pointer transition-all border",
                                        viewMode === "list"
                                            ? "flex items-center justify-between p-2 hover:bg-accent border-transparent hover:border-border"
                                            : "flex flex-col p-2 hover:bg-accent hover:border-primary/50 relative overflow-hidden",
                                        currentDrawingId === d.id && "bg-accent/80 text-accent-foreground font-medium border-primary/20"
                                    )}
                                    onClick={() => onSelectDrawing(d.id)}
                                >
                                    {/* Grid View Thumbnail */}
                                    {viewMode === "grid" && (
                                        <div className="aspect-video w-full bg-muted/50 rounded overflow-hidden mb-2 relative border border-border/50">
                                            {d.thumbnail ? (
                                                <img src={d.thumbnail} alt={d.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                    <FolderOpen className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {editingId === d.id ? (
                                        <div className="flex items-center gap-1 w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <Input
                                                value={editName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                                                className="h-7 text-xs"
                                                autoFocus
                                                onKeyDown={(e: React.KeyboardEvent) => {
                                                    if (e.key === 'Enter') handleUpdate(d.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdate(d.id)}>
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
                                                {viewMode === "list" && d.thumbnail && (
                                                    <img src={d.thumbnail} alt="" className="h-6 w-8 object-cover rounded border border-border/50 bg-muted" />
                                                )}
                                                <span className="truncate text-sm">{d.name}</span>
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
                                                        setEditingId(d.id);
                                                        setEditName(d.name);
                                                    }}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                                    onClick={(e) => handleDelete(e, d.id)}
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
                            placeholder="Drawing Name"
                            value={newDrawingName}
                            onChange={(e) => setNewDrawingName(e.target.value)}
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
                        <Plus className="h-4 w-4 mr-2" /> New Drawing
                    </Button>
                )}
            </div>
        </div>
    );
}
