import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Router } from "./lib/router";
import "./styles/styles.css";
import "./styles/site.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
