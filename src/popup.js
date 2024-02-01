async function getConfig() {
     try {
          const response = await fetch(chrome.runtime.getURL('config.json'));

          return await response.json();
     } catch {
          return {};
     }
}

//
let config = {};
let storage;

async function setConfig() {
     config = await getConfig();
     storage = await new Promise((resolve) =>
          chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
     );

     page();
}
setConfig();

async function getUserSettings() {
     return new Promise((resolve) =>
          chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
     );
}

async function loadStyles(link) {
     const response = await fetch(link);
     return await response.text();
}

async function loadRepos() {
     try {
          const response = await fetch(
               'https://raw.githubusercontent.com/dary1337/custom-themes/master/repos.json',
               {
                    cache: 'no-cache',
               }
          );

          return await response.json();
     } catch {
          return {};
     }
}

async function loadLocalRepos() {
     try {
          const response = await fetch(chrome.runtime.getURL('repos.json'));

          return await response.json();
     } catch {
          return {};
     }
}

let activeTab = "Author's";
let pageLoaded = false;
let data;

function checkUpdates(update = false) {
     if (!config.checkForUpdate) return;

     const versionUrl =
          'https://raw.githubusercontent.com/dary1337/custom-themes/master/version.txt';

     function getCurrentVersion() {
          return chrome.runtime.getManifest().version;
     }

     if (!config.useLocalFiles)
          fetch(versionUrl)
               .then((response) => response.text())
               .then((version) => {
                    if (version !== getCurrentVersion()) {
                         if (update) {
                              chrome.tabs.create({
                                   url: 'https://github.com/dary1337/custom-themes',
                              });
                         }
                         //
                         else {
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

function remoteCss() {
     const remoteCssUrl =
          'https://raw.githubusercontent.com/dary1337/custom-themes/master/src/main.css';

     fetch(remoteCssUrl)
          .then((response) => response.text())
          .then((newCssCode) => {
               const existingStyle = document.getElementById('mainStyles');
               if (existingStyle) existingStyle.textContent = newCssCode;
          });
}

function tabChanger() {
     const tabElements = document.querySelectorAll('tab div');
     tabElements.forEach((tabElement) => {
          tabElement.addEventListener('click', () => {
               tabElements.forEach((el) => el.classList.remove('selected'));

               tabElement.classList.add('selected');

               activeTab = tabElement.getAttribute('tabName');

               page();
          });
     });
}

const page = async () => {
     try {
          if (!data && pageLoaded) {
               data = config.useLocalJsonRepo ? await loadLocalRepos() : await loadRepos();
          }

          if (!pageLoaded) {
               remoteCss();

               pageLoaded = true;
               const html = `
                    <main id="tab" class="noSelect">
                         <h1>Custom Themes</h1>
                         <tab>
                              <div tabName="Author's" ${
                                   activeTab === "Author's" && 'class="selected"'
                              }>Author's</div>
                              <div tabName="Community" ${
                                   activeTab === 'Community' && 'class="selected"'
                              }>Community</div>
                         </tab>
                         <container></container>
                    </main>
                    <main id="footer" class="noSelect">
                         <a href="https://github.com/dary1337/custom-themes" target="_blank">Gihub</a>
                         <a href="#" id="updateThemes">Update themes</a>
                         </main>`;

               document.body.insertAdjacentHTML('beforeend', html);

               tabChanger();

               const div = document.createElement('div');

               const labelElement = document.createElement('label');
               labelElement.classList.add('dimmed');
               labelElement.textContent = 'Repository fetching...';

               const updateBtn = document.createElement('button');
               updateBtn.className = 'btn';
               updateBtn.style.marginTop = '12px';
               updateBtn.textContent = 'Load local version';
               updateBtn.addEventListener('click', () => {
                    config.useLocalJsonRepo = true;
                    updateBtn.remove();
                    page();
               });

               const mainElement = document.getElementById('tab');
               div.append(labelElement);
               div.append(updateBtn);
               mainElement.append(div);

               data = config.useLocalJsonRepo ? await loadLocalRepos() : await loadRepos();

               if (!data || !data["Author's"].length) {
                    labelElement.textContent = 'Repository are not available';
                    updateBtn.textContent = 'Load local version';
                    updateBtn.addEventListener('click', () => {
                         config.useLocalJsonRepo = true;
                         page();
                    });
                    return;
               } else div.remove();

               document.getElementById('updateThemes').onclick = async (e) => {
                    e.preventDefault();

                    document.getElementById('tab').style.display = 'none';
                    document.getElementById('updateThemes').style.display = 'none';

                    const main = document.createElement('main');
                    const updateBtn = document.createElement('label');
                    updateBtn.textContent = 'Updating...';
                    main.append(updateBtn);
                    document.body.prepend(main);

                    for (const theme of data[activeTab]) {
                         if (!storage[theme.id] || !storage[theme.id].checked) continue;
                         const updateValue = {
                              link: theme.link,
                              checked: true,
                              compiledCss: (await loadStyles(theme.cssLink))
                                   .replaceAll(';', ' !important;')
                                   .replaceAll('!important !important', '!important'),
                         };
                         const userSettings = {
                              ...storage,
                              [theme.id]: updateValue,
                         };

                         storage[theme.id] = updateValue;

                         chrome.storage.local.set({ userSettings });
                    }

                    main.remove();
                    document.getElementById('tab').style.display = '';
                    document.getElementById('updateThemes').style.display = '';
               };

               checkUpdates();
          }

          document.querySelector('container').innerHTML = '';

          try {
               data[activeTab].forEach((theme) => {
                    const switchContainerHtml = `
                         <div class="switch-container">
                              <div class="themeData">
                                   <label>${theme.name}</label>
                                   ${
                                        theme.link === '*'
                                             ? `<label class="dimmed">All Sites</label>`
                                             : `<a  href="${
                                                    theme.link
                                               }" target="_blank">${theme.link.replace(
                                                    /^https?:\/\//,
                                                    ''
                                               )}</a>`
                                   }
                                   ${
                                        activeTab !== "Author's"
                                             ? `<a href="${theme.authorLink}" target="_blank">${theme.author}</a>`
                                             : ''
                                   }
                              </div>
                              <label class="switch-input">
                                   <input type="checkbox" id="${theme.id}" ${
                         storage[theme.id]?.checked ? 'checked' : ''
                    } />
                                   <span class="slider"></span>
                              </label>
                         </div>`;

                    document
                         .querySelector('container')
                         .insertAdjacentHTML('beforeend', switchContainerHtml);

                    const switchInput = document.getElementById(theme.id);
                    switchInput.addEventListener('change', async () => {
                         try {
                              const updateValue = {
                                   link: theme.link,
                                   checked: switchInput.checked,
                                   compiledCss: (await loadStyles(theme.cssLink))
                                        .replaceAll(';', ' !important;')
                                        .replaceAll('!important !important', '!important'),
                              };
                              const userSettings = {
                                   ...storage,
                                   [theme.id]: updateValue,
                              };

                              if (!switchInput.checked) {
                                   delete storage[theme.id];
                                   delete userSettings[theme.id];
                              }
                              //
                              else storage[theme.id] = updateValue;

                              chrome.storage.local.set({ userSettings });
                         } catch (error) {
                              switchInput.checked = false;
                              alert('Something went wrong :(');
                         }
                    });
               });
          } catch {}
     } catch (error) {
          console.error(error);
     }
};
