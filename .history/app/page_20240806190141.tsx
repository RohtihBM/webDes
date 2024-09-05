"use client";

import React, { useEffect, useRef } from "react";
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
} from "./canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current) {
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
