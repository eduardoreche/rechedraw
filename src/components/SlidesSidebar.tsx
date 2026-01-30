import { useEffect, useState, memo } from "react";
import { exportToCanvas } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { GripVertical, Play } from "lucide-react";
import { Button } from "./ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "./ui/sheet";

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

    const getFrameName = (frame: ExcalidrawElement, index: number) => {
        // Excalidraw frames can have a name property
        const frameWithName = frame as any;
        if (frameWithName.name) return frameWithName.name;
        return `Slide ${index + 1}`;
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
            <div className="mt-4 h-32 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={`Preview of slide ${index + 1}`}
                        className="max-w-full max-h-full object-contain shadow-sm"
                    />
                ) : (
                    <span className="text-4xl font-bold text-slate-200/50">
                        {index + 1}
                    </span>
                )}
            </div>
        );
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Slides</SheetTitle>
                    <p className="text-sm text-slate-500">
                        {orderedFrames.length} frame{orderedFrames.length !== 1 ? "s" : ""}
                    </p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {orderedFrames.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-12">
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
                                    group relative p-4 bg-white border border-slate-200 rounded-lg
                                    hover:border-slate-300 hover:shadow-md cursor-move
                                    transition-all duration-200
                                    ${draggedIndex === index ? "opacity-50" : ""}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 truncate">
                                            {getFrameName(frame, index)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Position {index + 1}
                                        </div>
                                    </div>
                                </div>

                                <SlideThumbnail frame={frame} index={index} />
                            </div>
                        ))
                    )}
                </div>

                <SheetFooter className="p-6 border-t flex-col sm:flex-col gap-3">
                    <Button
                        onClick={onStartPresentation}
                        className="w-full h-11 text-base"
                        disabled={orderedFrames.length === 0}
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
