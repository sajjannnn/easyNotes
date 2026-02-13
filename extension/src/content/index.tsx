(() => {
  if (document.getElementById("my-extension-root")) return;

  const host = document.createElement("div");
  host.id = "my-extension-root";
  host.style.position = "fixed";
  host.style.top = "10px";
  host.style.left = "10px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });

  const container = document.createElement("div");
  container.style.background = "red";
  container.style.color = "white";
  container.style.padding = "10px";
  container.style.borderRadius = "8px";
  container.style.fontFamily = "sans-serif";

  const text = document.createElement("div");
  text.textContent = "Hello!";

  const button = document.createElement("button");
  button.textContent = "Capture Screenshot";
  button.style.marginTop = "10px";
  button.style.padding = "5px 10px";
  button.style.cursor = "pointer";
  button.style.background = "red";

  // 👇 When button clicked
  button.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { type: "CAPTURE_SCREENSHOT" },
      (response) => {
        if (!response?.screenshot) return;

        const img = document.createElement("img");
        img.src = response.screenshot;
        img.style.width = "200px";
        img.style.marginTop = "10px";

        container.appendChild(img);
      }
    );
  });

  container.appendChild(text);
  container.appendChild(button);
  shadow.appendChild(container);
  document.documentElement.appendChild(host);
})();