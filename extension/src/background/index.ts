export default chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender.tab?.id);

  if (message.type === "CAPTURE_SCREENSHOT") {
   chrome.tabs.captureVisibleTab({ format: "png" })
  .then((dataUrl) => {
    sendResponse({
      success: true,
      image: dataUrl
    });
  });
    return true;
  }
    if (message.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html"),
    });
  }
});