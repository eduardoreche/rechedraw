import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Button } from "./ui/button";

interface PresentationControlsProps {
    presentationMode: boolean;
    currentSlide: number;
    totalSlides: number;
    onStart: () => void;
    onNext: () => void;
    onPrev: () => void;
    onExit: () => void;
}

export const PresentationControls = ({
    presentationMode,
    currentSlide,
    totalSlides,
    onStart,
    onNext,
    onPrev,
    onExit,
}: PresentationControlsProps) => {
    // Handle fullscreen mode
    useEffect(() => {
        if (presentationMode) {
            // Enter fullscreen
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch((err) => {
                    console.warn("Failed to enter fullscreen:", err);
                });
            }
        } else {
            // Exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => {
                    console.warn("Failed to exit fullscreen:", err);
                });
            }
        }
    }, [presentationMode]);

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex gap-2">
            {!presentationMode ? (
                <Button
                    onClick={onStart}
                    size="lg"
                    className="shadow-lg"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Start Presentation
                </Button>
            ) : (
                <div className="flex items-center gap-2 bg-white/95 p-2 rounded-lg shadow-xl backdrop-blur-sm border border-slate-200">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onPrev}
                        disabled={currentSlide === 0}
                        className="h-9 w-9"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm font-medium px-2 min-w-[3rem] text-center text-slate-900">
                        {currentSlide + 1} / {totalSlides}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onNext}
                        disabled={currentSlide === totalSlides - 1}
                        className="h-9 w-9"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-slate-200 mx-1" />

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onExit}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Exit
                    </Button>
                </div>
            )}
        </div>
    );
};
