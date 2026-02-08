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
import { WorkspaceSidebar } from "./features/workspace/components/WorkspaceSidebar";
import { useDrawings, useSaveDrawing } from "./hooks/use-drawings";
import { useWorkspaces } from "./hooks/use-workspaces";
import { usePersistence } from "./hooks/use-persistence";
import { useShortcuts } from "./hooks/use-shortcuts";
import {
  loadSlideOrder,
  saveSlideOrder,
  loadLastWorkspaceId,
  saveLastWorkspaceId,
  sanitizeAppState,
  saveDrawingToLocalStorage,
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

  // Workspace state
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(() => loadLastWorkspaceId());
  const [currentWorkspaceName, setCurrentWorkspaceName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slidesSidebarOpen, setSlidesSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scanTimeoutRef = useRef<number | null>(null);

  // Fetch Data
  const { data: drawings } = useDrawings(currentWorkspaceId);
  const saveDrawingMutation = useSaveDrawing();
  const { data: workspaces } = useWorkspaces();
  const activeDrawing = drawings?.[0];

  // Persistence Hook
  const { initialData, saveDebounced } = usePersistence({
    currentWorkspaceId,
    activeDrawing,
    saveDrawingMutation,
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
    if (currentWorkspaceId !== null) {
      saveLastWorkspaceId(currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspaceId && workspaces) {
      const workspace = workspaces.find(w => w.id === currentWorkspaceId);
      setCurrentWorkspaceName(workspace?.name || "");
    } else {
      setCurrentWorkspaceName("");
    }
  }, [currentWorkspaceId, workspaces]);

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

    if (!presentationMode && activeDrawing && currentWorkspaceId) {
      // Save to localStorage immediately (synchronous, no race conditions)
      saveDrawingToLocalStorage(currentWorkspaceId, {
        elements,
        appState: sanitizeAppState(appState),
        files,
      });

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
      {/* Workspaces Sidebar */}
      <WorkspaceSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentWorkspaceId={currentWorkspaceId}
        onSelectWorkspace={(id) => {
          setCurrentWorkspaceId(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex-1 relative h-full">
        <div className={`w-full h-full ${presentationMode ? "presentation-mode" : ""}`}>
          <Excalidraw
            key={String(currentWorkspaceId)} // Force remount when workspace changes to load correct initialData
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
                      title="Workspaces"
                    >
                      <PanelRightOpen />
                    </button>

                    {/* Workspace name display */}
                    {currentWorkspaceName && (
                      <div className="workspace-name-display">
                        {currentWorkspaceName}
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
