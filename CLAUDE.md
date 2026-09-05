# Smart Kids

Lernspiel für zwei Kinder und ihre Eltern, deutsch, als PWA über GitHub
Pages. Vier Welten: **Erdkunde, Rechnen, Schreiben, Englisch** — die vierte
seit E3, und sie ist die letzte, die auf das Zielgerät passt (gemessen: die
Wand fasst genau vier Kacheln).
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
— die ganze Kette dauert 620 s, wenn alles nacheinander läuft, und 610 davon
liegen im Browser. Seit P1 laufen die Browsertore nebeneinander: `smoke` in
vier Teilen, `passt` und `ansicht` in je drei, zehn davon gleichzeitig.
**Unter 100 s.**

| Bahn | Wann | Dauer | Was |
|---|---|---|---|
| **`npm run tor -- --betroffen`** | bei **jeder** Änderung | **14 s bis 200 s**, je nachdem, was `git` meldet | alle billigen Tore plus die Browsertore, die von den geänderten Dateien überhaupt erreicht werden können |
| `npm run tor` | **einmal** je Runde, vor dem Einchecken | **~3 min** (gemessen 176,6 · 179,6 · 182,4 · 198,6 · 204,0 s am 04.09.) | die volle Kette, alle Größen, alle Bildschirme |
| Runner, bei jedem Push | automatisch | 3–4 min, ohne dich | dieselbe Kette ohne `ansicht` — und nur bei Grün geht etwas nach `/` |
| Runner, nachts um 04:00 | automatisch | **~35 min**, ohne dich | die volle Kette **und** alle 339 Gegenproben, 6 nebeneinander |

**Die Regel: du fährst `--betroffen`, einmal je Runde die volle Kette, den
Rest fährt der Runner.**

*Die eine Ausnahme, eng gefasst:* berührt eine Runde **ausschließlich**
`docs/`, `CLAUDE.md`, `README.md` oder `tor/proben-*`, dann ist
`--betroffen` schon der vollständige Lauf — nichts davon erreicht den Bau,
und kein Browsertor kann etwas anderes sehen als vorher. Die volle Kette
davor wäre genau die drei Minuten, gegen die diese Bahn gebaut wurde.
Sobald **eine** Datei außerhalb dieser Liste dabei ist, gilt die Regel
ohne Ausnahme: die volle Kette ist dann der Schutz gegen eine falsche
Zuordnung, und den braucht sie.

`--betroffen` nimmt **kein Argument**. Aussuchen kann man nichts; welche
Dateien geändert sind, sagt `git status`, und die Zuordnung Datei → Tor steht
in `tor/kette-liste.mjs` neben der Kette. Was dort nicht steht, fällt auf
**alle** Tore zurück — eine Datei, die niemand eingetragen hat, ist die
gefährlichste. Der Lauf nennt oben die geänderten Dateien und die
ausgelassenen Tore beim Namen und sagt grün wie rot dazu, dass er nichts
freigibt.

Gemessen am Tag des Umbaus: eine Änderung nur an `docs/` fuhr **14,5 s statt
200 s**. Der Anlass war gerechnet, nicht gefühlt — eine Runde kostete rund
37 Minuten Maschinenzeit, und ein voller Kettenlauf nach einer reinen
Doku-Änderung war davon der größte einzelne Posten.

**`npm run schnell` ist weg** (04.09.). Es fuhr einen FESTEN Ausschnitt
(`smoke --nur=spielen`) statt eines abgeleiteten, hatte **keine einzige
Gegenprobe** — und war **rot**, seit `smoke` seinen Fremdgriff-Prüfbereich
bekommen hat: „Der Fremdgriff hat keinen einzigen Aufgabenbildschirm
gesehen." Niemand hat es gemerkt, weil niemand es fuhr; CLAUDE.md empfahl es
trotzdem als die normale Runde. Ein Werkzeug, das immer dasselbe auslässt,
egal was sich geändert hat, ist genau der Schalter, vor dem
`tools/kette.mjs` warnt.

**`ansicht` von Hand: in drei Teilen nebeneinander.** Ein Prozess braucht
150 s, drei brauchen **44 s** — dieselbe Arbeit, dieselben 37 Aufnahmen:

```
for i in 0 1 2; do node tor/ansicht.mjs --teil=$i/3 & done; wait
```

**Die Gegenproben laufen nachts.** Sie prüfen die TORE, nicht die App, und
sie dauern zwanzig Minuten. `rhythmus` stand deshalb bis hierher vorn in der
Kette und verlangte, dass kein Nachweis älter als drei **Runden am Code**
ist — was in einer einzigen Sitzung dreimal einen vollen Lauf mitten in der
Arbeit ausgelöst hat. Die Frist ist richtig; falsch war, **wer sie bezahlt**.

Und falsch war auch die **Größe**: ein Commit ist kein Maß für Veränderung.
Nach einer Arbeitssitzung stand das Tor auf 47 Runden Rückstand, obwohl jede
Probe am selben Tag bezeugt worden war. Es zählt jetzt in **Tagen** — das
misst, was es abfangen soll (dass der Lauf nicht mehr stattfindet), und
hängt nicht an der Commit-Gewohnheit. Ob eine Probe durch eine Änderung
stumm geworden ist, beantwortet dafür `inhalt` in einer Millisekunde:
**findet jede Gegenprobe ihren Suchtext noch?** Fünf der sieben stummen
Proben hätten genau daran angeschlagen.

## Befehle

```
npm run tor -- --betroffen
                   DIE NORMALE RUNDE. 14 s bis 200 s. Siehe oben.
npm run tor        die ganze Kette, rund 3 min. Der Runner fährt sie ohnehin
                   bei jedem Push; hier nur, wenn du sie vorher sehen
                   willst. Sie schreibt seit Q40 jeden Lauf VOLLSTÄNDIG
                   nach `.kette/letzter.log`, einen roten zusätzlich in
                   eine eigene Datei mit Zeitstempel (die letzten fünf
                   bleiben). Der Anlass: ein Lauf war rot, der nächste
                   grün, und der Grund war nicht mehr zu ermitteln. Die billigen Tore laufen nacheinander und
                   brechen beim ersten Rot ab; die sechs Browsertore laufen
                   NEBENEINANDER, zehn Läufe zur Zeit (100 s statt 620 s):
                   `smoke` zerfällt in vier Teile, `passt` und `ansicht` in
                   je drei — und sie brechen NICHT ab, man sieht also in
                   einem Lauf, was alles rot ist. Zweieinhalb Bänder je
                   Kern, und es hilft trotzdem: diese Tore rechnen kaum,
                   sie warten. Die Liste steht in `tor/kette-liste.mjs`,
                   der Läufer in `tools/kette.mjs`; `SMARTKIDS_BECKEN`
                   setzt die Breite.
npm run bildprompt DIE BILD-PROMPTS FÜR E4. Ohne Argument die elf Blätter mit
                   ihren Wörtern, `-- <blatt>` einen vollständigen Prompt zum
                   Kopieren, `-- --alle` alle elf. Ein Prompt = EIN Bild mit
                   zehn Feldern (5 × 2), danach in ein 5×2-Raster
                   schneiden. Der Stil-Block steht in `tools/bildprompt.mjs`
                   genau einmal; die Motive stehen als Daten in
                   `src/inhalt/englisch.js` und werden wortwörtlich
                   eingesetzt. `inhalt` prüft, dass jedes der 151 Wörter in
                   genau einer der drei Mengen steht (Bild · Farbfleck ·
                   Funktionswort) und dass jedes Blatt zehn Felder hat.
npm run korpus     der Weg zur eingefrorenen Hälfte des Sprachkorpus.
                   `-- <export.json>` legt eine Urteilsliste an (der Export
                   kommt aus dem Elternbereich, „Als JSON sichern"),
                   `-- --einfrieren` baut daraus den Korpus. Dazwischen
                   liegt Handarbeit, und die ist der Punkt: das Urteil darf
                   NICHT aus `ergebnis` kommen — das ist die Entscheidung
                   des Abgleichs, den der Korpus prüfen soll.
npm run rhythmus   wie alt die Nachweise sind. Steht seit Q39e wieder VORN
                   in der Kette und kostet Millisekunden. Der nächtliche
                   Lauf hält 257 der 270 frisch — die anderen dreizehn
                   (zwölf an `ansicht`, einer an der Schriftmessung in
                   `passt`) entstehen nur hier, und dort werden sie
                   genannt statt angemahnt. Sonst stellte die Frist für
                   sie niemand.
npm run proben     baut Fehler ein und prüft, ob die Tore anschlagen.
                   Läuft nachts auf dem Runner; hier nur, wenn du ein Tor
                   geändert hast. Sechs Arbeiter, GEWICHTET verteilt: jede
                   Probe trägt ihre gemessene Dauer im Stand, und der Läufer
                   packt danach (`-- --arbeiter=N` setzt die Zahl).
                   Vorher reihum und 39 min — dabei lief in den letzten
                   zehn Minuten genau ein Prozess. Ausgewählt wird mit ARGUMENTEN, ohne
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
npm run regeln     prüft jeden Verweis „Regel N" gegen die Liste oben: die
                   Nummer muss es geben (Fehler), und im Satz daneben soll
                   ein Wort aus der Regel stehen (Ratsche, `-- --neu`
                   bestätigt den Stand). Beim ersten Lauf zeigten 101 von
                   197 Verweisen in die Regelliste eines ANDEREN
                   Verzeichnisses.
npm run doppelt    findet Quelltext, der zweimal dasteht (Regel 6) — in
                   TOKEN, nicht in Zeilen, sonst entgeht ihm jede Kopie,
                   die jemand umformatiert hat. Was zweimal dastehen DARF,
                   steht in `tor/doppelt-erlaubt.json`, und jeder Eintrag
                   braucht einen Satz, warum. `-- --neu` schreibt die
                   Liste neu — danach von Hand begründen, sonst bleibt es
                   rot.

npm run smoke      spielt die App im Browser durch. `-- --nur=spielen`
                   fährt nur den Hauptweg (28 s statt 138 s).
                   Läuft mit `?flott`: die Jubelpause der App ist dann
                   900 ms statt 2600. Gewartet wird auf BEDINGUNGEN
                   (`bewertet`, `weitergegangen`), nicht auf Fristen —
                   eine Frist ist entweder zu lang oder zu kurz.
                   Abschnitte: spielen · ablage · tippen · regler ·
                   ebene4 · durchgang · landschaft.
npm run bauen      dist/ (was ausgeliefert wird) + prototyp/spiel.html
npm run ansicht    Bildvergleich. Nur ortsfest, nicht auf dem Runner.
                   `-- --teil=0/3` faehrt ein Drittel - geteilt nach
                   AUFWAND, nicht reihum. Die Kette faehrt alle drei
                   nebeneinander und zaehlt nach, dass zusammen ALLE
                   geprueft sind (die Zahl steht nicht hier - sie stand als
                   „sechzehn" da, waehrend es einundzwanzig waren; die
                   Kette zaehlt sie selbst nach). Von Hand:
                   `for i in 0 1 2; do node tor/ansicht.mjs --teil=$i/3 & done; wait`
                   - 44 s statt 150.
                   `-- --nur=quer-vorlauf` nimmt nur die Bildschirme auf,
                   deren Name den Text enthaelt — fuer die Hand, wenn du an
                   einem davon arbeitest. Trifft nichts, ist es rot.
                   `-- --zeiten` sagt, was jede einzelne Aufnahme kostet.
                   Dafuer da: die Gewichte der Aufteilung sind eine
                   Schaetzung, und eine Schaetzung ohne Messstelle veraltet.
                   `--aktualisieren` erneuert die Vorbilder — bewusst, und
                   im SELBEN Commit einchecken.
npm run backen     Karten neu rechnen
npm run schrift    Andika und Plus Jakarta Sans holen
npm run symbol     App-Symbol neu backen
npm run schreiben  misst die Buchstabenerkennung: erkennt sich jede Vorlage
                   selbst, wird krumm Geschriebenes gelesen, wird Gekritzel
                   abgelehnt, gilt ein halber Zug nicht als nachgefahren
npm run gleichlauf prüft den Geräteabgleich ohne Browser und ohne Netz:
                   Schlüssel, Raum, Schloss, den Dienst selbst, und ob beim
                   Zusammenführen zweier Stände jemand etwas verliert
npm run dienstprobe -- <adresse>   spricht der AUFGESETZTE Dienst das
                   Protokoll? Legt in einem Wegwerfraum ab und geht wieder.
npm run zweigeraete  zwei Browser-Kontexte, ein echter Dienst — die eine
                   Naht, die kein Tor bewacht. Braucht einen Bau mit
                   SMARTKIDS_GLEICHLAUF; siehe den Kopf des Werkzeugs.
npm run ohneschrift  AUDIT A: geht Fionas Weg auf dem Zielgerät ab und
                   zählt, was ihr NICHTS sagt — kein Bild, keine Ziffer,
                   keine Stimme. Schreibt dazu Aufnahmen nach `blick/`,
                   auf denen die Buchstaben vertauscht sind: so sieht ein
                   Bildschirm aus, wenn man ihn nicht lesen kann. Kein
                   Tor, ein Blickwerkzeug — `--selbst` prüft nur den
                   Messer selbst.
```

Kette: `rhythmus` → `inhalt` · `saetze` · `topologie` · `beruehrung` · `marken` · `abzeichen` ·
`schrift` · `symbol` · `farben` · `englisch` · `tiere` · `betroffen` · `doku` → `regeln` → `doppelt` → `spielprobe` → `schreiben` → `vergleich` →
`gleichlauf` → `bauen` →
`budget` · `anker` → `passt` → `lesbarkeit` → `ziehen` → `ansicht` → `pwa` ·
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

`docs/Lernkiste-BACKLOG.md`. Seit dem 30.08.2026 ist es **nach Nutzen für
die Spieler sortiert**, nicht mehr nach Tragfähigkeit: oben steht, was
Fiona, Lea oder die Eltern in der nächsten Sitzung von selbst merken. Die
sieben gefahrenen Runden R1 bis R7 stehen im Archiv (§ 5), die Zwänge
zwischen den offenen Punkten in § 0.

**Zwei Abschnitte darin sind kein Text, sondern Eingabe für Tore** (§ 2):
die Tabelle der drei Profile — `tor/smoke.mjs` liest daraus Namen, Tiefe,
Sitzungslänge, Auswahlverbot, Ton und Vorlesen — und die Tabelle der drei
Rechensorten, aus der `tor/inhalt.mjs` die 158 Aufgaben der Eltern
nachzählt. Beide werden **der Reihe nach** gelesen. Wer dort eine Zeile
umbenennt oder eine Spalte einfügt, ohne die Tore mitzuziehen, nimmt ihnen
ihr Soll — der Grund ist Regel 3: das Erwartete darf nicht aus der Datei
kommen, die geprüft wird.

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
12. **Ein Raster ist nur so fein wie sein kleinstes Ziel.** Der Rauchtest
   zog ein Etikett auf Berlins Anker und landete auf Brandenburg; gemeldet
   wurde eine Zeitüberschreitung statt „daneben". Wer eine Fläche abtastet,
   muss das kleinste treffen können, das darin vorkommt.
13. **Safari-Falle: kein Filter, wo ein gebackener Verlauf reicht.** Auf iOS
   wird aus einem SVG-Filter über einer großen Fläche ein schwarzes Bild —
   auf dem Schreibtisch unauffällig. Licht und Schatten werden gebacken,
   nicht gerechnet.
14. **Das Modell darf nicht vom Gemessenen abhängen.** Ein Korpus, der das
   Urteil des Abgleichs übernimmt, misst 100 % Trefferquote — immer, und
   ohne etwas zu beweisen.

15. **Gepusht ist nicht ausgeliefert.** Nach jedem Push wird der Ablauf
   `Auslieferung` nachgesehen — grün oder rot, und bei rot sofort.
   Achtzehn Auslieferungen sind nacheinander rot gewesen, ohne dass es
   jemandem aufgefallen wäre: die Kette war hier grün, auf dem Runner
   nicht, und auf dem iPhone der Kinder stand einen Tag lang die Fassung
   von vorgestern. „Grün bei mir" ist keine Auslieferung.

16. **Der Runner und dieser Rechner müssen denselben Browser fahren.**
   Sonst heißt grün an zwei Orten Verschiedenes. Gemessen am Tag des
   Befunds: hier Chromium 141, auf dem Runner 151 — zehn Hauptversionen
   auseinander, und `passt` und `lesbarkeit` waren dort rot und hier
   grün. Ein Tor, das nur an einem der beiden Orte gilt, entscheidet
   nichts.

   Seit Q18 ist es **erzwungen, nicht aufgeschrieben**: `playwright` steht
   in `package.json` auf den Punkt genau (1.56.1 → Bau 1194 →
   141.0.7390.37, der Browser, der hier liegt), und `starte()` in
   `tor/chromium.mjs` vergleicht bei jedem Start die Fassung des wirklich
   gestarteten Browsers mit der, die `browsers.json` erwartet. Ein `npm
   update` zieht die beiden Orte damit nicht mehr still auseinander — es
   wird sofort rot, an beiden.

Die Nummern sind keine Zierde: das Tor `regeln` prüft jeden Verweis der
Form „Regel N" gegen diese Liste — die Nummer muss es geben, und im Satz
daneben muss ein Wort aus ihrer Überschrift stehen. Vorher zeigten 101 von
197 Verweisen in die Regelliste eines **anderen** Verzeichnisses.

---

## Aufbau

```
src/inhalt/    was gefragt wird (Kontinente, Länder, Städte, Rechnen,
               Buchstaben, Englisch)
src/geo/       gebackene SVG-Pfade, drei Stufen je Ebene
src/kern/      Leitner, Vergleich, Protokoll
src/marken/    das Gestaltungssystem - die EINZIGE Stelle mit Zahlenwerten
src/schrift/   Andika und Plus Jakarta Sans, SIL OFL 1.1
src/symbol/    App-Symbol, aus der echten Küstenlinie gebacken
prototyp/      der spielbare Stand + die PWA-Teile
tools/         Backen, Holen, Symbol
tor/           die Torkette
docs/          Konzept, Prüfbericht, Grafik-Audit, Stand
docs/referenz/ die amtlichen Listen im Wortlaut - das SOLL der Datentore,
               damit es nicht aus der geprüften Datei selbst kommt
```

---

## Was der Nutzer erwartet

- Deutsch, auch im Quelltext (Kommentare, Bezeichner, Ausgaben).
- Nach jeder Runde: vier nächste Schritte, davon mindestens einer technisch
  und einer grafisch — **als Reihenfolge, nicht als Liste**, und so
  geschnitten, dass sie mit dem vorhandenen Budget abzuarbeiten sind.
  Also je Schritt: was er kostet, warum er an dieser Stelle steht, was mit
  ihm in **dieselbe** Runde gehört (gleiche Tore, gleiche Dateien — ein
  Kettenlauf statt drei), was vorher passieren muss, damit das Nächste
  nicht zweimal gemacht wird, und welcher Schritt sich abschneiden lässt,
  wenn es nicht reicht.

  Die Einheit, in der geplant wird, ist die **Runde = ein voller
  Kettenlauf, ~220 s**. Ein Schritt, der ein Tor ändert, gehört vor den,
  den dieses Tor danach hütet; ein Schritt, der ein Bild abnimmt
  (`ansicht`), gehört hinter jede Änderung am Grundriss — sonst wird
  dasselbe Bild zweimal erneuert. Wo eine Zahl im Spiel ist (Startbündel
  von 700 KB, Ebene von 250, Fingermaß 44), steht sie dabei.
- Getestet wird auf **iPhone und iPad, quer**. Dort wird geurteilt.
- Gestaltung zählt. „User experience, grafisches Design etc. ist mir
  persönlich extrem wichtig."
