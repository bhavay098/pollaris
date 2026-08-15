// React app entry point. Renders the whole app into the <div id="root">
// element in index.html.

import { Agentation } from "agentation";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// AuthSessionSync renders nothing but keeps the auth store in sync with
// better-auth's session (it must mount once at the app root).
import AuthSessionSync from "./Components/AuthSessionSync";
import { ThemeProvider } from "./Components/ThemeProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthSessionSync />
      <App />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </ThemeProvider>
  </StrictMode>,
);
