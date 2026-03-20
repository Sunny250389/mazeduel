import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function loadGamePixSdk() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.__MAZEDUEL_GAMEPIX_READY__ = false;

  const existingScript = document.querySelector('script[data-gamepix-sdk="true"]');
  if (existingScript) return;

  const script = document.createElement("script");
  script.src = "https://integration.gamepix.com/sdk/v3/gamepix.sdk.js";
  script.async = true;
  script.dataset.gamepixSdk = "true";

  script.onload = () => {
    window.__MAZEDUEL_GAMEPIX_READY__ = !!window.GamePix;
    window.dispatchEvent(
      new CustomEvent("gamepix:ready", {
        detail: { ready: window.__MAZEDUEL_GAMEPIX_READY__ },
      })
    );
  };

  document.head.appendChild(script);
}

loadGamePixSdk();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
