import { createRoot } from "react-dom/client";
import Summary from "./Summary";
import ContentApp from "./ContentApp";

let hasMounted = false;

function injectPanel() {
  if (hasMounted) return;

  const sidebar = document.querySelector("#secondary-inner");
  if (!sidebar) return;

  const existing = document.getElementById("my-ai-panel");
  if (existing) return;

  const container = document.createElement("div");
  container.id = "my-ai-panel";

  container.style.background = "#0f0f0f";
  container.style.borderRadius = "12px";
  container.style.padding = "12px";
  container.style.marginBottom = "16px";
  container.style.color = "white";

  sidebar.prepend(container);

  const root = createRoot(container);
  root.render(
    <>
      <Summary />
      <ContentApp />
    </>
  );

  hasMounted = true;
}

function waitForSidebar() {
  const interval = setInterval(() => {
    const sidebar = document.querySelector("#secondary-inner");
    if (sidebar) {
      clearInterval(interval);
      injectPanel();
    }
  }, 500);
}

waitForSidebar();