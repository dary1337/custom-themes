/**
 @todo
     auto update themes in background
     rewrite to vue3 + ts
     add support for @import in css
*/
'use strict';

const isChromeStoreBuild = chrome.runtime.id === 'bepolblndbcmpffmmoedkdlpdkfenikn';

const isFullPage = window.innerWidth >= 290;

let //
    userSettings = {},
    extensionSettings = {
        useLocalJsonRepo: undefined,
        checkForUpdate: undefined,
        showScreenshots: undefined,
    },
    //
    activeSwitch,
    pageLoaded = false,
    repos,
    searchTheme = '';

const links = {
    repo: 'https://github.com/dary1337/custom-themes',
    newIssue: 'https://github.com/dary1337/custom-themes/issues/new',
    telegram: 'https://t.me/dary1337',
    reposJson: 'https://raw.githubusercontent.com/dary1337/custom-themes/master/repos.json',
    versionLink: 'https://raw.githubusercontent.com/dary1337/custom-themes/master/version.txt',
};

const svg = {
    update: '<svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>',
    settings:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>',
    openInNew:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>',
    import: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>',
    export: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>',
    back: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>',
    add: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>',
    world: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg>',
    done: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>',
    title: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M420-160v-520H200v-120h560v120H540v520H420Z"/></svg>',
    flag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>',
};

const dictionary = {
    ru: {
        tabs: {
            fromAuthor: 'Авторские',
            community: 'Сообщества',
            local: 'Локальные',
        },
        buttons: {
            edit: 'Изменить',
            export: 'Экспорт',
            update: 'Обновить',
            updateExtension: 'Обновить расширение',
            suggestGithub: 'Предложить через GitHub',
            suggestTelegram: 'Предложить через Telegram',
            badLayout: 'Проблема с отображением?',
            restoreFromCloud: 'Восстановить версию из облака',
            saveLocally: 'Сохранить локально',
            delete: 'Удалить',
            //
            createTheme: 'Создать тему',
            importTheme: 'Импортировать',
            //
            importThemes: 'Импортировать темы',
            exportThemes: 'Экспортировать локальные темы',
            resetExtension: 'Сбросить расширение',
        },
        about: `
                    <label>
                         Custom Themes - это бесплатное, созданное на энтузиазме расширение.
                         Основная идея - поделится моими "творениями" с людьми, а также дать эту возможность другим.
                    </label>
                    <label>
                         Буду рад любой критике и предложениям в
                              <a href="${links.newIssue}" target="_blank">GitHub</a>
                              или
                              <a href="${links.telegram}" target="_blank">Telegram</a>.
                    </label>`,
        settings: [
            {
                id: 'useLocalJsonRepo',
                name: 'Использовать локальный файл тем',
                description: 'Отключить обновление доступных тем',
                default: false,
            },
            isChromeStoreBuild
                ? {}
                : {
                      id: 'checkForUpdate',
                      name: 'Проверять обновления',
                      description: 'Уведомляет только о важных обновлениях',
                      default: !isChromeStoreBuild,
                  },
            {
                id: 'showScreenshots',
                name: 'Показывать скриншоты в информации о теме',
                default: false,
            },
        ],
        loader: {
            loadingCode: 'Загрузка кода...',
            loadingRepo: 'Получение репозитория...',
            updatingThemes: 'Обновление тем...',
            restoringTheme: 'Восстановление темы...',
        },
        strings: {
            untitled: 'Без названия',
            allSites: 'Все сайты',
            updateVer: 'Обновление',
            usedLibs: 'Использованные библиотеки',
            none: 'Нет',
            local: 'Локальная',
            copiedPreset: 'Шаблон скопирован, вставьте его в сообщение',
            somethingWrong: 'Что-то пошло не так :(',
        },
        titles: {
            settings: 'Настройки',
            about: 'О расширении',
        },
        labels: {
            website: 'Веб-сайт',
            author: 'Автор',
            source: 'Источник',
            version: 'Версия',
            selectTheme: 'Выберите тему слева или создайте новую',
            noScreenshots: '*Возможно, есть скриншоты в репозитории, посмотрите в источнике',
            importNotSupported: '* @import url("https://coolstyles.css") не поддерживается',
            linkPlaceholder: 'https://example.com или *',
        },
        changelog: [
            //
            'Добавлен поиск',
            'Добавлен полноэкранный вид для скриншотов',
        ],
    },
    en: {
        tabs: {
            fromAuthor: "Author's",
            community: 'Community',
            local: 'Local',
        },
        buttons: {
            edit: 'Edit',
            export: 'Export',
            update: 'Update',
            updateExtension: 'Update extension',
            suggestGithub: 'Suggest via GitHub',
            suggestTelegram: 'Suggest via Telegram',
            badLayout: 'Layout problem?',
            restoreFromCloud: 'Restore cloud version',
            saveLocally: 'Save locally',
            delete: 'Delete',
            //
            createTheme: 'Create theme',
            importTheme: 'Import theme',
            // settings
            importThemes: 'Import themes',
            exportThemes: 'Export locally themes',
            resetExtension: 'Reset extension',
        },
        about: `
                    <label>
                         Custom Themes is a free, passion-driven extension. 
                         The main idea is to share My "creations" with people, as well as give this opportunity to others.
                    </label>
                    <label>
                         I will be glad to any criticism and suggestions on 
                              <a href="${links.newIssue}" target="_blank">GitHub</a>
                              or 
                              <a href="${links.telegram}" target="_blank">Telegram</a>.
                    </label>`,
        settings: [
            {
                id: 'useLocalJsonRepo',
                name: 'Use local themes file',
                description: 'Disable updating of available themes',
                default: false,
            },
            isChromeStoreBuild
                ? {}
                : {
                      id: 'checkForUpdate',
                      name: 'Check for updates',
                      description: 'Notifies only about important updates',
                      default: !isChromeStoreBuild,
                  },
            {
                id: 'showScreenshots',
                name: 'Show screenshots in theme info',
                default: true,
            },
        ],
        loader: {
            loadingCode: 'Code loading...',
            loadingRepo: 'Repository fetching...',
            updatingThemes: 'Updating themes...',
            restoringTheme: 'Restoring theme...',
        },
        strings: {
            untitled: 'Untitled',
            allSites: 'All sites',
            updateVer: 'Update',
            usedLibs: 'Used libs',
            none: 'None',
            local: 'Local',
            copiedPreset: 'Preset copied, paste it into the message',
            somethingWrong: 'Something went wrong :(',
        },
        titles: {
            settings: 'Settings',
            about: 'About',
        },
        labels: {
            website: 'Website',
            author: 'Author',
            source: 'Source',
            version: 'Version',
            selectTheme: 'Select a theme on the left or create a new one',
            noScreenshots: '*Perhaps there are screenshots in the repository, look at the source',
            importNotSupported: `* @import url("https://coolstyles.css") not supported`,
            linkPlaceholder: 'https://example.com or *',
        },
        changelog: [
            //
            'Added search',
            'Added screenshot fullscreen view',
        ],
    },
};

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

function setSetting(key, value) {
    extensionSettings[key] = value;
    chrome.storage.local.set({ extensionSettings });
}

const pushUrl = (href) => history.pushState({}, '', href);

async function setValues() {
    userSettings = await new Promise((resolve) =>
        chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
    );
    extensionSettings = await new Promise((resolve) =>
        chrome.storage.local.get('extensionSettings', (result) =>
            resolve(result.extensionSettings || {})
        )
    );

    dictionary.en.settings.forEach((x) => {
        if (extensionSettings[x.id] === undefined) setSetting(x.id, x.default);
    });

    if (navigator.language.toLocaleLowerCase().startsWith('ru')) dict = dictionary.ru;

    await page();
}

setValues();

async function loadStyles(link) {
    const href = window.location.href;
    const response = await fetch(link);
    const result = await response.text();

    if (href !== window.location.href) throw '[loadStyles]: throw by href';

    return result;
}

async function loadRepos(useLocal = false) {
    try {
        if (useLocal) {
            const response = await fetch(chrome.runtime.getURL('repos.json'));

            return await response.json();
        }

        const response = await fetch(links.reposJson, {
            cache: 'no-cache',
        });

        return await response.json();
    } catch (error) {
        console.error('Failed load repos.json', error);
        return {};
    }
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

async function updateTheme(theme, checked, customCSS = undefined) {
    if (!checked && !theme.edited && customCSS === undefined) {
        delete userSettings[theme.id];

        chrome.storage.local.set({ userSettings });
        return;
    }

    let sourceCSS = '';

    const updateValue = {
        id: theme.id,
        link: theme.link,
        checked: checked,
        compiledCss: (customCSS || userSettings[theme.id]?.edited || userSettings[theme.id]?.local
            ? customCSS || userSettings[theme.id].sourceCSS
            : (sourceCSS = await loadStyles(theme.cssLink))
        )
            // comment replacement
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // minification and !important addition
            .replace(/;(?!\s*!important)|!important\b|\s+/g, (match) => {
                if (match === ';') return ' !important;';
                if (match === '!important !important') return '!important';
                return ' ';
            })
            .trim(),
        edited: theme.edited || !!customCSS,
        sourceCSS: customCSS || '',
        local: theme.local || false,
        name: theme.name,
    };

    if (theme.version) updateValue.version = theme.version;

    userSettings[theme.id] = updateValue;
    chrome.storage.local.set({ userSettings });

    return sourceCSS;
}

async function updateThemes() {
    display(['tab', 'updateThemes', 'settingsButton', 'aboutButton'], 'none');

    const mainHTML = `
                         <main id="updating-theme" style="display:flex;align-items:center;">
                              <div class="loader-icon"></div>
                              <label style="margin-left:6px; font-size:16px;">${dict.loader.updatingThemes}</label>
                         </main>
                    `;
    extensionPopup.insertAdjacentHTML('afterbegin', mainHTML);

    for (const tab of ["Author's", 'Community'])
        for (const theme of repos[tab]) {
            const themeSettings = userSettings[theme.id];
            if (
                themeSettings &&
                themeSettings.checked &&
                !themeSettings.local &&
                !themeSettings.edited
            )
                await updateTheme(theme, true);
        }

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
        switchInput.addEventListener('change', () => {
            try {
                setSetting(setting.id, switchInput.checked);
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

            if (!repos || !repos["Author's"].length) {
                document.querySelector('.loader-icon').remove();
                fetching.textContent = 'Repository are not available';
                updateBtn.addEventListener('click', () => {
                    extensionSettings.useLocalJsonRepo = true;
                    page();
                });
                return;
            }
            //
            else loading_div.remove();

            display(['updateThemes'], '');
            document.getElementById('updateThemes').onclick = async () => await updateThemes();
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
            else
                themes =
                    activeTab === 'Local'
                        ? Object.entries(userSettings)
                              .filter(([key, value]) => value.local === true)
                              .map(([key, value]) => value)
                        : repos[activeTab];

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
                              <label slider-id="${theme.id}" class="switch-input input-container">
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
                                    await updateTheme(theme, userSettings[theme.id]?.checked);
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
                                   <label id="theme-ps" class="dimmed">
                                        ${dict.labels.importNotSupported}
                                   </label>
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

window.addEventListener('popstate', async () => await page());
