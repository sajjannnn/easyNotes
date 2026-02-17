import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useState } from "react";

function ContentApp() {
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleCaptureScreenshot = () => {
    chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" }, (response) => {
      if (response?.screenshot) {
        setScreenshot(response.screenshot);
      }
    });
  };

  return (
    <div
      style={{
        background: "red",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
      }}
    >
      <div>Hello!</div>
      <button
        onClick={handleCaptureScreenshot}
        style={{
          marginTop: "10px",
          padding: "5px 10px",
          cursor: "pointer",
          background: "red",
        }}
      >
        Capture Screenshot
      </button>
      {screenshot && (
        <img
          src={screenshot}
          alt="Screenshot"
          style={{
            width: "200px",
            marginTop: "10px",
          }}
        />
      )}
    </div>
  );
}

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
