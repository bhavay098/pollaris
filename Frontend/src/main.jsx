// React app entry point. Renders the whole app into the <div id="root">
// element in index.html.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// AuthSessionSync renders nothing but keeps the auth store in sync with
// better-auth's session (it must mount once at the app root).
import AuthSessionSync from "./Components/AuthSessionSync";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthSessionSync />
    <App />
  </StrictMode>,
);
