import React from "react";
import { createRoot } from "react-dom/client";
import DirectorStagePreview from "./pages/DirectorStagePreview";
import LightSpherePreview from "./pages/LightSpherePreview";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Preview root element was not found.");
}

const params = new URLSearchParams(window.location.search);
const demo = params.get("demo");

createRoot(root).render(demo === "light" ? <LightSpherePreview /> : <DirectorStagePreview />);
