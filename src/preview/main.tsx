import React from "react";
import { createRoot } from "react-dom/client";
import ComponentPreview from "./components/ComponentPreview";
import DirectorStagePreview from "./pages/DirectorStagePreview";
import directorStageSource from "./pages/DirectorStagePreview.tsx?raw";
import LightSpherePreview from "./pages/LightSpherePreview";
import lightSphereSource from "./pages/LightSpherePreview.tsx?raw";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Preview root element was not found.");
}

const params = new URLSearchParams(window.location.search);
const demo = params.get("demo");

const preview = demo === "light"
  ? {
      title: "Light Sphere",
      description: "一个可拖拽布光、调整光束与切换视角的交互式 3D 灯光组件。",
      source: lightSphereSource,
      stageClassName: "component-preview__stage--light",
      component: <LightSpherePreview />,
    }
  : {
      title: "Director Stage",
      description: "用于编排角色、道具与摄影机的交互式 3D 导演台组件。",
      source: directorStageSource,
      stageClassName: "component-preview__stage--director",
      component: <DirectorStagePreview />,
    };

createRoot(root).render(
  <ComponentPreview
    title={preview.title}
    description={preview.description}
    source={preview.source}
    stageClassName={preview.stageClassName}
  >
    {preview.component}
  </ComponentPreview>,
);
