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
import { createInfiniteCanvas, InfiniteCanvas } from "./infinite-canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infiniteCanvasRef = useRef<InfiniteCanvas | null>(null);
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
        infiniteCanvasRef.current?.getCanvas().clear();
        setActiveElement(defaultNavElement);
        break;
      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;
        if (infiniteCanvasRef.current) {
          infiniteCanvasRef.current.getCanvas().isDrawingMode = false;
        }
        break;
      case "delete":
        handleDelete(
          infiniteCanvasRef.current?.getCanvas() as any,
          deleteShapeFromStorage
        );
        setActiveElement(defaultNavElement);
        break;
      default:
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  useEffect(() => {
    const canvas = createInfiniteCanvas({
      canvasElement: canvasRef.current!,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    infiniteCanvasRef.current = canvas;

    const fabricCanvas = canvas.getCanvas();

    fabricCanvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas: fabricCanvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    fabricCanvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        options,
        canvas: fabricCanvas,
        isDrawing,
        selectedShapeRef,
        shapeRef,
        syncShapeInStorage,
      });
    });

    fabricCanvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas: fabricCanvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
      });
    });

    fabricCanvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });

    fabricCanvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    fabricCanvas.on("object:moving", (options) => {
      handleCanvasObjectMoving({
        options,
      });
    });

    fabricCanvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    fabricCanvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    window.addEventListener("resize", () => {
      handleResize({
        canvas: infiniteCanvasRef.current?.getCanvas(),
      });
    });

    window.addEventListener("keydown", (e) =>
      handleKeyDown({
        e,
        canvas: infiniteCanvasRef.current?.getCanvas(),
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      })
    );

    return () => {
      canvas.dispose();

      window.removeEventListener("resize", () => {
        handleResize({
          canvas: null,
        });
      });

      window.removeEventListener("keydown", (e) =>
        handleKeyDown({
          e,
          canvas: infiniteCanvasRef.current?.getCanvas(),
          undo,
          redo,
          syncShapeInStorage,
          deleteShapeFromStorage,
        })
      );
    };
  }, [canvasRef]);

  useEffect(() => {
    renderCanvas({
      fabricRef: infiniteCanvasRef.current?.getCanvas(),
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
            canvas: infiniteCanvasRef as any,
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

        <Live infiniteCanvasRef={infiniteCanvasRef} />

        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={infiniteCanvasRef.current?.getCanvas()}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
