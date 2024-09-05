"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Navbar from "../components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";

const initializeFabric = ({ canvasRef, fabricRef }) => {
  const canvas = new fabric.Canvas(canvasRef.current);
  fabricRef.current = canvas;
  return canvas;
};

const handleResize = ({ fabricRef }) => {
  if (fabricRef.current) {
    fabricRef.current.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }
};

const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
  setDebugInfo,
}) => {
  isDrawing.current = true;
  const pointer = canvas.getPointer(options.e);
  setDebugInfo((prev) => `${prev}\nMouse down at (${pointer.x}, ${pointer.y})`);

  if (selectedShapeRef.current === "rectangle") {
    shapeRef.current = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 1,
      height: 1,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
    });
    canvas.add(shapeRef.current);
    setDebugInfo((prev) => `${prev}\nRectangle created and added to canvas`);
  }
};

const handleCanvasMouseMove = ({
  options,
  canvas,
  isDrawing,
  shapeRef,
  setDebugInfo,
}) => {
  if (!isDrawing.current) return;

  const pointer = canvas.getPointer(options.e);
  setDebugInfo((prev) => `${prev}\nMouse move to (${pointer.x}, ${pointer.y})`);

  if (shapeRef.current && shapeRef.current instanceof fabric.Rect) {
    const width = Math.abs(pointer.x - shapeRef.current.left);
    const height = Math.abs(pointer.y - shapeRef.current.top);
    shapeRef.current.set({ width, height });
    canvas.renderAll();
    setDebugInfo((prev) => `${prev}\nRectangle resized to ${width}x${height}`);
  }
};

const handleCanvasMouseUp = ({ canvas, isDrawing, setDebugInfo }) => {
  isDrawing.current = false;
  setDebugInfo((prev) => `${prev}\nMouse up, drawing finished`);
  canvas.renderAll();
};

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string>("rectangle");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current) {
        try {
          const canvas = await initializeFabric({ canvasRef, fabricRef });
          setDebugInfo((prev) => prev + "\nCanvas initialized");

          canvas.setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });

          canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
              options,
              canvas,
              selectedShapeRef,
              isDrawing,
              shapeRef,
              setDebugInfo,
            });
          });

          canvas.on("mouse:move", (options) => {
            handleCanvasMouseMove({
              options,
              canvas,
              isDrawing,
              shapeRef,
              setDebugInfo,
            });
          });

          canvas.on("mouse:up", () => {
            handleCanvasMouseUp({
              canvas,
              isDrawing,
              setDebugInfo,
            });
          });

          window.addEventListener("resize", () => handleResize({ fabricRef }));
        } catch (error) {
          setDebugInfo(
            (prev) => prev + "\nError initializing canvas: " + error
          );
        }
      } else {
        setDebugInfo((prev) => prev + "\nCanvas ref is null");
      }
    };

    initCanvas();

    return () => {
      window.removeEventListener("resize", () => handleResize({ fabricRef }));
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
    };
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex h-full flex-row">
        <LeftSidebar />
        <div className="flex-grow">
          <Live canvasRef={canvasRef} />
          <div className="mt-4 p-4 bg-gray-100 text-sm">
            <h3 className="font-bold">Debug Info:</h3>
            <pre>{debugInfo}</pre>
          </div>
        </div>
        <RightSidebar />
      </section>
    </main>
  );
}
