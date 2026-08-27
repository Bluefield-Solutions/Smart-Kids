# Smart Kids

Erdkunde für Fiona und Lea. Vier Ebenen, 64 Gebiete, drei Eingabewege.
Läuft im Browser, lässt sich über Safari auf den Startbildschirm legen und
startet von dort auch ohne Netz.

**Im Netz:** https://bluefield-solutions.github.io/Smart-Kids/

---

## Was drin ist

| Ebene | Was | Wieviel |
|---|---|---|
| 1 | Kontinente | 7 |
| 2 | die größten Länder je Kontinent | 25 |
| 3 | Bundesländer | 16 |
| 4 | Landeshauptstädte | 16 |

Zwei Profile. **Fiona** (6) zieht Etiketten und darf sprechen, **Lea** (8)
zieht und tippt. Auf Ebene 4 stehen bei beiden **vier Städte** zur Auswahl:
gefragt ist, *welche* Stadt es ist, nicht wie man sie schreibt.

Der Fortschritt läuft über ein **Leitner-System** mit fünf Fächern und liegt
in IndexedDB auf dem Gerät. Er geht nirgendwohin.

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

Die Torkette: `inhalt` · `topologie` · `beruehrung` · `marken` · `schrift` ·
`symbol` · `doku` → `vergleich` → `bauen` → `ansicht` → `pwa` · `offline`
→ `smoke`.

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
