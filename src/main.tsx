/// <reference types="vite-plugin-pwa/client" />
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerSW } from "virtual:pwa-register";

// Registro del Service Worker de la PWA
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
  