async function getUserSettings() {
     return await new Promise((resolve) => {
          chrome.storage.local.get('userSettings', (result) => {
               resolve(result.userSettings || {});
          });
     });
}

async function loadStyles(link) {
     try {
          const response = await fetch(link);
          if (!response.ok) {
               throw new Error(`HTTP error! Status: ${response.status}`);
          }

          return await response.text();
     } catch (error) {
          console.error('Ошибка при загрузке стилей:', error);
          throw error;
     }
}

async function load() {
     const userSettings = await getUserSettings();

     const currentUrl = window.location.href.toLowerCase();

     console.log(userSettings);

     if (userSettings.length === 0) return;

     for (const theme of Object.keys(userSettings)) {
          const settings = userSettings[theme];

          if ((currentUrl.includes(settings.link) || settings.link === '*') && settings.checked) {
               const cssText = await loadStyles(settings.cssLink);
               const modifiedCssText = cssText.replace(/;/g, ' !important;');

               const styleElement = document.createElement('style');
               styleElement.setAttribute('data-extension-priority', 'important');
               styleElement.innerHTML = modifiedCssText;

               document.head.insertBefore(styleElement, document.head.firstChild);
          }
     }
}
load();
