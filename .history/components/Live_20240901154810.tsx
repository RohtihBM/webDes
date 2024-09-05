import React, { useRef, useEffect } from "react";
import InfiniteCanvas from "react-infinite-canvas";
import { useCallback, useEffect, useState } from "react";

import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@/liveblocks.config";
import useInterval from "@/hooks/useInterval";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import { shortcuts } from "@/constants";

import { Comments } from "./comments/Comments";
import {
  CursorChat,
  FlyingReaction,
  LiveCursors,
  ReactionSelector,
} from "./index";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export default function Live() {
  const infiniteCanvasRef = useRef<InfiniteCanvas>(null);

  useEffect(() => {
    const canvas = infiniteCanvasRef.current?.getCanvas();
    if (canvas) {
      // Add event listeners for custom zoom and pan controls
      canvas.addEventListener("wheel", handleZoom);
      // ... Add event listeners for panning gestures
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleZoom);
        // ... Remove panning event listeners
      }
    };
  }, []);

  const handleZoom = (event: WheelEvent) => {
    const zoomAmount = event.deltaY > 0 ? 0.95 : 1.05;
    infiniteCanvasRef.current?.zoom(zoomAmount);
  };

  // ... Implement panning event handlers

  return (
    <div className="relative flex h-[100vh] w-full flex-1 items-center justify-center">
      <InfiniteCanvas
        ref={infiniteCanvasRef}
        id="canvas"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Rest of your Live component code */}
    </div>
  );
}
