import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

interface PresentationControlsProps {
    presentationMode: boolean;
    currentSlide: number;
    totalSlides: number;
    onNext: () => void;
    onPrev: () => void;
    onExit: () => void;
}

export function PresentationControls({
    presentationMode,
    currentSlide,
    totalSlides,
    onNext,
    onPrev,
    onExit,
}: PresentationControlsProps) {
    const [showToast, setShowToast] = useState(false);

    // Show toast when entering presentation mode
    useEffect(() => {
        if (presentationMode) {
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setShowToast(false);
        }
    }, [presentationMode]);

    return presentationMode ? (
        <>
            {/* Fullscreen hint toast */}
            {showToast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-sm flex items-center gap-2">
                        <span className="text-sm">
                            Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">F11</kbd> for fullscreen
                        </span>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation controls */}
            <div className="fixed bottom-5 right-5 z-[9999] opacity-40 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPrev}
                        disabled={currentSlide === 0}
                        className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-xs font-medium px-2 min-w-[2.5rem] text-center text-white/90">
                        {currentSlide + 1}/{totalSlides}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNext}
                        disabled={currentSlide === totalSlides - 1}
                        className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-white/30 mx-0.5" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExit}
                        className="h-8 w-8 text-white hover:bg-red-500/50"
                        title="Exit (ESC)"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    ) : null;
}
