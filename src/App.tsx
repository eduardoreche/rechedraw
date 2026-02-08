import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./index.css";
import {
  usePresentation,
  PresentationControls,
  SlidesSidebar
} from "./components/presentation";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Presentation, PanelRightOpen } from "lucide-react";
import { Button } from "./components/ui/button";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { WorkspaceSidebar } from "./features/workspace/components/WorkspaceSidebar";
import { useDrawings, useSaveDrawing } from "./hooks/use-drawings";
import { useWorkspaces, useCreateWorkspace } from "./hooks/use-workspaces";

const SLIDE_ORDER_KEY = "rechedraw-slide-order";
const APPSTATE_KEY = "rechedraw-appstate";
const LAST_WORKSPACE_KEY = "rechedraw-last-workspace-id";
const DRAWING_DATA_KEY = "rechedraw-drawing-data";

// Helper to sanitize appState for saving
const sanitizeAppState = (appState: AppState) => {
  const { collaborators, ...rest } = appState as any;
  return rest;
};

// Load slide order from localStorage
const loadSlideOrder = (): string[] => {
  try {
    const data = localStorage.getItem(SLIDE_ORDER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load slide order from localStorage:", error);
  }
  return [];
};

// Save slide order to localStorage
const saveSlideOrder = (frameIds: string[]) => {
  try {
    localStorage.setItem(SLIDE_ORDER_KEY, JSON.stringify(frameIds));
  } catch (error) {
    console.error("Failed to save slide order to localStorage:", error);
  }
};

// Load AppState from localStorage
const loadAppState = (): Partial<AppState> | null => {
  try {
    const data = localStorage.getItem(APPSTATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load AppState from localStorage:", error);
  }
  return null;
};

// Save AppState to localStorage
const saveAppState = (appState: Partial<AppState>) => {
  try {
    // Only save relevant properties
    const stateToSave = {
      theme: appState.theme,
      viewBackgroundColor: appState.viewBackgroundColor,
      zoom: appState.zoom,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
      gridSize: appState.gridSize,
    };
    localStorage.setItem(APPSTATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Failed to save AppState to localStorage:", error);
  }
};

// Save/load drawing data to/from localStorage
const saveDrawingToLocalStorage = (workspaceId: number | string, data: { elements: readonly any[]; appState: any; files: any }) => {
  try {
    localStorage.setItem(`${DRAWING_DATA_KEY}-${workspaceId}`, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save drawing to localStorage:", error);
  }
};

const loadDrawingFromLocalStorage = (workspaceId: number | string) => {
  try {
    const saved = localStorage.getItem(`${DRAWING_DATA_KEY}-${workspaceId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load drawing from localStorage:", error);
    return null;
  }
};

// Load last workspace ID from localStorage
const loadLastWorkspaceId = (): number | null => {
  try {
    const data = localStorage.getItem(LAST_WORKSPACE_KEY);
    if (data) {
      return parseInt(data, 10);
    }
  } catch (error) {
    console.error("Failed to load last workspace ID:", error);
  }
  return null;
};

// Save last workspace ID to localStorage
const saveLastWorkspaceId = (workspaceId: number) => {
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY, workspaceId.toString());
  } catch (error) {
    console.error("Failed to save last workspace ID:", error);
  }
};

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

  const saveTimeoutRef = useRef<number | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  // Fetch drawings for current workspace
  const { data: drawings } = useDrawings(currentWorkspaceId);
  const saveDrawingMutation = useSaveDrawing();

  // Fetch workspaces to get workspace name
  const { data: workspaces } = useWorkspaces();


  // Get the active drawing (first one for now, can be enhanced later)
  const activeDrawing = drawings?.[0];

  // Memoize the initial data to avoid re-renders
  const initialData = useMemo(() => {
    if (!currentWorkspaceId) return null;

    // Try to load from localStorage first (synchronous/fast)
    const localData = loadDrawingFromLocalStorage(currentWorkspaceId);
    if (localData) {
      return {
        elements: localData.elements || [],
        appState: {
          ...loadAppState(),
          ...(localData.appState || {}),
        },
        files: localData.files || null
      };
    }

    // Fallback to database data if available
    if (activeDrawing) {
      return {
        elements: (activeDrawing.data as any)?.elements || [],
        appState: {
          ...loadAppState(),
          ...((activeDrawing.data as any)?.appState || {}),
        },
        files: (activeDrawing.data as any)?.files || null
      };
    }

    return {
      elements: [],
      appState: loadAppState(),
    };
  }, [currentWorkspaceId, activeDrawing]);

  // Load drawing data when active drawing changes

  // Save workspace ID when it changes
  useEffect(() => {
    if (currentWorkspaceId !== null) {
      saveLastWorkspaceId(currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  // Update workspace name when workspace changes
  useEffect(() => {
    if (currentWorkspaceId && workspaces) {
      const workspace = workspaces.find(w => w.id === currentWorkspaceId);
      setCurrentWorkspaceName(workspace?.name || "");
    } else {
      setCurrentWorkspaceName("");
    }
  }, [currentWorkspaceId, workspaces]);




  // Save slide order when it changes
  useEffect(() => {
    if (orderedFrames.length > 0) {
      saveSlideOrder(orderedFrames.map(f => f.id));
    }
  }, [orderedFrames]);

  // Sync dark mode with document for portals (Sheet, etc.)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Debounced save to database
  const saveDebounced = useCallback((
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      if (activeDrawing) {
        try {
          const dataToSave = {
            elements,
            appState: sanitizeAppState(appState),
            files,
          };
          await saveDrawingMutation.mutateAsync({
            id: activeDrawing.id,
            data: dataToSave,
          });

          // Also save AppState to localStorage
          saveAppState(appState);
        } catch (error) {
          console.error("Failed to save drawing:", error);
        }
      }
    }, 500); // 500ms debounce
  }, [activeDrawing, saveDrawingMutation]);

  // Keyboard shortcuts
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
  }, [presentationMode, slidesSidebarOpen, sidebarOpen, orderedFrames.length, startPresentation]);

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
            onChange={(elements, appState, files) => {
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
            }}
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
