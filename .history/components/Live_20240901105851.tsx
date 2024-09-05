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

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const setreaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

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
        const x =
          (event.clientX -
            event.currentTarget.getBoundingClientRect().x -
            offsetX) /
          scale;
        const y =
          (event.clientY -
            event.currentTarget.getBoundingClientRect().y -
            offsetY) /
          scale;
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [cursor, cursorState.mode, scale, offsetX, offsetY, updateMyPresence]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button === 1) {
        // Middle mouse button to pan
        isPanningRef.current = true;
        startXRef.current = event.clientX;
        startYRef.current = event.clientY;
      } else {
        const x =
          (event.clientX -
            event.currentTarget.getBoundingClientRect().x -
            offsetX) /
          scale;
        const y =
          (event.clientY -
            event.currentTarget.getBoundingClientRect().y -
            offsetY) /
          scale;
        updateMyPresence({ cursor: { x, y } });

        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction
            ? { ...state, isPressed: true }
            : state
        );
      }
    },
    [cursorState.mode, scale, offsetX, offsetY, updateMyPresence]
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

      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - offsetX) / scale;
      const mouseY = (event.clientY - rect.top - offsetY) / scale;

      setOffsetX((prevOffsetX) => prevOffsetX - mouseX * (newScale - scale));
      setOffsetY((prevOffsetY) => prevOffsetY - mouseY * (newScale - scale));
      setScale(newScale);
    },
    [scale, offsetX, offsetY, canvasRef]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set a large canvas size to simulate infinite space
      canvas.width = 5000;
      canvas.height = 5000;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        ctx.clearRect(
          -offsetX / scale,
          -offsetY / scale,
          canvas.width / scale,
          canvas.height / scale
        );
        // Render the content here (e.g., grid, shapes, etc.)
      }
    }
  }, [scale, offsetX, offsetY, canvasRef]);

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

  const [Reaction, setReaction] = useState<Reaction[]>([]);
  const broadcast = useBroadcastEvent();
  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReaction((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReaction((reactions) =>
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
        style={{ width: "100%", height: "100%" }}
      />
      {Reaction.map((reaction) => (
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
