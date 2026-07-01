import de from './de'

export const en: typeof de = {
  localeName: 'English',
  manifest: {
    extensionName: 'TUfast TU Dresden',
    extensionDescription: 'The productivity tool for TU Dresden students',
    commandOpenOpal: 'Open OPAL',
    commandOpenOwa: 'Open mail (OWA)'
  },
  common: {
    close: 'Close',
    edit: 'Edit',
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    saved: 'SAVED',
    website: 'Website',
    team: 'Team',
    github: 'GitHub',
    supportUs: 'Support us',
    privacy: 'Privacy'
  },
  settings: {
    documentTitle: 'TUfast Settings',
    location: 'Settings',
    personalization: 'Personalization',
    functions: 'Features',
    information: 'Information',
    statistics: {
      saved: 'Already saved:',
      clicks: ' click | clicks'
    },
    tiles: {
      autoLogin: 'Automatic Login',
      email: 'Email Notifications',
      improveOpal: 'Improve OPAL',
      improveSelma: 'Improve Selma',
      searchEngines: 'Search Engine Powers',
      shortcuts: 'Shortcuts',
      rockets: 'Collect Rockets',
      about: 'About the Project',
      contact: 'Help & Contact',
      faculty: 'My Faculty',
      language: 'Language'
    },
    pages: {
      email: {
        needsLogin: 'You need to set up "Automatic Login" with your login before you can use this feature.',
        title: 'Get notifications when you receive new emails',
        fetchToggle: 'Show unread email count as a notification badge',
        notificationToggle: 'Pop-up notification when a new email arrives',
        permission:
          'Fetching your unread email count can take up to 5 minutes. TUfast needs a special permission for this, so please click "Allow" in the following pop-up.',
        help: 'For this feature, TUfast fetches the number of unread emails from the TU Dresden mail server. Your login data is transmitted encrypted. This connection is secure. It works the same way as checking your mail in the browser. Notifications use the Windows API. Please note that the corresponding feature must be enabled in Windows.'
      },
      improveOpal: {
        title: 'Improve handling of PDF and text documents in OPAL',
        inline: 'Open PDF and text documents directly in the browser instead of downloading them',
        newTab: 'Open PDF and text documents in a new tab (recommended)',
        permission:
          'To apply these settings, you need to refresh OPAL once. TUfast may need a special permission. Please click "Allow" in the following pop-up.',
        firefoxWarning: 'Unfortunately, this feature is not stable in Firefox.'
      },
      improveSelma: {
        title: 'Improve layout and grade distributions in Selma',
        toggle: 'Add improved layout, grade distribution and attempt tracker',
        help: 'This feature adds graphs for grade distributions and attempt tracking in Selma. It also adjusts the layout and design to make it easier to use.'
      },
      rockets: {
        title: 'Unlock new rockets and use them to customize OPAL and your browser!',
        help: 'This also supports the TUfast project and helps us a lot :)'
      },
      searchEngines: {
        title: 'Short commands in search engines open OPAL and other tools directly',
        toggle: 'Enable search engine powers',
        help: 'For example, type "tumail" into Google Search to open Outlook Web App directly. Most search engines are supported!'
      },
      shortcuts: {
        title: 'Open OPAL and other tools with keyboard shortcuts',
        activeByDefault: 'Enabled by default:',
        dashboard: 'Open dashboard',
        opal: 'Open OPAL',
        mail: 'Open mail (OWA)'
      },
      autoLogin: {
        saved: 'Currently saved',
        notSaved: 'No data saved',
        intro:
          'For this, your {name} login data must be stored securely on this PC. The data is stored locally and encrypted. You can delete it at any time.',
        saveLogin: 'Save login locally',
        deleteLogin: 'Delete login',
        twoFactorTitle: 'Two-factor authentication (2FA)',
        twoFactorHelp:
          'Automatic Login also supports 2FA. Here you can save your TOTP secret key. The key is Base32 encoded and looks like this, for example:',
        twoFactorLink: 'Here you can find more information and a full setup guide. ->',
        saveKey: 'Save key locally',
        deleteKey: 'Delete key'
      },
      about: {
        title: 'Why does studying online have to be so complicated?',
        intro1:
          'At TU Dresden, we juggle OPAL, Selma, Hisqis and Outlook every day, losing time and patience. So we asked ourselves: could this be easier? That question became TUfast. First it was a small side project during our studies, then a growing platform that quickly reached more and more students. What started with a few lines of code became a shared mission: making digital student life at TU Dresden easier.',
        intro2:
          'Today, TUfast is an open-source project by students and alumni of TU Dresden. It is used by more than 4000 students at TU Dresden. Everyone contributing to the project does so voluntarily and with the wish to make online teaching a little easier for other students.',
        supportersStart: 'The project is supported, among others, by the',
        supportersEnd:
          'of the Faculty of Computer Science, several student councils at TU Dresden and kind sponsors on',
        nextStep:
          'We are not done yet: our next step is to keep expanding TUfast - for TU Dresden, for other universities in Saxony and for everyone who wants a little more structure and ease in digital teaching.',
        claim: 'By students, for students. Free and open source.',
        clickCalcTitle: 'How saved clicks are calculated:',
        clickCalcClick: 'One saved click = 3 seconds',
        clickCalcShortcut: 'Using a shortcut = 2 saved clicks',
        clickCalcLogin: 'One automatic login = 3 saved clicks',
        clickCalcCourse: 'Opening a course through the dashboard = 3 saved clicks',
        clickCalcSearch: 'One search redirect = 2 saved clicks',
        developedBy: 'TUfast is developed by:',
        licenses: 'Open Source & Licenses',
        fontLicense:
          'Font: Space Grotesk, 2020. The Space Grotesk Project Authors, Florian Karsten, SIL Open Font License.',
        iconLicense: 'Icons: Tabler Icons, Copyright (c) 2018-2025 Tabler, MIT License'
      },
      contact: {
        title: 'Do you have a question or an idea for TUfast?',
        text: 'Then please send us an email at',
        subject: 'TUfast feedback'
      },
      appearance: {
        title: 'Appearance'
      }
    },
    logins: {
      zih: {
        title: 'Automatically log in to all TU Dresden online portals',
        name: 'TU Dresden',
        usernamePlaceholder: 'Username (ZIH login)',
        usernameError:
          "The username looks like 's3276763' or 'luka075d'. Only save your current input if you are sure.",
        passwordPlaceholder: 'Password (ZIH login)',
        passwordError: 'The password must be at least 5 characters long.',
        totpSecretPlaceholder: 'TOTP secret key',
        totpSecretError:
          'The TOTP secret key consists of uppercase letters (A to Z) and digits (2 to 7) and is 32 characters long.'
      },
      slub: {
        title: 'Automatically log in to the SLUB website',
        name: 'SLUB',
        usernamePlaceholder: 'User number (SLUB login)',
        usernameError: 'You can find the user number on your SLUB card, among other places.',
        passwordPlaceholder: 'Password (SLUB login)',
        passwordError: 'The password must be at least 5 characters long.'
      }
    },
    faculty: {
      alt: 'Icon of the degree program {name}',
      placeholder: 'Placeholder',
      default: 'Default settings',
      mailSubject: 'Degree program suggestion',
      names: {
        geowissenschaften: 'Geosciences',
        maschinenbau: 'Mechanical Engineering',
        informatik: 'Computer Science',
        mathematik: 'Mathematics',
        medizin: 'Medicine',
        psychologie: 'Psychology',
        wirtschaftswissenschaften: 'Business and Economics',
        elektrotechnik: 'Electrical Engineering',
        bauingenieurwesen: 'Civil Engineering',
        verkehr: 'Transport and Traffic Sciences "Friedrich List"',
        general: 'Default settings',
        addStudiengang: '+ Add degree program...'
      }
    },
    rocketsText: {
      default: {
        beforeUnlock: 'Default. Everyone has it.',
        unlocked: 'Default. Everyone has it.'
      },
      '250clicks': {
        beforeUnlock: 'Save more than 250 clicks.',
        unlocked: 'More than 250 clicks saved. TUfast seems useful!'
      },
      '2500clicks': {
        beforeUnlock: 'Save more than 2500 clicks. You are a pro!',
        unlocked: 'More than 2500 clicks saved. TUfast is useful!'
      },
      easteregg: {
        beforeUnlock: 'Find the easter egg!',
        unlocked: 'Easter egg found :)'
      },
      email: {
        beforeUnlock: 'Do you find TUfast useful? Tell two people by email to unlock this fancy rocket!',
        unlocked: 'You earned this rocket! Recommended by email.'
      },
      webstore: {
        beforeUnlock: 'Do you like TUfast? Or do you have feedback? Then leave a review in the web store!',
        unlocked: 'Thanks for your review in the web store!'
      },
      whatsapp: {
        beforeUnlock:
          'Sharing cool things is your thing? Share TUfast with two friends on WhatsApp and collect this rocket!',
        unlocked: 'Thanks for your support! Recommended with WhatsApp.'
      }
    },
    rocketLinks: {
      email:
        'mailto:?subject=Try%20TUfast!&body=Hey%20%3A)%0A%0ADo%20you%20know%20TUfast%3F%0A%0ATUfast%20helps%20with%20daily%20work%20in%20the%20TU%20Dresden%20online%20portals.%0AIt%20saves%20me%20a%20lot%20of%20time%20and%20annoying%20clicks.%0A%0ATUfast%20is%20a%20browser%20extension%20developed%20by%20students.%0ATry%20it%20now%20at%20www.tu-fast.de%20!%0A%0ABest%20wishes',
      whatsapp:
        'https://api.whatsapp.com/send?text=Hey%2C%20do%20you%20know%20TUfast%3F%0A%0AIt%20makes%20working%20with%20the%20TU%20Dresden%20online%20portals%20more%20productive%20and%20has%20already%20saved%20me%20a%20lot%20of%20time%20and%20annoying%20clicks.%20A%20really%20useful%20browser%20extension%20for%20students!%0A%0ATry%20it%20now%20at%20www.tu-fast.de'
    },
    searchSites: {
      hisqis: 'HISQIS',
      opal: 'OPAL',
      selma: 'Selma',
      slub: 'SLUB',
      tucloud: 'Cloudstore TU Dresden',
      tudmail: 'Outlook Web App',
      tumail: 'Outlook Web App',
      tumatrix: 'Matrix TU Dresden',
      tumed: 'Medical ePortal',
      tustore: 'Cloudstore TU Dresden',
      videocampus: 'Videocampus Sachsen',
      tex: 'Overleaf ShareLaTeX'
    }
  },
  onboarding: {
    start: 'Start setup',
    next: 'Next',
    skip: 'Skip setup',
    finish: 'Finish setup',
    steps: {
      welcome: 'Welcome to TUfast',
      faculty: 'My Faculty',
      login: 'Automatic Login - Access',
      otp: 'Automatic Login - 2FA',
      email: 'Email Notifications',
      opalSelma: 'Improve OPAL and Selma',
      searchEngines: 'Search Engine Shortcuts',
      done: 'DONE!'
    },
    pages: {
      welcomeTitle: 'Your productivity tool for TU Dresden',
      welcomeHelp: 'with TUfast you save up to<br />90 minutes and up to 2000 clicks per semester',
      facultyHelp: 'Choose your faculty. Your dashboard will then be set up with all links relevant to you.',
      loginHelp: 'Automatically log in to all TU Dresden online portals',
      otpHelp: 'Want to log in instantly? Then set up two-factor authentication',
      emailHelp: 'Automatically log in to all TU Dresden online portals',
      doneIntro: 'TUfast is now fully set up for you.<br />Here are a few tips:',
      doneSettings: 'You can change your settings at any time',
      doneCourses: 'Add your OPAL courses to the dashboard',
      doneContact: 'If you have questions or ideas for TUfast, feel free to contact us!',
      doneGoodLuck: 'Good luck with your studies!'
    }
  },
  popup: {
    title: 'TU Dresden Dashboard',
    searchPlaceholder: 'Search course...',
    autoLogin: 'AutoLogin',
    bananaHtml:
      '<a tabindex="-1" href="https://www.buymeacoffee.com/olihausdoerfer" target="_blank" style = "position: fixed; bottom: 70px; right: 26px;" > <img tabindex="-1" style="width: 160px;"src="https://img.buymeacoffee.com/button-api/?text=Support%20us%20with%20a%20Mate&emoji=%F0%9F%8D%BE&slug=olihausdoerfer&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=000000></a>',
    shareHtml:
      '<div class="content"><h1>Help your fellow students discover<br /><img class="invert" src="../../assets/images/tufast48.png" style="height:1.5em;vertical-align:middle;" /> TUfast</h1><p class="subtitle">and <a href="#" id="rockets_link" style="color:var(--color-text-link);text-decoration:underline;cursor:pointer;">collect cool rockets</a>!</p><div class="share-section"><div class="share-title">Share with</div><div class="share-links"><a class="share-link" href="mailto:?subject=Try%20TUfast!&body=Hey%20%3A)%0A%0ADo%20you%20know%20TUfast%3F%0A%0ATUfast%20helps%20with%20daily%20work%20in%20the%20TU%20Dresden%20online%20portals.%0AIt%20saves%20me%20a%20lot%20of%20time%20and%20annoying%20clicks.%0A%0ATUfast%20is%20a%20browser%20extension%20developed%20by%20students.%0ATry%20it%20now%20at%20www.tu-fast.de%20!%0A%0ABest%20wishes" target="_blank"><img src="../../assets/icons/gmail.png" />E-Mail</a><a class="share-link" href="https://api.whatsapp.com/send?text=Hey%2C%20do%20you%20know%20TUfast%3F%0A%0AIt%20makes%20working%20with%20the%20TU%20Dresden%20online%20portals%20more%20productive%20and%20has%20already%20saved%20me%20a%20lot%20of%20time%20and%20annoying%20clicks.%20A%20really%20useful%20browser%20extension%20for%20students!%0A%0ATry%20it%20now%20at%20www.tu-fast.de" target="_blank"><img src="../../assets/icons/wa2.png" />WhatsApp</a><a class="share-link" href="https://www.tu-fast.de" target="_blank">www.tu-fast.de</a></div></div><div class="footer">Made by students with care - <a href="https://github.com/TUfast-TUD/TUfast_TUD" target="_blank">GitHub</a> - <a href="mailto:frage@tu-fast.de?subject=TUfast%20feedback" target="_blank">Contact</a></div></div>',
    savedClicks: '{clicks} clicks, {time} saved',
    importOpalCourses: 'Click to import your OPAL courses',
    updateCourseList: 'Update this course list now...',
    ratingDone: "Done <text style='font-size:14px'>OK</text>",
    rateBeforeSubmit: 'Please rate the course with stars before submitting your rating!',
    introRating:
      "<b>We are looking for the best course at TU Dresden. Rate your courses now with 1-5 stars!</b> Your rating is 100% anonymous. We will publish the voting results afterwards. Details and the extension to the privacy policy are available <a target='_blank' href='https://tu-fast.de/datenschutz'>here</a>. <a id='intro' href='#'>Close</a>.",
    outroRating:
      "<b>Thanks for voting. You will be notified about the results!</b> Share <a target='_blank' href='https://www.tu-fast.de'>www.tu-fast.de</a> with your friends now so they can rate their courses too. This helps us improve teaching at TU Dresden! Thank you<br><a id='outro' href='#'>Close</a>.",
    gopalBanner:
      "<b>Tip for first-year students: Learn everything important about your studies with gOPAL, the mobile study assistant! Open <a target='_blank' href='https://tu-dresden.de/mz/projekte/projektoverview/mobiles-studienassistenzsystem-gopal'>gOPAL here.</a> <a id='msg1' href='#'>Close</a>.",
    tooManyCourses: 'Disabled: more than 25 courses',
    openAllFavorites: 'Open all favorites',
    openAllCourses: 'Open all courses',
    switchToCourses: 'Switching to "My Courses" ... ',
    switchToFavorites: 'Switching to "My Favorites" ...',
    iconTitles: {
      selma: 'Selma',
      eportal: 'ePortal',
      moodle: 'Moodle',
      opal: 'OPAL',
      qis: 'QIS',
      matrix: 'Matrix Chat',
      msx: 'TU Mail',
      slub: 'SLUB',
      cloud: 'Datashare',
      gitlab: 'GitLab',
      orsee: 'orsee',
      geoportal: 'Geoportal',
      tuNavi: 'TU Campus Navigator',
      marudor: 'bahn.expert (formerly marudor.de)',
      infoDiscord: 'Computer Science Discord',
      swdd: 'Cafeteria',
      pa: 'Examination Offices',
      tex: 'tex'
    }
  },
  content: {
    opal: {
      closeAllTabs: 'Close all tabs',
      closeAllTabsTitle: 'Close all tabs. A TUfast feature.',
      openAllCourses: 'Open all courses',
      openAllCoursesTitle: 'Open all courses. A TUfast feature.',
      openAllFavorites: 'Open all favorites',
      openAllFavoritesTitle: 'Open all favorites. A TUfast feature.',
      coursesSaved:
        'Your courses were successfully saved in TUfast. Press <kbd>Alt</kbd> + <kbd>Q</kbd> now to see your courses!',
      coursesUpdated: 'Your courses were successfully updated in TUfast!',
      snowEnable: 'Enable snow',
      snowDisable: 'Disable snow',
      snowTitle: 'Configure snow. TUfast winter mode.',
      logoTitle: 'Powered by TUfast. Enjoy :)',
      banners: {
        helpText: 'Want to help develop TUfast? ',
        helpAction: 'We are looking for you!',
        helpTitle: 'Help wanted:',
        mv3Text: 'Unfortunately, you need to enable OPAL personalization again, if you like. ',
        mv3Action: 'Enable here',
        mv3Title: 'Big TUfast update!',
        rocketText: 'Recommend TUfast and unlock new icons! ',
        rocketAction: "Let's go!",
        rocketTitle: 'Catch them all!',
        reviewText: 'Then leave a good review in the store! ',
        reviewAction: 'This way!',
        reviewTitle: 'Like it?',
        close: 'X'
      }
    },
    hisqis: {
      credits:
        'Powered by <img src="{imgUrl}" style="position:relative; right: 2px;height: 15px;"><a href="https://www.tu-fast.de" target="_blank">TUfast</a> (developed by <a href="https://github.com/Noxdor" target="_blank">Noxdor</a> & <a href="https://github.com/C0ntroller" target="_blank">C0ntroller</a>)',
      oldTable: 'boring old table...',
      newTable: 'new, cool TUfast table',
      continueTo: ' Continue to ',
      overview: 'Your grade overview',
      descriptors: ['Module', 'Passed exam', 'Failed exam'],
      weightedAverage: 'Your average grade (weighted by CP): {average}',
      moduleCount: 'Number of modules: {count}',
      examCount: 'Number of exams: {count}',
      failed: 'failed'
    },
    selma: {
      passed: 'Passed',
      notSet: 'Not set yet',
      distribution: 'Grade distribution',
      tries: 'Attempts',
      examDate: 'Exam/appointment',
      deactivate: 'Deactivate',
      activate: 'Activate',
      toggleTitle: 'Toggle the "Improve Selma" feature and reload the page to apply the change.',
      creditsEnabled: 'Table powered by',
      creditsDisabled: 'Table disabled',
      creditsBy: 'by'
    },
    owa: {
      permissionFetch: "TUfast needs this permission to regularly fetch all emails. Please click 'Allow'.",
      permissionNotification:
        "TUfast needs this permission to send you additional notifications. Please click 'Allow'.",
      newMailTitle: 'New emails',
      newMailMessage: 'You have {count} new email | You have {count} new emails'
    },
    opalInline: {
      permission: "TUfast needs this permission to open files without downloading them. Please click 'Allow'."
    },
    background: {
      tooManyLinks: 'You have more than 25 {type}. To avoid overloading your browser, please open them manually.',
      favorites: 'favorites',
      courses: 'courses'
    },
    otp: {
      snatcherConfirm:
        'TUfast can save this two-factor code for you and automatically fill it in at the right places (=AutoLogin). However, this goes against the idea of a second factor.\n\nMAKE SURE TO SAVE THIS CODE AND THE RECOVERY CODES SOMEWHERE ELSE TOO!\n\nShould TUfast handle two-factor authentication for you?'
    }
  }
}

export default en
