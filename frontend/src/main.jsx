import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./premium.css"; // Premium CSS for additional styling (if needed)
import App from "./App.jsx";

// Remove App.css if not needed - prevents duplicate CSS conflicts
// import "./App.css"; // <-- ye hata diya, index.css hi 11/10 full hai

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found. Check index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);