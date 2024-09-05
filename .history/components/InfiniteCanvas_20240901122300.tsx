import { fabric } from "fabric";

export interface InfiniteCanvasOptions {
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
}

export class InfiniteCanvas {
  private canvas: fabric.Canvas;
  private viewportTransform: number[];
  private isDragging: boolean;
  private lastPosX: number;
  private lastPosY: number;

  constructor(options: InfiniteCanvasOptions) {
    this.canvas = new fabric.Canvas(options.canvasElement, {
      width: options.width,
      height: options.height,
    });

    this.viewportTransform = this.canvas.viewportTransform!;
    this.isDragging = false;
    this.lastPosX = 0;
    this.lastPosY = 0;

    this.setupInfiniteCanvas();
  }

  private setupInfiniteCanvas() {
    this.canvas.on("mouse:down", this.onMouseDown.bind(this));
    this.canvas.on("mouse:move", this.onMouseMove.bind(this));
    this.canvas.on("mouse:up", this.onMouseUp.bind(this));
    this.canvas.on("mouse:wheel", this.onMouseWheel.bind(this));
  }

  private onMouseDown(opt: fabric.IEvent) {
    const evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  }

  private onMouseMove(opt: fabric.IEvent) {
    if (this.isDragging) {
      const e = opt.e;
      const vpt = this.canvas.viewportTransform!;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.canvas.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onMouseWheel(opt: fabric.IEvent) {
    const delta = (opt.e as WheelEvent).deltaY;
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  public getCanvas(): fabric.Canvas {
    return this.canvas;
  }

  public dispose() {
    this.canvas.dispose();
  }

  public setCanvasElement(element: HTMLCanvasElement) {
    this.canvas.setDimensions({
      width: element.width,
      height: element.height,
    });
  }
}

export function createInfiniteCanvas(
  options: InfiniteCanvasOptions
): InfiniteCanvas {
  return new InfiniteCanvas(options);
}
