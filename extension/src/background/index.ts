export default chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "CAPTURE_SCREENSHOT") {
//     chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
//       sendResponse({ screenshot: dataUrl });
//     });

//     return true;
//   }
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender.tab?.id);

  if (message.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab({ format: "png" })
      .then((dataUrl) => {

        chrome.downloads.download({
          url: dataUrl,
          filename: "screenshot.png",
          saveAs: true // shows save dialog
        });

        sendResponse({ success: true });
      });

    return true;
  }
});