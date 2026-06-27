import { Canvas, FabricObject } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { clampZoom, fitViewport, type Size } from "../utils/geometry";

let defaultsConfigured = false;

export function useFabricCanvas(documentSize: Size) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [zoom, setZoomState] = useState(1);

  const setZoom = useCallback((value: number) => {
    setZoomState(clampZoom(value));
  }, []);

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    setZoomState(fitViewport(bounds, documentSize));
  }, [documentSize.height, documentSize.width]);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element || canvasRef.current) return;
    if (!defaultsConfigured) {
      FabricObject.ownDefaults.transparentCorners = false;
      defaultsConfigured = true;
    }
    const instance = new Canvas(element, {
      preserveObjectStacking: true,
      selection: true,
      enableRetinaScaling: true,
    });
    instance.setDimensions(documentSize);
    canvasRef.current = instance;
    setCanvas(instance);

    return () => {
      canvasRef.current = null;
      void instance.dispose();
    };
  }, []);

  useEffect(() => {
    const instance = canvasRef.current;
    if (!instance) return;
    instance.setDimensions(documentSize);
    instance.requestRenderAll();
    fitToViewport();
  }, [documentSize.height, documentSize.width, fitToViewport]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(fitToViewport);
    observer.observe(viewport);
    const handleWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      setZoomState((current) => clampZoom(current * Math.exp(-event.deltaY * 0.0015)));
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    fitToViewport();
    return () => {
      observer.disconnect();
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [fitToViewport]);

  return {
    canvas,
    canvasElementRef,
    viewportRef,
    zoom,
    setZoom,
    fitToViewport,
  };
}
