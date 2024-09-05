import { Room } from "./Room";
import { CollaborativeApp } from "./CollaborativeApp";
import Navbar from "../components/Navbar";
import Live from "@components/Live";
import { ActiveElement } from "@types/type";
import LeftSidebar from "@components/LeftSidebar";
import RightSidebar from "@components/RightSidebar";
import { useEffect, useRef } from "react";
import { handleCanvasMouseDown, initializeFabric } from "@lib/canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);

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
    <div>
      <Navbar />
      <LeftSidebar />
      <RightSidebar />
      <Live />
    </div>
  );
}
