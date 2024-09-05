"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useMyPresence } from "@/liveblocks.config";
import { useEventListener, useOthers } from "@liveblocks/react";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./Reaction/ReactionBtn";
import FlyingReaction from "./Reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { useBroadcastEvent } from "@liveblocks/react";

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
      this.draw();
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
    this.draw();
  }

  draw(): void {
    if (this.canvas && this.context) {
      this.context.setTransform(
        this.scale,
        0,
        0,
        this.scale,
        this.offsetX,
        this.offsetY
      );
      this.context.clearRect(
        -this.offsetX / this.scale,
        -this.offsetY / this.scale,
        this.canvas.width / this.scale,
        this.canvas.height / this.scale
      );
      this.drawGrid();
    }
  }

  drawGrid(): void {
    if (this.canvas && this.context) {
      this.context.strokeStyle = "rgb(229,231,235)";
      this.context.lineWidth = 1 / this.scale;
      this.context.beginPath();

      const startX =
        Math.floor(-this.offsetX / this.scale / this.cellSize) * this.cellSize;
      const startY =
        Math.floor(-this.offsetY / this.scale / this.cellSize) * this.cellSize;
      const endX = startX + this.canvas.width / this.scale;
      const endY = startY + this.canvas.height / this.scale;

      for (let x = startX; x <= endX; x += this.cellSize) {
        this.context.moveTo(x, startY);
        this.context.lineTo(x, endY);
      }

      for (let y = startY; y <= endY; y += this.cellSize) {
        this.context.moveTo(startX, y);
        this.context.lineTo(endX, y);
      }

      this.context.stroke();
    }
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
    }
  }, [scale, offsetX, offsetY]);

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
        }
      }
    },
    [cursor, cursorState.mode, updateMyPresence]
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
        }

        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction
            ? { ...state, isPressed: true }
            : state
        );
      }
    },
    [cursorState.mode, updateMyPresence]
  );

  const handlePointerUp = useCallback(() => {
    isPanningRef.current = false;
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
        id="canvas"
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
