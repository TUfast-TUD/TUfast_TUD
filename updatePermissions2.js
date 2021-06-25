function denyHostPermission() {
	alert("Okay, das ist schade. Beachte bitte, dass diese Berechtigun gebraucht wird, um TUfast weiterhin zu verwenden. Ansonsten deaktiviert sich die Erweiterung bei dir bald automatisch.")
	alert("Wir empfehlen dir deshalb, die Berechtigung jetzt zu akzeptieren. Dies kannst du auf der Einstellungsseite von TUfast tun.")
	chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
	window.close()
}

function requestHostPermission() {
	chrome.permissions.request({
		origins: ["*://*/*"]
	}, function (granted) {
		if (granted) {
			alert("Perfekt! TUfast hast jetzt maximale Funktiontn. Viel Spass!")
			chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
			window.close()
		} else {
			alert("Okay, das ist schade. Beachte bitte, dass diese Berechtigun gebraucht wird, um TUfast weiterhin zu verwenden. Ansonsten deaktiviert sich die Erweiterung bei dir bald automatisch.")
			alert("Wir empfehlen dir deshalb, die Berechtigung jetzt zu akzeptieren. Dies kannst du auf der Einstellungsseite von TUfast tun.")
			chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
			window.close()
		}
	})
}

window.onload = function () {
	document.getElementById("refuseDomains").onclick = denyHostPermission
	document.getElementById("acceptDomains").onclick = requestHostPermission
}

