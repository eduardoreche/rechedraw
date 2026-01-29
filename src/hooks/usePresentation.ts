import { useState, useCallback, useEffect } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const usePresentation = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [presentationMode, setPresentationMode] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<ExcalidrawElement[]>([]);
    const [originalElements, setOriginalElements] = useState<readonly ExcalidrawElement[]>([]);

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
    const zoomToFrame = useCallback((frame: ExcalidrawElement) => {
        if (!excalidrawAPI) return;

        const allElements = excalidrawAPI.getSceneElements();
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
                opacity: 0, // Try to hide frame by setting opacity to 0
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

        // Sort frames: Top-to-bottom, then Left-to-right
        frames.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 50) {
                return a.y - b.y;
            }
            return a.x - b.x;
        });

        setSlides(frames);
        setCurrentSlide(0);
        setPresentationMode(true);

        // Zoom to first slide
        setTimeout(() => {
            zoomToFrame(frames[0]);
        }, 100);
    }, [excalidrawAPI, zoomToFrame]);

    const nextSlide = useCallback(() => {
        if (!excalidrawAPI || !slides.length) return;

        const nextIndex = Math.min(currentSlide + 1, slides.length - 1);
        if (nextIndex !== currentSlide) {
            setCurrentSlide(nextIndex);
            zoomToFrame(slides[nextIndex]);
        }
    }, [excalidrawAPI, slides, currentSlide, zoomToFrame]);

    const prevSlide = useCallback(() => {
        if (!excalidrawAPI || !slides.length) return;

        const prevIndex = Math.max(currentSlide - 1, 0);
        if (prevIndex !== currentSlide) {
            setCurrentSlide(prevIndex);
            zoomToFrame(slides[prevIndex]);
        }
    }, [excalidrawAPI, slides, currentSlide, zoomToFrame]);

    const exitPresentation = useCallback(() => {
        if (excalidrawAPI && originalElements.length > 0) {
            // Restore original elements
            excalidrawAPI.updateScene({
                elements: originalElements,
            });
        }
        setPresentationMode(false);
        setSlides([]);
        setCurrentSlide(0);
        setOriginalElements([]);
    }, [excalidrawAPI, originalElements]);

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
        startPresentation,
        nextSlide,
        prevSlide,
        exitPresentation
    };
};
