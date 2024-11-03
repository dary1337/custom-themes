import {
    getExtensionSettings,
    getUserSettings,
    setExtensionSetting,
    updateThemes,
} from './shared.js';

async function loadStylesInTab(tabId, url) {
    const userSettings = await getUserSettings();
    let count = 0;

    if (Object.keys(userSettings).length === 0) return count;

    for (const theme of Object.keys(userSettings)) {
        const settings = userSettings[theme];

        if (!settings.checked || !settings.link) continue;

        const link = settings.link.replace('https://', '').toLowerCase();

        if (url.includes(link) || url.includes('www.' + link) || link === '*') {
            await chrome.scripting.insertCSS({
                target: {
                    tabId: tabId,
                    // allFrames: true,
                },
                css: settings.compiledCss,
            });
            count++;
        }
    }

    return count;
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (
        [
            //
            'reload',
            'link',
            'typed',
            'generated',
            'auto_bookmark',
            'form_submit',
        ].includes(details.transitionType)
    ) {
        const tabId = details.tabId;
        const url = details.url;

        if (url) {
            try {
                const loaded = await loadStylesInTab(tabId, url);
                console.log(`Loaded ${loaded} styles:`, url, tabId);
            } catch (e) {
                console.log('Failed to load styles in tab:', url, tabId);
                console.log('catch', e);
            }
        }
    }
});

async function checkForBackgroundUpdates() {
    const extensionSettings = await getExtensionSettings();

    const backgroundUpdate = async () => {
        setExtensionSetting('lastThemesUpdate', new Date().getTime());

        const userSettings = await getUserSettings();
        updateThemes(userSettings);
        console.log('themes updated in the background');
    };

    if (extensionSettings['backgroundUpdate']) {
        const ALARM_NAME = 'UPDATE_THEMES';

        async function createAlarm() {
            const alarm = await chrome.alarms.get(ALARM_NAME);
            if (typeof alarm === 'undefined') {
                console.log('created alarm');
                chrome.alarms.create(ALARM_NAME, {
                    delayInMinutes: 1,
                    periodInMinutes: 1440,
                });
                backgroundUpdate();
            }
        }

        createAlarm();

        chrome.alarms.onAlarm.addListener(backgroundUpdate);
    }
}

checkForBackgroundUpdates();
