"use client";

import React, { useEffect, useRef } from "react";

type InfiniteCanvasProps = {
  onPointerMove: (x: number, y: number) => void;
  onPointerLeave: () => void;
  onPointerDown: (x: number, y: number) => void;
  onPointerUp: () => void;
};

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        return () => {
          window.removeEventListener("resize", resizeCanvas);
        };
      }
    }
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x =
      (event.clientX - rect.left) / scaleRef.current - offsetRef.current.x;
    const y =
      (event.clientY - rect.top) / scaleRef.current - offsetRef.current.y;
    onPointerMove(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={(e) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x =
          (e.clientX - rect.left) / scaleRef.current - offsetRef.current.x;
        const y =
          (e.clientY - rect.top) / scaleRef.current - offsetRef.current.y;
        onPointerDown(x, y);
      }}
      onPointerUp={onPointerUp}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default InfiniteCanvas;
