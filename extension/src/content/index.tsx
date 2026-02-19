import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContentApp from "./ContentApp";



(() => {
  if (document.getElementById("my-extension-root")) return;

  const host = document.createElement("div");
  host.id = "my-extension-root";
  host.style.position = "fixed";
  host.style.top = "10px";
  host.style.left = "10px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });

  // Create a container inside shadow DOM for React
  const container = document.createElement("div");
  shadow.appendChild(container);

  // Create a style element for shadow DOM
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }
  `;
  shadow.appendChild(style);

  // Render React app into shadow DOM
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ContentApp />
    </StrictMode>,
  );

  document.documentElement.appendChild(host);
})();
