import { fabric } from "fabric";

// Types
export type CanvasMouseDown = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  selectedShapeRef: React.MutableRefObject<string | null>;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
};

export type CanvasMouseMove = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
};

export type CanvasMouseUp = {
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
};

export const initializeFabric = ({
  canvasRef,
  fabricRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
}) => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

  const canvas = new fabric.Canvas(canvasElement, {
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });

  fabricRef.current = canvas;
  return canvas;
};

export const handleResize = ({
  fabricRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
}) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);

  isDrawing.current = true;

  if (selectedShapeRef.current === "rectangle") {
    shapeRef.current = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
    });
    canvas.add(shapeRef.current);
  }
};

export const handleCanvasMouseMove = ({
  options,
  canvas,
  isDrawing,
  shapeRef,
}: CanvasMouseMove) => {
  if (!isDrawing.current) return;

  const pointer = canvas.getPointer(options.e);

  if (shapeRef.current && shapeRef.current.type === "rect") {
    const rect = shapeRef.current as fabric.Rect;
    const width = Math.abs(pointer.x - rect.left!);
    const height = Math.abs(pointer.y - rect.top!);
    rect.set({ width, height });
    canvas.renderAll();
  }
};

export const handleCanvasMouseUp = ({ canvas, isDrawing }: CanvasMouseUp) => {
  isDrawing.current = false;
  canvas.renderAll();
};
