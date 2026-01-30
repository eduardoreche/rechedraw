import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./index.css";
import { usePresentation } from "./hooks/usePresentation";
import { PresentationControls } from "./components/PresentationControls";
import { SlidesSidebar } from "./components/SlidesSidebar";
import { useState } from "react";
import { Presentation } from "lucide-react";
import { Button as ShadcnButton } from "./components/ui/button";

function App() {
  const {
    excalidrawAPI,
    setExcalidrawAPI,
    presentationMode,
    currentSlide,
    totalSlides,
    orderedFrames,
    setOrderedFrames,
    scanFrames,
    getFrameContent,
    startPresentation,
    nextSlide,
    prevSlide,
    exitPresentation,
  } = usePresentation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scanTimeoutRef = useState<{ id: number | null }>({ id: null })[0];

  return (
    <div className="relative w-full h-full">
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        viewModeEnabled={presentationMode}
        onChange={(elements) => {
          if (!presentationMode) {
            if (scanTimeoutRef.id) {
              window.clearTimeout(scanTimeoutRef.id);
            }
            scanTimeoutRef.id = window.setTimeout(() => {
              scanFrames(elements);
            }, 500);
          }
        }}
      />

      {/* Presentation Button - positioned absolute */}
      {!presentationMode && (
        <ShadcnButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="cursor-pointer fixed top-4 right-32 z-[50] shadow-md border border-slate-200"
          title="Presentation"
        >
          <Presentation className="h-4 w-4 mr-2" />
          Presentation
        </ShadcnButton>
      )}

      <PresentationControls
        presentationMode={presentationMode}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onNext={nextSlide}
        onPrev={prevSlide}
        onExit={exitPresentation}
      />

      {!presentationMode && (
        <SlidesSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          orderedFrames={orderedFrames}
          setOrderedFrames={setOrderedFrames}
          scanFrames={scanFrames}
          getFrameContent={getFrameContent}
          excalidrawAPI={excalidrawAPI}
          onStartPresentation={startPresentation}
        />
      )}
    </div>
  );
}

export default App;
