import * as credentials from "./modules/credentials";
import * as owaFetch from "./modules/owaFetch";

// Should be pretty save but not maybe not perfect
// Currently Firefox doesn't even support Manifest V3
/*const isFirefox =
  typeof browser !== "undefined" &&
  browser.runtime &&
  browser.runtime.getBrowserInfo;*/


// On installed/updated function
chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;
    switch (reason) {
        case "install":
            console.log("TUfast installed");
            await chrome.storage.local.set({
                dashboardDisplay: 'favoriten',
                fwdEnabled: true,
                encryptionLevel: 3,
                availableRockets: ["RI_default"],
                selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}',
                theme: "system",
                studiengang: "general",
            });
            await openSettingsPage("first_visit");
            break;
        // TODO
        case "update":
            const currentSettings = await chrome.storage.local.get([
                'dashboardDisplay',
                'fwdEnabled',
                'encryptionLevel',
                'encryption_level', // legacy
                'availableRockets',
                'selectedRocketIcon',
                'theme',
                'studiengang',
                'hisqisPimpedTable',
                'savedClickCounter',
                'saved_click_counter', // legacy
                'Rocket', // legacy
                'foundEasteregg'
            ]);

            const updateObj: any = {};

            // Setting the defaults if keys do not exist
            if (typeof currentSettings.dashboardDisplay === 'undefined') updateObj.dashboardDisplay = 'favoriten';
            if (typeof currentSettings.fwdEnabled === 'undefined') updateObj.fwdEnabled = true;
            if (typeof currentSettings.hisqisPimpedTable === 'undefined') updateObj.hisqisPimpedTable = true;
            if (typeof currentSettings.theme === 'undefined') updateObj.theme = 'system';
            if (typeof currentSettings.studiengang === 'undefined') updateObj.studiengang = 'general';
            if (typeof currentSettings.selectedRocketIcon === 'undefined') updateObj.selectedRocketIcon = '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}';

            // Upgrading encryption
            // Currently "encryptionLevel" can't be lower than 3
            if (currentSettings.encryption_level !== 3) {
                switch (currentSettings.encryption_level) {
                    case 1: {
                        // This branch probably/hopefully will not be called anymore...
                        console.log('Upgrading encryption standard from level 1 to level 3...');
                        const userData = await chrome.storage.local.get(['asdf', 'fdsa']);
                        await setUserData({ user: atob(userData.asdf), pass: atob(userData.fdsa) }, 'zih')
                        await chrome.storage.local.remove(['asdf', 'fdsa']);
                        break;
                    }
                    case 2: {
                        const { asdf: user, fdsa: pass } = await getUserDataLagacy();
                        await setUserData({ user, pass }, 'zih');
                        // Delete old user data
                        await chrome.storage.local.remove(['Data']);
                        break;
                    }
                }
                updateObj.encryptionLevel = 3;
                await chrome.storage.local.remove(['encryption_level']);
            }

            // Upgrading savedClicksCounter
            const savedClicks = currentSettings.savedClickCounter || currentSettings.saved_click_counter;
            if (typeof currentSettings.savedClickCounter === 'undefined' && typeof currentSettings.saved_click_counter !== 'undefined') {
                updateObj.savedClickCounter = savedClicks;
                await chrome.storage.local.remove(['saved_click_counter']);
            }

            // Upgrading availableRockets
            const avRockets = currentSettings.availableRockets || [];
            if (savedClicks > 250 && !avRockets.includes('RI4')) avRockets.push('RI4');
            if (savedClicks > 2500 && !avRockets.includes('RI5')) avRockets.push('RI5');
            if (currentSettings.Rocket === 'colorful' && currentSettings.foundEasteregg === undefined) {
                updateObj.foundEasteregg = true;
                updateObj.selectedRocketIcon = '{"id": "RI3", "link": "assets/icons/RocketIcons/3_120px.png"}';
                avRockets.push('RI3');
                await chrome.action.setIcon({ path: 'assets/icons/RocketIcons/3_120px.png' });
                await chrome.storage.local.remove(['Rocket']);
            }
            updateObj.availableRockets = avRockets;

            break;
    }
});

chrome.storage.local.get(["selectedRocketIcon"]).then((result) => {
    if (!result.selectedRocketIcon) return;
    try {
        const icon = JSON.parse(result.selectedRocketIcon);
        chrome.browserAction.setIcon({ path: icon.link });
    } catch (e) {
        console.error(`Cannot parse rocket icon: ${result}`);
        chrome.browserAction.setIcon({
            path: "assets/icons/RocketIcons/default_128px.png",
        });
    }
});

// register hotkeys
chrome.commands.onCommand.addListener(async (command) => {
    console.log("Detected command: " + command);
    switch (command) {
        case "open_opal_hotkey":
            chrome.tabs.update({
                url: "https://bildungsportal.sachsen.de/opal/home/",
            });
            await saveClicks(2);
            break;
        case "open_owa_hotkey":
            chrome.tabs.update({ url: "https://msx.tu-dresden.de/owa/" });
            await saveClicks(2);
            break;
        case "open_jexam_hotkey":
            chrome.tabs.update({ url: "https://jexam.inf.tu-dresden.de/" });
            await saveClicks(2);
            break;
    }
});

async function saveCourses(courseList) {
    courseList.list.sort((a, b) => (a.name > b.name ? 1 : -1));
    switch (courseList.type) {
        case "favoriten":
            await chrome.storage.local.set({ favoriten: JSON.stringify(courseList.list) });
            console.log("saved Favoriten in TUfast");
            break;
        case "meine_kurse":
            await chrome.storage.local.set({ meine_kurse: JSON.stringify(courseList.list) });
            console.log("saved Meine Kurse in TUfast");
            break;
    }
}

// save_click_counter
async function saveClicks(counter: number) {
    // load number of saved clicks and add counter!
    const { savedClickCounter: clicks } = await chrome.storage.local.get(['savedClickCounter']);
    const savedClicks = (typeof clicks === 'undefined') ? counter : clicks + counter;
    await chrome.storage.local.set({ savedClickCounter: savedClicks });
    console.log('You just saved yourself ' + counter + ' clicks!');

    // make rocketIcons available if appropriate
    const { availableRockets } = await chrome.storage.local.get(['availableRockets']);
    if (savedClicks > 250 && !availableRockets.includes('RI4')) availableRockets.push('RI4');
    if (savedClicks > 2500 && !availableRockets.includes('RI5')) availableRockets.push('RI5');
    await chrome.storage.local.set({ availableRockets });
}

// show badge
async function showBadge(text: string, color: string, _timeout: number) {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    /* setTimeout(() => {
        chrome.browserAction.setBadgeText({text: ""});
    }, timeout);*/
}

async function openSharePage() {
    await chrome.tabs.create({ url: 'share.html' });
}

async function openSettingsPage(params: string) {
    if (params) await chrome.storage.local.set({ openSettingsPageParam: params });
    await chrome.runtime.openOptionsPage();
}

/**
 * enable or disable the header listener
 * modify http header from opal, to view pdf in browser without the need to download it
 * @param {true} enabled flag to enable/ disable listener
 */
function enableHeaderListener(enabled: boolean) {
    if (enabled) {
        chrome.webRequest.onHeadersReceived.addListener(
            headerListenerFunc,
            {
                urls: [
                    'https://bildungsportal.sachsen.de/opal/downloadering*',
                    'https://bildungsportal.sachsen.de/opal/*.pdf'
                ]
            },
            ['blocking', 'responseHeaders']
        );
    } else {
        chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc);
    }
}

function headerListenerFunc(details: any) {
    const header = details.responseHeaders.find((e: any) => e.name.toLowerCase() === 'content-disposition');
    if (!header?.value.includes('.pdf')) return; // only for pdf
    header.value = 'inline';
    return { responseHeaders: details.responseHeaders };
}