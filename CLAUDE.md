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
npm run proben     baut Fehler ein und prüft, ob die Tore anschlagen.
                   Verlangt einen sauberen Baum — sie arbeitet mit
                   `git checkout` und löschte sonst die frische Arbeit.
                   Voll 35,6 min; `-- --geaendert` fährt nur die Proben,
                   deren Datei oder Tor seit dem letzten vollen Lauf
                   angefasst wurde — meist unter einer Minute. Die
                   Abkürzung schreibt KEINEN Stand, sonst wäre die Regel
                   „alle drei Runden" still ausgehebelt.
npm run smoke      spielt die App im Browser durch. `-- --nur=spielen,tippen`
                   fährt nur einzelne Abschnitte (spielen · ablage · tippen ·
                   ebene4 · durchgang) — dasselbe Mittel wie bei `ziehen`, und
                   der Grund, warum ein voller Probenlauf nicht mehr eine
                   halbe Stunde dauert.
npm run bauen      dist/ (was ausgeliefert wird) + prototyp/spiel.html (zum Ansehen)
npm run ansicht    Bildvergleich. Nur ortsfest, nicht auf dem Runner.
                   `--aktualisieren` erneuert die Vorbilder — bewusst, und
                   im SELBEN Commit einchecken.
npm run backen     Karten neu rechnen
npm run schrift    Andika und Plus Jakarta Sans holen
npm run symbol     App-Symbol neu backen
```

Kette: `rhythmus` → `inhalt` · `topologie` · `beruehrung` · `marken` ·
`schrift` · `symbol` · `doku` → `spielprobe` → `vergleich` → `bauen` →
`budget` → `passt` → `lesbarkeit` → `ziehen` → `ansicht` → `pwa` ·
`offline` → `smoke`.

### Zwei Wege ins Netz

| Zweig | Was läuft | Wohin | Dauer |
|---|---|---|---|
| `main` | die volle Kette (`auslieferung.yml`) | `/` — dort spielen die Kinder | 4,2 min |
| `vorschau` | nur die Tore ohne Browser (`vorschau.yml`), dann `vorschau-versand.yml` | `/vorschau/`, mit Marke im Bild | 45 s (23 + 22) |

Versandt wird **immer vom Standardzweig aus**: die Umgebung `github-pages`
nimmt Auslieferungen nur von dort an. `vorschau-versand.yml` hängt deshalb
an `workflow_run` — so läuft es im Zusammenhang von `main`. Es baut `main`
neu, ohne die Kette zu fahren, und fragt deshalb vorher bei GitHub nach, ob
genau dieser Commit schon einmal ausgeliefert wurde. Sonst käme Ungeprüftes
unter `/`.

Die Vorschau ist zum **Ansehen**, nicht zum Ausliefern: `passt`,
`lesbarkeit`, `ziehen`, `ansicht`, `pwa`/`offline` und `smoke` laufen dort
nicht. Was sie nicht prüft, steht namentlich in `vorschau.yml`, und das Tor
`doku` schlägt an, wenn ein Tor dazukommt, das dort weder gefahren noch
genannt ist.

Beide Abläufe stellen **beide** Hälften zusammen
(`tools/seite-zusammenstellen.mjs`). Täte es nur einer, löschte jede
Auslieferung die Vorschau — und jeder Versand der Vorschau das ausgelieferte
Spiel. Das Tor `doku` prüft genau das: jede Ablaufdatei, die einen
Pages-Anhang hochlädt, muss vorher zusammengestellt haben.

Diese Aufzählung wird **verglichen, nicht geglaubt**: das Tor `doku` legt
sie neben `npm run tor` in `package.json` und neben die Überschriften der
Tore, die weitere in sich tragen. Sie stand einmal sechs Tore im Rückstand,
und wer diese Datei las — sie wird zu Beginn jeder Sitzung gelesen —, hielt
sechs Tore für nicht vorhanden.

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
9. **Erst einchecken, dann gegenproben.** `npm run proben` arbeitet mit
   `git checkout` und verweigert deshalb den Dienst bei schmutzigem Baum.
10. **Jede Probe prüft zuerst, ob ihr Eingriff angekommen ist.** Ein nicht
   angekommener Eingriff sieht aus wie ein bestandenes Tor.
11. **Ein abgestürztes Tor besteht jede Gegenprobe.** `tor/inhalt.mjs`
   importierte nach dem Streichen von Antarktika eine gelöschte Datei;
   sieben Prüfungen starben vor ihrer ersten Zeile. „Muss rot werden" ist
   erfüllt, wenn ein Tor immer rot ist — deshalb fragt `proben` bei jedem
   roten Tor nach, ob es OHNE Eingriff grün gewesen wäre.

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
