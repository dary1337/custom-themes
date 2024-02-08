async function getUserSettings() {
     return new Promise((resolve) =>
          chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
     );
}

function loadStylesInTab(tabId, url) {
     getUserSettings().then((userSettings) => {
          if (Object.keys(userSettings).length === 0) return;

          for (const theme of Object.keys(userSettings)) {
               const settings = userSettings[theme];

               if (
                    settings.link &&
                    (url.includes(settings.link.toLowerCase()) || settings.link === '*') &&
                    settings.checked
               ) {
                    chrome.scripting.insertCSS({
                         target: {
                              tabId: tabId,
                              // allFrames: true,
                         },
                         css: settings.compiledCss,
                    });
               }
          }
     });
}

chrome.webNavigation.onCommitted.addListener((details) => {
     if (
          ['reload', 'link', 'typed', 'generated', 'auto_bookmark'].includes(details.transitionType)
     ) {
          const tabId = details.tabId;
          const url = details.url;

          if (url) {
               loadStylesInTab(tabId, hostname);
               console.log('Loaded:', url, tabId);
          }
     }
});
