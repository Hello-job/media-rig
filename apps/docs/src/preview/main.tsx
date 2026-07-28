import React from "react";
import { createRoot } from "react-dom/client";
import ComponentLibraryApp from "./components/ComponentLibraryApp";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Preview root element was not found.");
}

createRoot(root).render(<ComponentLibraryApp />);
