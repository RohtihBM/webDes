"use client";

import Navbar from "../components/Navbar";
import Live from "@/components/Live";
import { ActiveElement } from "@/types/type";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { Attributes, useEffect, useRef, useState } from "react";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handlePathCreated,
  handleResize,
  renderCanvas,
} from "@/lib/canvas";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { defaultNavElement } from "@/constants";
import { handleImageUpload } from "@/lib/shapes";
import InfiniteCanvas from "@/components/InfiniteCanvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const undo = useUndo();
  const redo = useRedo();

  const canvasObjects = useStorage((root) => root.canvasObjects || new Map());

  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(shapeId);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const objectId = object.objectId;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx?.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
        setActiveElement(defaultNavElement);
        break;
      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;
        break;
      case "delete":
        handleDelete(canvasRef.current, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      default:
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  const handlePointerMove = (x: number, y: number) => {
    handleCanvaseMouseMove({
      options: { e: { clientX: x, clientY: y } },
      canvas: canvasRef.current,
      isDrawing,
      selectedShapeRef,
      shapeRef,
      syncShapeInStorage,
    });
  };

  const handlePointerDown = (x: number, y: number) => {
    handleCanvasMouseDown({
      options: { e: { clientX: x, clientY: y } },
      canvas: canvasRef.current,
      selectedShapeRef,
      isDrawing,
      shapeRef,
    });
  };

  const handlePointerUp = () => {
    handleCanvasMouseUp({
      canvas: canvasRef.current,
      isDrawing,
      shapeRef,
      activeObjectRef,
      selectedShapeRef,
      syncShapeInStorage,
      setActiveElement,
    });
  };

  useEffect(() => {
    const handleKeyDownWrapper = (e: KeyboardEvent) =>
      handleKeyDown({
        e,
        canvas: canvasRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });

    window.addEventListener("keydown", handleKeyDownWrapper);

    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, []);

  useEffect(() => {
    renderCanvas({
      fabricRef: canvasRef.current,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: canvasRef.current,
            shapeRef,
            syncShapeInStorage,
          });
        }}
        handleActiveElement={handleActiveElement}
      />

      <section className="flex h-full flex-row">
        <LeftSidebar
          allShapes={canvasObjects ? Array.from(canvasObjects) : []}
        />

        <InfiniteCanvas
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={canvasRef.current}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
