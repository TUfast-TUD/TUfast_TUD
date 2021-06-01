# TUfast 🚀
TUfast ist eine Browser-Erweiterung, um die Online-Portale der TU Dresden schneller und einfacher nutzerbar zu machen. Das spart Zeit und Nerven!
TUfast ist verfügbar für Firefox, Chrome und Edge über [www.tu-fast.de](https://www.tu-fast.de) und hat aktuell 950+ Nutzer.

TUfast soll für deinen Studiengang angepasst werden? Schreibe uns eine Mail an frage@tu-fast.de mit deinem Vorschlag und melde es am besten zusätzlich deinem [FSR](https://www.stura.tu-dresden.de/fachschaften), welcher uns unterstützen kann!
Aktuell gibt es exklusive Anpassungen für: Maschinenbau und Medizin.

![image](https://user-images.githubusercontent.com/31124624/115123463-72e24980-9fbd-11eb-8ff9-7466ba8e0df2.png)

### Funktionen
 - Automatisches Anmelden in Opal, Selma und Co. (insgesamt über 11 Portale der TU Dresden!)
 - Opal-Kurse und Opal-Favoriten über das Dashbaord öffnen
 - Benachrichtigungen für neue E-Mails im TU Dresden Postfach
 - Abkürzungen in der Google-Suche, z.B. "tumail" öffnet OWA Mail TU Dresden
 - Shortcuts für TU Dresden IT-Services, z.B. Alt+O öffnet Opal
 - Notenstatistik im Hisqisi & coole Tabelle
 - ... weitere Optionen findest du in TUfast :)

### Datenschutz
Die Anwendung sammelt keine Informationen über die Nutzer. Daten werden nur lokal auf dem PC gespeichert und verschlüsselt.
Siehe auch [Datenschutzerklärung](https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing).

## Das Projekt unterstützen❤️❤️❤️
Danke an alle [Contributor](https://github.com/TUfast-TUD/TUfast_TUD/graphs/contributors) und Unterstützer. Das ist großartige Arbeit für die Studierenden und die TU Dresden! 

# TUfast-Entwickler werden
Wenn du auch den Alltag der Studierenden verbessern möchtest, werde jetzt TUfast-Entwickler! Wenn du zwei Funktionen erfolgreich implementiert hast, erhältst du einen Nachweis für dein Engagement im TUfast-Team für deine Unterlagen! :)

# Spenden
[Hier](https://www.buymeacoffee.com/olihausdoerfer) kannst du das Projekt mit einer kleinen Spende unterstützen.

## Zukünftige Entwicklung und Feature Ideen ⭐
Du willst auch das Leben der Studenten an unserer Uni verbessern? Dann schlag ein Feature vor oder fang an zu entwickeln! Hier sind ein paar Ideen, sortiert nach Anzahl der Nachfragen:

### Häufig nachgefragt
- **Portierung für Safari ~[assinged]~**: Dafür gibt es schon einen PR (in Arbeit).
- **Design-Rework von der Einstellungsseite in TUfast**: Noch Nutzerfreundlicher. Noch Übersichtlicher. Noch Besser!
- **Prüfen von Login-Daten**: Damit man bei der Eingabe falscher Login-Daten nicht für die Portale gesperrt wird, sollte TUfast beim speichern der Login-Daten prüfen, ob diese valide sind.
- **Unterstütze https://videocampus.sachsen.de**: Dieses Feature wird häufig nachgefragt. Die Berechtigung für sachsen.de/ muss optional sein! 
- **Praktische Weiterleitung für weitere Suchmaschinen (DuckDuckGo,..)**: Aktuell wird hier nur google supported. [Issue 28](https://github.com/TUfast-TUD/TUfast_TUD/issues/28)
- **Aufrufen Anzahl ungelesener Nachrichten aus Matrix-Chat**: Analog wie die Benachrichtigungen / Icons für neue Mail; nur eben für Matrix. Ist anscheinend vielen wichtig & **macht bestimmt Spaß zu implementieren! :D** Vielleicht macht es Sinn, die Code-Struktur so anzulegen, dass weitere Portale zukünftig leicht hinzugefügt werden können.

### Manchmal nachgefragt
- **Reminder für Ablauf der Campus Sachsen Lizenz**: Das Datum wird bei Aktivierung der Lizenz auf https://campussachsen.tu-dresden.de/ angezeigt. TUfast könnte den Nutzer erinnern die Lizenz zu erneuern, bevor sie abläuft.
- **Benachrichtigungen für neue Noten** im HISQIS, jExam oder Selma.
- **Notenstatistik in Selma**: schöne, graphische Darstellung aller Noten im Selma, zB. mit Charts.js.
- **Notenstatistik in jExam**: schöne, graphische Darstellung aller Noten im jExam, zB. mit Charts.js. Die Informatiker freuen sich bestimmt darüber.
- **AutoLoad Kontostand**: Man könnte den Kontostand von Mensa-AutoLoad abfragen und im Dashboard zeigen!
- **PDF aus OPAL über Kontext-Menu direkt in neuem Fenster öffnen**: Über [diese](https://developer.chrome.com/docs/extensions/reference/contextMenus/) API ist das möglich. Ist ewas eleganter als die aktuelle Lösung mit dem Switch!


### Weiteres
- Migrierung zu [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/).
- Option, die Einstellungen und OPAL-Kurse über die Broweser zu synchronisieren.
- **Ein Masterpasswort** das man jedes mal vor dem AutoLogin eingeben muss um die Anwendung noch sicherer zu machen.
- TUfast für Android (Freifox, und bald auch Chrome)

## Kontakt
frage@tu-fast.de
TUfast Telegram: [t.me/TUfast_TUD](https://t.me/TUfast_TUD)

