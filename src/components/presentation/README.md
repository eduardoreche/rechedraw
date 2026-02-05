# Presentation Mode

A self-contained presentation module for Excalidraw clones. Drop this folder into any Excalidraw project to add presentation capabilities.

## Features

- 🎯 **Frame-based slides**: Each Excalidraw frame becomes a slide
- 🎨 **Slide thumbnails**: Visual preview in sidebar
- 🔄 **Drag & drop reordering**: Organize slides easily
- ⌨️ **Keyboard navigation**: Arrow keys, Space, ESC
- 🌓 **Dark mode**: Auto-syncs with Excalidraw theme
- 🖱️ **Laser pointer**: Built-in during presentations
- 💾 **Persistence**: Slide order saved to localStorage

## Usage

```tsx
import { 
  usePresentation, 
  PresentationControls, 
  SlidesSidebar 
} from "./components/presentation";

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

  return (
    <div className={presentationMode ? "presentation-mode" : ""}>
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        onChange={(elements) => {
          if (!presentationMode) {
            scanFrames(elements);
          }
        }}
      />
      
      <PresentationControls
        presentationMode={presentationMode}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onNext={nextSlide}
        onPrev={prevSlide}
        onExit={exitPresentation}
      />
      
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
    </div>
  );
}
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open sidebar | `Ctrl+Shift+P` |
| Start presentation | `Ctrl+Enter` |
| Next slide | `→`, `↓`, `Space` |
| Previous slide | `←`, `↑` |
| Exit | `ESC` |
| Fullscreen | `F11` |

## Dependencies

Requires the following to be already installed in your project:
- `@excalidraw/excalidraw`
- `@radix-ui/react-dialog` (for Sheet component)
- `lucide-react` (for icons)
- shadcn/ui components: Button, Sheet
- Tailwind CSS with shadcn/ui design tokens

## Files

- `index.ts` - Barrel export
- `usePresentation.ts` - Core presentation logic hook
- `PresentationControls.tsx` - Navigation controls component
- `SlidesSidebar.tsx` - Slide management sidebar component
