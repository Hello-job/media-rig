import React from "react";
import { createRoot } from "react-dom/client";
import LightSpherePreview from "./pages/LightSpherePreview";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Preview root element was not found.");
}

createRoot(root).render(<LightSpherePreview />);
