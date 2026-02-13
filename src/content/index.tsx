
(() => {
  if (document.getElementById("my-extension-root")) return;

  const host = document.createElement("div");
host.style.position = "fixed";
host.style.top = "10px";
host.style.left = "10px";
host.style.zIndex = "2147483647";

const shadow = host.attachShadow({ mode: "open" });

const inner = document.createElement("div");
inner.textContent = "Hello!";
inner.style.background = "red";
inner.style.color = "white";
inner.style.padding = "10px";

shadow.appendChild(inner);
document.documentElement.appendChild(host);
})();