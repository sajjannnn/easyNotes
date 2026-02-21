import { useEffect, useState } from "react";
import type { Note } from "../utilis/db";

import { ensureActiveFile, saveNote, getNotesByFileId } from "../utilis/db";

export default function ContentApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  function getYouTubeVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("v");
  }

  const handleCaptureScreenshot = async () => {
    chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" }, async (response) => {
      if (response?.success) {
        const imageDataUrl = response.image;

        const video = document.querySelector("video") as HTMLVideoElement | null;
        const activeFileId = await ensureActiveFile();

        const noteObject = {
          id: crypto.randomUUID(),
          url: window.location.href,
          fileId: activeFileId,
          videoId: getYouTubeVideoId(),
          videoTitle: document.title,
          timestamp: video ? video.currentTime : null,
          image: imageDataUrl,
          createdAt: Date.now(),
        };

        await saveNote(noteObject);
        const updatedNotes = await getNotesByFileId(activeFileId);
        setNotes(updatedNotes);
        console.log("Saved to file:", activeFileId);
      }
    });
  };
  useEffect(() => {
    const loadNotes = async () => {
      const activeFileId = await ensureActiveFile();
      const fileNotes = await getNotesByFileId(activeFileId);
      setNotes(fileNotes);
    };

    loadNotes();
  }, []);
  const openDashboard = () =>
    chrome.runtime.sendMessage({
      type: "OPEN_DASHBOARD",
    });

  return (
    <div>
      <button onClick={handleCaptureScreenshot}>Capture Screenshot</button>
      <button onClick={openDashboard}>Open DashBoard</button>
      {/* {screenshot && <img src={screenshot} alt="Screenshot" />} */}
      <div>
        {notes.map((note) => (
          <div key={note.id} style={{ marginBottom: "10px" }}>
            <p>Time: {note.timestamp?.toFixed(2)} sec</p>
            {note.image && <img src={note.image} width="200" />}
          </div>
        ))}
      </div>
    </div>
  );
}
