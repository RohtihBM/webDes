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
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const others = useOthers();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const setreaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      };
    },
    [offsetX, offsetY, scale]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      const { clientX, clientY } = event;
      const { x, y } = toCanvasCoords(clientX, clientY);

      if (isPanningRef.current) {
        const dx = clientX - lastMousePosRef.current.x;
        const dy = clientY - lastMousePosRef.current.y;
        setOffsetX((prev) => prev + dx);
        setOffsetY((prev) => prev + dy);
        lastMousePosRef.current = { x: clientX, y: clientY };
      } else if (
        cursor == null ||
        cursorState.mode !== CursorMode.ReactionSelector
      ) {
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [cursor, cursorState.mode, updateMyPresence, toCanvasCoords]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const { clientX, clientY } = event;
      const { x, y } = toCanvasCoords(clientX, clientY);

      if (event.button === 1 || event.button === 2) {
        // Middle or right mouse button
        isPanningRef.current = true;
        lastMousePosRef.current = { x: clientX, y: clientY };
      } else {
        updateMyPresence({ cursor: { x, y } });
        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction
            ? { ...state, isPressed: true }
            : state
        );
      }
    },
    [cursorState.mode, updateMyPresence, toCanvasCoords]
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
      const { clientX, clientY } = event;
      const { x: canvasX, y: canvasY } = toCanvasCoords(clientX, clientY);

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = scale * zoomFactor;

      setScale(newScale);
      setOffsetX(clientX - canvasX * newScale);
      setOffsetY(clientY - canvasY * newScale);
    },
    [scale, toCanvasCoords]
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
      className="relative flex h-[100vh] w-full flex-1 items-center justify-center overflow-hidden"
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
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale}) translate(${offsetX / scale}px, ${
            offsetY / scale
          }px)`,
        }}
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
