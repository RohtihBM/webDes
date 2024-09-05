"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  useMyPresence,
  useOthers,
  useEventListener,
  useBroadcastEvent,
} from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./Reaction/ReactionBtn";
import FlyingReaction from "./Reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { Shape, ShapeType } from "@/types/canvas";

class InfiniteCanvas {
  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  cellSize: number;

  scale: number = 1;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(canvas: HTMLCanvasElement, cellSize = 40) {
    this.canvas = canvas;
    this.cellSize = cellSize;
    const context = canvas.getContext("2d");
    if (context) {
      this.context = context;
    } else {
      console.error(`<canvas> element is missing context 2d`);
    }
  }

  toVirtualX(xReal: number): number {
    return (xReal - this.offsetX) / this.scale;
  }

  toVirtualY(yReal: number): number {
    return (yReal - this.offsetY) / this.scale;
  }

  toRealX(xVirtual: number): number {
    return xVirtual * this.scale + this.offsetX;
  }

  toRealY(yVirtual: number): number {
    return yVirtual * this.scale + this.offsetY;
  }

  setTransform(scale: number, offsetX: number, offsetY: number): void {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    if (this.context) {
      this.context.setTransform(
        this.scale,
        0,
        0,
        this.scale,
        this.offsetX,
        this.offsetY
      );
    }
  }

  clearCanvas(): void {
    if (this.canvas && this.context) {
      this.context.clearRect(
        -this.offsetX / this.scale,
        -this.offsetY / this.scale,
        this.canvas.width / this.scale,
        this.canvas.height / this.scale
      );
    }
  }

  drawShapes(shapes: Shape[]): void {
    if (!this.context) return;

    shapes.forEach((shape) => {
      this.context!.fillStyle = shape.color;
      switch (shape.type) {
        case ShapeType.Rectangle:
          this.context!.fillRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case ShapeType.Ellipse:
          this.context!.beginPath();
          this.context!.ellipse(
            shape.x + shape.width / 2,
            shape.y + shape.height / 2,
            shape.width / 2,
            shape.height / 2,
            0,
            0,
            2 * Math.PI
          );
          this.context!.fill();
          break;
        // Add more shape types as needed
      }
    });
  }
}

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const others = useOthers();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const infiniteCanvasRef = useRef<InfiniteCanvas | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);

  const setreaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useEffect(() => {
    if (canvasRef.current && !infiniteCanvasRef.current) {
      infiniteCanvasRef.current = new InfiniteCanvas(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (infiniteCanvasRef.current) {
      infiniteCanvasRef.current.setTransform(scale, offsetX, offsetY);
      infiniteCanvasRef.current.clearCanvas();
      infiniteCanvasRef.current.drawShapes(shapes);
    }
  }, [scale, offsetX, offsetY, shapes]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (isPanningRef.current) {
        const x = event.clientX - startXRef.current;
        const y = event.clientY - startYRef.current;
        setOffsetX((prevOffsetX) => prevOffsetX + x);
        setOffsetY((prevOffsetY) => prevOffsetY + y);
        startXRef.current = event.clientX;
        startYRef.current = event.clientY;
      } else if (
        cursor == null ||
        cursorState.mode !== CursorMode.ReactionSelector
      ) {
        const canvas = infiniteCanvasRef.current;
        if (canvas) {
          const x = canvas.toVirtualX(event.clientX);
          const y = canvas.toVirtualY(event.clientY);
          updateMyPresence({ cursor: { x, y } });

          if (selectedShape) {
            setShapes((prevShapes) =>
              prevShapes.map((shape) =>
                shape.id === selectedShape.id ? { ...shape, x, y } : shape
              )
            );
          }
        }
      }
    },
    [cursor, cursorState.mode, updateMyPresence, selectedShape]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button === 1) {
        isPanningRef.current = true;
        startXRef.current = event.clientX;
        startYRef.current = event.clientY;
      } else {
        const canvas = infiniteCanvasRef.current;
        if (canvas) {
          const x = canvas.toVirtualX(event.clientX);
          const y = canvas.toVirtualY(event.clientY);
          updateMyPresence({ cursor: { x, y } });

          const clickedShape = shapes.find(
            (shape) =>
              x >= shape.x &&
              x <= shape.x + shape.width &&
              y >= shape.y &&
              y <= shape.y + shape.height
          );

          if (clickedShape) {
            setSelectedShape(clickedShape);
          } else {
            setSelectedShape(null);
            // Add a new shape when clicking on empty space
            const newShape: Shape = {
              id: Date.now().toString(),
              type: ShapeType.Rectangle,
              x,
              y,
              width: 100,
              height: 100,
              color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            };
            setShapes((prevShapes) => [...prevShapes, newShape]);
          }
        }

        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction
            ? { ...state, isPressed: true }
            : state
        );
      }
    },
    [cursorState.mode, updateMyPresence, shapes]
  );

  const handlePointerUp = useCallback(() => {
    isPanningRef.current = false;
    setSelectedShape(null);
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state
    );
  }, [cursorState.mode]);

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null });
    isPanningRef.current = false;
  }, [updateMyPresence]);

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      const zoomFactor = 1.1;
      const direction = event.deltaY < 0 ? 1 : -1;
      const newScale = scale * (direction > 0 ? zoomFactor : 1 / zoomFactor);

      const canvas = infiniteCanvasRef.current;
      if (canvas) {
        const mouseX = canvas.toVirtualX(event.clientX);
        const mouseY = canvas.toVirtualY(event.clientY);

        setOffsetX((prevOffsetX) => prevOffsetX - mouseX * (newScale - scale));
        setOffsetY((prevOffsetY) => prevOffsetY - mouseY * (newScale - scale));
        setScale(newScale);
      }
    },
    [scale]
  );

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => Date.now() - reaction.timestamp < 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  return (
    <div
      className="relative flex h-[100vh] w-full flex-1 items-center justify-center"
      id="canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ width: "100%", height: "100%" }}
      />
      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp.toString()}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}
      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setreaction} />
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
