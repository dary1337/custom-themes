/**
 @todo
     rewrite to vue3 + ts
*/
'use strict';

import { isChromeStoreBuild, isFullPage, links, svg } from './conts.js';
import { dictionary } from './dict.js';
import {
    getExtensionSettings,
    getUserSettings,
    loadRepos,
    loadStyles,
    setExtensionSetting,
    updateTheme,
    updateThemes,
} from './shared.js';

let //
    userSettings = {},
    extensionSettings = {
        useLocalJsonRepo: undefined,
        checkForUpdate: undefined,
        showScreenshots: undefined,
        backgroundUpdate: undefined,
    },
    //
    activeSwitch,
    pageLoaded = false,
    repos,
    searchTheme = '';

let dict = dictionary.en;

const elements = {
    emptyBigTab: `
               <div id="empty-tab" class="noSelect">
                    <label class="dimmed">${dict.labels.selectTheme}</label>
                    <button class="createTheme">
                         ${svg.add}
                         ${dict.buttons.createTheme}
                    </button>
               </div>`,
    changelog: `
               <h2>${dict.strings.updateVer} ${getCurrentVersion()}</h2>
     
               ${dict.changelog.map((x) => `<label>- ${x}</label>`).join('')}
               `,
};

const pushUrl = (href) => history.pushState({}, '', href);

async function setValues() {
    userSettings = await getUserSettings();
    extensionSettings = await getExtensionSettings();

    dictionary.en.settings.forEach(async (x) => {
        if (extensionSettings[x.id] === undefined) await setExtensionSetting(x.id, x.default);
    });

    if (navigator.language.toLocaleLowerCase().startsWith('ru')) dict = dictionary.ru;

    await page();
}

function getLoader(text) {
    return (
        //
        `<div id="loader-div" style="display:flex;align-items:center">
               <div class="loader-icon"></div>
               <label id="fetching" class="dimmed" style="padding:6px; font-size:20px">${text}</label>
          </div>`
    );
}

function getCurrentVersion() {
    return chrome.runtime.getManifest().version;
}

function checkUpdates() {
    if (!extensionSettings.checkForUpdate || isChromeStoreBuild) return;

    fetch(links.versionLink)
        .then((response) => response.text())
        .then((version) => {
            if (version !== getCurrentVersion() && !version.includes('NOT FOUND')) {
                extensionPopup.insertAdjacentHTML(
                    'afterbegin',
                    `<main>
                              <a href="${links.repo}" target="_blank">
                                   <button>
                                        ${svg.update}
                                        ${dict.buttons.updateExtension}
                                   </button>
                              </a>
                         </main>`
                );
            }
        });
}

function tabSwitchEvent(tab = undefined) {
    const tabElements = document.querySelectorAll('tab div');
    tabElements.forEach((tabElement) => {
        tabElement.addEventListener('click', () => {
            if (tabElement.classList.contains('selected')) return;

            tabElements.forEach((el) => el.classList.remove('selected'));

            tabElement.classList.add('selected');

            const newTab = tab || tabElement.getAttribute('tabName');
            // pushUrl(`index.html#${newTab}`);
            // window.location.href = `index.html#${newTab}`;

            page(true, newTab);
        });
    });
}

function createTheme() {
    function getRandomString() {
        const abc = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let randomString = '';

        for (let i = 0; i < 25; i++) {
            const randomIndex = Math.floor(Math.random() * abc.length);
            randomString += abc.charAt(randomIndex);
        }

        return randomString;
    }
    const id = getRandomString();

    const updateValue = {
        id: id,
        name: dict.strings.untitled,
        link: '',
        checked: true,
        compiledCss: '',
        local: true,
        sourceCSS: '',
    };

    userSettings[id] = updateValue;
    chrome.storage.local.set({ userSettings });

    pushUrl(`index.html#Local-${id}`);
    page();
}

async function updateThemes_page() {
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], 'none');

    const mainHTML = `
                         <main id="updating-theme" style="display:flex;align-items:center;">
                              <div class="loader-icon"></div>
                              <label style="margin-left:6px; font-size:16px;">${dict.loader.updatingThemes}</label>
                         </main>
                    `;
    extensionPopup.insertAdjacentHTML('afterbegin', mainHTML);

    await updateThemes(userSettings, repos);

    document.getElementById('updating-theme').remove();
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], '');

    await page();
}

function deleteTheme(theme) {
    delete userSettings[theme.id];
    chrome.storage.local.set({ userSettings });
    activeSwitch = '';

    bigTab.innerHTML = elements.emptyBigTab;
    window.location.href = 'index.html#Local';
    page();
}

function exportTheme(themeId = undefined) {
    const jsonData = JSON.stringify(
        themeId
            ? userSettings[themeId]
            : Object.keys(userSettings)
                  .filter((key) => userSettings[key].local === true)
                  .map((key) => userSettings[key])
    );

    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData));
    a.setAttribute('download', `custom-theme-${themeId || 'all'}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// add a confirm for replace
function importTheme() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.addEventListener('change', function () {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const json = JSON.parse(event.target.result);

            if (Array.isArray(json)) json.forEach((theme) => (userSettings[theme.id] = theme));
            else userSettings[json.id] = json;

            chrome.storage.local.set({ userSettings });

            window.location.href = 'index.html#Local';
            closeSettings();
        };

        reader.readAsText(file);
    });

    input.click();
}

function display(array, style) {
    array.forEach(
        (el) => document.getElementById(el) && (document.getElementById(el).style.display = style)
    );
}

function openSettings() {
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], 'none');

    const mainHTML = `
          <main id="settingsPage" class="noSelect">
               <div id="backFromSettings">${svg.back}</div>
               <h1>${dict.titles.settings}</h1>
               <container></container>
          </main>
     `;
    extensionPopup.insertAdjacentHTML('afterbegin', mainHTML);

    const settings = dict.settings;

    settings.forEach((setting) => {
        if (setting.id === undefined) return;

        document.querySelector('container').insertAdjacentHTML(
            'beforeend',
            `<div class="switch-container">
                    <div class="switch-label">
                         <label>${setting.name}</label>
                         <label class="dimmed">${setting.description || ''}</label>
                    </div>
                    <label class="switch-input">
                         <input type="checkbox" id="${setting.id}" 
                              ${extensionSettings[setting.id] ? 'checked' : ''} 
                         />
                         <span class="slider"></span>
                    </label>
               </div>`
        );

        const switchInput = document.getElementById(setting.id);
        switchInput.addEventListener('change', async () => {
            try {
                await setExtensionSetting(setting.id, switchInput.checked);
            } catch (error) {
                switchInput.checked = false;
            }
        });
    });

    document.querySelector('container').insertAdjacentHTML(
        'beforeend',
        `
               <div id="settings-bottom">
                    <button id="import-themes">
                         ${svg.import}
                         ${dict.buttons.importThemes}
                    </button>
                    <button id="export-themes">
                         ${svg.export}
                         ${dict.buttons.exportThemes}
                    </button>
                    <button id="resetExtensionButton" class="danger">
                         ${svg.trash}
                         ${dict.buttons.resetExtension}
                    </button>
               </div>
          `
    );

    document.getElementById('import-themes').onclick = () => importTheme();
    document.getElementById('export-themes').onclick = () => exportTheme();

    backFromSettings.onclick = closeSettings;

    resetExtensionButton.onclick = resetExtension;
}
function closeSettings() {
    settingsPage.remove();
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], '');

    page();
}

function openAbout() {
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], 'none');

    const mainHTML = `
          <main id="aboutPage" class="noSelect">
               <h1>
                    <div id="backFromSettings">${svg.back}</div>
                    ${dict.titles.about}
               </h1>
               <div id="about-labels">
                    ${dict.about}
                    <label>
                         :3
                    </label>

                    <h2>${dict.strings.usedLibs}:</h2>
                    <label>
                         - Ace Editor
                    </label>
                    <label>
                         - Beautify
                    </label>

                    ${elements.changelog}
               </div>
          </main>
     `;
    extensionPopup.insertAdjacentHTML('afterbegin', mainHTML);

    backFromSettings.onclick = () => {
        aboutPage.remove();
        display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], '');

        page();
    };
}

function resetExtension() {
    if (confirm('Are you sure want to reset all data?')) {
        chrome.storage.local.set({ extensionSettings: {}, userSettings: {} });
        window.location.reload();
    }
}

function openLink(link) {
    chrome.tabs.create({
        url: link,
    });
}

function copyToClipboard(text, then = () => {}) {
    navigator.clipboard.writeText(text).then(then);
}

function showModal(triggerElement, html) {
    const { top, left, width, height } = triggerElement.getBoundingClientRect();
    const modal = document.createElement('div');
    const modalContent = document.createElement('div');

    modal.className = 'modal';
    modal.style.backgroundColor = `rgba(0, 0, 0, 0)`;

    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
          top: ${top}px;
          left: ${left}px;
          width: ${width}px;
          height: ${height}px;
     `;
    modalContent.insertAdjacentHTML('afterbegin', html);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modalContent.getBoundingClientRect();

    modalContent.style.cssText = `
          opacity: 1;
          top: 10%;
          left: 10%;
          width: 80%;
          height: 80%;
     `;
    modal.style.backgroundColor = `rgba(0, 0, 0, 0.2)`;

    modal.onclick = () => {
        modalContent.style.transition = 'all 0.25s cubic-bezier(.08,1.2,.76,.93)';
        modal.style.transition = 'background-color 0.3s ease';
        modal.style.backgroundColor = `rgba(0, 0, 0, 0)`;

        modalContent.style.cssText = `
               top: ${top}px;
               left: ${left}px;
               width: ${width}px;
               height: ${height}px;
          `;

        setTimeout(() => {
            triggerElement.style.cssText = '';
            modal.remove();
        }, 350);
    };

    triggerElement.style.cssText = 'opacity: 0; pointer-events: none;';
}

const page = async (check_href = true, newTab = undefined) => {
    try {
        if (!repos && pageLoaded) repos = await loadRepos(extensionSettings.useLocalJsonRepo);

        console.log('page', userSettings);

        const path = window.location.href
            .split('/')
            .pop()
            .split('#')
            .pop()
            .replace('index.html', '')
            .split('-');
        const activeTab = newTab || path[0] || "Author's";
        const href = window.location.href.split('/').pop().split('#').pop();

        if (!pageLoaded) {
            pageLoaded = true;

            document.body.insertAdjacentHTML(
                'beforeend',
                `
                    <div id="extensionPopup">
                         <main id="tab" class="noSelect">
                              <h1>Custom Themes</h1>
                              <div id="tabs">
                                   <tab>
                                        <div tabName="Author's" 
                                             ${activeTab === "Author's" && 'class="selected"'}>
                                             ${dict.tabs.fromAuthor}
                                        </div>
                                        <div tabName="Community"
                                             ${activeTab === 'Community' && 'class="selected"'}>
                                             ${dict.tabs.community}
                                        </div>
                                        ${
                                            Object.entries(userSettings).filter(
                                                ([key, value]) => value.local
                                            ).length !== 0 || isFullPage
                                                ? `
                                                  <div tabName="Local" 
                                                       ${
                                                           activeTab === 'Local' &&
                                                           'class="selected"'
                                                       }>
                                                       ${dict.tabs.local}
                                                  </div>`
                                                : ''
                                        }
                                   </tab>
                                   ${
                                       isFullPage
                                           ? `
                                             <button id="theme-search-button" opened="false">
                                                  ${svg.search}
                                             </button>`
                                           : ''
                                   }
                              </div>
                              <container></container>
                         </main>
                         <main id="footer" class="noSelect">
                              <a href="${links.repo}" target="_blank">Github</a>
                              <div style="display:flex">
                                   <div id="updateThemes" style="display:none">
                                        ${svg.update}
                                   </div>
                                   <div id="settingsButton">
                                        ${svg.settings}
                                   </div>
                                   <a id="openFullWindow" href="#" target="_blank">
                                        ${svg.openInNew}
                                   </a>
                                   <div id="aboutButton" class="tooltip">${svg.info}</div>
                              </div>
                         </main>
                    </div>
                    ${
                        isFullPage
                            ? `
                              <div id="extensionFull">
                                   <main id="bigTab">
                                        ${elements.emptyBigTab}
                                   </main>
                              </div>
                              `
                            : ''
                    }
                    `
            );

            tabSwitchEvent();

            const loading_div = document.createElement('div');

            const updateBtn = document.createElement('button');
            updateBtn.style.marginTop = '6px';
            updateBtn.textContent = 'Load local version';
            updateBtn.addEventListener('click', () => {
                extensionSettings.useLocalJsonRepo = true;
                updateBtn.remove();
                page();
            });

            loading_div.insertAdjacentHTML('beforeend', getLoader(dict.loader.loadingRepo));
            if (!extensionSettings.useLocalJsonRepo) loading_div.append(updateBtn);
            tab.append(loading_div);

            repos = await loadRepos(extensionSettings.useLocalJsonRepo);

            if (!repos || !repos["Author's"] || !repos["Author's"].length) {
                document.querySelector('.loader-icon').remove();
                updateBtn.addEventListener('click', () => {
                    extensionSettings.useLocalJsonRepo = true;
                    page();
                });
                // return;
            }
            //
            else loading_div.remove();

            display(['updateThemes'], '');
            document.getElementById('updateThemes').onclick = async () => await updateThemes_page();
            settingsButton.onclick = () => openSettings();
            aboutButton.onclick = () => openAbout();

            if (isFullPage) {
                const searchBtn = document.getElementById('theme-search-button');
                searchBtn.onclick = () => {
                    const isOpened = searchBtn.getAttribute('opened') === 'true';

                    if (isOpened) {
                        document.getElementById('theme-search').remove();
                        searchTheme = '';
                        page();
                    }
                    //
                    else {
                        document.getElementById('tabs').insertAdjacentHTML(
                            'afterbegin',
                            `<div id="theme-search" class="input-container">
                                        ${svg.search}
                                        <input
                                            id="theme-search-input"
                                             type="text"
                                             placeholder="Search"
                                        />
                                   </div>`
                        );

                        const input = document.getElementById('theme-search-input');
                        input.focus();
                        input.oninput = (el) => {
                            console.log(el.target.value);
                            searchTheme = el.target.value;
                            page();
                        };
                    }
                    document.querySelector('tab').style.display = isOpened ? '' : 'none';
                    searchBtn.setAttribute('opened', !isOpened);
                    searchBtn.innerHTML = isOpened ? svg.search : svg.close;
                };
            }

            checkUpdates();
        }

        if (!repos || !repos["Author's"] || !repos["Author's"].length)
            fetching.textContent = activeTab === 'Local' ? '' : 'Repository are not available';

        document.querySelector('container').innerHTML = '';

        document.querySelectorAll('tab div').forEach((el) => el.classList.remove('selected'));
        document.querySelector(`[tabname="${activeTab}"]`).classList.add('selected');

        try {
            // todo: if something deleted from repos

            let themes = [];

            if (searchTheme !== '') {
                themes = [
                    ...Object.entries(userSettings)
                        .filter(([key, value]) => value.local === true)
                        .map(([key, value]) => value),
                    ...repos["Author's"],
                    ...repos['Community'],
                ];

                themes = themes.filter((theme) =>
                    theme.name.toLowerCase().includes(searchTheme.toLowerCase())
                );

                console.log(themes);
            }
            //
            else {
                if (!repos && activeTab !== 'Local') return;

                themes =
                    activeTab === 'Local'
                        ? Object.entries(userSettings)
                              .filter(([key, value]) => value.local === true)
                              .map(([key, value]) => value)
                        : repos[activeTab];
            }

            themes.forEach(
                (
                    /** from repos or userSettings (if local) */
                    theme
                ) => {
                    const switchContainer = document.createElement('div');
                    switchContainer.className = 'switch-container';
                    if (activeSwitch === theme.id) switchContainer.classList.add('selected');

                    switchContainer.insertAdjacentHTML(
                        'beforeend',
                        `
                              <div class="switch-label">
                                   <div style="display:flex">
                                        <label class="label-name">
                                             ${theme.name}
                                        </label>
                                        <div class="edited-info">
                                             ${
                                                 userSettings[theme.id]?.edited
                                                     ? `
                                                       <a 
                                                            href="index.html#${activeTab}-${theme.id}-edit" 
                                                            target="_blank"
                                                       >
                                                            ${svg.edit}
                                                       </a>`
                                                     : ''
                                             }
                                        </div>
                                   </div>
                                   ${
                                       theme.link === '*'
                                           ? `<label class="dimmed">${dict.strings.allSites}</label>`
                                           : `
                                             <a 
                                                  href="${theme.link}" 
                                                  target="_blank">
                                                  ${theme.link.replace(/^https?:\/\//, '')}
                                             </a>`
                                   }
                                   ${
                                       activeTab !== "Author's" && theme.author
                                           ? `<a href="${theme.authorLink}" target="_blank">${theme.author}</a>`
                                           : ''
                                   }
                                   ${
                                       userSettings[theme.id] &&
                                       theme.version !== userSettings[theme.id].version &&
                                       !userSettings[theme.id].edited &&
                                       userSettings[theme.id].checked
                                           ? `<label class="dimmed">Update available</label>`
                                           : ''
                                   }
                              </div>
                              <label slider-id="${theme.id}" class="switch-input">
                                   <input
                                        type="checkbox" 
                                        id="${theme.id}"
                                        ${userSettings[theme.id]?.checked ? 'checked' : ''}
                                   />
                                   <span class="slider"></span>
                              </label>`
                    );
                    document.querySelector('container').append(switchContainer);

                    if (isFullPage) {
                        let editor;

                        const openTheme = (append_href = true) => {
                            document
                                .querySelectorAll('.switch-container.selected')
                                .forEach((x) => x.classList.remove('selected'));
                            switchContainer.classList.add('selected');

                            if (append_href) pushUrl(`index.html#${activeTab}-${theme.id}`);

                            activeSwitch = theme.id;

                            bigTab.innerHTML = `
                                   <div id="theme-window">
                                        <div id="theme-title" class="noSelect">
                                             <div id="backFromThemeEditing" style="display:none">
                                                  ${svg.back}
                                             </div>
                                             <h1 id="theme-h1">
                                                  ${theme.name}
                                             </h1>
                                             ${
                                                 theme.local
                                                     ? `
                                                            <div id="theme-edit-name" class="input-container" style="display:none">
                                                                 ${svg.title}
                                                                 <input
                                                                      id="theme-edit-input"
                                                                      type="text"     
                                                                      placeholder="Untitled"
                                                                      value="${theme.name}"
                                                                 />
                                                            </div>`
                                                     : ''
                                             }
                                             <div id="backFromThemeInfo">
                                                  ${svg.close}
                                             </div>
                                        </div>
                                        <div id="theme-container">
                                             ${
                                                 extensionSettings.showScreenshots && !theme.local
                                                     ? theme.screenshots?.length
                                                         ? `
                                                                 <div id="theme-screenshots" class="noSelect">
                                                                      ${theme.screenshots
                                                                          .map(
                                                                              (screen) =>
                                                                                  `<img src="${screen}"></img>`
                                                                          )
                                                                          .join('')}
                                                                 </div>
                                                            `
                                                         : `<label class="dimmed" style="font-size:15px;">
                                                                 ${dict.labels.noScreenshots}
                                                            </label>`
                                                     : ''
                                             }
                                             <div id="theme-info">
                                                  <div id="theme-description">
                                                       <label>${dict.labels.website}:</label>
                                                       <a 
                                                            ${
                                                                theme.link === '*' || !theme.link
                                                                    ? ''
                                                                    : `href="${theme.link}" target="_blank"`
                                                            }
                                                       >
                                                            ${theme.link || dict.strings.none}
                                                       </a>
                                                       ${
                                                           theme.authorLink
                                                               ? `
                                                                      <label>${dict.labels.author}: </label>
                                                                      <a href="${theme.authorLink}" target="_blank">
                                                                           ${theme.author}
                                                                      </a>`
                                                               : ''
                                                       }
                                                       ${
                                                           theme.repoLink
                                                               ? `
                                                                      <label>${dict.labels.source}:</label>
                                                                      <a href="${theme.repoLink}" target="_blank">Github</a>`
                                                               : ''
                                                       }
                                                       <label>${dict.labels.version}: </label>
                                                       <a>
                                                            ${
                                                                userSettings[theme.id]?.edited ||
                                                                theme.local
                                                                    ? dict.strings.local
                                                                    : userSettings[theme.id]
                                                                          ?.version || theme.version
                                                            }
                                                       </a>
                                                  </div>
                                                  <div id="theme-info-panel">
                                                       <button id="editTheme">
                                                            ${svg.edit}
                                                            ${dict.buttons.edit}
                                                       </button>
                                                       ${
                                                           userSettings[theme.id] &&
                                                           theme.version !==
                                                               userSettings[theme.id].version &&
                                                           !userSettings[theme.id].edited
                                                               ? `
                                                                      <button id="theme-update-button">
                                                                           ${svg.update}
                                                                           ${dict.buttons.update}
                                                                      </button>`
                                                               : ''
                                                       }
                                                       ${
                                                           theme.local
                                                               ? `
                                                                      <button id="export-theme">
                                                                           ${svg.export}
                                                                           ${dict.buttons.export}
                                                                      </button>
                                                                      <a 
                                                                           id="suggest-theme-github"
                                                                           href="${links.newIssue}" target="_blank">
                                                                           <button>
                                                                                ${svg.openInNew}
                                                                                ${dict.buttons.suggestGithub}
                                                                           </button>
                                                                      </a>
                                                                      <a 
                                                                           id="suggest-theme-telegram"
                                                                           href="${links.telegram}" target="_blank">
                                                                           <button>
                                                                                ${svg.openInNew}
                                                                                ${dict.buttons.suggestTelegram}
                                                                           </button>
                                                                      </a>
                                                                 `
                                                               : ''
                                                       }
                                                       ${
                                                           !userSettings[theme.id]?.edited &&
                                                           repos["Author's"].findIndex(
                                                               (x) => x.id === theme.id
                                                           ) !== -1
                                                               ? `
                                                                      <a 
                                                                           href="${links.newIssue}"
                                                                           target="_blank" 
                                                                      >
                                                                           <button>
                                                                                ${svg.openInNew}
                                                                                ${dict.buttons.badLayout}
                                                                           </button>
                                                                      </a>`
                                                               : ''
                                                       }
                                                  </div>
                                             </div>
                                        </div>
                                   </div>`;

                            if (theme.local) {
                                const deleteThemeBtn = document.createElement('button');
                                deleteThemeBtn.className = 'danger';
                                deleteThemeBtn.innerHTML = `${svg.trash}${dict.buttons.delete}`;
                                deleteThemeBtn.onclick = () => deleteTheme(theme);

                                document.getElementById('theme-info-panel').append(deleteThemeBtn);

                                document.getElementById('export-theme').onclick = () =>
                                    exportTheme(theme.id);

                                for (const site of ['github', 'telegram'])
                                    document.getElementById('suggest-theme-' + site).onclick = (
                                        e
                                    ) => {
                                        e.preventDefault();
                                        copyToClipboard(
                                            `Hi, I would like to suggest a theme\nTitle: ${
                                                userSettings[theme.id].name
                                            }\nWebsite: ${
                                                userSettings[theme.id].link
                                            }\n\`\`\`css\n${
                                                userSettings[theme.id].sourceCSS
                                            }\`\`\``,
                                            () => {
                                                alert(dict.strings.copiedPreset);

                                                openLink(
                                                    site === 'github'
                                                        ? links.newIssue
                                                        : links.telegram
                                                );
                                            }
                                        );
                                    };
                            }

                            // imgs
                            document
                                .querySelectorAll('img')
                                .forEach(
                                    (img) => (img.onclick = () => showModal(img, img.outerHTML))
                                );

                            const updateBtn = document.getElementById('theme-update-button');
                            if (updateBtn)
                                updateBtn.onclick = async () => {
                                    await updateTheme(
                                        userSettings,
                                        theme,
                                        userSettings[theme.id]?.checked
                                    );
                                    await page();
                                };

                            editTheme.onclick = openEditor;
                            backFromThemeEditing.onclick = () => closeEditor();
                            backFromThemeInfo.onclick = () => {
                                window.location.href = `index.html#${activeTab}`;
                                page();
                            };
                        };

                        async function saveCode() {
                            if (!theme.local && !userSettings[theme.id]?.edited) {
                                document.getElementById('theme-panel').insertAdjacentHTML(
                                    'beforeend',
                                    `<button id="restore-theme" class="danger">
                                                  ${svg.trash}
                                                  ${dict.buttons.restoreFromCloud}
                                             </button>`
                                );
                                document.getElementById('restore-theme').onclick = restoreTheme;
                            }

                            if (theme.local) {
                                let link = document.getElementById('theme-link').value;

                                if (link && !link.includes('https://') && link !== '*')
                                    link = 'https://' + link;

                                theme.link = link;

                                theme.name = document.getElementById('theme-edit-input').value;
                            }

                            await updateTheme(
                                userSettings,
                                theme,
                                theme.local ? theme.checked : userSettings[theme.id]?.checked,
                                editor.getValue() || ' '
                            );
                            const line = editor.selection.getCursor().row;

                            editor.setValue(
                                css_beautify(editor.getValue(), {
                                    indent_size: 5,
                                    preserve_newlines: false,
                                })
                            );
                            editor.gotoLine(line + 1);

                            document.getElementById('save-theme').classList.remove('filled');
                            await page(false);
                        }

                        async function restoreTheme() {
                            userSettings[theme.id].edited = false;
                            document.getElementById('restore-theme').remove();

                            const loading_div = document.createElement('div');

                            loading_div.insertAdjacentHTML(
                                'afterbegin',
                                getLoader(dict.loader.restoringTheme)
                            );
                            document.getElementById('theme-container').prepend(loading_div);

                            const sourceCSS = await updateTheme(
                                userSettings,
                                theme,
                                userSettings[theme.id].checked,
                                false
                            );

                            editor.session.setValue(sourceCSS, -1);

                            await page(false);

                            loading_div.remove();
                        }

                        const openEditor = async (append_href = true) => {
                            if (append_href) pushUrl(window.location.href + '-edit');

                            let remoteCss;

                            document.getElementById('theme-container').innerHTML = getLoader(
                                dict.loader.loadingCode
                            );

                            if (theme.local || theme.edited) remoteCss = theme.sourceCSS;
                            else {
                                remoteCss = userSettings[theme.id]?.edited
                                    ? userSettings[theme.id].sourceCSS
                                    : await loadStyles(theme.cssLink);
                            }

                            document.getElementById('theme-container').innerHTML = `
                                   ${
                                       theme.local
                                           ? `<div id="theme-website" class="input-container">
                                                  ${svg.world}
                                                  <input
                                                       id="theme-link"
                                                       type="text"
                                                       placeholder="${dict.labels.linkPlaceholder}"
                                                       value="${userSettings[theme.id]?.link}"
                                                  />
                                             </div>`
                                           : ''
                                   }
                                   <div id="theme-code"></div>
                                   <div id="theme-panel">
                                        <button id="save-theme">
                                             ${svg.save}
                                             ${dict.buttons.saveLocally}
                                        </button>
                                        ${
                                            !theme.local && userSettings[theme.id]?.edited
                                                ? `
                                                  <button id="restore-theme" class="danger">
                                                       ${svg.trash}
                                                       ${dict.buttons.restoreFromCloud}
                                                  </button>`
                                                : ''
                                        }
                                   </div>`;

                            display(['backFromThemeEditing', 'theme-edit-name'], '');
                            if (theme.local) display(['theme-h1'], 'none');

                            editor = ace.edit('theme-code', {
                                theme: 'ace/theme/tomorrow_night',
                                mode: 'ace/mode/css',
                                value: remoteCss,
                                tabSize: 5,
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                            });
                            ace.require('ace/ext/language_tools');

                            editor.session.setUseWrapMode(true);

                            editor.commands.addCommand({
                                name: 'save',
                                bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
                                exec: saveCode,
                            });

                            const saveTheme = document.getElementById('save-theme');
                            const themeLink = document.getElementById('theme-link');
                            const themeName = document.getElementById('theme-edit-input');

                            const somethingChanged = () =>
                                remoteCss !== editor.getValue() ||
                                (themeLink && themeLink.value !== theme.link) ||
                                (themeName && themeName.value !== theme.name)
                                    ? saveTheme.classList.add('filled')
                                    : saveTheme.classList.remove('filled');

                            editor.session.on('change', somethingChanged);

                            if (theme.local) {
                                themeLink.addEventListener('input', somethingChanged);
                                themeName.addEventListener('input', somethingChanged);

                                const keyDownHandler = (e) => {
                                    if (e.ctrlKey && e.key === 's') {
                                        e.preventDefault();
                                        saveCode();
                                    }
                                };

                                document
                                    .getElementById('theme-website')
                                    .addEventListener('keydown', keyDownHandler);

                                document
                                    .getElementById('theme-edit-input')
                                    .addEventListener('keydown', keyDownHandler);
                            }

                            saveTheme.onclick = saveCode;
                            try {
                                document.getElementById('restore-theme').onclick = restoreTheme;
                            } catch {}
                        };

                        const closeEditor = () => {
                            display(
                                ['backFromThemeEditing', 'theme-h1', 'theme-edit-name'],
                                'none'
                            );
                            display(['theme-h1'], '');
                            openTheme();
                            window.location.href = window.location.href.replace('-edit', '');
                        };

                        document.querySelector(`[slider-id="${theme.id}"]`).onclick = (e) =>
                            e.stopPropagation();

                        switchContainer.onclick = openTheme;

                        if (check_href && href.includes(theme.id)) {
                            openTheme(false);
                            if (href.includes('-edit')) openEditor(false);
                        }
                    }

                    const switchInput = document.getElementById(theme.id);

                    switchInput.onchange = async () => {
                        try {
                            await updateTheme(
                                userSettings,
                                theme,
                                switchInput.checked,
                                userSettings[theme.id]?.sourceCSS || false
                            );
                        } catch (error) {
                            switchInput.checked = false;
                            console.error(error);
                            alert(dict.strings.somethingWrong);
                        }
                    };
                }
            );

            if (
                check_href &&
                !href.includes('-') &&
                themes.findIndex((theme) => href.includes(theme.id)) === -1
            ) {
                document
                    .querySelectorAll('.switch-container.selected')
                    .forEach((x) => x.classList.remove('selected'));
                bigTab.innerHTML = elements.emptyBigTab;
            }
            if (activeTab === 'Local' && isFullPage) {
                document.querySelector('container').insertAdjacentHTML(
                    'afterbegin',
                    `
                         <div id="top-local-panel">
                              <button class="createTheme" >
                                   ${svg.add}
                                   ${dict.buttons.createTheme}
                              </button>
                              <button id="import-theme" class="importTheme">
                                   ${svg.import}
                                   ${dict.buttons.importTheme}
                              </button>
                         </div>
                         `
                );
                document.getElementById('import-theme').onclick = importTheme;
            }
        } catch (error) {
            console.error(error);
        }

        document.querySelectorAll('.createTheme').forEach((el) => (el.onclick = createTheme));
    } catch (error) {
        console.error(error);
    }
};

setValues();

window.addEventListener('popstate', async () => await page());
