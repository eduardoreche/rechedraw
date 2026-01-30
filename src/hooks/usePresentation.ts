import { useState, useCallback, useEffect } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const usePresentation = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [presentationMode, setPresentationMode] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<ExcalidrawElement[]>([]);
    const [originalElements, setOriginalElements] = useState<readonly ExcalidrawElement[]>([]);
    const [initialAppState, setInitialAppState] = useState<any>(null);
    const [orderedFrames, setOrderedFrames] = useState<ExcalidrawElement[]>([]);

    // Helper function to get elements inside a frame (excluding the frame itself)
    const getFrameContent = useCallback((frame: ExcalidrawElement, allElements: readonly ExcalidrawElement[]) => {
        return allElements.filter((el) => {
            if (el.id === frame.id || el.type === "frame") return false;
            // Check if element is inside the frame (using frameId property)
            if (el.frameId === frame.id) return true;
            return false;
        });
    }, []);

    // Helper function to zoom to fit frame content
    const zoomToFrame = useCallback((frame: ExcalidrawElement, allElements: readonly ExcalidrawElement[]) => {
        if (!excalidrawAPI) return;

        const frameContent = getFrameContent(frame, allElements);

        // Temporarily hide the frame element and show only its content
        const elementsToShow = frameContent.map((el) => ({
            ...el,
            isDeleted: false,
        }));

        // Hide all frames
        const hiddenFrames = allElements
            .filter((el) => el.type === "frame")
            .map((el) => ({
                ...el,
                strokeColor: "transparent",
                backgroundColor: "transparent",
            }));

        // Combine: hidden frames + visible content + other elements not in any frame
        const otherElements = allElements.filter(
            (el) =>
                el.type !== "frame" &&
                !frameContent.some((fc) => fc.id === el.id)
        ).map((el) => ({
            ...el,
            isDeleted: true, // Hide elements not in current frame
        }));

        const updatedElements = [...hiddenFrames, ...elementsToShow, ...otherElements];

        // Update scene with modified elements
        // Note: updateScene expects readonly elements usually, but here we are passing modified copies
        excalidrawAPI.updateScene({
            elements: updatedElements,
        });

        // Use scrollToContent to zoom to the frame
        setTimeout(() => {
            excalidrawAPI.scrollToContent(frame, {
                fitToViewport: true,
                animate: true,
                duration: 300,
            });
        }, 50);
    }, [excalidrawAPI, getFrameContent]);

    // Scan for frames in the scene and update orderedFrames
    const scanFrames = useCallback((elementsToScan?: readonly ExcalidrawElement[]) => {
        if (!excalidrawAPI && !elementsToScan) return;

        const elements = elementsToScan || excalidrawAPI?.getSceneElements() || [];
        const frames = elements.filter((el) => el.type === "frame" && !el.isDeleted);

        setOrderedFrames((prev) => {
            const currentFramesGroupedById = new Map(frames.map(f => [f.id, f]));

            // Preserve existing order, but use the NEW frame objects from the latest elements
            const existingOrderedFrames = prev
                .map(p => currentFramesGroupedById.get(p.id))
                .filter((f): f is ExcalidrawElement => !!f);

            const existingIds = new Set(existingOrderedFrames.map(f => f.id));
            const newFrames = frames.filter(f => !existingIds.has(f.id));

            const updatedOrderedFrames = [
                ...existingOrderedFrames,
                ...newFrames
            ];

            // Optimization: Check if anything actually changed before updating state
            if (prev.length === updatedOrderedFrames.length) {
                const isSame = prev.every((f, i) => f === updatedOrderedFrames[i]);
                if (isSame) return prev;
            }

            // If no ordered frames exist yet, use default sort (top-to-bottom, left-to-right)
            if (prev.length === 0) {
                return [...frames].sort((a, b) => {
                    if (Math.abs(a.y - b.y) > 50) {
                        return a.y - b.y;
                    }
                    return a.x - b.x;
                });
            }

            return updatedOrderedFrames;
        });
    }, [excalidrawAPI]);

    const startPresentation = useCallback(() => {
        if (!excalidrawAPI) return;

        const elements = excalidrawAPI.getSceneElements();
        const frames = elements.filter((el) => el.type === "frame" && !el.isDeleted);

        if (frames.length === 0) {
            alert("No frames found! Create some frames to start a presentation.");
            return;
        }

        // Store original elements to restore later
        setOriginalElements(elements);
        setInitialAppState(excalidrawAPI.getAppState());

        // Use custom order if available, otherwise use default sort
        const framesToUse = orderedFrames.length > 0
            ? orderedFrames.filter(f => frames.some(frame => frame.id === f.id))
            : [...frames].sort((a, b) => {
                if (Math.abs(a.y - b.y) > 50) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            });

        setSlides(framesToUse);
        setCurrentSlide(0);
        setPresentationMode(true);

        // Zoom to first slide
        setTimeout(() => {
            zoomToFrame(framesToUse[0], elements);
        }, 100);
    }, [excalidrawAPI, zoomToFrame, orderedFrames]);

    const nextSlide = useCallback(() => {
        if (!excalidrawAPI || !slides.length) return;

        const nextIndex = Math.min(currentSlide + 1, slides.length - 1);
        if (nextIndex !== currentSlide) {
            setCurrentSlide(nextIndex);
            zoomToFrame(slides[nextIndex], originalElements);
        }
    }, [excalidrawAPI, slides, currentSlide, zoomToFrame, originalElements]);

    const prevSlide = useCallback(() => {
        if (!excalidrawAPI || !slides.length) return;

        const prevIndex = Math.max(currentSlide - 1, 0);
        if (prevIndex !== currentSlide) {
            setCurrentSlide(prevIndex);
            zoomToFrame(slides[prevIndex], originalElements);
        }
    }, [excalidrawAPI, slides, currentSlide, zoomToFrame, originalElements]);

    const exitPresentation = useCallback(() => {
        if (excalidrawAPI && originalElements.length > 0) {
            const restoreState = initialAppState ? {
                ...initialAppState,
                zoom: { value: 1 },
                // Restore scrollX/Y from initial state automatically by spreading
            } : undefined;

            // Restore original elements
            excalidrawAPI.updateScene({
                elements: originalElements,
                appState: restoreState,
            });
        }
        setPresentationMode(false);
        setSlides([]);
        setCurrentSlide(0);
        setOriginalElements([]);
        setInitialAppState(null);
    }, [excalidrawAPI, originalElements, initialAppState]);

    // Keyboard navigation
    useEffect(() => {
        if (!presentationMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                nextSlide();
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                prevSlide();
            } else if (e.key === "Escape") {
                e.preventDefault();
                exitPresentation();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [presentationMode, nextSlide, prevSlide, exitPresentation]);

    return {
        excalidrawAPI,
        setExcalidrawAPI,
        presentationMode,
        currentSlide,
        totalSlides: slides.length,
        orderedFrames,
        setOrderedFrames,
        scanFrames,
        getFrameContent,
        startPresentation,
        nextSlide,
        prevSlide,
        exitPresentation
    };
};
