import { useEffect } from "react";

interface UseShortcutsProps {
    presentationMode: boolean;
    slidesSidebarOpen: boolean;
    setSlidesSidebarOpen: (open: boolean) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    orderedFrames: any[];
    startPresentation: () => void;
}

export const useShortcuts = ({
    presentationMode,
    slidesSidebarOpen,
    setSlidesSidebarOpen,
    sidebarOpen,
    setSidebarOpen,
    orderedFrames,
    startPresentation,
}: UseShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (presentationMode) return;

            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
                e.preventDefault();
                setSlidesSidebarOpen(true);
            }
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                if (orderedFrames.length > 0) {
                    startPresentation();
                } else {
                    setSlidesSidebarOpen(true);
                }
            }
            if (e.key === "Escape") {
                if (slidesSidebarOpen) setSlidesSidebarOpen(false);
                if (sidebarOpen) setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        presentationMode,
        slidesSidebarOpen,
        sidebarOpen,
        orderedFrames.length,
        startPresentation,
        setSlidesSidebarOpen,
        setSidebarOpen,
    ]);
};
