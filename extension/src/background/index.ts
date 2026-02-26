import { ensureActiveFile, saveNote } from "../utilis/db";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  // =============================
  // 📸 CAPTURE SCREENSHOT
  // =============================
  if (message.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab({ format: "png" })
      .then((dataUrl) => {
        sendResponse({
          success: true,
          image: dataUrl,
        });
      })
      .catch((error) => {
        console.error("Screenshot failed:", error);
        sendResponse({
          success: false,
          error: error?.message || "Screenshot failed",
        });
      });

    return true; // IMPORTANT for async response
  }

  // =============================
  // 💾 SAVE NOTE
  // =============================
  if (message.type === "SAVE_NOTE") {
    (async () => {
      try {
        const activeFileId = await ensureActiveFile();

        const noteToSave = {
          ...message.payload,
          fileId: activeFileId,
        };

        await saveNote(noteToSave);

        console.log("Note saved to file:", activeFileId);

        sendResponse({ success: true });
      } catch (error) {
        console.error("Save note failed:", error);
        sendResponse({
          success: false,
          error: "Failed to save note",
        });
      }
    })();

    return true; // IMPORTANT
  }

  // =============================
  // 🖥 OPEN DASHBOARD
  // =============================
  if (message.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html"),
    });

    sendResponse({ success: true });
  }
});