import { useEffect, useState, memo } from "react";
import { exportToCanvas } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { GripVertical, Play, ChevronDown, ChevronUp, HelpCircle, Keyboard, MousePointer, Move } from "lucide-react";
import { Button } from "./ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "./ui/sheet";

const HELP_COLLAPSED_KEY = "rechedraw-help-collapsed";

interface SlidesSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orderedFrames: ExcalidrawElement[];
    setOrderedFrames: (frames: ExcalidrawElement[]) => void;
    scanFrames: () => void;
    getFrameContent: (frame: ExcalidrawElement, allElements: readonly ExcalidrawElement[]) => ExcalidrawElement[];
    excalidrawAPI: any;
    onStartPresentation: () => void;
}

export const SlidesSidebar = ({
    isOpen,
    onClose,
    orderedFrames,
    setOrderedFrames,
    scanFrames,
    getFrameContent,
    excalidrawAPI,
    onStartPresentation,
}: SlidesSidebarProps) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [helpCollapsed, setHelpCollapsed] = useState(() => {
        const saved = localStorage.getItem(HELP_COLLAPSED_KEY);
        return saved === "true"; // Default to expanded (false) if not saved
    });

    // Persist help collapsed state
    const toggleHelp = () => {
        const newState = !helpCollapsed;
        setHelpCollapsed(newState);
        localStorage.setItem(HELP_COLLAPSED_KEY, String(newState));
    };

    // Scan frames on mount and when excalidrawAPI changes
    useEffect(() => {
        if (excalidrawAPI) {
            scanFrames();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excalidrawAPI]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFrames = [...orderedFrames];
        const draggedFrame = newFrames[draggedIndex];
        newFrames.splice(draggedIndex, 1);
        newFrames.splice(index, 0, draggedFrame);

        setOrderedFrames(newFrames);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };


    const SlideThumbnail = memo(({ frame, index }: { frame: ExcalidrawElement, index: number }) => {
        const [thumbnail, setThumbnail] = useState<string | null>(null);

        useEffect(() => {
            let isCancelled = false;

            const generateThumbnail = async () => {
                if (!excalidrawAPI) return;

                const allElements = excalidrawAPI.getSceneElements();
                const frameElements = getFrameContent(frame, allElements);

                // Include the frame itself so it renders the background/border
                const elementsToExport = [frame, ...frameElements];

                try {
                    const canvas = await exportToCanvas({
                        elements: elementsToExport,
                        appState: {
                            ...excalidrawAPI.getAppState(),
                            exportWithDarkMode: false,
                            exportBackground: true,
                            viewBackgroundColor: "#ffffff",
                        },
                        files: excalidrawAPI.getFiles(),
                        maxWidthOrHeight: 200,
                    });

                    if (!isCancelled) {
                        setThumbnail(canvas.toDataURL());
                    }
                } catch (error) {
                    console.error("Failed to generate thumbnail:", error);
                }
            };

            generateThumbnail();

            return () => {
                isCancelled = true;
            };
        }, [frame, excalidrawAPI]);

        return (
            <div className="mt-4 h-32 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={`Preview of slide ${index + 1}`}
                        className="max-w-full max-h-full object-contain shadow-sm"
                    />
                ) : (
                    <span className="text-4xl font-bold text-slate-200/50 dark:text-slate-700">
                        {index + 1}
                    </span>
                )}
            </div>
        );
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b dark:border-slate-700">
                    <SheetTitle>Slides</SheetTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {orderedFrames.length} frame{orderedFrames.length !== 1 ? "s" : ""}
                    </p>
                </SheetHeader>

                {/* Collapsible Help Section */}
                <div className="border-b bg-amber-50 dark:bg-amber-950/30">
                    <button
                        onClick={toggleHelp}
                        className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                            <HelpCircle className="w-4 h-4" />
                            How to use
                        </div>
                        {helpCollapsed ? (
                            <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                    </button>

                    {!helpCollapsed && (
                        <div className="px-6 pb-4 space-y-3 text-sm text-amber-900 dark:text-amber-100">
                            <div className="flex items-start gap-3">
                                <Move className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <p><strong>Create slides:</strong> Press <kbd className="px-1 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-xs font-mono">F</kbd> to activate the Frame tool. Each frame becomes a slide.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <GripVertical className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <p><strong>Reorder:</strong> Drag and drop slides in this sidebar to change their order.</p>
                            </div>

                            <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                    <Keyboard className="w-3.5 h-3.5" />
                                    Keyboard Shortcuts
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200">Open sidebar</span>
                                        <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono whitespace-nowrap">Ctrl+Shift+P</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200">Start presentation</span>
                                        <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono whitespace-nowrap">Ctrl+Enter</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200">Navigate slides</span>
                                        <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono whitespace-nowrap">Arrows / Space</kbd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200">Exit / Fullscreen</span>
                                        <span className="flex gap-1">
                                            <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono">ESC</kbd>
                                            <kbd className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono">F11</kbd>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                    <MousePointer className="w-3.5 h-3.5" />
                                    During Presentation
                                </div>
                                <ul className="text-xs space-y-1 text-amber-700 dark:text-amber-300">
                                    <li>• <strong>Laser pointer</strong> is automatically enabled</li>
                                    <li>• Click and drag to point at content</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {orderedFrames.length === 0 ? (
                        <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-12">
                            No frames found.<br />
                            Create frames to see them here.
                        </div>
                    ) : (
                        orderedFrames.map((frame, index) => (
                            <div
                                key={frame.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    group relative p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
                                    hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md cursor-move
                                    transition-all duration-200
                                    ${draggedIndex === index ? "opacity-50" : ""}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-12" />
                                    <SlideThumbnail frame={frame} index={index} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <SheetFooter className="p-6 border-t dark:border-slate-700 flex-col sm:flex-col gap-3">
                    <Button
                        onClick={onStartPresentation}
                        className="w-full h-11 text-base"
                        disabled={orderedFrames.length === 0}
                        title="Start Presentation (Ctrl+Enter)"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Presentation
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={scanFrames}
                        className="w-full"
                    >
                        Refresh Frames
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
