import { createRoot } from "react-dom/client";
import App from "./App";

(() => {
  if (document.getElementById("my-extension-root")) return;

  const host = document.createElement("div");
  host.id = "my-extension-root";
  host.style.position = "fixed";
  host.style.bottom = "20px";
  host.style.right = "20px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(<App />);
})();