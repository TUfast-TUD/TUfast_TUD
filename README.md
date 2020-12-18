# TUfast 🚀
Browser-Erweiterung, um die Online-Portale der TU Dresden schneller und einfacher nutzerbar zu machen.
Spart Zeit und Nerven.

Verfügbar für Firefox, Chrome und Edge über [www.tu-fast.de](https://www.tu-fast.de)

Lizenz und Copyright: Informationen werden in Kürze hinzugefügt. Melde dich einfach bei akuten Fragen.

## Funktionen
 - Automatisches Anmelden in Opal, Selma und Co.
 - Opal-Kurse und Opal-Favoriten über das Dashbaord öffnen
 - Abkürzungen in der Google-Suche, z.B. "tumail" --> OWA Mail TU Dresden
 - Shortcuts für TU Dresden IT-Services, z.B. Alt+O für Opal öffnen
 - Notenstatistik im Hisqis
 
Unterstützt werden opal, hisqis, selma, cloudstore. outlook web app, magma, matrix, jExam
 
Die Anwendung funktioniert ausschließlich lokal auf dem PC. Nutzerdaten werden mit Systeminformationen (chrome.system API) verschlüsselt gespeichert. 

## Feature-Bounties 🤩
Feature implementieren -> neuen Code einschicken -> Feature wird in das offizielle TUfast übernommen -> Bounty kassieren!

Gerne können wir ein Feature genauer Besprechen, bevor du mit der Implementierung beginnst. Das spart am Ende vielleicht Zeit und sichert dir den Bounty :)

TUfast Telegram: [t.me/TUfast_TUD](https://t.me/TUfast_TUD)

### 45€ 💸💸💸
- **High-Prio - Portierung für Safari [assinged]**: Ich habe kein MacOS - deswegen wird das schwer für mich. Sollte aber weitgehen kompatibel sein.
- **pdfs im OPAL in neuer Browser-Seite anzeigen und nicht direkt runtergeladen**: Kommt schon, dass ist wirklich ziemlich nervig. Man will nur kurz was nachschauen und muss den scheiß gleich runterladen. Mit diesem Feature habe ich in [dieser Branche](https://github.com/OliEfr/TUfast_TUD/tree/ModifyHeaders) schon begonnen; es technisch allerdings nicht ganz hinbekommen. Wirde mich wirklich sehr freuen, wenn das jemand schafft.
- **Notenstatistik in Selma**: schöne, graphische Darstellung aller Noten im Selma, zB. mit Charts.js. Aktuell gibts dieses Feature nur für Hisqis.
- **Support Slub-Login**: automatisches Anmelden in Slub-Account. Die Nutzerdaten dafür sollte man in den Einstellungen speichern können.
- **Design-Rework von der Einstellungsseite in TUfast [assinged]**: Hauptsache Nutzerfreundlicher als es jetzt ist. Am besten sprechen wir uns hier vorher kurz ab.

### 35€ 💸💸
- **Reminder für Ablauf der Campus Sachsen Lizenz (Word & Co)**: Ist im Prinzip einfach zu machen: das Datum wird bei Aktivierung der Lizenz auf https://campussachsen.tu-dresden.de/ angezeigt. Die Berechtigung für die Campussachsen-Website sollte optional sein.
- **Benachrichtigungen für neue Mails im OWA**: Damit habe ich in [dieser Branche](https://github.com/OliEfr/TUfast_TUD/tree/OWAHackFetch) schon begonnen. Das Abrufen der Mails funktioniert. Die ganze Logik drumrum und ein Eintrag auf der Einstellungsseite muss noch implementiert werden.

### 15€ 💸
- Migrating to [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Entwickler
Entwickelt von Studenten, für Studenten:

- Daniel alias https://github.com/C0ntroller
- Tim alias tortletim

... und alle anderen freundlichen Supporter :)

## Kontakt
frage@tu-fast.de
ollidev97@gmail.com

[Datenschutzerklärung](https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing)
