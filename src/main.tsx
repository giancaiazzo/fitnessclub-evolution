import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./MOD2-GESTION/context/ThemeContext";
import { AuthProvider } from "./MOD2-GESTION/context/AuthContext";
import App from "./App";
// Único punto de entrada visual: incluye Tailwind, tema, iconos y plugins.
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
