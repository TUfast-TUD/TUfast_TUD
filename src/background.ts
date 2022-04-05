import * as credentials from './modules/credentials';
import * as owaFetch from './modules/owaFetch';

// Should be pretty save but not maybe not perfect
// Currently Firefox doesn't even support Manifest V3
const isFirefox = typeof browser !== 'undefined' && browser.runtime && browser.runtime.getBrowserInfo;

chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;
    switch (reason) {
        case 'install':
            console.log('TUfast installed');
            await chrome.storage.local.set({
                fwdEnabled: true,
                encryptionLevel: 4,
                availableRockets: ['RI_default'],
                selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}',
                theme: 'system',
                studiengang: 'general'
            });
            await openSettingsPage('first_visit');
            break;
    }
})

chrome.storage.local.get(['selectedRocketIcon']).then(
    (result) => {
        if (!result.selectedRocketIcon) return;
        try {
            const icon = JSON.parse(result.selectedRocketIcon);
            chrome.browserAction.setIcon({ path: icon.link });
        } catch (e) {
            console.error(`Cannot parse rocket icon: ${result}`);
            chrome.browserAction.setIcon({ path: 'assets/icons/RocketIcons/default_128px.png' });
        }
    }
);

