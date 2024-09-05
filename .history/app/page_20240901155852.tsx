export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const scale = useRef(1);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  // Event Handlers
  const handleZoom = (amount) => {
    scale.current *= amount;
    fabricRef.current.setZoom(scale.current);
    fabricRef.current.viewportTransform[4] = offsetX.current;
    fabricRef.current.viewportTransform[5] = offsetY.current;
    fabricRef.current.requestRenderAll();
  };

  const handlePan = (dx, dy) => {
    offsetX.current += dx;
    offsetY.current += dy;
    fabricRef.current.viewportTransform[4] = offsetX.current;
    fabricRef.current.viewportTransform[5] = offsetY.current;
    fabricRef.current.requestRenderAll();
  };

  const handleMouseWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    handleZoom(zoomFactor);
  };

  const handlePanStart = (e) => {
    canvasRef.current.style.cursor = "grabbing";
  };

  const handlePanMove = (e) => {
    if (e.buttons !== 1) return; // Only move on left click
    const dx = e.movementX;
    const dy = e.movementY;
    handlePan(dx, dy);
  };

  // Initialize Fabric.js
  useEffect(() => {
    const canvas = initializeFabric({
      canvasRef,
      fabricRef,
    });

    // Attach Event Listeners
    canvas.on("mouse:wheel", handleMouseWheel);
    canvas.on("mouse:down", handlePanStart);
    canvas.on("mouse:move", handlePanMove);

    // Clean up
    return () => {
      canvas.off("mouse:wheel", handleMouseWheel);
      canvas.off("mouse:down", handlePanStart);
      canvas.off("mouse:move", handlePanMove);
    };
  }, [canvasRef]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        imageInputRef={imageInputRef}
        handleImageUpload={handleImageUpload}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar
          allShapes={canvasObjects ? Array.from(canvasObjects) : []}
        />
        <Live canvasRef={canvasRef} />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
