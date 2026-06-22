export const de = {
  common: {
    close: 'Schließen',
    edit: 'Bearbeiten',
    website: 'Website',
    supportUs: 'Unterstütze uns',
    privacy: 'Datenschutz'
  },
  settings: {
    location: '→ Einstellungen',
    personalization: 'Personalisierung',
    functions: 'Funktionen',
    information: 'Informationen',
    tiles: {
      autoLogin: 'Automatisches Anmelden',
      email: 'E-Mail Benachrichtigungen',
      improveOpal: 'OPAL verbessern',
      improveSelma: 'Selma verbessern',
      searchEngines: 'Suchmaschinen Superkräfte',
      shortcuts: 'Shortcuts',
      rockets: 'Raketen sammeln',
      about: 'Über das Projekt',
      contact: 'Hilfe & Kontakt',
      faculty: 'Meine Fakultät',
      language: 'Sprache – Bald! Soon!'
    },
    pages: {
      email: {
        needsLogin:
          'Du musst "Automatisches Anmelden" mit deinem Login einrichten, um diese Funktion nutzen zu können.',
        title: 'Erhalte Benachrichtigungen, wenn du neue E-Mails erhältst',
        fetchToggle: 'Anzahl ungelesener Mails als Notification Bubble',
        notificationToggle: 'Pop-Up Benachrichtigung beim Erhalt einer neuen Mail',
        permission:
          'Das Abrufen der Anzahl deiner ungelesenen Mails kann bis zu 5 Minuten dauern. Weil TUfast dafür eine spezielle Berechtigung braucht, drücke bitte auf „Erlauben“ im folgenden Pop-Up.',
        help: 'Für diese Funktion ruft TUfast die Anzahl deiner ungelesenen Mails vom Mail-Server der TU Dresden ab. Zum Anmelden werden deine Login-Daten verschlüsselt übertragen. Diese Verbindung ist sicher. Es funktioniert genauso, als würdest du deine Mails über den Browser abrufen. Die Benachrichtigungen kommen über die Windows-API. Beachte, dass du unter Windows die entsprechende Funktion aktiviert haben musst.'
      },
      improveOpal: {
        title: 'Optimiere den Umgang mit PDF und Textdokumenten in OPAL',
        inline: 'PDF- und Textdokumente direkt im Browser öffnen, anstatt sie herunterzuladen',
        newTab: 'PDF- und Textdokumente in einem neuen Tab öffnen (empfohlen)',
        permission:
          'Damit die Einstellungen wirksam werden, musst du OPAL einmal aktualisieren. Möglicherweise braucht TUfast eine spezielle Berechtigung. Drücke bitte auf „Erlauben“ im folgenden Pop-Up.',
        firefoxWarning: 'Diese Funktion funktioniert im Firefox Browser leider nicht stabil.'
      },
      improveSelma: {
        title: 'Optimiere Layout und Notenverteilungen in Selma',
        toggle: 'Verbessertes Layout, Notenverteilung, Versuchstracker hinzufügen',
        help: 'Dieses Feature fügt Graphen für die Notenverteilungen und Versuchstracker in selma hinzu. Zusätzlich wird das Layout und Design angepasst, um benutzerfreundlicher zu sein.'
      },
      rockets: {
        title: 'Schalte neue Raketen frei und gestalte damit OPAL und deinen Browser!',
        help: 'Damit unterstützt du auch das TUfast-Projekt und das hilft uns sehr 🙂'
      },
      searchEngines: {
        title: 'Kurzbefehle in Suchmaschinen öffnen OPAL und weitere Tools direkt',
        toggle: 'Suchmaschinen Superkräfte aktivieren',
        help: 'Gib z.B. "tumail" in der Google-Suche ein, um direkt zur Outlook-Web-App zu kommen. Es werden die meisten Suchmaschinen unterstützt!'
      },
      shortcuts: {
        title: 'Öffne OPAL und weitere Tools mit Tastenkombinationen',
        activeByDefault: 'Standardmäßig sind aktiv:',
        dashboard: 'Dashboard öffnen',
        opal: 'OPAL öffnen',
        mail: 'Mail (OWA) öffnen'
      }
    }
  },
  onboarding: {
    start: 'Einrichtung beginnen',
    next: 'Weiter',
    skip: 'Einrichtung überspringen',
    finish: 'Einrichtung abschließen',
    steps: {
      welcome: 'Herzlich Willkommen bei TUfast',
      faculty: 'Meine Fakultät',
      login: 'Automatischer Login – Zugang',
      otp: 'Automatischer Login – 2FA',
      email: 'E-Mail Benachrichtigungen',
      opalSelma: 'OPAL und Selma verbessern',
      searchEngines: 'Suchmaschinen Kurzbefehle',
      done: 'GESCHAFFT!'
    }
  },
  popup: {
    shareHtml:
      '<div class="content"><h1>Hilf deinen Mitstudierenden <br /><img class="invert" src="../../assets/images/tufast48.png" style="height:1.5em;vertical-align:middle;" /> TUfast zu entdecken</h1><p class="subtitle">und <a href="#" id="rockets_link" style="color:var(--color-text-link);text-decoration:underline;cursor:pointer;">sammle coole Raketen</a>!</p><div class="share-section"><div class="share-title">Teilen mit</div><div class="share-links"><a class="share-link" href="mailto:?subject=Probiere%20mal%20TUfast!%20%F0%9F%9A%80&body=Hey%20%3A)%0A%0Akennst%20du%20schon%20TUfast%3F%0A%0ATUfast%20hilft%20beim%20t%C3%A4glichen%20Arbeiten%20mit%20den%20Online-Portalen%20der%20TU%20Dresden.%0ADamit%20spare%20ich%20viel%20Zeit%20und%20nervige%20Klicks.%0A%0ATUfast%20ist%20eine%20Erweiterung%20f%C3%BCr%20den%20Browser%20und%20wurde%20von%20Studierenden%20entwickelt.%0AProbiere%20es%20jetzt%20auf%20www.tu-fast.de%20!%0A%0ALiebe%20Gr%C3%BC%C3%9Fe%C2%A0%F0%9F%96%90" target="_blank"><img src="../../assets/icons/gmail.png" />E-Mail</a><a class="share-link" href="https://api.whatsapp.com/send?text=Hey%2C%20kennst%20du%20schon%20TUfast%3F%20%F0%9F%9A%80%0A%0AMacht%20das%20arbeiten%20mit%20allen%20Online-Portalen%20der%20TU%20Dresden%20produktiver%20und%20hat%20mir%20schon%20viel%20Zeit%20und%20nervige%20Klicks%20gespart.%20Eine%20richtig%20n%C3%BCtzliche%20Browsererweiterung%20f%C3%BCr%20Studierenden!%0A%0AProbiers%20gleich%20mal%20aus%20auf%20www.tu-fast.de%20%F0%9F%96%90" target="_blank"><img src="../../assets/icons/wa2.png" />WhatsApp</a><a class="share-link" href="https://www.tu-fast.de" target="_blank">www.tu-fast.de</a></div></div><div class="footer">Gemacht mit 💙 von Studierenden · <a href="https://github.com/TUfast-TUD/TUfast_TUD" target="_blank">GitHub</a> · <a href="mailto:frage@tu-fast.de?subject=Feedback%20TUfast" target="_blank">Kontakt</a></div></div>',
    savedClicks: (clicks: number, time: string) => `${clicks} Klicks, ${time} gespart`,
    importOpalCourses: 'Klicke, um deine OPAL-Kurse zu importieren',
    updateCourseList: 'Diese Kursliste jetzt aktualisieren...',
    ratingDone: "Fertig <text style='font-size:14px'>✅</text>",
    rateBeforeSubmit: 'Bitte bewerte den Kurs mit Sternen, bevor du dein Rating abgibst!',
    introRating:
      "<b>Wir suchen den besten Kurs an der TU Dresden. Bewerte jetzt deine Kurse mit 1-5 Sternen!</b> Deine Bewertung ist zu 100% völlig anonym. Die Ergebnisse der Abstimmung veröffentlichen wir anschließend. Details und die Erweiterung zur Datenschutzerklärung gibts <a target='_blank' href='https://tu-fast.de/datenschutz'>hier</a>. <a id='intro' href='#'>Schließen</a>.",
    outroRating:
      "<b>Danke für's Abstimmen. Über die Ergebnisse wirst du benachrichtigt!</b> Teile <a target='_blank' href='https://www.tu-fast.de'>www.tu-fast.de</a> jetzt mit deinen Freunden, damit auch sie die Kurse bewerten. Damit k&ouml;nnen wir die Lehre an der TU verbessern! Danke &#x1f499;<br><a id='outro' href='#'>Schließen</a>.",
    gopalBanner:
      "<b>Tipp für Erstis: Erfahre alles wichtige rund um dein Studium mit gOPAL - dem mobilen Studienassistenzsystem! Hier <a target='_blank' href='https://tu-dresden.de/mz/projekte/projektoverview/mobiles-studienassistenzsystem-gopal'>gOPAL öffnen.</a> <a id='msg1' href='#'>Schließen</a>.",
    tooManyCourses: 'Deaktiviert: mehr als 25 Kurse',
    openAllFavorites: 'Alle Favoriten öffnen',
    openAllCourses: 'Alle Kurse öffnen',
    switchToCourses: 'Wechsel zu "Meine Kurse" ... ',
    switchToFavorites: 'Wechsel zu "Meine Favoriten" ...'
  },
  content: {
    opal: {
      closeAllTabs: 'Alle Tabs schließen',
      closeAllTabsTitle: 'Alle Tabs schließen. Ein TUfast-Feature.',
      openAllCourses: 'Alle Kurse öffnen',
      openAllCoursesTitle: 'Alle Kurse öffnen. Ein TUfast-Feature.',
      openAllFavorites: 'Alle Favoriten öffnen',
      openAllFavoritesTitle: 'Alle Favoriten öffnen. Ein TUfast-Feature.',
      coursesSaved:
        'Deine Kurse wurden erfolgreich in TUfast gespeichert. Drücke jetzt <kbd>Alt</kbd> + <kbd>Q</kbd>, um deine Kurse zu sehen! 🚀',
      coursesUpdated: 'Deine Kurse wurden erfolgreich in TUfast aktualisiert! 🚀',
      snowEnable: 'Schnee aktivieren',
      snowDisable: 'Schnee deaktivieren',
      snowTitle: 'Schnee einstellen. Winter-Modus von TUfast.',
      logoTitle: 'Powered by TUfast. Enjoy :)',
      banners: {
        helpText: 'Du hast Bock TUfast weiterzuentwickeln? ',
        helpAction: 'Wir suchen dich!',
        helpTitle: 'Verstärkung gesucht:',
        mv3Text: 'Die Opal-Personalisierung muss von dir leider erneut aktiviert werden(, wenn du magst). ',
        mv3Action: 'Hier aktivieren',
        mv3Title: 'Großes TUfast Update!',
        rocketText: 'TUfast empfehlen und neue Icons freischalten! ',
        rocketAction: 'Los gehts!',
        rocketTitle: "Schnapp' sie dir alle!",
        reviewText: "Dann hau' mal ne gute Bewertung im Store raus! ",
        reviewAction: "Hier geht's lang!",
        reviewTitle: "Gefällt's dir?"
      }
    },
    hisqis: {
      credits:
        'Powered by <img src="{imgUrl}" style="position:relative; right: 2px;height: 15px;"><a href="https://www.tu-fast.de" target="_blank">TUfast</a> (entwickelt von <a href="https://github.com/Noxdor" target="_blank">Noxdor</a> & <a href="https://github.com/C0ntroller" target="_blank">C0ntroller</a>)',
      oldTable: 'langweiligen, alten Tabelle...',
      newTable: 'neuen, coolen TUfast-Tabelle 🔥',
      continueTo: ' Weiter zur ',
      overview: 'Deine Notenübersicht',
      descriptors: ['Modul', 'Bestandene Prüfung', 'Verhauene Prüfung'],
      weightedAverage: (average: string) => `Deine Durchschnittnote (nach CP gewichtet): ${average}`,
      moduleCount: (count: number) => `Anzahl Module: ${count}`,
      examCount: (count: number) => `Anzahl Prüfungen: ${count}`
    },
    selma: {
      passed: 'Bestanden',
      notSet: 'Noch nicht gesetzt',
      distribution: 'Notenverteilung',
      tries: 'Versuche',
      examDate: 'Prüfungsleistung/Termin',
      deactivate: 'Deactivate',
      activate: 'Activate',
      toggleTitle: 'Toggle the "ImproveSelma" feature and reload the page to apply the change.'
    },
    owa: {
      permissionFetch:
        "TUfast braucht diese Berechtigung, um regelmäßig alle Mails abzurufen. Bitte drücke auf 'Erlauben'.",
      permissionNotification:
        "TUfast braucht diese Berechtigung, um dir zusätzliche Benachrichtigungen zu senden. Bitte drücke auf 'Erlauben'.",
      newMailTitle: 'Neue E-Mails',
      newMailMessage: (count: number) => `Du hast ${count} neue E-Mail${count > 1 ? 's' : ''}`
    },
    opalInline: {
      permission: "TUfast braucht diese Berechtigung, um Dateien ohne Download zu öffnen. Bitte drücke auf 'Erlauben'."
    },
    otp: {
      snatcherConfirm:
        'TUfast kann diesen 2-Faktor-Code für dich speichern und automatisch an den entsprechenden Stellen einfügen (=AutoLogin). Dies geht jedoch eigentlich gegen den Sinn eines zweiten Faktors.\n\nSPEICHERE DIR DEN CODE UND DIE RECOVERY CODES AUF JEDEN FALL AUCH AN EINER ANDEREN STELLE!\n\nSoll TUfast für dich die 2-Faktor-Authentifizierung übernehmen?'
    }
  }
}
