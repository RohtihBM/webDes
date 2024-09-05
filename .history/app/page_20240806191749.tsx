"use client";
import { useEffect, useRef, useState } from "react";
import fabric from "fabric";
import Navbar from "../components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from "@/lib/canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);

  useEffect(() => {
    const setupCanvas = async () => {
      if (canvasRef.current) {
        const canvas = await initializeFabric({ canvasRef, fabricRef });
        if (!canvas) return;

        // Set the initial shape
        selectedShapeRef.current = "rectangle";

        canvas.on("mouse:down", (options) => {
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
          handleCanvasMouseUp({
            canvas,
            isDrawing,
          });
        });

        window.addEventListener("resize", () => {
          handleResize({ fabricRef });
        });
      }
    };

    setupCanvas();

    // Cleanup function
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
      window.removeEventListener("resize", () => {
        handleResize({ fabricRef });
      });
    };
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex h-full flex-row">
        <Live canvasRef={canvasRef} />
        <LeftSidebar />
        <RightSidebar />
      </section>
    </main>
  );
}
