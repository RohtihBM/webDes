"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Navbar from "../components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";
import {
  initializeFabric,
  handleResize,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
} from "@/lib/canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current) {
        if (typeof fabric !== "undefined") {
          try {
            const canvas = await initializeFabric({ canvasRef, fabricRef });
            setDebugInfo((prev) => prev + "\nCanvas initialized");

            canvas.on("mouse:down", (options) => {
              setDebugInfo((prev) => prev + "\nMouse down event");
              handleCanvasMouseDown({
                options,
                canvas,
                selectedShapeRef,
                isDrawing,
                shapeRef,
              });
            });

            canvas.on("mouse:move", (options) => {
              handleCanvasMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
              });
            });

            canvas.on("mouse:up", () => {
              setDebugInfo((prev) => prev + "\nMouse up event");
              handleCanvasMouseUp({
                canvas,
                isDrawing,
              });
            });

            window.addEventListener("resize", () => {
              handleResize({ fabricRef });
            });
          } catch (error) {
            setDebugInfo(
              (prev) => prev + "\nError initializing canvas: " + error
            );
          }
        } else {
          setDebugInfo((prev) => prev + "\nFabric.js is not loaded");
        }
      } else {
        setDebugInfo((prev) => prev + "\nCanvas ref is null");
      }
    };

    initCanvas();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", () => {
        handleResize({ fabricRef });
      });
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
