// import { useState } from "react";

import { saveNote } from "../utilis/db";

export default function ContentApp() {
  // const [screenshot, setScreenshot] = useState<string | null>(null);

  function getYouTubeVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("v");
  }

   const handleCaptureScreenshot = async () => {
  chrome.runtime.sendMessage(
    { type: "CAPTURE_SCREENSHOT" },
    async (response) => {
      if (response?.success) {
        const imageDataUrl = response.image;

        const video = document.querySelector("video") as HTMLVideoElement | null;

        const noteObject = {
          id: crypto.randomUUID(),
          url: window.location.href,
          videoId: getYouTubeVideoId(),
          videoTitle: document.title,
          timestamp: video ? video.currentTime : null,
          image: imageDataUrl,
          createdAt: Date.now(),
        };

        await saveNote(noteObject);
        console.log("Saved to IndexedDB");
      }
    }
  );
};

  return (
    <div>
      <button onClick={handleCaptureScreenshot}>Capture Screenshot</button>
      {/* {screenshot && <img src={screenshot} alt="Screenshot" />} */}
    </div>
  );
}
