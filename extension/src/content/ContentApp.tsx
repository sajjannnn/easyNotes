import { useState } from "react";

export default function ContentApp() {
  const [text, setText] = useState("");

  function getYouTubeVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("v");
  }

  // =============================
  // SCREENSHOT
  // =============================
const handleCaptureScreenshot = async () => {
  const video = document.querySelector("video") as HTMLVideoElement | null;
  const url = new URL(window.location.href);
    if (url.pathname !== "/watch" || !url.searchParams.get("v")) {
    alert("No video is currently playing.");
    return;
  }

  if (!video) {
    alert("No video found");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL("image/png");

  const noteObject = {
    id: crypto.randomUUID(),
    url: window.location.href,
    videoId: new URL(window.location.href).searchParams.get("v"),
    videoTitle: document.title,
    timestamp: video.currentTime,
    image: imageDataUrl,
    createdAt: Date.now(),
  };

  chrome.runtime.sendMessage({
    type: "SAVE_NOTE",
    payload: noteObject,
  });
};
  // =============================
  // TEXT NOTE
  // =============================
  const handleAddText = () => {
    if (!text.trim()) return;

    const video =
      document.querySelector("video") as HTMLVideoElement | null;

    const noteObject = {
      id: crypto.randomUUID(),
      url: window.location.href,
      videoId: getYouTubeVideoId(),
      videoTitle: document.title,
      timestamp: video ? video.currentTime : null,
      text: text.trim(),
      createdAt: Date.now(),
    };

    chrome.runtime.sendMessage({
      type: "SAVE_NOTE",
      payload: noteObject,
    });

    setText("");
  };

  const openDashboard = () =>
    chrome.runtime.sendMessage({
      type: "OPEN_DASHBOARD",
    });

  return (
    <div  style={{
      position: "fixed",
      top: "10px",
      left: "10px",
      zIndex: 9999,
      background: "white",
      padding: "10px",
    }}
    onKeyDown={(e) => e.stopPropagation()}
    onKeyUp={(e) => e.stopPropagation()}
     
    >
      <button onClick={handleCaptureScreenshot}>
        Capture Screenshot
      </button>

      <br /><br />

      <textarea
        placeholder="Write note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: "60px" }}
      />

      <button onClick={handleAddText}>
        Add Text
      </button>

      <br /><br />

      <button onClick={openDashboard}>
        Open Dashboard
      </button>
    </div>
  );
}