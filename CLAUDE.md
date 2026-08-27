# Smart Kids

Erdkunde-Lernspiel für zwei Kinder, deutsch, als PWA über GitHub Pages.
TypeScript-frei bislang: reines ES2022, SVG im DOM, kein Gerüst.

**Diese Datei wird zu Beginn jeder Sitzung gelesen. Sie ist kurz gehalten,
weil eine lange Datei nicht gelesen wird. Alles Ausführliche steht in
`docs/`.**

## Die Rohdaten liegen nicht in Git

`roh/` ist ausgenommen. Zum Bauen und Spielen werden nur die gebackenen
Fassungen in `src/geo/` gebraucht. Wer neue Karten einbaut: `npm run
geo-holen`, dann `npm run backen`, das **Ergebnis** einchecken.

---

## Befehle

```
npm run tor        die ganze Kette. Muss vor jedem Push auf main grün sein.
npm run bauen      dist/ (was ausgeliefert wird) + prototyp/spiel.html (zum Ansehen)
npm run backen     Karten neu rechnen
npm run schrift    Andika und Plus Jakarta Sans holen
npm run symbol     App-Symbol neu backen
```

Kette: `inhalt` · `topologie` · `beruehrung` · `marken` · `schrift` ·
`symbol` · `doku` → `vergleich` → `bauen` → `ansicht` → `pwa` · `offline`
→ `smoke`.

---

## Eiserne Regeln

Jede hat mindestens eine Runde gekostet.

1. **Eine Prüfung, die nie etwas meldet, ist kein Beweis.** Wer eine Wirkung
   misst, schaltet sie zuerst ab. Das Offline-Tor fährt seine Gegenprobe bei
   jedem Lauf mit: ohne Service Worker MUSS es durchfallen.
2. **Grenzen anteilig, nie absolut.**
3. **Das Soll kommt aus der Referenz, nicht aus mir.**
4. **Kein Tor ersetzt den Blick — und kein Blick die Tore.** Zwei Befunde
   kamen vom Gerät, keiner von einem Tor: der Strich quer durch Antarktika
   und das nicht erkennbare Zielgebiet. Beide sind jetzt eingefangen.
5. **Jede Zahl trägt ihre Messstelle mit.** Gemessen woran, in welcher
   Auflösung, in welcher Umgebung.
6. **Was zweimal dasteht, veraltet einmal.** Farben, Abstände und Radien
   stehen NUR in `src/marken/marken.css`; das Tor `marken` setzt das durch.
   Die Torzahl in der Zusammenfassung wird gezählt, nicht geschrieben — dort
   stand „Alle vier Tore grün", während sechs liefen.
7. **Geprüft wird `dist/`, nicht der Prototyp.** `prototyp/spiel.html` ist
   eine Bequemlichkeit zum Verschicken. Was auf das iPad geht, ist `dist/`.
8. **Ein Zufallsgenerator ist erst dann einer, wenn es gemessen ist.** Ein
   einfacher LCG legte die richtige Antwort zehnmal hintereinander auf Platz
   2 oder 3. Jede Einzelprüfung war grün.

---

## Aufbau

```
src/inhalt/    was gefragt wird (Kontinente, Länder, Städte)
src/geo/       gebackene SVG-Pfade, drei Stufen je Ebene
src/kern/      Leitner, Vergleich, Protokoll
src/marken/    das Gestaltungssystem - die EINZIGE Stelle mit Zahlenwerten
src/schrift/   Andika und Plus Jakarta Sans, SIL OFL 1.1
src/symbol/    App-Symbol, aus der echten Küstenlinie gebacken
prototyp/      der spielbare Stand + die PWA-Teile
tools/         Backen, Holen, Symbol
tor/           die Torkette
docs/          Konzept, Prüfbericht, Grafik-Audit, Stand
```

---

## Was der Nutzer erwartet

- Deutsch, auch im Quelltext (Kommentare, Bezeichner, Ausgaben).
- Nach jeder Runde: vier nächste Schritte, davon mindestens einer technisch
  und einer grafisch.
- Getestet wird auf **iPhone und iPad, quer**. Dort wird geurteilt.
- Gestaltung zählt. „User experience, grafisches Design etc. ist mir
  persönlich extrem wichtig."
