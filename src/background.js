'use strict'

//start fetchOWA if activated and user data exists
chrome.storage.local.get(['enabledOWAFetch', 'NumberOfUnreadMails'], (resp) => {
	userDataExists().then((userDataExists) => {
		if (userDataExists && resp.enabledOWAFetch) {
			enableOWAFetch() //start owa fetch
			setBadgeUnreadMails(resp.NumberOfUnreadMails) //read number of unread mails from storage and display badge
			console.log("Activated OWA fetch.")
		} else { console.log("No OWAfetch registered") }
	})
})

//enable rating
chrome.storage.local.set({ratingEnabledFlag: true}, function () {})

//DOESNT WORK IN RELEASE VERSION
chrome.storage.local.get(['openSettingsOnReload'], (resp) => {
	if (resp.openSettingsOnReload) openSettingsPage()
	chrome.storage.local.set({ openSettingsOnReload: false }, function () { })
})

//set browserIcon
chrome.storage.local.get(['selectedRocketIcon'], (resp) => {
	try {
		let r = JSON.parse(resp.selectedRocketIcon)
		chrome.browserAction.setIcon({
			path: r.link
		})
	} catch (e) { console.log("Cannot set rocket icon: " + e) }
})

console.log('Loaded TUfast')
chrome.storage.local.set({ loggedOutSelma: false }, function () { })
chrome.storage.local.set({ loggedOutElearningMED: false }, function () { })
chrome.storage.local.set({ loggedOutTumed: false }, function () { })
chrome.storage.local.set({ loggedOutQis: false }, function () { })
chrome.storage.local.set({ loggedOutOpal: false }, function () { })
chrome.storage.local.set({ loggedOutOwa: false }, function () { })
chrome.storage.local.set({ loggedOutMagma: false }, function () { })
chrome.storage.local.set({ loggedOutJexam: false }, function () { })
chrome.storage.local.set({ loggedOutCloudstore: false }, function () { })
chrome.storage.local.set({ loggedOutTex: false }, function () { })
chrome.storage.local.set({ loggedOutTumed: false }, function () { })
chrome.storage.local.set({ loggedOutGitlab: false }, function () { })
chrome.storage.local.get(["pdfInNewTab"], function (result) {
	if (result.pdfInNewTab) {
		enableHeaderListener(true)
	}
})


chrome.runtime.onInstalled.addListener(async (details) => {
	const reason = details.reason
	switch (reason) {
		case 'install':
			console.log('TUfast installed.')
			openSettingsPage("first_visit") //open settings page
			chrome.storage.local.set({ installed: true }, function () { })
			chrome.storage.local.set({ showed_50_clicks: false }, function () { })
			chrome.storage.local.set({ showed_100_clicks: false }, function () { })
			chrome.storage.local.set({ isEnabled: false }, function () { })
			chrome.storage.local.set({ fwdEnabled: true }, function () { })
			chrome.storage.local.set({ mostLiklySubmittedReview: false }, function () { })
			chrome.storage.local.set({ removedReviewBanner: false }, function () { })
			chrome.storage.local.set({ neverShowedReviewBanner: true }, function () { })
			chrome.storage.local.set({ encryption_level: 2 }, function () { })
			chrome.storage.local.set({ meine_kurse: false }, function () { })
			chrome.storage.local.set({ favoriten: false }, function () { })
			//chrome.storage.local.set({openSettingsPageParam: false}, function() {})
			chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: 0 }, function () { })
			chrome.storage.local.set({ dashboardDisplay: "favoriten" }, function () { })
			chrome.storage.local.set({ additionalNotificationOnNewMail: false })
			chrome.storage.local.set({ NumberOfUnreadMails: "undefined" })
			chrome.storage.local.set({ removedOpalBanner: false }, function () { })
			chrome.storage.local.set({ nameIsTUfast: true }, function () { })
			chrome.storage.local.set({ enabledOWAFetch: false }, function () { })
			chrome.storage.local.set({ colorfulRocket: "black" }, function () { })
			chrome.storage.local.set({ PRObadge: false }, function () { })
			chrome.storage.local.set({ flakeState: false }, function () { })
			chrome.storage.local.set({ availableRockets: ["RI_default"] }, function () { })
			chrome.storage.local.set({ foundEasteregg: false }, function () { })
			chrome.storage.local.set({ hisqisPimpedTable: true }, function () { })
			chrome.storage.local.set({ openSettingsOnReload: false }, function () { })
			chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}' }, function () { })
			chrome.storage.local.set({ pdfInInline: false }, function () { })
			chrome.storage.local.set({ pdfInNewTab: false }, function () { })
			chrome.storage.local.set({ studiengang: "general" }, function () { })
			chrome.storage.local.set({ updateCustomizeStudiengang: false }, function () { })
			chrome.storage.local.set({ TUfastCampInvite1: false }, function () { })
			chrome.storage.local.set({ theme: 'system' })
			break
		case 'update':
			//check if encryption is already on level 2. This should be the case for every install now. But I'll leave this here anyway
			chrome.storage.local.get(['encryption_level'], (resp) => {
				if (!(resp.encryption_level === 2)) {
					console.log('Upgrading encryption standard to level 2...')
					chrome.storage.local.get(['asdf', 'fdsa'], function (result) {
						setUserData({ asdf: atob(result.asdf), fdsa: atob(result.fdsa) })
						chrome.storage.local.set({ encryption_level: 2 }, function () { })
					})
				}
			})
			//check if the type of courses is selected which should be display in the dasbhaord. If not, set to default
			chrome.storage.local.get(['dashboardDisplay'], (resp) => {
				if (resp.dashboardDisplay === null || resp.dashboardDisplay === undefined || resp.dashboardDisplay === "") {
					chrome.storage.local.set({ dashboardDisplay: "favoriten" }, function () { })
				}
			})
			//check if mostLiklySubmittedReview
			chrome.storage.local.get(['mostLiklySubmittedReview'], (resp) => {
				if (resp.mostLiklySubmittedReview === null || resp.mostLiklySubmittedReview === undefined || resp.mostLiklySubmittedReview === "") {
					chrome.storage.local.set({ mostLiklySubmittedReview: false }, function () { })
				}
			})
			//check if removedReviewBanner
			chrome.storage.local.get(['removedReviewBanner'], (resp) => {
				if (resp.removedReviewBanner === null || resp.removedReviewBanner === undefined || resp.removedReviewBanner === "") {
					chrome.storage.local.set({ removedReviewBanner: false }, function () { })
				}
			})
			//check if neverShowedReviewBanner
			chrome.storage.local.get(['neverShowedReviewBanner'], (resp) => {
				if (resp.neverShowedReviewBanner === null || resp.neverShowedReviewBanner === undefined || resp.neverShowedReviewBanner === "") {
					chrome.storage.local.set({ neverShowedReviewBanner: true }, function () { })
				}
			})
			//check if seenInOpalAfterDashbaordUpdate exists
			chrome.storage.local.get(['seenInOpalAfterDashbaordUpdate'], (resp) => {
				if (resp.seenInOpalAfterDashbaordUpdate === null || resp.seenInOpalAfterDashbaordUpdate === undefined || resp.seenInOpalAfterDashbaordUpdate === "") {
					chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: 0 }, function () { })
				}
			})
			//check if enabledOWAFetch exists
			chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
				if (resp.enabledOWAFetch === null || resp.enabledOWAFetch === undefined || resp.enabledOWAFetch === "") {
					chrome.storage.local.set({ enabledOWAFetch: false }, function () { })
					chrome.storage.local.set({ NumberOfUnreadMails: "undefined" })
					chrome.storage.local.set({ additionalNotificationOnNewMail: false })
				}
			})
			//check, whether flake state exists. If not, initialize with false.
			chrome.storage.local.get(['flakeState'], function (result) {
				if (result.flakeState === undefined || result.flakeState === null) { //set to true, so that state will be false!
					chrome.storage.local.set({ flakeState: false }, function () { })
				}
			})
			//check if ShowedFirefoxBanner
			chrome.storage.local.get(['showedFirefoxBanner'], function (result) {
				if (result.showedFirefoxBanner === undefined || result.showedFirefoxBanner === null) {
					chrome.storage.local.set({ showedFirefoxBanner: false }, function () { })
				}
			})
			//check if showedUnreadMailCounterBanner
			chrome.storage.local.get(['showedUnreadMailCounterBanner'], function (result) {
				if (result.showedUnreadMailCounterBanner === undefined || result.showedUnreadMailCounterBanner === null) {
					chrome.storage.local.set({ showedUnreadMailCounterBanner: false }, function () { })
				}
			})
			//check if openSettingsOnReload
			chrome.storage.local.get(['openSettingsOnReload'], function (result) {
				if (result.openSettingsOnReload === undefined || result.openSettingsOnReload === null) {
					chrome.storage.local.set({ openSettingsOnReload: false }, function () { })
				}
			})
			//check if availableRockets
			chrome.storage.local.get(['availableRockets'], function (result) {
				if (result.availableRockets === undefined || result.availableRockets === null) {
					chrome.storage.local.set({ availableRockets: ["RI_default"] }, function () { })
				}
			})
			//check if selectedRocketIcon
			chrome.storage.local.get(['selectedRocketIcon'], function (result) {
				if (result.selectedRocketIcon === undefined || result.selectedRocketIcon === null) {
					chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}' }, function () { })
				}
			})
			//check if hisqisPimpedTable
			chrome.storage.local.get(['hisqisPimpedTable'], function (result) {
				if (result.hisqisPimpedTable === undefined || result.hisqisPimpedTable === null) {
					chrome.storage.local.set({ hisqisPimpedTable: true }, function () { })
				}
			})
			//if easteregg was discovered in an earlier version: enable and select specific rocket!
			chrome.storage.local.get(['Rocket', "foundEasteregg", "saved_click_counter", "availableRockets"], function (result) {
				let avRockets = result.availableRockets
				if (result.saved_click_counter > 250 && !avRockets.includes("RI4")) avRockets.push("RI4")
				if (result.saved_click_counter > 2500 && !avRockets.includes("RI5")) avRockets.push("RI5")
				if (result.Rocket === "colorful" && result.foundEasteregg === undefined) {
					chrome.storage.local.set({ foundEasteregg: true }, function () { })
					chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI3", "link": "assets/icons/RocketIcons/3_120px.png"}' }, function () { })
					avRockets.push("RI3")
					chrome.browserAction.setIcon({
						path: "assets/icons/RocketIcons/3_120px.png"
					})
				}
				chrome.storage.local.set({ "availableRockets": avRockets })

			})
			//seen customized studiengang
			chrome.storage.local.get(['updateCustomizeStudiengang'], function (result) {
				if (result.updateCustomizeStudiengang === undefined || result.updateCustomizeStudiengang === null) {
					chrome.storage.local.set({ updateCustomizeStudiengang: false }, function () { })
				}
			})
			//selected studiengang
			chrome.storage.local.get(['studiengang'], function (result) {
				if (result.studiengang === undefined || result.studiengang === null) {
					chrome.storage.local.set({ studiengang: "general" }, function () { })
				}
			})
			//selected theme
			chrome.storage.local.get(['theme'], (res) => {
				if (res.theme === undefined || res.theme === null) {
					chrome.storage.local.set({ theme: 'system' })
				}
			})
			//if not yet invite shown: show, and set shown to true
			//chrome.storage.local.get(['TUfastCampInvite1'], (res) => {
			//	let today = new Date();
			//	let max_invite_date = new Date(2021, 8, 30) //27.09.2021; month is zero based
			//	if (!res.TUfastCampInvite1 === true && today < max_invite_date) {
			//		chrome.storage.local.set({ TUfastCampInvite1: true }, function () { })
			//		chrome.tabs.create(({ url: "TUfastCamp.html" }))
			//	}
			// })


			break
		default:
			console.log('Other install events within the browser for TUfast.')
			break
	}
})

//checks, if user currently uses owa in browser
function owaIsOpened() {
	return new Promise(async (resolve, reject) => {
		let uri = "msx.tu-dresden.de"
		let tabs = await getAllChromeTabs()
		tabs.forEach(function (tab) {
			if ((tab.url).includes(uri)) {
				console.log("currentyl opened owa")
				resolve(true)
			}
		})
		resolve(false)
	})
}

function getAllChromeTabs() {
	return new Promise(async (res, rej) => {
		await chrome.tabs.query({}, function (tabs) {
			res(tabs)
		})
	})
}

//check if user stored login data
async function loginDataExists() {
	getUserData().then((userData) => {
		if (userData.asdf === undefined || userData.fdsa === undefined) {
			return false
		} else {
			return true
		}
	})
}


//start OWA fetch funtion based on interval
function enableOWAFetch() {
	//first, clear all alarms
	console.log("starting to fetch from owa...")
	owaFetch()
	chrome.alarms.clearAll(() => {
		chrome.alarms.create("fetchOWAAlarm", { delayInMinutes: 1, periodInMinutes: 5 })
		chrome.alarms.onAlarm.addListener(async (alarm) => {
			owaFetch()
		})
	})
}

async function owaFetch() {
	//dont logout if user is currently using owa in browser
	let logout = true
	if (await owaIsOpened()) {
		logout = false
	}

	console.log("executing fetch ...")

	//get user data
	let asdf = ""
	let fdsa = ""

	await getUserData().then((userData) => {
		asdf = userData.asdf
		fdsa = userData.fdsa
	})

	//call fetch
	let mailInfoJson = await fetchOWA(asdf, fdsa, logout)

	//check # of unread mails
	let numberUnreadMails = await countUnreadMsg(mailInfoJson)
	console.log("Unread mails in OWA: " + numberUnreadMails)

	//alert on new Mail
	await chrome.storage.local.get(['NumberOfUnreadMails', "additionalNotificationOnNewMail"], (result) => {
		if (!(result.NumberOfUnreadMails === undefined || result.NumberOfUnreadMails === "undefined") && result.additionalNotificationOnNewMail) {
			if (result.NumberOfUnreadMails < numberUnreadMails) {
				if (confirm("Neue Mail in deinem TU Dresden Postfach!\nDruecke 'Ok' um OWA zu oeffnen.")) {
					let URL = "https://msx.tu-dresden.de/owa/auth/logon.aspx?url=https%3a%2f%2fmsx.tu-dresden.de%2fowa&reason=0"
					chrome.tabs.create({ url: URL })
				}
			}
		}
	})

	//set badge and local storage
	await chrome.storage.local.set({ NumberOfUnreadMails: numberUnreadMails })
	setBadgeUnreadMails(numberUnreadMails)
}

function disableOwaFetch() {
	console.log("stopped owa connection")
	setBadgeUnreadMails(0)
	chrome.storage.local.set({ NumberOfUnreadMails: "undefined" })
	chrome.alarms.clearAll(() => { })
}

function readMailOWA(NrUnreadMails) {
	//set badge and local storage
	chrome.storage.local.set({ NumberOfUnreadMails: NrUnreadMails })
	setBadgeUnreadMails(NrUnreadMails)
}

function setBadgeUnreadMails(numberUnreadMails) {
	//set badge
	if (numberUnreadMails == 0) {
		show_badge("", '#4cb749')
	}
	else if (numberUnreadMails > 99) {
		show_badge("99+", '#4cb749')
	}
	else {
		show_badge(numberUnreadMails.toString(), '#4cb749')
	}
}

//show badge when extension is triggered
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.cmd) {
		case 'show_ok_badge':
			//show_badge('Login', '#4cb749', request.timeout)
			break
		case 'no_login_data':
			//alert("Bitte gib deinen Nutzernamen und Passwort in der TUfast Erweiterung an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
			//show_badge("Error", '#ff0000', 10000)
			break
		case 'perform_login':
			break
		case 'clear_badge':
			//show_badge("", "#ffffff", 0)
			break
		case 'save_clicks':
			save_clicks(request.click_count)
			break
		case 'get_user_data':
			getUserData().then((userData) => sendResponse(userData))
			break
		case 'set_user_data':
			setUserData(request.userData)
			break
		case 'read_mail_owa':
			readMailOWA(request.NrUnreadMails)
			break
		case 'logged_out':
			loggedOut(request.portal)
			break
		case "enable_owa_fetch":
			enableOWAFetch()
			break
		case "disable_owa_fetch":
			disableOwaFetch()
			break
		case 'reload_extension':
			chrome.runtime.reload()
			break
		case 'save_courses':
			saveCourses(request.course_list)
			break
		case 'open_settings_page':
			openSettingsPage(request.params)
			break
		case 'open_share_page':
			openSharePage()
			break
		case 'register_addition_content_scripts':
			regAddContentScripts()
			break
		case 'open_shortcut_settings':
			let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
			let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
			if (isFirefox) { chrome.tabs.create({ url: "https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten" }) }
			else { chrome.tabs.create({ url: "chrome://extensions/shortcuts" }) } //for chrome and everything else
			break
		case 'toggle_pdf_inline_setting':
			enableHeaderListener(request.enabled)
			break
		case "update_rocket_logo_easteregg":
			chrome.browserAction.setIcon({
				path: "assets/icons/RocketIcons/3_120px.png"
			})
			break
		default:
			console.log('Cmd not found!')
			break
	}
	return true //required for async sendResponse

})


//register hotkeys
chrome.commands.onCommand.addListener(function (command) {
	console.log('Detected command: ' + command)
	switch (command) {
		case 'open_opal_hotkey':
			chrome.tabs.update({ url: "https://bildungsportal.sachsen.de/opal/home/" })
			save_clicks(2)
			break
		case 'open_owa_hotkey':
			save_clicks(2)
			chrome.tabs.update({ url: "https://msx.tu-dresden.de/owa/" })
			break
		case 'open_jexam_hotkey':
			chrome.tabs.update({ url: "https://jexam.inf.tu-dresden.de/" })
			save_clicks(2)
		default:
			break
	}
})

/**
 * enable or disable the header listener
 * modify http header from opal, to view pdf in browser without the need to download it
 * @param {true} enabled flag to enable/ disable listener
 */
function enableHeaderListener(enabled) {
	if (enabled) {
		chrome.webRequest.onHeadersReceived.addListener(
			headerListenerFunc,
			{
				urls: [
					"https://bildungsportal.sachsen.de/opal/downloadering*",
					"https://bildungsportal.sachsen.de/opal/*.pdf",
				],
			},
			["blocking", "responseHeaders"]
		)
	} else {
		chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc)
	}
}

function headerListenerFunc(details) {
	let header = details.responseHeaders.find(
		e => e.name.toLowerCase() === "content-disposition"
	)
	if (!header.value.includes(".pdf")) return //only for pdf
	header.value = "inline"
	return { responseHeaders: details.responseHeaders }
}

//open settings (=options) page, if required set params
function openSettingsPage(params) {
	if (params) {
		chrome.storage.local.set({ openSettingsPageParam: params }, function () {
			chrome.runtime.openOptionsPage()
		})
	} else {
		chrome.runtime.openOptionsPage()
	}
	return
}

function openSharePage() {
	chrome.tabs.create(({ url: "share.html" }))
}

//timeout is 2000 default
function loggedOut(portal) {
	let timeout = 2000
	if (portal === "loggedOutCloudstore") { timeout = 7000 }
	let loggedOutPortal = {}
	loggedOutPortal[portal] = true
	chrome.storage.local.set(loggedOutPortal, function () { })
	setTimeout(function () {
		loggedOutPortal[portal] = false
		chrome.storage.local.set(loggedOutPortal, function () { })
	}, timeout)
}

//show badge
function show_badge(Text, Color, timeout) {
	chrome.browserAction.setBadgeText({ text: Text })
	chrome.browserAction.setBadgeBackgroundColor({ color: Color })
	//setTimeout(function() {
	//  chrome.browserAction.setBadgeText({text: ""});
	//}, timeout);
}

//save_click_counter
function save_clicks(counter) {
	//load number of saved clicks and add counter!
	var saved_clicks = 0
	chrome.storage.local.get(['saved_click_counter'], (result) => {
		saved_clicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter
		chrome.storage.local.set({ saved_click_counter: saved_clicks + counter }, function () {
			console.log('You just saved yourself ' + counter + " clicks!")
		})
		//make rocketIcons available if appropriate
		chrome.storage.local.get(["availableRockets"], (resp) => {
			let avRockets = resp.availableRockets
			if (result.saved_click_counter > 250 && !avRockets.includes("RI4")) avRockets.push("RI4")
			if (result.saved_click_counter > 2500 && !avRockets.includes("RI5")) avRockets.push("RI5")
			chrome.storage.local.set({ "availableRockets": avRockets })
		})
	})
}

//////////////// FUNCTIONS FOR ENCRYPTION AND USERDATA HANDLING ////////////////
// info: asdf = username | fdsa = password

//create hash from input-string (can also be json of course)
//output hash is always of same length and is of type buffer
function hashDigest(string) {
	return new Promise(async (resolve, reject) => {
		const encoder = new TextEncoder()
		const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(string))
		resolve(hashBuffer)
	})
}

//get key for encryption (format: buffer)
function getKeyBuffer() {
	return new Promise((resolve, reject) => {
		let sysInfo = ""
		let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
		let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection

		//key differs between browsers, because different APIs
		if (isFirefox) {
			sysInfo = sysInfo + window.navigator.hardwareConcurrency
			chrome.runtime.getPlatformInfo(async (info) => {
				sysInfo = sysInfo + JSON.stringify(info)
				//create key
				let keyBuffer = await crypto.subtle.importKey('raw', await hashDigest(sysInfo),
					{ name: "AES-CBC", },
					false,
					['encrypt', 'decrypt'])
				resolve(keyBuffer)
			})
			//chrome, edge and everything else
		} else {
			chrome.system.cpu.getInfo(info => {
				delete info['processors']
				delete info['temperatures']
				sysInfo = sysInfo + JSON.stringify(info)
				chrome.runtime.getPlatformInfo(async (info) => {
					sysInfo = sysInfo + JSON.stringify(info)
					//create key
					let keyBuffer = await crypto.subtle.importKey('raw', await hashDigest(sysInfo),
						{ name: "AES-CBC", },
						false,
						['encrypt', 'decrypt'])
					resolve(keyBuffer)
				})
			})
		}
	})
}

//this functions saved user login-data locally.
//user data is encrypted using the crpyto-js library (aes-cbc). The encryption key is created from pc-information with system.cpu
//a lot of encoding and transforming needs to be done, in order to provide all values in the right format.
async function setUserData(userData) {
	//collect all required information for encryption in the right format
	let userDataConcat = userData.asdf + '@@@@@' + userData.fdsa
	let encoder = new TextEncoder()
	let userDataEncoded = encoder.encode(userDataConcat)
	let keyBuffer = await getKeyBuffer()
	let iv = crypto.getRandomValues(new Uint8Array(16))

	//encrypt
	let userDataEncrypted = await crypto.subtle.encrypt(
		{
			name: "AES-CBC",
			iv: iv
		},
		keyBuffer,
		userDataEncoded
	)

	//adjust format to save encrypted data in lokal storage
	userDataEncrypted = Array.from(new Uint8Array(userDataEncrypted))
	userDataEncrypted = userDataEncrypted.map(byte => String.fromCharCode(byte)).join('')
	userDataEncrypted = btoa(userDataEncrypted)
	iv = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
	chrome.storage.local.set({ Data: iv + userDataEncrypted }, function () { })
}

//check if username, password exist
function userDataExists() {
	return new Promise(async (resolve, reject) => {
		let userData = await getUserData()
		if (userData.asdf === undefined || userData.fdsa === undefined) {
			resolve(false)
			return
		}
		resolve(true)
		return
	})
}

//return {asdf: "", fdsa: ""}
//decrypt and return user data
//a lot of encoding and transforming needs to be done, in order to provide all values in the right format
async function getUserData() {
	return new Promise(async (resolve, reject) => {
		//get required data for decryption
		let keyBuffer = await getKeyBuffer()
		chrome.storage.local.get(['Data'], async (Data) => {
			//check if Data exists, else return
			if (Data.Data === undefined || Data.Data === "undefined" || Data.Data === null) {
				resolve({ asdf: undefined, fdsa: undefined })
				return
			}
			let iv = await Data.Data.slice(0, 32).match(/.{2}/g).map(byte => parseInt(byte, 16))
			iv = new Uint8Array(iv)
			let userDataEncrypted = atob(Data.Data.slice(32))
			userDataEncrypted = new Uint8Array(userDataEncrypted.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))

			//decrypt
			let UserData = await crypto.subtle.decrypt(
				{
					name: "AES-CBC",
					iv: iv
				},
				keyBuffer,
				userDataEncrypted
			)

			//adjust to useable format
			UserData = new TextDecoder().decode(UserData)
			UserData = UserData.split("@@@@@")
			resolve({ asdf: UserData[0], fdsa: UserData[1] })
		})
	})
}

//////////////// END FUNCTIONS FOR ENCRYPTION AND USERDATA HANDLING ////////////////

//save parsed courses
//course_list = {type:"", list:[{link:link, name: name}, ...]}
function saveCourses(course_list) {
	course_list.list.sort((a, b) => (a.name > b.name) ? 1 : -1)
	switch (course_list.type) {
		case 'favoriten':
			chrome.storage.local.set({ favoriten: JSON.stringify(course_list.list) }, function () { })
			console.log('saved Favoriten in TUfast')
			break
		case 'meine_kurse':
			chrome.storage.local.set({ meine_kurse: JSON.stringify(course_list.list) }, function () { })
			console.log('saved Meine Kurse in TUfast')
			break
		default:
			break
	}
}

//get parsed courses
//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
	switch (type) {
		case "favoriten":
			chrome.storage.local.get(['favoriten'], function (result) {
				console.log(JSON.parse(result.favoriten))
			})
			break
		case "meine_kurse":
			chrome.storage.local.get(['meine_kurse'], function (result) {
				console.log(JSON.parse(result.meine_kurse))
			})
			break
		default:
			break
	}
}

//function for custom URIEncoding
function customURIEncoding(string) {
	string = encodeURIComponent(string)
	string = string.replace("!", "%21").replace("'", "%27").replace("(", "%28").replace(")", "%29").replace("~", "%7E")
	return string
}

//function to log msx.tu-dresden.de/owa/ and retrieve the .json containing information about EMails
function fetchOWA(username, password, logout) {
	return new Promise((resolve, reject) => {

		//encodeURIComponent and encodeURI are not working for all chars. See documentation. Thats why I implemented custom encoding.
		username = customURIEncoding(username)
		password = customURIEncoding(password)

		var mailInfoJson = new Object() //contains all required info

		//login
		fetch("https://msx.tu-dresden.de/owa/auth.owa", {
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded",
				"Access-Control-Allow-Origin": "*",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			},
			"referrer": "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa%2f%23authRedirect%3dtrue",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"Access-Control-Allow-Origin": "*",
			"body": "destination=https%3A%2F%2Fmsx.tu-dresden.de%2Fowa%2F%23authRedirect%3Dtrue&flags=4&forcedownlevel=0&username=" + username + "%40msx.tu-dresden.de&password=" + password + "&passwordText=&isUtf8=1",
			"method": "POST",
			"mode": "no-cors",
			"credentials": "include"
		})
			.then(() => {
				//get clientID and correlationID
				fetch("https://msx.tu-dresden.de/owa/", {
					"headers": {
						"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
						"accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
						"cache-control": "max-age=0",
						"sec-fetch-dest": "document",
						"sec-fetch-mode": "navigate",
						"Access-Control-Allow-Origin": "*",
						"sec-fetch-site": "same-origin",
						"sec-fetch-user": "?1",
						"upgrade-insecure-requests": "1"
					},
					"referrer": "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa",
					"referrerPolicy": "strict-origin-when-cross-origin",
					"body": null,
					"method": "GET",
					"Access-Control-Allow-Origin": "*",
					"mode": "cors",
					"credentials": "include"
				})
					//extract x-owa-correlationid. correlation id is
					.then(resp => resp.text()).then(respText => {
						let temp = respText.split("window.clientId = '")[1]
						let clientId = temp.split("'")[0]
						let corrId = clientId + "_" + (new Date()).getTime()
						console.log("corrID: " + corrId)
					})
					//getAllInfo
					.then(corrId => {
						fetch("https://msx.tu-dresden.de/owa/sessiondata.ashx?appcacheclient=0", {
							"headers": {
								"accept": "*/*",
								"accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
								"sec-fetch-dest": "empty",
								"sec-fetch-mode": "cors",
								"Access-Control-Allow-Origin": "*",
								"sec-fetch-site": "same-origin",
								"x-owa-correlationid": corrId,
								"x-owa-smimeinstalled": "1"
							},
							"referrer": "https://msx.tu-dresden.de/owa/",
							"referrerPolicy": "strict-origin-when-cross-origin",
							"Access-Control-Allow-Origin": "*",
							"body": null,
							"method": "POST",
							"mode": "cors",
							"credentials": "include"
						})
							.then(resp => resp.json()).then(respJson => {
								mailInfoJson = respJson
							})
							//logout
							.then(() => {
								//only logout, if user is not using owa in browser session
								if (logout) {
									console.log("Logging out from owa..")
									fetch("https://msx.tu-dresden.de/owa/logoff.owa", {
										"headers": {
											"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
											"accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
											"sec-fetch-dest": "document",
											"Access-Control-Allow-Origin": "*",
											"sec-fetch-mode": "navigate",
											"sec-fetch-site": "same-origin",
											"sec-fetch-user": "?1",
											"upgrade-insecure-requests": "1"
										},
										"referrer": "https://msx.tu-dresden.de/owa/",
										"referrerPolicy": "strict-origin-when-cross-origin",
										"Access-Control-Allow-Origin": "*",
										"body": null,
										"method": "GET",
										"mode": "cors",
										"credentials": "include"
									})
								}
							})
							.then(() => resolve(mailInfoJson))
					})
			})
	})
}

//extract number of unread messages in owa
function countUnreadMsg(json) {
	return new Promise((resolve, reject) => {
		json.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders.forEach(obj => {
			if (obj.DisplayName === "Inbox" || obj.DisplayName === "Posteingang") resolve(obj.UnreadCount)
		})
	})
}
