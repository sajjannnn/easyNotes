import { ensureActiveFile, saveNote } from "../utilis/db";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // 📸 Capture Screenshot
  if (message.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab({ format: "png" })
      .then((dataUrl) => {
        sendResponse({
          success: true,
          image: dataUrl
        });
      })
      .catch((err) => {
        sendResponse({
          success: false,
          error: err.message
        });
      });

    return true; // required for async response
  }

  // 💾 Save Note (NOW handled in background)
  if (message.type === "SAVE_NOTE") {
    (async () => {
      try {
        const activeFileId = await ensureActiveFile();

        const noteToSave = {
          ...message.payload,
          fileId: activeFileId,
        };

        await saveNote(noteToSave);

        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false });
      }
    })();

    return true;
  }

  // 🖥 Open Dashboard
  if (message.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html"),
    });
  }
});