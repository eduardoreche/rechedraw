import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./index.css";
import {
  usePresentation,
  PresentationControls,
  SlidesSidebar
} from "./components/presentation";
import { useState, useEffect, useRef } from "react";
import { Presentation, PanelRightOpen } from "lucide-react";
import { Button } from "./components/ui/button";
import { DrawingSidebar } from "./features/drawing-list/components/DrawingSidebar";
import { useScenes, useSaveScene } from "./hooks/use-scenes";
import { useDrawings, useCreateDrawing } from "./hooks/use-drawings";
import { usePersistence } from "./hooks/use-persistence";
import { useShortcuts } from "./hooks/use-shortcuts";
import {
  loadSlideOrder,
  saveSlideOrder,
  loadLastDrawingId,
  saveLastDrawingId,
  sanitizeAppState,
  saveSceneToLocalStorage,
} from "./utils/storage";

const initialSlideOrder = loadSlideOrder();

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
  } = usePresentation(initialSlideOrder);

  // Drawing state (formerly Workspace)
  const [currentDrawingId, setCurrentDrawingId] = useState<number | null>(() => loadLastDrawingId());
  const [currentDrawingName, setCurrentDrawingName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slidesSidebarOpen, setSlidesSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scanTimeoutRef = useRef<number | null>(null);

  // Fetch Data
  const { data: scenes } = useScenes(currentDrawingId);
  const saveSceneMutation = useSaveScene();
  const { data: drawings } = useDrawings();
  const createDrawing = useCreateDrawing();
  const activeScene = scenes?.[0];

  // Persistence Hook
  const { initialData, saveDebounced } = usePersistence({
    currentDrawingId,
    activeScene,
    saveSceneMutation,
  });

  // Shortcuts Hook
  useShortcuts({
    presentationMode,
    slidesSidebarOpen,
    setSlidesSidebarOpen,
    sidebarOpen,
    setSidebarOpen,
    orderedFrames,
    startPresentation,
  });

  // Effects
  useEffect(() => {
    if (currentDrawingId !== null) {
      saveLastDrawingId(currentDrawingId);
    }
  }, [currentDrawingId]);

  useEffect(() => {
    if (currentDrawingId && drawings) {
      const drawing = drawings.find(d => d.id === currentDrawingId);
      setCurrentDrawingName(drawing?.name || "");
    } else {
      setCurrentDrawingName("");
    }
  }, [currentDrawingId, drawings]);

  // Initialize default "Draft" drawing if none exists
  useEffect(() => {
    if (drawings && drawings.length === 0 && !createDrawing.isPending) {
      createDrawing.mutate(
        { name: "Draft", isPermanent: true },
        {
          onSuccess: (id) => {
            setCurrentDrawingId(id);
          },
        }
      );
    }
  }, [drawings, createDrawing]);

  useEffect(() => {
    if (orderedFrames.length > 0) {
      saveSlideOrder(orderedFrames.map(f => f.id));
    }
  }, [orderedFrames]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Main Change Handler
  const handleChange = (elements: any, appState: any, files: any) => {
    const newDarkMode = appState.theme === "dark";
    if (newDarkMode !== isDarkMode) setIsDarkMode(newDarkMode);

    if (!presentationMode && activeScene && currentDrawingId) {
      const dataToSave = {
        elements,
        appState: sanitizeAppState(appState),
        files,
      };

      // Save to localStorage immediately (synchronous, no race conditions)
      saveSceneToLocalStorage(currentDrawingId, dataToSave);

      // Debounced save to DB
      saveDebounced(elements, appState, files);

      // Scan frames logic
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = window.setTimeout(() => {
        scanFrames(elements);
      }, 500);
    }
  };

  return (
    <div className={`relative w-full h-full flex ${isDarkMode ? "dark" : ""}`}>
      {/* Drawings Sidebar */}
      <DrawingSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentDrawingId={currentDrawingId}
        onSelectDrawing={(id) => {
          setCurrentDrawingId(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex-1 relative h-full">
        <div className={`w-full h-full ${presentationMode ? "presentation-mode" : ""}`}>
          <Excalidraw
            key={String(currentDrawingId)} // Force remount when drawing changes to load correct initialData
            excalidrawAPI={setExcalidrawAPI}
            initialData={initialData}
            onChange={handleChange}
            renderTopRightUI={() => (
              <div className="flex gap-2">
                {!presentationMode && (
                  <>
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="workspace-button excalidraw-btn"
                      title="Drawings"
                    >
                      <PanelRightOpen />
                    </button>

                    {/* Drawing name display */}
                    {currentDrawingName && (
                      <div className="workspace-name-display flex items-center gap-2">
                        <div className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">
                          {currentDrawingName}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setSlidesSidebarOpen(!slidesSidebarOpen)}
                      className="shadow-md border border-slate-200"
                      title="Presentation (Ctrl+Shift+P)"
                    >
                      <Presentation className="h-4 w-4 mr-2" />
                      Presentation
                    </Button>
                  </>
                )}
              </div>
            )}
          />
        </div>

        {/* Overlays */}
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
            isOpen={slidesSidebarOpen}
            onClose={() => setSlidesSidebarOpen(false)}
            orderedFrames={orderedFrames}
            setOrderedFrames={setOrderedFrames}
            scanFrames={scanFrames}
            getFrameContent={getFrameContent}
            excalidrawAPI={excalidrawAPI}
            onStartPresentation={startPresentation}
          />
        )}
      </div>
    </div>
  );
}

export default App;
