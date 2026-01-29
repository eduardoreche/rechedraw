import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./index.css";
import { usePresentation } from "./hooks/usePresentation";
import { PresentationControls } from "./components/PresentationControls";

function App() {
  const {
    setExcalidrawAPI,
    presentationMode,
    currentSlide,
    totalSlides,
    startPresentation,
    nextSlide,
    prevSlide,
    exitPresentation,
  } = usePresentation();

  return (
    <div className="relative w-full h-full">
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        viewModeEnabled={presentationMode}
      />

      <PresentationControls
        presentationMode={presentationMode}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onStart={startPresentation}
        onNext={nextSlide}
        onPrev={prevSlide}
        onExit={exitPresentation}
      />
    </div>
  );
}

export default App;
