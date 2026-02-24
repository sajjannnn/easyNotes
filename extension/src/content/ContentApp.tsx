export default function ContentApp() {

  function getYouTubeVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("v");
  }

  const handleCaptureScreenshot = () => {
    chrome.runtime.sendMessage(
      { type: "CAPTURE_SCREENSHOT" },
      (response) => {
        if (!response?.success) return;

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

        // 🔥 SEND TO BACKGROUND FOR SAVING
        chrome.runtime.sendMessage({
          type: "SAVE_NOTE",
          payload: noteObject,
        });
      }
    );
  };

  const openDashboard = () =>
    chrome.runtime.sendMessage({
      type: "OPEN_DASHBOARD",
    });

  return (
    <div style={{ position: "fixed", top: "10px", left: "10px", zIndex: 9999 }}>
      <button onClick={handleCaptureScreenshot}>
        Capture Screenshot
      </button>

      <button onClick={openDashboard}>
        Open Dashboard
      </button>
    </div>
  );
}