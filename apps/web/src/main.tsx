import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AppPaletteProvider } from "./context/AppPaletteContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppPaletteProvider>
        <App />
      </AppPaletteProvider>
    </BrowserRouter>
  </StrictMode>
);
