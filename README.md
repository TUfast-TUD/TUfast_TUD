# TUfast 🚀
Browser-Erweiterung, um die Online-Portale der TU Dresden schneller und einfacher nutzerbar zu machen.
Spart Zeit und Nerven.

Verfügbar für Firefox, Chrome und Edge über [www.tu-fast.de](https://www.tu-fast.de)

Lizenz und Copyright: Informationen werden in Kürze hinzugefügt. Melde dich einfach bei akuten Fragen.

Achtung: OWAHackFetch ist die aktuelle Branch!

## Funktionen
 - Automatisches Anmelden in Opal, Selma und Co.
 - Opal-Kurse und Opal-Favoriten über das Dashbaord öffnen
 - Benachrichtigungen für neue Mails im TU Dresden Postfach (coming soon!)
 - Abkürzungen in der Google-Suche, z.B. "tumail" --> OWA Mail TU Dresden
 - Shortcuts für TU Dresden IT-Services, z.B. Alt+O für Opal öffnen
 - Notenstatistik im Hisqis
 - Verbesserungen für OPAL
 
Unterstützt werden opal, hisqis, selma, cloudstore, outlook web app, magma, matrix, jExam, eportal, elearning,

Die Anwendung sammelt keine Informationen über die Nutzer. Daten werden nur lokal auf dem PC gespeichert. 
Daten werden mit Systeminformationen (chrome.system API) verschlüsselt gespeichert. 
Siehe auch [Datenschutzerklärung](https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing)

## Feature-Roadmap
Du hast Lust mitzumachen? :) Suche dir gerne ein Feature aus und fange an zu Entwickeln!

### High-Prio
- **High-Prio - Portierung für Safari [assinged]**: Ich habe kein MacOS - deswegen wird das schwer für mich. Sollte aber weitgehen kompatibel sein.
- **Notenstatistik in Selma**: schöne, graphische Darstellung aller Noten im Selma, zB. mit Charts.js. Aktuell gibts dieses Feature nur für Hisqis.
- **Design-Rework von der Einstellungsseite in TUfast [assinged]**: Hauptsache Nutzerfreundlicher als es jetzt ist. Am besten sprechen wir uns hier vorher kurz ab.
- Damit man bei der Eingabe falscher Login-Daten nicht gesperrt wird, sollte TUfast beim Anmelden prüfen, ob ein Fehler vorliegt. Tatsächlich ist das bei steigender Nutzerzahl wichtig. 
- **Support https://videocampus.sachsen.de**: Die Berechtigung für sachsen.de/ muss optional sein! (Diese Implementierung wird häufig nachgefragt - vlt hat ja jemand Lust)
- **support shortcuts for DuckDuckGo and other search engines**: For now, only google is supportet. I.e. when typing "tumail" to be forwarded to owa and so on.

### Mid-Prio
- **Reminder für Ablauf der Campus Sachsen Lizenz (Word & Co)**: Ist im Prinzip einfach zu machen: das Datum wird bei Aktivierung der Lizenz auf https://campussachsen.tu-dresden.de/ angezeigt. Die Berechtigung für die Campussachsen-Website sollte optional sein.
- Benachrichtigungen für neue Noten im HISQIS

### Low-Prio
- Migrating to [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- add eportal.tumed to Portal-Icons
- add option for the user to synchronize settings and opal courses across devices.

## Entwickler
Entwickelt von Studenten, für Studenten:

- Daniel alias https://github.com/C0ntroller
- Tim alias tortletim
- Ali Behbudov alias https://github.com/libhh


... und alle anderen freundlichen Supporter :)

## Kontakt
frage@tu-fast.de
TUfast Telegram: [t.me/TUfast_TUD](https://t.me/TUfast_TUD)

