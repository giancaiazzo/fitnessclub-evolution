import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./MOD2-GESTION/context/ThemeContext";
import { AuthProvider } from "./MOD2-GESTION/context/AuthContext";
import App from "./App";
import "./styles/global.css";
import "remixicon/fonts/remixicon.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
