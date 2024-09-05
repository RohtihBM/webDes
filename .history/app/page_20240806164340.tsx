import { Room } from "./Room";
import { CollaborativeApp } from "./CollaborativeApp";
import Navbar from "../components/Navbar";
import Live from "@components/Live";
import { ActiveElement } from "@types/type";
import LeftSidebar from "@components/LeftSidebar";
import RightSidebar from "@components/RightSidebar";
import { useEffect, useRef } from "react";
import { handleCanvasMouseDown, initializeFabric } from "@lib/canvas";
import { FabricObject } from "fabric";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.object | null>(null);
  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex h-full flex-row">
        <LeftSidebar />
        <RightSidebar />
        <Live />
      </section>
    </main>
  );
}
