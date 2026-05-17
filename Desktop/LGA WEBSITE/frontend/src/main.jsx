// PURPOSE: Mounts the React application into the browser DOM.
// USAGE: Imported by `index.html` as the Vite application entrypoint.

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
