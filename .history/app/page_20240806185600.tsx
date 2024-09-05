"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
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
  const selectedShapeRef = useRef<string | null>("rectangle");

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current) {
        // Ensure fabric is loaded
        if (typeof fabric !== "undefined") {
          const canvas = await initializeFabric({ canvasRef, fabricRef });

          canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
              options,
              canvas,
              selectedShapeRef,
              isDrawing,
              shapeRef,
            });
          });

          window.addEventListener("resize", () => {
            handleResize({ fabricRef });
          });
        } else {
          console.error("Fabric.js is not loaded");
        }
      }
    };

    initCanvas();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", () => {
        handleResize({ fabricRef });
      });
      // Dispose of the Fabric.js canvas if it exists
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
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </main>
  );
}
