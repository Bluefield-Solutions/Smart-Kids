# Smart Kids

Lernkiste für Fiona und Lea: **Erdkunde, Rechnen und Schreiben** in einer
Datei. Läuft im Browser, lässt sich auf dem iPhone oder iPad über
„Zum Home-Bildschirm" ablegen und startet von dort auch ohne Netz.

**Im Netz:** https://bluefield-solutions.github.io/Smart-Kids/

---

## Was drin ist

**Erdkunde** — Kontinente · Länder in Europa, Afrika, Asien, Nordamerika,
Mittelamerika und Südamerika · Bundesländer · Landeshauptstädte ·
Hauptstädte in Europa.

**Rechnen** — Plus und Minus bis 10 (Fiona) · Reihen 6 bis 10 (Lea) ·
Großes Einmaleins (Eltern).

**Schreiben** — Buchstaben nachfahren und hören, Zahlen nachfahren und
hören (Fiona).

Vier Profile mit eigener Tiefe und eigenen Eingabewegen: **Fiona** (6)
zieht Etiketten und darf sprechen, **Lea** (8) zieht, tippt und darf
sprechen, **Stephan** und **Violeta** tippen und sprechen und bekommen nie
eine Auswahl. Die Sprachausgabe liest jede Frage vor — Fiona liest noch
nicht, und ohne Vorlesen käme sie nicht los.

Der Fortschritt läuft über ein **Leitner-System** mit fünf Fächern und liegt
in IndexedDB auf dem Gerät. Er geht nirgendwohin.

---

## Auf dem iPad ablegen

1. Die Adresse oben in **Safari** öffnen (nicht in Chrome — nur Safari legt
   auf iOS eine App auf den Home-Bildschirm).
2. Teilen-Knopf → **Zum Home-Bildschirm**.
3. Name bestätigen. Das Symbol steht danach zwischen den anderen Apps, und
   die Seite startet ohne Adresszeile — und ohne Netz.

Der Fortschritt liegt **je Gerät** getrennt: was auf dem iPhone geübt wurde,
steht nicht auf dem iPad.

---

## Befehle

```
npm run tor        die ganze Kette. Muss vor jedem Push auf main grün sein.
npm run bauen      dist/ und die eine Datei zum Ansehen
npm run backen     Karten aus den Rohdaten neu rechnen (braucht roh/)
npm run geo-holen  die Rohdaten beschaffen
npm run schrift    Andika und Plus Jakarta Sans holen (einmalig)
npm run symbol     das App-Symbol neu backen
```

Die Torkette steht als Daten in `tor/kette-liste.mjs` und wird von
`tools/kette.mjs` gefahren — nicht hier abgeschrieben, sonst veraltet sie.
`npm run tor -- --betroffen` fährt nur die Tore, die von den geänderten
Dateien erreicht werden können, `npm run tor` die ganze
(rund 105 s, zehn Browser nebeneinander).

`ansicht` läuft **nur ortsfest**. Ein Bildpunktvergleich gilt nur bei
gleicher Zeichenumgebung; der Runner hat einen anderen Chromium-Bau und
andere Ersatzschriften. Auf dem Runner läuft `npm run tor:runner` — dieselbe
Kette ohne dieses eine Tor, und es meldet den Verzicht im Protokoll.

---

## Wie ausgeliefert wird

Push auf `main` → `.github/workflows/auslieferung.yml` fährt **erst die
Torkette, dann erst den Versand**. Was rot ist, geht nicht auf das iPad.

Pages muss dafür auf **Source = GitHub Actions** stehen (Settings → Pages).

---

## Woher die Daten kommen

- **Karten:** Natural Earth (Public Domain), 1:50m und 1:10m.
  Für die Bundesländer ist **BKG VG250** vorgesehen (Datenlizenz Deutschland
  Namensnennung 2.0, © GeoBasis-DE / BKG); bis dahin steht dort ebenfalls
  Natural Earth — gut genug zum Entwerfen, zu grob zum Ausliefern.
- **Schriften:** Andika (SIL) und Plus Jakarta Sans (Tokotype), beide unter
  der SIL Open Font License 1.1. Siehe `src/schrift/HERKUNFT.md`.

Ausführlich: `docs/Lernkiste-KONZEPT.md`, Stand in `docs/Lernkiste-STAND.md`.
