# TUfast 🚀
Chrome-Erweiterung, um die Online-Portale der TU Dresden schneller und einfacher nutzerbar zu machen.
Spart Zeit und Nerven.

Verfügbar im [Chrome Web Store](https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk?hl=de)

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

Am besten Forks du dieses Repo und stellst nach der Implementierung einen Pull-Request.
Alternativ kannst du dieses Repo als .zip runterladen und mir nach der Implementierung eine .zip schicken.

Gerne können wir ein Feature genauer Besprechen, bevor du mit der Implementierung beginnst. Das spart am Ende vielleicht Nerven und sichert dir den Bounty :)

TUfast Telegram: [t.me/TUfast_TUD](https://t.me/TUfast_TUD)

### 45€ 💸💸💸
- **High-Prio - Portierung für Firefox**: Viele Fragen nach, wann es die Erweiterung für Firefox gibt. Der entstehende Code muss für Chrome und Firefox nutzbar sein. Siehe auch [dieses Issue](https://github.com/OliEfr/TUfast_TUD/issues/2). Außerdem muss die Erweiterung vrmtl. mit [self-distribution](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/#self-distribution) vertrieben werden.
- **pdfs im OPAL in neuer Browser-Seite anzeigen und nicht direkt runtergeladen**: Kommt schon, dass ist wirklich ziemlich nervig. Man will nur kurz was nachschauen und muss den scheiß gleich runterladen. Mit diesem Feature habe ich in [dieser Branche](https://github.com/OliEfr/TUfast_TUD/tree/ModifyHeaders) schon begonnen; es technisch allerdings nicht ganz hinbekommen. Wirde mich wirklich sehr freuen, wenn das jemand schafft.
- **Notenstatistik in Selma**: schöne, graphische Darstellung aller Noten im Selma, zB. mit Charts.js. Aktuell gibts dieses Feature nur für Hisqis.
- **Support Slub-Login**: automatisches Anmelden in Slub-Account. Die Nutzerdaten dafür sollte man in den Einstellungen speichern können.
- **Design-Rework von der Einstellungsseite in TUfast**: Hauptsache Nutzerfreundlicher als es jetzt ist. Am besten sprechen wir uns hier vorher kurz ab.

### 35€ 💸💸
- **Reminder für Ablauf der Campus Sachsen Lizenz (Word & Co)**: Ist im Prinzip einfach zu machen: das Datum wird bei Aktivierung der Lizenz auf https://campussachsen.tu-dresden.de/ angezeigt. Die Berechtigung für die Campussachsen-Website sollte optional sein.
- **Benachrichtigungen für neue Mails im OWA**: Damit habe ich in [dieser Branche](https://github.com/OliEfr/TUfast_TUD/tree/OWAHackFetch) schon begonnen. Das Abrufen der Mails funktioniert. Die ganze Logik drumrum und ein Eintrag auf der Einstellungsseite muss noch implementiert werden.

### 15€ 💸
- Login im [Medizinerportal](https://eportal.med.tu-dresden.de/login) mit ZIH-Login; also Username s1111111 und Password password
- --> du kannst auch gerne Vorschläge für eigene Ideen machen.

## Entwickler
Entwickelt von Studenten, für Studenten:

- Daniel alias https://github.com/C0ntroller
- Tim alias tortletim

... und alle anderen freundlichen Supporter :)

## Kontakt
frage@tu-fast.de
ollidev97@gmail.com

[Datenschutzerklärung](https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing)
