// filepath: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/globals.css";
import { AuthProvider } from "./features/auth/context";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
        <App />
  </React.StrictMode>
);

