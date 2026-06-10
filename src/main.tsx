import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./MOD2-GESTION/context/ThemeContext";
import App from "./App";
import "./styles/global.css";
import "remixicon/fonts/remixicon.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);