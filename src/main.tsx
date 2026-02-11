// Import React properly
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Make React available globally
window.React = React;
window.ReactDOM = ReactDOM;

createRoot(document.getElementById("root")!).render(<App />);
