async function getConfig() {
     try {
          const response = await fetch(chrome.runtime.getURL('config.json'));

          return await response.json();
     } catch {
          return {};
     }
}

//

const versionUrl = 'https://raw.githubusercontent.com/dary1337/custom-themes/master/version.txt';

(async () => {
     function getCurrentVersion() {
          return localStorage.getItem('extensionVersion') || '1.0.0';
     }

     const config = await getConfig();

     const cssUrl = config.useLocalFiles
          ? 'src/main.css'
          : 'https://raw.githubusercontent.com/dary1337/custom-themes/master/src/main.css';
     const jsUrl = config.useLocalFiles
          ? 'src/popup.js'
          : 'https://raw.githubusercontent.com/dary1337/custom-themes/master/src/popup.js';

     const cssWithVersion = `${cssUrl}?version=${getCurrentVersion()}`;
     const jsWithVersion = `${jsUrl}?version=${getCurrentVersion()}`;

     const cssLink = document.createElement('link');
     cssLink.rel = 'stylesheet';
     cssLink.type = 'text/css';
     cssLink.href = cssWithVersion;

     const jsScript = document.createElement('script');
     jsScript.src = jsWithVersion;

     document.head.appendChild(cssLink);
     document.head.appendChild(jsScript);

     function checkUpdates(update = false) {
          if (!config.useLocalFiles)
               fetch(versionUrl)
                    .then((response) => response.text())
                    .then((version) => {
                         if (version !== getCurrentVersion()) {
                              if (update) {
                                   localStorage.setItem('extensionVersion', version);
                                   location.reload();
                              } else {
                                   const main = document.createElement('main');
                                   const updateBtn = document.createElement('button');
                                   updateBtn.className = 'btn';
                                   updateBtn.textContent = 'Update extension';
                                   updateBtn.addEventListener('click', () => checkUpdates(true));
                                   main.append(updateBtn);
                                   document.body.prepend(main);
                              }
                         }
                    })
                    .catch((error) => console.error('Unable to update:', error));
     }

     checkUpdates();
})();
