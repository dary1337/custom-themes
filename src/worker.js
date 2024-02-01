async function getUserSettings() {
     return new Promise((resolve) =>
          chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
     );
}

function loadStylesInTab(tabId, currentUrl) {
     getUserSettings().then((userSettings) => {
          if (Object.keys(userSettings).length === 0) return;

          for (const theme of Object.keys(userSettings)) {
               const settings = userSettings[theme];

               if (
                    (currentUrl.includes(settings.link.toLowerCase()) || settings.link === '*') &&
                    settings.checked
               ) {
                    chrome.scripting.insertCSS({
                         target: {
                              tabId: tabId,
                              allFrames: true,
                         },
                         css: settings.compiledCss,
                    });
               }
          }
     });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
     if (changeInfo.status !== 'complete' || !tab || !tab.url) return;
     const currentUrl = tab.url.toLowerCase();
     loadStylesInTab(tabId, currentUrl);
});
