import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageContext";
import App from "./App.tsx";
import { ensureIconVersion } from "./lib/iconVersion";
import "./index.css";

ensureIconVersion();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
