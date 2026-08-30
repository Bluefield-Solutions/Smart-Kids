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

## Wie hier gearbeitet wird: drei Bahnen

Nicht alles wird immer geprüft. Was wann läuft, ist **gemessen** entschieden
— die ganze Kette dauerte 336 s, und 335 davon lagen im Browser.

| Bahn | Wann | Dauer | Was |
|---|---|---|---|
| **`npm run schnell`** | bei **jeder** Änderung | **~46 s** (gemessen, 23 Aufnahmen) | inhalt · spielprobe · vergleich · bauen · budget, dann Rauchtest (Hauptweg) und die zwei Hälften des Bildvergleichs — **drei Browser nebeneinander** |
| `npm run tor` | wenn du unsicher bist, sonst gar nicht | ~5 min (gemessen 4:48) | die volle Kette, alle Größen, alle Bildschirme |
| Runner, bei jedem Push | automatisch | 3–4 min, ohne dich | die volle Kette — und nur bei Grün geht etwas nach `/` |
| Runner, nachts | automatisch | ~20 min, ohne dich | `npm run proben`: alle Gegenproben |

**Die Regel ist einfach: du fährst `schnell`, der Runner fährt den Rest.**

Der Preis, ausgesprochen: ein Layoutfehler auf dem iPhone SE fällt dir nicht
sofort auf, sondern drei Minuten später im Ablauf. Auf dem Gerät der Kinder
landet er trotzdem nie — die Auslieferung fährt die volle Kette und schickt
nur bei Grün.

**Der Rauchtest wartet auf Bedingungen, nicht auf Fristen.** Er hatte
45,5 s in 84 festen Pausen verbracht — ein Viertel seiner Laufzeit. Jetzt
sind es null, und der Bericht nennt die Zahl selbst (*„Blind gewartet"*).
Wer eine feste Pause einbaut, sieht sie dort sofort. Für ein AUSBLEIBEN
(„Lea hört nichts") geht das nicht: dort wird nicht gewartet, sondern
später gelesen.

**Was `schnell` NICHT fährt und warum:** `passt` (54 s, nur bei
Layoutänderungen interessant) · `ziehen` (48 s, ändert sich fast nie) ·
`lesbarkeit`, `pwa`, `offline` (hängen an Marken und Manifest) · den
Rauchtest-Abschnitt `durchgang` (83 s — jede Ebene für beide Kinder, der
gründlichste und teuerste Teil). Alles davon läuft auf dem Runner.

**Die Gegenproben laufen nachts.** Sie prüfen die TORE, nicht die App, und
sie dauern zwanzig Minuten. `rhythmus` stand deshalb bis hierher vorn in der
Kette und verlangte, dass kein Nachweis älter als drei Runden ist — was in
einer einzigen Sitzung dreimal einen vollen Lauf mitten in der Arbeit
ausgelöst hat. Die Frist ist richtig; falsch war, **wer sie bezahlt**.

## Befehle

```
npm run schnell    DIE NORMALE RUNDE. ~46 s. Siehe oben.
npm run tor        die ganze Kette. Der Runner fährt sie ohnehin bei jedem
                   Push; hier nur, wenn du sie vorher sehen willst.
npm run rhythmus   wie alt die Nachweise sind. Bremst nichts mehr —
                   der nächtliche Lauf hält sie frisch.
npm run proben     baut Fehler ein und prüft, ob die Tore anschlagen.
                   Läuft nachts auf dem Runner; hier nur, wenn du ein Tor
                   geändert hast. Ausgewählt wird mit ARGUMENTEN, ohne
                   Strich: `-- smoke` fährt alle Proben dieses Tors,
                   `-- "der Ton spielt auch"` eine einzelne (Teilwort
                   des Namens genügt). Hier stand `--tor passt` und
                   `--nur "..."` — beide Schalter gibt es nicht, sie
                   wären als unbekannte Flags stillschweigend ignoriert
                   worden und hätten den vollen Satz gefahren.
                   Arbeitet in einer Wegwerf-Kopie (`.probenbaum`) — der
                   Arbeitsbaum wird nicht angefasst.
                   Was ANGESCHLAGEN hat, wird festgehalten, auch wenn der
                   Lauf rot ist: sonst wirft ein einziger Befund die
                   Nachweise von siebzig anderen weg.
npm run smoke      spielt die App im Browser durch. `-- --nur=spielen`
                   fährt nur den Hauptweg (28 s statt 138 s).
                   Läuft mit `?flott`: die Jubelpause der App ist dann
                   900 ms statt 2600. Gewartet wird auf BEDINGUNGEN
                   (`bewertet`, `weitergegangen`), nicht auf Fristen —
                   eine Frist ist entweder zu lang oder zu kurz.
                   Abschnitte: spielen · ablage · tippen · regler ·
                   ebene4 · durchgang.
npm run bauen      dist/ (was ausgeliefert wird) + prototyp/spiel.html
npm run ansicht    Bildvergleich. Nur ortsfest, nicht auf dem Runner.
                   `-- --teil=0/2` faehrt die eine Haelfte - geteilt nach
                   AUFWAND, nicht reihum; `schnell`
                   fuehrt beide Haelften nebeneinander und zaehlt nach,
                   dass zusammen ALLE geprueft sind (die Zahl steht nicht hier -
                   sie stand als „sechzehn" da, waehrend es einundzwanzig
                   waren; `schnell` zaehlt sie selbst nach).
                   `-- --nur=quer-vorlauf` nimmt nur die Bildschirme auf,
                   deren Name den Text enthaelt — fuer die Hand, wenn du an
                   einem davon arbeitest. Trifft nichts, ist es rot.
                   `--aktualisieren` erneuert die Vorbilder — bewusst, und
                   im SELBEN Commit einchecken.
npm run backen     Karten neu rechnen
npm run schrift    Andika und Plus Jakarta Sans holen
npm run symbol     App-Symbol neu backen
```

Kette: `inhalt` · `topologie` · `beruehrung` · `marken` ·
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

## Was als Nächstes kommt

`docs/Lernkiste-BACKLOG.md` — sieben Runden aus vier Anforderungen, in der
Reihenfolge ihrer **Tragfähigkeit**, jede mit Ziel und Abnahmekriterium.
Zwei Zwänge stehen darin fest: die Kachelsprache (R2) trägt den
Memory-Vorlauf (R3) und das Elternprofil (R4), und die Länderdaten (R5)
tragen die schwere Erdkunde (R6).

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
9. **Eine Regel, die nur verbietet, hilft nicht, wenn jemand das Verbot
   umgeht.** Hier stand „erst einchecken, dann gegenproben": `npm run
   proben` griff in den Arbeitsbaum ein und räumte mit `git checkout` auf.
   Die Regel hat den Schaden nicht verhindert — beim fünften Mal wurde sie
   mit `--trotzdem` umgangen, und eine ganze Runde war weg. Weggefallen ist
   deshalb nicht die Umgehung, sondern die **Gefahr**: geprobt wird in einer
   Wegwerf-Kopie, der Arbeitsbaum wird nicht mehr angefasst. Mit der Gefahr
   ist die Regel verschwunden — und die Zeremonie „commit, proben,
   nachbessern, nochmal committen" gleich mit.
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
