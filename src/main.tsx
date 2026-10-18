import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@/app/globals.css";
import "@/app/motion.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  if (rootElement.dataset.prerendered === "true") {
    ReactDOM.hydrateRoot(rootElement, app);
  } else {
    // Development and unknown routes start without matching prerendered markup.
    ReactDOM.createRoot(rootElement).render(app);
  }
}
