# Lernkiste — Stand

Was gebaut ist, was gemessen ist, was offen bleibt. Ergänzt Konzept K3, den
Prüfbericht und das Grafik-Audit; ersetzt keines davon.

Stand: nach M0-Vorarbeit, M2, MG, dem Tor `ansicht`, **M3 bis M6**, der
Sichtrunde, dem **Umzug nach `Bluefield-Solutions/Smart-Kids`** samt PWA und
Auslieferung, der Ausbau-, der Spieler-, der Gestaltungs-, der Zieh-, der Proben-,
der Budget-, der Übergangs-, der Geräte-, der Umschalter-, der Vorlese- und
der **Audit-Runde**.

> **Der Baum ist umgezogen.** Gearbeitet wird in
> `Bluefield-Solutions/Smart-Kids`, nicht mehr in `towerfront/lernkiste`.
> Diese Datei liegt dort unter demselben Namen weiter.

---

## Was läuft

```
npm run backen      Kartenpipeline: Kontinente, Deutschland, Länder, Städte
npm run ansicht     Bildvergleich, 13 Aufnahmen — vier davon auf dem
                    Zielgerät (iPhone quer). Nur ortsfest.
npm run bauen       baut prototyp/spiel.html und dist/
npm run tor         die ganze Kette
npm run proben      die 56 stehenden Gegenproben (Baum muss sauber sein,
                    höchstens drei Runden alt)
                    `npm run proben ziehen` fährt nur eines
npm run budget      Größenzusagen aus Konzept K3, plus Ratsche
npm run proben -- --geaendert
                    nur die Proben, deren Datei oder Tor seit dem
                    letzten vollen Lauf angefasst wurde
```

Die Kette, in dieser Reihenfolge:

```
rhythmus → inhalt · topologie · beruehrung · marken · schrift · symbol · doku
  → spielprobe → vergleich → bauen → budget → passt → lesbarkeit → ziehen
  → ansicht → pwa · offline → smoke
```

**Die Torkette ist grün.** Neunzehn Prüfungen — und „mit Gegenprobe belegt"
ist keine Behauptung mehr, sondern ein Lauf: **56 Gegenproben, alle schlagen
an**, und `rhythmus` lässt sie nicht älter als drei Runden werden.

Seit der Audit-Runde vergleicht sich die Aufzählung darüber selbst: das Tor
`doku` legt die Kette in `CLAUDE.md` neben `npm run tor` in `package.json`.
Sie lag einmal sechs Tore zurück — und `inhalt` war zur selben Zeit **tot**.

---

## Gemessen, nicht geschätzt

Alle Stufen halten die Hausdorff-Grenze von **0,75 Bildpunkten** ein. Die
Spalten sind grob · mittel · fein, jeweils gzip.

| Ebene | grob | mittel | fein | Hausdorff max |
|---|---|---|---|---|
| Kontinente | 29,7 KB | 105,0 KB | 134,2 KB | 0,74 px |
| Deutschland | 34,3 KB | 55,7 KB | 57,5 KB | 0,52 px |
| Länder Asien | 95,8 KB | 194,3 KB | 268,1 KB | 0,69 px |
| Länder Afrika | 66,2 KB | 132,0 KB | 154,8 KB | 0,69 px |
| Länder Europa | 105,6 KB | 186,5 KB | 220,5 KB | 0,73 px |
| Länder Nordamerika | 74,2 KB | 188,9 KB | 253,4 KB | 0,74 px |
| Länder Südamerika | 62,0 KB | 108,7 KB | 137,9 KB | 0,74 px |
| Antarktika, polar | 7,8 KB | 15,3 KB | 19,0 KB | 0,71 px |

**Das Budget hält, mit einer Ausnahme.** Konzept K3 setzt „< 250 KB je
nachgeladener Ebene". Asien fein (268 KB) und Nordamerika fein (253 KB) liegen
darüber. Beide werden auf Ebene 2 aber nur in der **mittleren** Stufe gezeigt —
dort ist der Kontinent formatfüllend, nicht ein einzelnes Land. Die feine
Stufe entsteht trotzdem, weil sie nichts kostet, solange sie niemand lädt.

Das Startbündel braucht nur `kontinente.grob`: **29,7 KB**. Die 90-KB-Grenze
aus K3 ist damit zu einem Drittel ausgenutzt.

---

## Vier Zahlen, die sich geändert haben

**64 Gebiete statt 69.** K2 und K3 rechneten mit 30 Ländern — als gäbe es
sechs Kontinente mit Ländern. Es sind fünf: Australien ist ausgenommen,
Antarktika hat keine. 5 × 5 = 25. Gefunden hat es das Tor `inhalt` beim
ersten Lauf; die Zahl wird jetzt gezählt und gegen das Konzept geprüft.

**14 von 16 Bundesländernamen passen nicht ins Gebiet.** Gemessen am Pol der
Unzugänglichkeit gegen die Textbreite, bei 470 px Kartenbreite. Nur Hessen und
Bayern haben Platz. **Die Fahne ist der Normalfall, nicht die Ausnahme** —
Befund G10 ist damit größer als gedacht.

**Vier Gebiete brauchen eine entkoppelte Trefferfläche:** Bremen 9,4 pt,
Hamburg 16,8 pt, Berlin 17,9 pt, Saarland 32,3 pt. Und ein Paar überlappt sich
dabei: Brandenburg/Berlin liegen 4 pt auseinander. Im Prototyp ist es
umgesetzt — unsichtbare 44-pt-Kreise um den Anker, das kleinere Gebiet
gewinnt.

**Antarktika ist gelöst.** Der offene Punkt aus MG: in jeder Weltprojektion
liegt es als Sockel am unteren Rand. Es gibt jetzt eine **polare Aufsicht**
(azimutal flächentreu, auf den Südpol gedreht, 7,8 KB grob). Runde 3 bekommt
damit eine eigene Ansicht. Auf der Weltkarte kommt es **gar nicht mehr vor** —
sonst bliebe unten ein grauer Sockel stehen, der wie ein Fehler aussieht.

---

## Die Sichtrunde

Drei Befunde vom Gerät, keiner davon von einem Tor gemeldet.

**1. Man sah nicht, welches Gebiet gefragt ist.** Alle Flächen sahen gleich
aus, das Ziel war nur an einer etwas anderen Füllung zu ahnen. Jetzt tragen
die anderen `class="ruhig"` (Deckkraft 0,42, Sättigung 0,35), das Ziel behält
seine Farbe und bekommt zwei zusätzliche Umrisse: einen dunklen festen und
einen pulsierenden in der Akzentfarbe (Strichbreite 3 → 9, 1,5 s). Ist das
Ziel kleiner als 190 px, kommt ein hüpfender Zeiger auf den Anker dazu — in
fester **Bildschirmgröße**, also mit `1/k` gegenskaliert, sonst wäre er auf
der Weltkarte winzig und auf Bremen riesig. Bei `prefers-reduced-motion` wird
aus dem Puls ein dicker ruhender Strich. Nach der richtigen Antwort geht alles
aus.

**2. Ein Strich quer durch Antarktika.** Natural Earth speichert den Umriss
für eine **rechteckige** Weltkarte: er läuft bei 180 Grad die Längslinie
hinunter bis lat −89,999, einmal am unteren Rand entlang und bei −180 Grad
wieder hinauf. Auf der Weltkarte deckt sich das mit dem Kartenrand. In der
polaren Aufsicht sind 180 und −180 **dieselbe Linie**: beide Schenkel liegen
aufeinander und zeigen sich als Strich vom Rand bis in die Mitte.

Der Schnitt wird jetzt beim Backen durch **einen** Punkt ersetzt — den echten
Küstenpunkt bei 180 Grad. Gemessen: Fläche und Umgrenzung bleiben
**identisch** (432 160 px², dieselbe BBox), nur der nächste Umrisspunkt zur
Kartenmitte springt von **0,0 px auf 100,4 px**.

**3. Kein Tor hatte etwas davon gesehen** — und das war die eigentliche
Lücke. Beide Befunde sind jetzt eingefangen:

- Das Tor `topologie` sucht **Nadeln**: zwei Punkte desselben Ringes fallen
  aufeinander (< 0,15 px), der Weg dazwischen ist lang (≥ 20 px) und
  umschließt nichts (mittlere Breite < 0,05 px). Eine Naht ändert weder
  Fläche noch Umgrenzung noch Umlaufsinn — sie ist genau an dieser Kombination
  zu fassen. **Gegenprobe gefahren** (Regel 1): auf der alten Geometrie
  meldet es *1 Nadel, längste 236 px*, auf der neuen null.
  Die dünnsten **echten** Gebilde im Vorrat — drei Fjorde in Kanada, eine
  Nehrung in den USA — liegen bei 0,18 bis 0,27 px mittlerer Breite und
  kommen als Hinweis, nicht als Fehler: so stehen sie in der Wirklichkeit.
- Das Tor `ansicht` fotografiert jetzt auch den **lebenden Prototyp**, nicht
  nur die gemalten Entwürfe (`spiel-kontinent`, `spiel-bundesland`). Vorher
  steckte die ganze Spieldarstellung hinter keinem Tor: der Lauf blieb grün,
  während sich jeder Spielbildschirm änderte. Je Aufnahme wird die Ablage
  geleert, damit der Keim aus Sitzungsnummer 0 kommt — dreimal nacheinander
  0 Bildpunkte Unterschied.

---

## Vier stille Fallen beim Bauen

Keine davon wurde rot. Alle vier sind der Grund, warum es die Tore gibt.

1. **`-clean gap-fill-area=20km2` auf unprojizierten Graddaten** löste die
   halbe Geometrie auf. Die Messung meldete danach 0,00 px Abweichung bei
   2,4 % der Punkte — ein perfektes Ergebnis für nichts.
2. **d3-geo erwartet den entgegengesetzten Umlaufsinn zu RFC 7946.** Natural
   Earth liefert im Uhrzeigersinn und läuft; mapshaper dreht um, und danach
   umschließt jede Fläche rechnerisch den Nordpol: `geoBounds` meldet die
   ganze Erde, `fitWidth` liefert Maßstab 0, jede Fläche ist null.
3. **`-dissolve2` gibt eine GeometryCollection zurück** und lief damit an der
   Umlaufsinn-Korrektur vorbei, die nur Features kannte.
4. **Die Inselregel muss je Stufe gelten.** Nur an der feinsten angewandt,
   steckte Fehmarn auch in der groben Stufe, wo es 0,4 × 0,4 Bildpunkte groß
   ist. Die Vereinfachung ließ es zusammenfallen, sein Umriss lag danach weit
   von allem entfernt — und die Abstandsmessung kam nicht unter 59 % Punkte.

Dazu drei Fehler in den Toren selbst, gefunden beim ersten Lauf: der
Umlaufsinn wird im **ausgegebenen** Pfad andersherum gemessen (y zeigt nach
unten), das Markentor las den Abendmodus mit, und das Tor `ansicht` war nicht
deterministisch — eine endlose Animation bleibt auch bei 1 ms Dauer irgendwo
stehen.

---

## M3 bis M6

Vier Kernmodule, alle einzeln prüfbar und ohne DOM:

| Modul | Was |
|---|---|
| `src/vergleich/` | Kölner Phonetik, Damerau-Levenshtein, drei Ausgänge (angenommen · Rückfrage · nochmal), Rechtschreibbewertung |
| `src/kern/leitner.js` | fünf Fächer, deterministische Sitzungsauswahl, Fortschritt |
| `src/profil/ablage.js` | IndexedDB ohne Abhängigkeit, `storage.persist()`, profilweises Löschen |
| `src/protokoll/` | anhängender Ereignisstrom, Auswertung, CSV- und JSON-Ausfuhr |

Im Prototyp sind sie eingebettet — ein kleiner Inliner wickelt jedes Modul in
eine benannte IIFE. Ohne das kollidiert `mischen` aus dem Leitner mit
`mischen` aus dem Spiel, und niemand merkt es.

### Das Tor `vergleich`

| Korpus | Trefferquote | Falsch-Positiv |
|---|---|---|
| erfunden (65 / 43 Fälle) | 100 % | 2,3 % |
| eingefroren | **fehlt noch** — entsteht aus echten Aufnahmen | — |

**Solange die eingefrorene Hälfte fehlt, gilt keine Zielzahl.** Das Tor sagt
das ausdrücklich, statt eine Zahl zu melden, die nichts bezeugt. Es fängt
trotzdem eine offensichtliche Fehlfunktion: ein Abgleich, der alles annimmt,
fällt durch.

Der erste Lauf meldete **11,6 % Falsch-Positiv**: „euro" wurde als Europa
angenommen, „bayer" als Bayern, „afrikaner" als Afrika. Lauter kürzere oder
längere Wörter, die klanglich fast gleich sind. Zwei Regeln haben es
behoben — eine Längenstrafe im Abstand, und die Regel, dass ein Wort, das
eine Silbe zu kurz oder zu lang ist, **nie ohne Rückfrage** angenommen wird.
„Meintest du Bayern?" ist die richtige Antwort auf „Bayer", nicht „richtig".

Was bleibt: **„aussen" wird als „Asien" angenommen.** Die Kölner Phonetik
gibt beiden denselben Code, und sie sind gleich lang. Das ist eine echte
Grenze des Verfahrens, kein Einstellfehler.

## Der Prototyp

`lernkiste/prototyp/spiel.html` — **eine Datei, läuft ohne Server**, 766 KB.

Beide Profile, vier Ebenen (Kontinente, Länder in Europa und Afrika,
Bundesländer, Landeshauptstädte), echtes Ziehen mit Pointer Events, Vorlesen,
Spracherkennung wo verfügbar mit Rückfall auf Stufe C, der Belohnungsmoment,
Abendmodus.

Was der Rauchtest wirklich fährt: Profilwahl → Ebenenwahl → Ziehen →
Belohnung, auf **iPhone quer, iPhone hoch und iPad quer**.

Zwei Layoutfehler hat erst der Rauchtest gefunden: die CSS-Regeln für das
Spielfeld waren auf `#spiel` gezielt, während der Bildschirm gar keine id
hatte — die Karte wuchs auf ihre Eigengröße. Und im Querformat rutschte das
erste Etikett **unter die Kopfleiste**, weil `justify-content: center` bei
Überlauf über die obere Kante hinausschiebt. Der Finger traf dort die Leiste.

Neu mit M3 bis M6: **Ablage in IndexedDB** (der Fortschritt überlebt den
Neustart), **Leitner mit fünf Fächern**, **Forscherbuch** (der Aufkleber ist
der Umriss des Gebiets selbst), die **Stadtstaaten-Lerneinheit** vor Ebene 4,
und der **Elternbereich** hinter einer vierstelligen PIN: Trefferquoten,
Wackelkandidaten, Ausspracheliste, CSV- und JSON-Ausfuhr, profilweises
Löschen, Fassungsstempel, Speicherzustand und die Herkunft der Karten.

**Was der Prototyp NICHT ist:** keine PWA, kein Service Worker, kein
Startbildschirm-Symbol, keine Auslieferung. Das ist M1 und braucht das
Repository.

### Fünf Fehler, die erst der Rauchtest gezeigt hat

1. **Die CSS-Regeln fürs Spielfeld waren auf `#spiel` gezielt**, während der
   Bildschirm gar keine id hatte — die Karte wuchs auf ihre Eigengröße.
2. **Im Querformat rutschte das erste Etikett unter die Kopfleiste**, weil
   `justify-content: center` bei Überlauf über die obere Kante hinausschiebt.
   Der Finger traf dort die Leiste.
3. **Berlins 44-Punkt-Trefferkreis lag über Brandenburgs Anker.** Brandenburg
   war an seiner besten Stelle nicht mehr treffbar. „Das kleinere gewinnt"
   heißt nicht „das kleinere sperrt aus" — die Kreise schrumpfen jetzt, bevor
   sie den Anker eines Nachbarn verschlucken.
4. **Der Aufkleber kam erst bei Fach 5**, also nach vier richtigen Antworten
   über drei Wochen. Für eine Sechsjährige bliebe das Forscherbuch wochenlang
   leer. Jetzt ab Fach 3, mit einem Siegel bei Fach 5.
5. **Die Auffüllung der Sitzung bevorzugte Neues vor Angefangenem.** Ein Kind
   bekam in der zweiten Sitzung fast nur neue Gebiete, keines erreichte Fach 3,
   und das Buch blieb leer — bei zwölf richtigen Antworten.

Dazu zwei Fehler im Tor selbst: die Fortschrittsprüfung `/[1-9]/` traf die
**16** in „0 von 16 geschafft" und meldete grün, obwohl nichts abgelegt war —
sie liest jetzt die Ablage statt den Text. Und der Zufallskeim kam aus der
Uhr, womit keine Sitzung reproduzierbar war; er kommt jetzt aus einer
gespeicherten Sitzungsnummer.

---

## Der Umzug: PWA und Auslieferung

**Ebene 4 zeigt jetzt immer vier Städte.** Genau eine ist richtig, die
Reihenfolge wird je Aufgabe neu gewürfelt, und das gilt für **beide
Profile** — auf dieser Ebene tippt auch Lea nicht. Gefragt ist, *welche*
Stadt es ist, nicht wie man sie schreibt; eine Stadt zu tippen, die man nie
gesehen hat, prüft das Buchstabieren. Im Elternbereich abschaltbar.

Die drei falschen sind nicht beliebig: **eine** kommt aus demselben
Bundesland — bei fünf Ländern ist die größte Stadt nicht die Hauptstadt, und
dort sitzt der Irrtum. **Zwei** sind Hauptstädte anderer Länder, sonst
stünden vier Namen aus derselben Ecke Deutschlands da.

**Der neue Rauchtest dafür fand sofort einen echten Fehler.** Der einfache
lineare Kongruenzgenerator legte die richtige Antwort in **zehn Aufgaben
hintereinander nur auf Platz 2 oder 3** — nie auf 1 oder 4. Benachbarte
Aufgaben liegen im Keim 7919 auseinander, und bei einem LCG hängen die
Ausgaben zu benachbarten Keimen linear zusammen. Jede Einzelprüfung war
grün: vier Städte, eine richtig, eine aus demselben Land. Die Aufgabe war
trotzdem kaputt — wer rät, rät in der Mitte. Jetzt Mulberry32, alle vier
Plätze belegt.

**Das App-Symbol** ist ein Globus in orthographischer Aufsicht, gedreht auf
10° Ost / 15° Nord, aus **derselben Küste wie die Karten im Spiel** (Natural
Earth 1:50m, auf 0,81 px Hausdorff vereinfacht). Kein Clipart — ein Symbol,
das neben der App liegt, verspricht etwas anderes als sie hält. Die Kugel
misst 75 % der Kante und liegt damit innerhalb der iOS-Maske *und* der
80-%-Schutzzone maskierbarer Kacheln. Ausgeliefert werden 180 (iOS), 192 und
512 (Manifest); die 1024 bleibt als Vorrat im Baum.

**Die PWA löst zwei Zusagen auf, die einander widersprechen:** ohne Netz
starten und immer aktuell sein. Getrennt wird an der Stelle, an der es sich
entscheidet — die **Seite** kommt Netz zuerst (mit 2,5 s Reißleine, ein Kind
wartet nicht auf ein mürbes Hotel-WLAN), **Schrift und Symbole** kommen
Lager zuerst, weil sie sich innerhalb einer Fassung nie ändern.

**Die Schriften liegen jetzt im Baum**, nicht bei Google. Drei Gründe: eine
Kinder-App soll beim Start nicht bei einem Dritten anklopfen, ohne Netz gäbe
es sonst keine Schrift, und der Bau auf dem Runner braucht so kein Netz. Nur
der Schnitt **latin** — 51,6 KB statt 328. Beide stehen unter der SIL OFL
1.1, Herkunft in `src/schrift/HERKUNFT.md`.

### Vier neue Tore, und was sie gefunden haben

| Tor | Was es prüft | Erster Fund |
|---|---|---|
| `schrift` | kein angezeigter Name braucht ein Zeichen außerhalb von latin | ●, ○ und ← in der PIN-Eingabe — sie sind jetzt gezeichnet statt getippt |
| `symbol` | quadratisch, undurchsichtig, nicht leer, Kugel in der Maske | — |
| `pwa` | Manifest vollständig, Symbole in der genannten Größe, **jede** Datei im Vorrat existiert wirklich | — |
| `offline` | startet die App ohne Netz | — |

`offline` fährt seine **Gegenprobe bei jedem Lauf mit**: ohne Service Worker
*muss* dasselbe durchfallen. Sonst misst das Tor den Browser-Cache und wäre
grün, ohne je etwas bewiesen zu haben (Regel 1).

### Das Tor `ansicht` läuft nicht auf dem Runner

Beim ersten Lauf dort waren **alle sieben Aufnahmen rot** — zwei davon mit
*geänderten Maßen*, also anderem Zeilenumbruch, nicht nur anderen
Bildpunkten. Das ist kein Befund über die App, sondern einer über die
Maschine: der Runner hat einen anderen Chromium-Bau, andere Ersatzschriften
und andere Kantenglättung. Ein Bildpunktvergleich gilt nur bei **gleicher
Zeichenumgebung**.

Es wird deshalb auf dem Runner übersprungen — **laut und mit Begründung im
Protokoll**, nicht still. Ein Tor, das sich unbemerkt überspringt, ist
schlimmer als keines. Ortsfest läuft es weiter mit `npm run ansicht`.

**Offen (D28):** Wer die Aufnahmen auch auf dem Runner will, muss die
Umgebung festnageln — im Playwright-Abbild bauen *und* die Vorbilder darin
aufnehmen. Solange beides nicht in derselben Umgebung passiert, misst der
Vergleich die Maschine.

**Geprüft wird ab jetzt `dist/`**, nicht mehr `prototyp/spiel.html`. Die eine
Datei ist eine Bequemlichkeit zum Verschicken; sie hat weder Manifest noch
Service Worker, ein grüner Lauf auf ihr beweist nichts über die App auf dem
Startbildschirm. Dabei kam heraus, dass die alten Vorbilder des Tors
`ansicht` die **Systemschrift** festgehalten hatten — die Google-Schrift war
beim Aufnehmen nie angekommen, und niemandem war es aufgefallen. Das Tor
prüft jetzt vor jeder Aufnahme, dass beide Schriften wirklich geladen sind.

Und die Zusammenfassung sagte „Alle **vier** Tore grün", während längst
sechs liefen. Die Zahl wird jetzt gezählt, nicht geschrieben.

---

## Die Sichtrunde am Gerät

Der Anlass war eine Bitte um **Gestaltungsvorschläge**. Beim Nachmessen auf
sechs Gerätegrößen kam heraus, dass die App auf dem **Zielgerät kaputt war** —
und drei Tore meldeten grün.

### Sechzehn Elemente waren nicht erreichbar

| Gerät | Was fehlte |
|---|---|
| iPhone quer 844×390 | vierte Antwort 22 px unter dem Rand · „Bundesländer" und „Landeshauptstädte" 10 px · „Verstanden" der Stadtstaaten-Einweisung 42 px |
| iPhone SE quer 667×375 | dasselbe, dazu drei Tasten der Eltern-PIN |
| iPhone hoch 390×844 | „Landeshauptstädte" 64 px · „Zurück" und „Eltern" **verdeckt** von der Überschrift |
| iPad, Schreibtisch | in Ordnung — deshalb ist es nie aufgefallen |

Im Klartext: das Kind sah auf dem iPhone die vierte Antwort nicht, kam nicht
in die Landeshauptstädte, und auf dem SE ließ sich die Eltern-PIN nicht
eingeben.

### Warum kein Tor es sah

Der Rauchtest sucht Etiketten über das **DOM**, nicht über das Sichtbare — ein
Element in einem scrollenden Behälter *existiert*, es ist nur nicht da. Das
Tor `ansicht` fotografiert bei 1240 × 1000, wo alles passt. Und `beruehrung`
misst Kartenflächen, keine Knöpfe.

### Die Ursachen, der Reihe nach

1. **`justify-content:center` auf `.mitte`.** Läuft der Inhalt über, schiebt
   zentrierter Inhalt nach **oben und unten gleichzeitig** hinaus — deshalb lag
   die Überschrift über den Kopfknöpfen. Für `.seite` war das seit v109
   repariert, für `.mitte` nie nachgezogen. Regel 6, wörtlich.
2. **`style="min-width:200px"` inline im Markup.** Inline schlägt jede
   Stilregel. Vier Größen waren rot, während im Stylesheet ein sauberes Raster
   stand, das gegen eine Zahl im Markup arbeitete.
3. **Ein Rasterfeld ist mindestens so breit wie sein längstes Wort.**
   „Landeshauptstädte" sprengte die Spalte um bis zu 36 px.
4. **Eine Medienabfrage erhöht die Spezifität nicht.** Der Kurzschirm-Block
   stand vor `.ziffern` und war für die wirkungslos.
5. **Ohne `min-width:0` läuft der Text aus seinem eigenen Knopf** — der Kasten
   saß, der Inhalt nicht.

### Vier Marken, die es nie gab

Beim Aufräumen fiel auf: `--app-gut`, `--app-warn`, `--app-linie` und
`--f-mono` wurden an **neun Stellen benutzt und nirgends definiert**. Deshalb
hat sich **kein Fortschrittsbalken je gefüllt**, und „Richtig — Thüringen!"
stand nie in Grün. `marken.css` und die Kopie in `vorlage.html` waren
außerdem auseinandergelaufen (`--tinte-2` gegen `--tinte2`).

Die Kopie ist weg. Der Bau setzt `marken.css` jetzt selbst ein.

### Das Tor `passt`

Sechs Gerätegrößen × sieben Bildschirme. Kein bedienbares Element darf über
den Rand seines Behälters laufen, keines darf **verdeckt** sein
(`elementFromPoint` in seiner Mitte), und der **Text muss in seinen Knopf
passen**. `overflow:auto` zählt nicht als Lösung: ein Kind scrollt nicht in
einer Liste, von der es nicht weiß, dass sie weitergeht.

Alle drei Prüfungen sind gegengeprobt — jede meldet den Fehler, für den sie
gebaut wurde, und schweigt danach.

### Die Knöpfe

Vorher war **jeder** Knopf dieselbe weiße Pille: die Antwort, die
Ebenenkachel, „Zurück", „Eltern". Deshalb wirkte nichts gestaltet — es gab
keine Rangfolge. Jetzt drei Gewichte: `.knopf` **leise** (Werkzeug am Rand,
kein Füllton), `.kachel` **mittel**, `.etikett` **laut** (die Antwort, der
wichtigste Knopf der App).

Die Tiefe ist keine versetzte Fläche mehr, sondern eine **Kante**: helle Linie
oben innen, dunklere unten. Beim Drücken fährt der Knopf um genau die
Kantenhöhe nach unten. Und bei falscher Antwort **wackelt das Etikett** —
vorher passierte dort gar nichts, es kam nur ein Satz darunter.

---

## Die Ausbaurunde

Vier Punkte, die ohne Rückfrage zu machen waren — in dieser Reihenfolge,
damit die spätere Arbeit im System landet und nicht daneben.

### 1. Das Gestaltungssystem hält jetzt

Im Stylesheet standen **vier Farben, drei Dauern und ein Dutzend
Strichstärken** frei herum, in `spiel.js` vier weitere Farben — darunter die
der Sterne. Und `#1b2835` stand zweimal im Baum (Meta-Tag und Manifest).

Alles in `marken.css`, neue Marken für Kante, Ring, Puls, Treffer, Ziel,
Stern. Das Tor `marken` prüft es jetzt in fünf Kategorien — Farbe, Dauer,
Radius, Strich, Abstand — und alle vier Gegenproben schlagen an. Was ein
**Bauteilmaß** ist (44 pt Trefferfläche, 76 px Mikrofon), bleibt erlaubt:
das sind Größen, keine Marken.

### 2. Der Grundriss folgt der Karte (D29)

Die Karte beanspruchte Platz, den sie nicht nutzen kann. Gemessen: auf dem
iPhone quer war ihr Kasten **420 Punkte breit, gezeichnet wurden 213** —
daneben ein Loch, das niemand nutzt. Deutschland ist hochformatig (0,74),
die Weltkarte quer (1,67); ein Kasten für beide verschenkt immer bei einer.

Das ist bewusst **keine Stilregel** geworden: CSS kann die eine Achse nicht
gegen die andere abwägen. `aspect-ratio` mit `width:100%` macht die Höhe
richtig und lässt die Breite stehen, mit `height:100%` genau andersherum.
`kartenGroesse()` misst den freien Platz und setzt beides — ein `Math.min`.

Dazu ist das Mikrofon verschwunden, wenn der Sprachmodus aus ist. Es stand
grau da, mit einer **Anweisung an die Eltern auf dem Spielbildschirm des
Kindes**, und kostete bis zu 120 Punkte Höhe.

| | vorher | jetzt |
|---|---|---|
| iPhone hoch · Deutschland | 45 % des Feldes | **62 %** |
| iPad hoch · Deutschland | 34 % | **49 %** |
| Fenster schmal · Weltkarte | 36 % | **51 %** |
| Karte füllt ihren Kasten | 43–100 % | **94–100 %** |

### 3. Die Karte füllt sich beim Spielen (D30)

Was schon saß, steht in voller Farbe und trägt einen grünen Haken; der Rest
bleibt gedämpft. Der Fortschritt steht damit **auf der Karte**, nicht nur als
Zahl in der Kopfzeile.

Der erste Anlauf hing an der Sitzung — der Rauchtest meldete sofort *null
gekonnte Gebiete*, weil die Karte nach jedem Neustart wieder leer war. Jetzt
kommt es aus dem **Leitner-Stand** (Fach ≥ 2): es überlebt das Schließen der
App und fällt zurück, wenn ein Gebiet später danebengeht.

### 4. Der Name am Ort (G10)

Bei richtiger Antwort steht der Name auf der Karte. Gehört hat das Kind ihn,
gelesen auf einem Etikett — aber nicht **am Ort**, und genau diese Verbindung
soll hängenbleiben.

**14 von 16 Bundesländernamen passen nicht in ihr Gebiet**, deshalb ist die
Fahne der Normalfall: ein Schild neben dem Gebiet mit einer Leitlinie
darauf. Entschieden wird **gemessen** — der Text wird gesetzt, ausgemessen
und mit dem Gebiet verglichen — nicht nach Liste. Damit gilt es auch für
Kontinente, Länder und jede Karte, die noch dazukommt.

Der Rauchtest prüft, dass der Name erscheint, ganz im Kartenfeld liegt und
dass **beide Sorten vorkommen**: fällt die Entscheidung immer gleich aus,
ist sie keine Messung, sondern eine feste Einstellung.

---

## Die Spielerrunde

Anlass: ein Kind tippte **„Australien"** und die App lehnte es ab. Ich habe
daraufhin aus Spielersicht alles durchgespielt — und **sechs Fehler**
gefunden, von denen zwölf Tore keinen gesehen hatten. Sie prüften, ob das
Programm läuft. Keines hatte je eine Antwort gegeben.

### 1. Beim Tippen zählte kein einziger Alias

`rechtschreibung()` bekam nur den kanonischen Namen. Der Kontinent heißt im
Vorrat „Australien und Ozeanien"; **„Australien" stand als Alias da und wurde
nie gelesen.** Mit ihm fielen durch: England, Großbritannien, Britannien,
Kongo, Amerika, Ozeanien, Antarktis, Südpol, Canada, Mexico, Tanzania,
Bangladesh, Aegypten, Aethiopien. **21 richtige Antworten** wurden abgelehnt.

### 2. Die Hervorhebung bewachte das Ziel

Der pulsierende Ring um das gesuchte Gebiet (`fill:none`, Strich bis 9 pt)
lag **über** der Fläche und fing den Zug ab. `elementFromPoint` lieferte
`path.zielpuls` — weder Gebiet noch Trefferkreis —, und die Bewertung lief
**gar nicht erst an**: kein Protokolleintrag, kein Hinweis, keine Bewegung.
Gemessen waren **21 bis 35 % der Zielfläche** blockiert; etwa jeder vierte
Zug landete auf nichts.

Ausgerechnet die Hervorhebung, die zeigen soll wohin man ziehen muss.

### 3. Fionas drei Runden gab es nicht

Das Konzept (4.1) gibt ihr drei aufeinander aufbauende Runden. Im Code stand
`k.runde<=3` — **immer wahr**. Sie bekam von Anfang an alle sieben
Kontinente, das Feld `runde` war Dekoration. Jetzt öffnet die nächste Runde,
wenn jeder Kontinent der bisherigen einmal saß (Fach 2).

Dabei ist gleich der nächste aufgefallen: die Runde begrenzte auch die
**Karte** — auf Fionas Weltkarte fehlten Asien und Nordamerika ganz. Die
Runde begrenzt jetzt, wonach gefragt wird, nicht was es auf der Welt gibt.

### 4. Fünfzehn Länder waren nicht erreichbar

Die Torkette zählte **25 Länder**, spielbar waren **10**. Asien, Nord- und
Südamerika lagen gebacken im Baum und waren nicht verdrahtet. Die
Ebenenwahl kommt jetzt aus den Daten statt aus einer zweiten Liste.

### 5. Guatemala hatte keine Fläche

Und dann waren es 24 statt 25. Auf der groben Stufe misst Guatemala rund
anderthalb Bildpunkte, und der Inselfilter warf es weg — ein **MultiPolygon**
behielt dort immer seine größte Fläche, ein einfaches **Polygon** fiel
ersatzlos. Guatemala ist ein einfaches Polygon. Es stand in den Daten, wurde
gezählt und konnte nie gefragt werden.

### 6. Der ausgeblendete Bildschirm nahm noch an

Die unsichtbaren Trefferkreise setzen `pointer-events:all` und hoben damit
das `none` ihres ausgeblendeten Bildschirms auf — 340 ms lang. Gefunden beim
Suchen nach Fehler 2, behoben, auch wenn es nicht die Ursache war.

### Das Startpaket wurde dabei kleiner

Mit fünf Kontinenten wäre die Seite von 297 auf **537 KB gzip** gesprungen —
fast die Hälfte davon Umgebungskarten. Die Länderebenen werden jetzt einzeln
nachgeladen und vom Service Worker ins Lager gelegt. **Start: 132 KB gzip**,
je Kontinent 63–107 KB einmalig. Das Offline-Tor läuft jetzt bis zu einer
nachgeladenen Ebene, nicht nur bis zum Startbildschirm.

### Zwei neue Tore

**`spielprobe`** (ohne Browser, 0,3 s): 455 Antworten und Zusammenhänge.
Jeder Name, jeder Alias, kleingeschrieben, ein Buchstabe daneben, jede
hinterlegte Aussprache — für alle Ebenen und beide Tiefen. Dazu: Ränge 1–5
je Kontinent lückenlos, kein Ablenker ist die Hauptstadt, jedes Gebiet aus
den Daten hat eine Fläche auf der Karte.

**`passt`** prüft zusätzlich, ob das gesuchte Gebiet den Finger **überall**
annimmt, wo man es sieht — mit `elementsFromPoint` über den ganzen Stapel.
Ein Nachbargebiet an der gemeinsamen Grenze zählt nicht als Störung, Schmuck
schon.

Und der **Rauchtest** spielt jetzt jede Ebene mit beiden Profilen: 16
Kombinationen, jedes Mal eine richtige Antwort — beim Tippen bewusst der
Alias.

---

## Die Gestaltungsrunde

Sechs Wünsche in einem Satz: saubere Zurück- und Schließen-Knöpfe, ein Kopf
ohne überlappende Zeichen, „farblich eine Schippe drauf", mehr Toleranz beim
Schreiben, ein dezentes Überspringen und nach drei Fehlern die Lösung — und
die Bundesländer als Auswahl aus vier.

### Der Kopf war nirgends derselbe

Acht Bildschirme, acht von Hand gebaute Kopfzeilen. Auf dem iPhone quer
rutschten Titel und Knöpfe ineinander, weil jede Zeile ihre Breite anders
verteilte. Es gibt jetzt **einen** Kopf:

```
.kopf { grid-template-columns: 1fr auto 1fr; min-height: 68px }
```

Links die Rückweg-Knöpfe, in der Mitte der Titel, rechts die runden
Zeichenknöpfe (44 × 44). Unter 520 Bildpunkten fällt das Wort im Knopf weg,
das Zeichen bleibt — der Knopf schrumpft nicht unter die Daumengröße. Alle
acht Bildschirme rufen dieselbe Funktion `kopf({links, mitte, rechts})`; es
gibt keine Stelle mehr, an der man eine Kopfzeile falsch bauen kann.

### Die Blässe war erzwungen, nicht gewählt

Die sieben Flächenfarben lagen alle auf **L 0,88**. Das war die Ursache: bei
gleicher Helligkeit ist die stärkste Buntheit, die alle sieben Farbtöne im
sRGB-Raum noch erreichen, an die Helligkeit gebunden. Gemessen über die
Helligkeitsachse:

| L | größte gemeinsame Buntheit C |
|---|---|
| 0,90 | 0,045 |
| 0,86 | 0,070 |
| 0,82 | 0,090 |
| 0,78 | 0,115 |
| **0,74** | **0,135** |
| 0,70 | 0,130 |

Bei **L 0,74** ist das Maximum — 0,135 statt 0,055, also **zweieinhalbmal so
bunt**. Darunter fällt es wieder, weil Gelb und Grün an den Rand des Raums
stoßen. Die dunkle Schrift darauf hält 6,1:1.

Dazu: ein Farbverlauf im Grund statt einer Fläche, die Ebenenliste in acht
verschiedenen Farben mit Überschrift („Länder in · Asien"), Kacheln mit
farbiger Kante statt grauem Rahmen.

**Eine Falle unterwegs:** `color-mix(in oklch, …)` zog alle sieben Töne nach
Rot, weil Weiß den Farbwinkel 0 hat und in Polarkoordinaten dazwischen
gemischt wird. Alle sieben Mischungen laufen jetzt `in oklab`.

### Ein neues Tor: `lesbarkeit`

Farbe anfassen heißt Kontrast riskieren. Das Tor misst **88 Texte** in der
gebauten Seite, in Tag und Abend, jeden gegen den Grund, auf dem er
**wirklich** steht — nicht gegen den Seitenhintergrund. WCAG-Grenzen 4,5:1 für
kleinen, 3:1 für großen Text.

Beim ersten Lauf meldete es 34 Fehler, die keine waren: berechnete Farben
kommen als `oklch(…)` zurück, und die kann man nicht mit einer Zahlensuche
lesen. Der Umweg geht jetzt über eine Leinwand — malen, auslesen, rechnen.
Danach blieben **zwei echte**: `--tinte-3` erreichte auf Weiß nur 2,86:1 und
auf getönten Kacheln 2,3:1. Kleiner Text steht jetzt auf `--tinte-2`, das auf
0,46 abgedunkelt wurde.

### Schreiben darf danebenliegen

`rechtschreibung()` bekam bisher nur den kanonischen Namen — deshalb war
„Australien" falsch, wenn der Alias gefragt war. Sie bekommt jetzt das ganze
Ziel und urteilt in vier Stufen:

1. **richtig** — trifft einen der Namen genau
2. **fast** — trifft ihn, aber kleingeschrieben: „Namen schreibt man groß."
3. **richtig, mit Nebenbei** — trifft ihn ohne Bindestriche und Leerzeichen:
   „Nord-Amerika", „nordamerika", „Baden Württemberg". Antwort zählt, die
   Schreibweise wird gezeigt.
4. **fast/falsch** — Damerau-Levenshtein gegen den ähnlichsten Namen, mit der
   Stelle des Fehlers

Kleingeschrieben schlägt Bindestrich: „nord-amerika" gibt weiter den
Großschreibhinweis, nicht die Punkte.

### Wer nicht weiß, kommt trotzdem weiter

Unter dem Feld steht **„Weiß ich nicht"** — unterstrichen, grau, ohne Rahmen,
44 Bildpunkte hoch. Und nach dem **dritten** Fehlversuch löst die App von
selbst auf: Zeiger und Puls gehen aus, der Name erscheint am Ort auf der
Karte, „Das ist Thüringen." wird gesagt und geschrieben, nach 2,6 s geht es
weiter. Beides zählt im Leitner als *nicht gekonnt* und steht im Protokoll als
`ergebnis: gezeigt` — der Elternbereich sieht den Unterschied zwischen
„geraten" und „gezeigt".

### Bundesländer als Auswahl

Wie die Hauptstädte: vier Namen, einer richtig, die Reihenfolge je Aufgabe neu
gewürfelt. Das Tippen entfällt dort für beide Profile — sechzehn Bundesländer
mit Bindestrich und Umlaut sind für eine Achtjährige eine Rechtschreibprüfung,
keine Erdkundeaufgabe. Getippt wird weiter bei den Ländern.

---

## Die Ziehrunde

Der Anlass, wörtlich: *„im Fiona-Profil, wenn man die einzelnen
Möglichkeiten reinschiebt, kommen die nicht richtig an."*

### Was wirklich los war

Nachgemessen am gebauten Spiel, iPhone quer, Ebene „Kontinente":

| daneben | vorher | jetzt |
|---|---|---|
| 0–8 px | getroffen | getroffen |
| 16 px | **nichts passiert** | getroffen |
| 20–80 px | **nichts passiert** | getroffen |
| ab 100 px | nichts passiert | „Lass es auf dem Land los." |

**Ab 16 Bildpunkten daneben geschah gar nichts** — kein Hinweis, kein
Protokolleintrag, keine Bewegung. Das Etikett sprang zurück, und das Kind
erfuhr nie, warum. Australien misst auf der Weltkarte 60 × 50 Punkte; ein
Daumen ist breiter als das.

Warum kein Tor das gesehen hat: der Rauchtest zieht auf den **Anker**, also
auf den einen Punkt, der immer trifft. Er beweist, dass Ziehen
*funktioniert* — nicht, dass es *benutzbar* ist.

### Nachsicht, aber keine Zauberei

Die Umkreissuche testet nicht mit einer größer gerechneten Fläche, sondern
mit **echtem Treffertest an echten Umrissen** — nur eben auf Ringen um den
Finger statt an einem Punkt, von innen nach außen. Der erste Treffer
gewinnt, also gewinnt das nächstgelegene Gebiet. Die Form bleibt die Form.

Der Ring hört bei 60 Punkten auf. Ohne Deckel träfe jeder Wurf irgendetwas,
und ein Fehlgriff im Meer würde als **falsche Antwort** gewertet — das
kostet einen der drei Versuche für etwas, das gar keine Antwort war.

### Und man sieht, was gelten wird

Nachsicht ohne Anzeige wäre ein Würfel, den niemand sieht. Was unter dem
Finger liegt, **leuchtet auf**, bevor man loslässt. Dazu brauchte es
`pointer-events:none` am gezogenen Etikett: solange es anfassbar war, stand
es bei jedem Treffertest im Weg.

### Was nur das Bild gezeigt hat

Und dann war es trotzdem falsch. Das erste Bildschirmfoto zeigt: **das
Etikett deckte sein eigenes Ziel vollständig zu.** Die Antwortkachel
„Australien und Ozeanien" ist 240 × 160 Punkte groß und hing mittig am
Finger. Das Tor meldete grün — es prüft, *dass* etwas aufleuchtet, nicht,
ob man es sehen kann.

Jetzt wird aus der Kachel beim Aufheben ein **Schild**: einzeilig, ohne
feste Breite (ein `position:fixed`-Kasten schrumpft dann auf seinen
Inhalt), und es hängt **unter** dem Finger. Oben bleibt frei — dort liegt
die Karte.

Deshalb hält `ansicht` jetzt zwei Aufnahmen mehr: `spiel-zug` (mitten im
Zug, 22 Punkte daneben) und `spiel-lob`. Beides Zustände, die es sonst nur
mit dem Finger gibt.

### Aufgehoben wird erst nach 6 Punkten Weg

Vorher sprang das Etikett bei der leisesten Berührung auf `position:fixed`
unter den Finger und wieder zurück. Getippt wird aber viel: ein Etikett
liest sich selbst vor.

### Eine freundlichere Stimme

Drei Stellschrauben, alle drei standen auf „neutral": **welche** Stimme
(gesucht wird jetzt nach Namen — Anna, Petra, Helena, Marlene —, statt die
erstbeste deutsche zu nehmen), **wie schnell** (0,92 → 0,88) und **wie
hoch** (`pitch` 1 → 1,15; darüber wird es schrill).

### Gelobt statt festgestellt

„Richtig — Australien und Ozeanien!" ist eine Feststellung. Jetzt steht das
Lob in einer eigenen Zeile darüber, aus einem Vorrat von acht, und nie
zweimal hintereinander dasselbe: *Super gemacht! · Ganz genau! · Richtig! ·
Klasse! · Das stimmt! · Toll gemacht! · Perfekt! · Prima!*

Gelobt wird nur, was **ganz** richtig war — ein „Super gemacht!" auf eine
fast richtige Antwort nimmt dem Wort seinen Wert. Auch die Ablehnungen sind
freundlicher („Nicht ganz — probier es noch einmal." statt „Das ist ein
anderer Name."), und die Auflösung nach drei Fehlversuchen beginnt mit
„Kein Problem."

**Der Rauchtest hat das sofort gefangen** — und zwar mit 21 Fehlern, obwohl
jede Antwort korrekt gewertet wurde: er wartete auf das Wort „Richtig".
Er hängt jetzt an der **Klasse** `.richtigText`, nicht am Wortlaut. Eine
Klasse ist eine Zusage des Programms; ein Satz ist Text, den jemand ändern
darf.

### Neues Tor `ziehen`, fünf Gegenproben

Vier Zusagen: Nachsicht mindestens 40 Punkte · ein Wurf ins offene Meer
erzeugt **keinen** Protokolleintrag (das ist zugleich der Deckel) · während
des Zuges leuchtet das Ziel auf · Antippen ist kein Ziehen.

Zwei der fünf Gegenproben haben zuerst das **Tor** widerlegt, nicht den
Code:

- Der Deckel-Test maß über die Trefferreihe. 200 Punkte neben Australien
  liegt aber ein anderer Kontinent, und den zu treffen ist eine falsche
  *Antwort* — von außen sieht das aus wie „nichts gefunden". Er misst jetzt
  am offenen Meer, wo der Unterschied messbar ist.
- Der Antipp-Test maß nach dem Loslassen. Da hat die App längst aufgeräumt,
  und ein Zucken sieht aus wie keines. Er misst jetzt bei gedrücktem Finger.

Und die Messreihe selbst war zuerst wertlos: alle zehn Weiten liefen im
selben Browser-Kontext, also schaltete der Fortschritt weiter und **jede
Weite traf ein anderes Gebiet**. „Getroffen bis 80 px" war ein Mittelwert
über Australien, Europa und Afrika. Jeder Wurf bekommt jetzt einen frischen
Kontext.

Dazu prüft `passt` neu auch den **Hinweis**: er ist nicht bedienbar, aber er
ist die einzige Auskunft bei einem Fehlversuch — und er stand auf dem iPhone
quer zweizeilig am unteren Rand.

---

## Die Probenrunde

`npm run proben` — **19 stehende Gegenproben**, jede baut einen Fehler ein
und schaut nach, ob das zuständige Tor rot wird.

### Warum das nötig war

Ein Tor, das nie etwas meldet, sieht von außen genauso aus wie eines, das
alles durchlässt: **grün**. Bis hierher lagen die Gegenproben in meinem
Kopf. In der Ziehrunde habe ich fünf von Hand gefahren, zwei davon haben
nicht den Code widerlegt, sondern das Tor — und beim nächsten Mal wären sie
vergessen gewesen.

Zwei Regeln, erzwungen statt aufgeschrieben:

- **Erst einchecken, dann proben.** Wiederhergestellt wird mit `git
  checkout`. Der Lauf verweigert bei schmutzigem Baum den Dienst.
- **Prüfen, ob der Eingriff angekommen ist.** Jede Probe sagt, *worin* die
  Änderung zu finden sein muss — bei Toren, die `dist/` lesen, im gebauten
  Stand, nicht in der Quelle. Ein Eingriff, der nicht ankommt, sieht aus wie
  ein bestandenes Tor.

### Der erste Lauf hat vier Löcher gefunden

Vierzehn von achtzehn schlugen an. Die anderen vier waren die Ausbeute:

**1. `doku` lief seit dem Umzug überhaupt nicht.** Der Pfad lautete
`../docs/Lernkiste-KONZEPT.md` — ein Rest aus der Zeit unter
`towerfront/lernkiste/`. Seit dem Umzug zeigt er *aus* dem Verzeichnis
heraus, `existsSync` war falsch, und die ganze Prüfung übersprang sich
**still**. Still ist grün. Eine fehlende Konzeptdatei ist jetzt ein Fehler,
kein Achselzucken.

**2. `beruehrung` konnte gar nicht rot werden.** Es hatte keinen einzigen
Fehlerpfad — es berichtete, es bewachte nicht. Es hat jetzt eine harte
Zusage: die App baut die entkoppelte Trefferfläche aus dem **Anker**. Ein
Gebiet, das zu klein ist und keinen Anker hat, bekommt keinen Kreis und ist
mit dem Finger an *keiner* Stelle zu treffen — es stünde in den Daten, wäre
gezählt, läge auf der Karte und ließe sich nicht spielen.

**3. Das Tor stürzte ab, statt zu urteilen.** Die Gegenprobe dazu (Bremen
verliert seinen Anker, 9,4 pt, das kleinste Gebiet überhaupt) brachte einen
`TypeError` an zwei Stellen. Ein Absturz ist rot, aber er sagt nichts: dort
steht ein Stapelabzug statt eines Satzes, und beim nächsten Mal sucht
jemand den Fehler im Tor statt in den Daten. Ein Tor muss auch **kaputte**
Eingaben beurteilen können.

**4. `proben` selbst ließ den Baum schlechter zurück, als es ihn vorfand.**
Es stellte die Quellen mit `git checkout` wieder her — aber `dist/` steht
nicht in Git. Der letzte Eingriff blieb im gebauten Stand stehen, und das
nächste Tor prüfte ihn mit. Es baut jetzt nach jeder Probe neu.

Dazu zwei Proben, die *selbst* falsch gezielt hatten: „einen Alias aus den
Daten nehmen" ist eine erlaubte Datenänderung und kein Fehler — gemeint war
der Fehler aus der Spielerrunde, dass die Rechtschreibprüfung Aliasse gar
nicht erst bekommt. Und der Manifest-Pfad hieß `manifest.webmanifest`,
nicht `app.webmanifest`.

### Und das `ziehen`-Tor war zu schwach

Die Gegenprobe „das gezogene Schild bleibt anfassbar" blieb grün. Der Grund
ist lehrreich: das Schild hängt seit der Ziehrunde **unter** dem Finger,
also liegt es beim exakten Treffertest gar nicht mehr im Weg. Aber die
Umkreissuche testet bis 60 Punkte in **alle** Richtungen, und
`elementFromPoint` liefert immer nur das oberste Element — ein anfassbares
Schild verdeckt damit die ganze untere Hälfte des Suchradius.

Das Tor zieht deshalb jetzt auch **von oben** heran, wo das Schild über dem
Ziel hängt. Gemessen: mit `pointer-events:none` trifft man bis 40 Punkte,
ohne es bis 0.

### Was `proben` außerdem zählt

Zwei Deckungsprüfungen, beide aus dem Baum gelesen statt hingeschrieben:

- **Hat jedes Tor der Kette eine Probe?** Die Kette kommt aus
  `package.json`. Die häufigste Verfallsart ist nicht die falsche Probe,
  sondern die fehlende: ein neues Tor kommt dazu, niemand trägt eine nach,
  und alles bleibt grün.
- **Hat jede der sieben Prüfungen in `inhalt.mjs` eine?** Die Liste wird aus
  der Datei selbst gelesen. Genau so ist `beruehrung` aufgefallen.

---

## Die Budgetrunde

Zwei Tore: eines, das die Größenzusagen hält, und eines, das dafür sorgt,
dass die Gegenproben überhaupt noch gefahren werden.

### `budget` — die Zusagen standen im Konzept, ohne dass sie jemand hielt

Kapitel 8 des Konzepts nennt fünf Größengrenzen und schreibt hinter drei
davon „Tor `budget`". Das Tor gab es nicht. Und die Startgröße ist hier
schon zweimal unbemerkt gewandert — von 297 auf 537 KB, als fünf Kontinente
verdrahtet wurden, und zurück auf 132, als sie nachgeladen statt eingebacken
wurden. Beide Male hat es niemand *gemessen*, sondern jemand *gemerkt*.

**Die Grenzen stehen nicht im Tor, sie werden aus dem Konzept gelesen.** Zwei
Zahlen an zwei Orten veralten getrennt voneinander: die eine wird gepflegt,
die andere gilt, und niemand sieht den Unterschied.

### Der erste Lauf fand eine echte Überschreitung

| | vorher | jetzt | Zusage |
|---|---|---|---|
| Startbündel gesamt | 194,0 KB | **138,2 KB** | < 400 |
| davon Geometrie | **94,8 KB** | **38,7 KB** | < 90 |
| davon Schriften | 51,7 KB | 51,7 KB | < 60 |
| größte nachgeladene Ebene | 107,4 KB | 107,4 KB | < 250 |

94,8 gegen 90 — fünf Prozent drüber. Und aufgeschlüsselt lag der Grund
offen: **56 der 94 KB waren Deutschland**, gebraucht für *zwei von sechzehn*
Ebenen. Ein Kind, das Kontinente übt, hatte sechzehn Bundesländer im
Gepäck.

Deutschland hängt jetzt in derselben Nachladestrecke wie die Länder.
Herausgenommen wird nur `pfad` — Name, Hauptstadt, Anker, Ort und
Stadtstaat-Kennzeichen bleiben im Startbündel, zusammen unter einem
Kilobyte, weil die Ebenenwahl den Fortschritt ausrechnet, bevor eine Ebene
offen ist. Ersetzt wird **eintragsweise**, nicht als neue Liste: sonst
blieben die Verweise, die anderswo längst auf die alten Einträge zeigen, ohne
Umriss zurück.

**Die Messstelle, weil die Zahl sonst nichts bedeutet:** gemessen wird der
*Anteil* der Geometrie, nicht ihre Summe — also gzip(Seite) minus
gzip(dieselbe Seite mit leeren Pfaden). Der erste Anlauf packte die Umrisse
für sich allein und kam auf 91,7 KB. Das ist die Größe, die sie *hätten*,
nicht die, die sie in der Seite *kosten*.

### Und eine Ratsche unterhalb der Grenze

Zwischen 138 und 400 KB liegt viel Platz. Eine Zahl, die sich in acht Runden
verdoppelt, ohne je anzuschlagen, ist genau der Verfall, den keine Grenze
fängt. Der festgehaltene Stand (`tor/budget-stand.json`) meldet deshalb
jedes Wachstum über 5 % — nicht als Verbot, sondern als Frage: war das
Absicht? Neu festhalten mit `npm run budget -- --neu`, von Hand, so wie die
Vorbilder in `ansicht`.

### `rhythmus` — eine Regel, die nur dasteht, wird gebrochen

`npm run proben` dauert rund zwölf Minuten. Zu lang für jede Runde, zu kurz,
um es sich zu sparen. Also braucht es einen Rhythmus — und der darf nicht in
einem Dokument stehen, sondern muss erzwungen sein. Dieses Verzeichnis hatte
schon einmal 61 Fassungen lang eine falsche Zahl im Stand, ohne dass es
jemandem auffiel.

`rhythmus` steht **vorn in der Kette**, kostet Millisekunden und schlägt an,
wenn der letzte volle Probenlauf mehr als **drei Runden** zurückliegt.
Gezählt werden nur Commits, die Code anfassen — wer eine Zeile im Konzept
ändert, verbraucht keine Frist.

Es prüft außerdem zwei Dinge, über die das Datum nichts sagt: ob **so viele
Proben** im Baum stehen wie festgehalten (wer eine dazuschreibt, hat einen
anderen Lauf vor sich), und ob **alle Tore der Kette** schon beim letzten
Lauf dabei waren.

Drei Fallen, die dabei zu umgehen waren:

- **Ohne Historie kann es nichts zählen.** `actions/checkout` holt
  voreingestellt nur den letzten Commit. Der Ablauf fährt jetzt
  `fetch-depth: 0`, und fehlt die Historie trotzdem, sagt es das laut,
  statt sich zu überspringen.
- **Gezählt wird ab der Standdatei, nicht ab dem notierten Commit.** Das
  kostete einen Anlauf: `proben` läuft *vor* dem Commit (der Baum muss
  sauber sein) und notiert sich den damaligen Kopf. Wird die Runde danach
  zusammengefasst, gibt es diesen Commit nicht mehr — lokal findet `git` ihn
  noch im Objektspeicher, auf dem Runner nach einem frischen Klon nicht. Das
  Tor wäre genau dort rot geworden, wo alles in Ordnung ist. Die Standdatei
  dagegen steht immer in der Historie.
- **Ein abgebrochener Probenlauf soll nicht durchwinken.** Der Stand trägt
  `lauf: vollständig`; alles andere ist rot.
- **Henne und Ei.** Zwei Proben prüfen, ob `rhythmus` einen veralteten Stand
  erkennt — und brauchen dafür einen Stand, den erst dieser Lauf erzeugt.
  Aufgelöst wird das **einmal und laut**: beim Erstlauf werden die beiden
  übersprungen, es steht in der Ausgabe, und weil danach ein Stand
  existiert, kann der Fall nie wieder eintreten. Was nicht passiert: sie
  stillschweigend überspringen — das ist genau die Lücke, die dieses
  Werkzeug aufdecken soll.

### Sieben neue Gegenproben, zwei davon lehrreich

25 stehende Proben, alle schlagen an. Alle vier Fehlerpfade von `rhythmus`
sind belegt — auch „der Lauf liegt zu lange zurück", und das ging nicht
ohne Weiteres: *wie lange* er zurückliegt, steht in der Historie und nicht
in einer Datei, die man anfassen kann. Das Tor hat dafür eine Schraube
bekommen, die nur **strenger** stellen kann (`Math.min`) — eine, die auch
lockern könnte, wäre ein Schalter zum Abstellen des Tors, und der hat in
einer Kette nichts verloren. Die Füllung für „die Seite wächst
unbemerkt" musste beim zweiten Anlauf **unkomprimierbar** werden: 40 000
gleiche Buchstaben schrumpfen im Packer auf ein paar Dutzend Byte, und die
Probe wäre an der Grenze gescheitert, ohne dass jemand den Grund gesehen
hätte. Gemessen wird gzip — also muss die Füllung wie Rauschen aussehen.

---

## Die Übergangsrunde

Drei Punkte, und zwei davon haben unterwegs Fehler in den **Toren**
gefunden, nicht im Spiel.

### Erst eine Korrektur an mir selbst

Ich hatte geschrieben, `npm run proben` dauere zwölf Minuten. Gemessen sind
es **4,8** — ich hatte die Wanduhr meiner ganzen Arbeit dafür gehalten. Der
Lauf sagt jetzt selbst, wo die Zeit liegt:

| Tor | vorher | jetzt |
|---|---|---|
| ziehen (5 Proben) | 129 s | **48 s** |
| smoke | 79 s | 79 s |
| passt | 29 s | 29 s |
| ansicht | 25 s | 25 s |
| *alle 27* | *4,8 min* | *3,5 min* |

`ziehen` war der lohnende Posten: jede seiner fünf Proben fuhr das ganze Tor
durch — zehn Wurfweiten, vier von oben, die Meersuche, das Antippen —,
obwohl jede sich für genau einen Abschnitt interessierte. Es kennt jetzt
`--nur=nachsicht,oben,meer,anzeige,tippen`. Voreingestellt läuft alles, und
die Kette ruft es ohne Argument auf: eine Abkürzung, die man versehentlich
nimmt, wäre keine.

### Das Offline-Tor hat nur die halbe Wahrheit gemessen

Deutschland wird seit der Budgetrunde nachgeladen. Also musste das
Offline-Tor auch dorthin laufen, nicht nur bis „Länder in Asien". Die
Gegenprobe dazu — Deutschland aus dem Vorrat des Service Workers nehmen —
**blieb grün**. Zwei Befunde dahinter:

**1. Auf ein Element zu warten ist nicht dasselbe wie eine Karte zu sehen.**
Die App baut ihre Pfade aus dem leichten Verzeichnis, das im Startbündel
bleibt: Name, Anker, Ort — aber kein Umriss. Fehlt die nachgeladene
Geometrie, steht `path.ziel` trotzdem da, nur mit leerem `d`. Geprüft wird
jetzt die **Fläche**.

**2. `context.setOffline(true)` deckt den Service Worker nicht ab.** Mit
einem mitschreibenden Server nachgemessen: während der Kontext auf offline
stand, hat der Server `/daten/deutschland.json` und `/sw.js` ausgeliefert.
Der Service Worker holte munter weiter — und das Tor meldete „ohne Netz
kommt die App bis zu den Bundesländern". Genau der Fall, vor dem Regel 1
warnt: die Prüfung maß etwas anderes, das lauter war.

Das Netz wird jetzt am **Server** abgeschaltet, und zwar durch Abreißen der
Verbindung, nicht durch einen Fehlercode — eine Antwort ist Netz, auch eine
mit 503. `setOffline` bleibt daneben stehen: zwei Schlösser sind besser als
eines, und im Browser sieht die App dann auch `navigator.onLine === false`.

### Der Übergang von Aufgabe zu Aufgabe

Es war kein harter Schnitt — eine 320-ms-Überblendung gab es schon. Nur
blenden beide Bildschirme *gleichzeitig*, und weil die Karte zwischen zwei
Aufgaben derselben Ebene identisch ist, sah man nur, wie sie kurz dunkler
wird: ein **Blinzeln**.

Jetzt kommt das Neue herein — Frage, Karte und Antworten steigen leicht von
unten auf, die Antworten nacheinander im Abstand `--d-staffel` (45 ms). Das
Auge folgt der Liste, statt vier Kästen gleichzeitig aufblitzen zu sehen.

**Der erste Anlauf war schlechter als vorher.** Das Bild aus der Mitte des
Übergangs zeigte ein **Doppelbild**: die alte Lobzeile stand über der neuen
Frage, und hinter der neuen Karte lag die alte mit ihrem grün gefärbten
Treffer. Der gehende Bildschirm braucht `--d-schirm / 2`; genau so lange
wartet das Neue jetzt.

Gesehen hat das ein Auge, kein Tor — deshalb misst der Rauchtest es jetzt:
während des ganzen Wechsels darf nie mehr als **ein** Bildschirm deutlich
sichtbar sein. Gemessen wird der schwächere der beiden im schlimmsten Bild;
er liegt bei **0,00**, erlaubt sind 0,20. Blenden beide gleichzeitig,
treffen sie sich bei etwa 0,5.

Und noch eine Falle: die Messung stand zuerst *vor* der Fahnenprüfung,
verbrauchte 2,6 s und überholte damit den Bildschirmwechsel — danach meldete
das Tor „kein Name auf der Karte", obwohl der Name dagewesen war. Sie
ersetzt jetzt die Wartezeit, statt dazuzukommen.

### Und dann hat der Übergang das Ziehen kaputtgemacht

Drei Aufnahmen wurden rot. Bei zweien war es wirklich nur Kantenglättung:
die Geometrie ist auf den Zehntelpunkt identisch, und eine
`animation`-Eigenschaft hebt ein Element auf eine eigene Ebene, wo Text
anders geglättet wird. Byte-identisch bei drei Läufen, also kein Rennen.

**Bei der dritten war es ein echter Regress, und ich habe ihn zuerst
übersehen.** Ich habe den Befund von `spiel-lob` auf alle drei übertragen
und die Vorbilder erneuert — mit dem Fehler drin. Aufgefallen ist es erst,
als eine Gegenprobe grün blieb, die vorher angeschlagen hatte.

Der Fehler: **eine CSS-Animation steht in der Kaskade über dem Inline-Stil**
— auch wenn sie längst abgelaufen ist und nur noch ihren Endzustand hält
(`both`). `herein` endet auf `transform: none`, und genau das ist die
Eigenschaft, mit der das gezogene Schild am Finger hängt. Das Schild blieb
in der Antwortliste stehen.

Und es sah harmlos aus: das Ziel leuchtete richtig auf, weil die
Umkreissuche am **Finger** hängt und nicht am Schild. Kein Tor hat es
gesehen. Jetzt misst `ziehen` den **Abstand vom Finger** (19 px) und fragt
direkt, was mitten unter dem Schild liegt — die Karte oder das Schild
selbst.

Zwei Anläufe dieser Prüfung waren daneben, beide aus demselben Grund: bei
55 Punkten über Australiens Anker steht der Finger schon über Indonesien,
und das gehört zu Asien. Eine Reihe, die so weit misst, misst einen
Nachbarn statt das Schild — dieselbe Falle wie beim Deckel der Nachsicht.

### `proben` hat nie gefragt, ob das Tor vorher grün war

Genau daran ist die Probe vorbeigelaufen: sie meldete „schlägt an", während
das Tor in **beiden** Zuständen dieselbe Zeile schrieb. „Schlägt an" heißt
seither wirklich, was es sagt — vor jedem Urteil wird das Tor einmal ohne
Eingriff gefahren.

Das kostet ungefähr einen Kettenlauf, aber nur dort, wo es zählt: gefragt
wird erst, **nachdem** das Tor unter dem Eingriff rot war. Bleibt es grün,
ist die Antwort ohnehin belanglos.

Dabei kam ein Widerspruch heraus: **während eines Probenlaufs ist
`rhythmus` per Definition rot** — der festgehaltene Stand ist veraltet,
genau deshalb läuft man ja. Seine vier Proben laufen jetzt in einem zweiten
Durchgang, nach dem Schreiben des Standes. Schlägt dort eine fehl, wird der
eben geschriebene Stand als `abgebrochen` markiert: er darf keinen Lauf
bezeugen, der etwas offen gelassen hat. Und weil `git checkout` nach jeder
Probe die *eingecheckte* Fassung zurückholt, wird der frische Stand danach
neu gesetzt — ohne diese Zeile war `rhythmus` sofort wieder rot.

---

## Die Geräterunde

Nach dem Spielen am iPhone. Vier Punkte, und zwei davon hatten **dieselbe**
Ursache.

### Der X-Knopf und die Sterne lagen unter der Statusleiste

Nicht schlecht gebaut — begraben. `body` trug das Polster
`env(safe-area-inset-*)`, aber `#buehne` ist `position:absolute` und `body`
ist nicht positioniert: `inset:0` bezieht sich damit auf das **Fenster**,
nicht auf das Polster.

Nachgemessen: mit 44 Punkten Polster am Rumpf blieb der Schließen-Knopf
exakt dort, wo er vorher war — 12 Punkte von der Ecke. Dort sitzt auf dem
iPhone die Uhr, rechts daneben der Akku. Der Knopf war zu sehen und nahm den
Finger nicht an.

Der sichere Bereich hängt jetzt an der Bühne, über Marken
(`--sicher-oben` …). Nach der Reparatur wandert der X mit 44/20 Punkten
Einzug von (12,12) auf (56,32), die Sterne von 22 auf 66.

**Und `passt` hat eine siebte Größe:** *iPhone quer, Leiste* — dasselbe
Gerät mit dem, was das Telefon selbst belegt (21 oben und unten, 59 an den
Seiten). `env()` lässt sich von außen in keinem Browser vorgeben; die
Verkabelung dahinter schon. Geprüft wird damit nicht, ob iOS die richtigen
Zahlen liefert, sondern ob die App sie überhaupt beachtet — und genau das
tat sie nicht.

### Antarktika ist raus — gegen meinen eigenen früheren Rat

Die Frage war: *warum wird Antarktika immer als einzelner Kontinent gezeigt,
auf der großen Karte kann man das nicht verbinden?* Sie trifft genau den
Punkt. Antarktika hatte hier **zwei** Sonderrollen, und beide waren teuer:

- Auf der Weltkarte wird die Antarktis zu einem breiten Band am unteren
  Rand, das über die ganze Kartenbreite läuft. Als Umriss unkenntlich, beim
  Ziehen kaum vom Kartenrand zu unterscheiden.
- Deshalb bekam sie eine eigene **polare Aufsicht** — eine zweite Kartenart
  für ein einziges Gebiet. Ein Kind, das gerade sechs Umrisse nebeneinander
  gelernt hat, sah bei der siebten plötzlich die Welt von oben.

Im Konzept stand mein Rat von damals: *„ich rate davon ab."* Er steht dort
weiter, mit dem Ausgang daneben. Was er nicht mitgerechnet hatte, ist der
Preis der zweiten Kartenart.

Damit fällt einiges mit weg: der Sonderschnitt der Weltkarte (sie wurde
knapp unterhalb der Eiskante beschnitten, jetzt sind es acht Punkte Luft wie
an jedem anderen Rand), die polare Ansicht im Spiel, `vbA`, und Fionas
dritte Runde. **63 Gebiete statt 64, Startbündel 138,2 → 131,7 KB.**

Zwei Tore trugen die Drei fest verdrahtet und meldeten es sofort:
`spielprobe` prüfte `[1,2,3]` auf leere Runden, die App las
`kontinentRunde` bis 3. Beide lesen die Rundenzahl jetzt aus den Daten.
Und der Sprachkorpus hielt Antarktika-Zeilen; das Tor `vergleich` brach
darüber ab.

### „Von vorne", und zwar für das Kind

Wer eine Ebene gekonnt hatte, kam nicht mehr an sie heran: der einzige Weg
zurück ging über *„Alles von Fiona löschen"* im Elternbereich — und das
löscht das ganze Profil.

Unter jeder Kachel mit Fortschritt steht jetzt ein kleines **„von vorne"**.
Zwei Tipper, nicht einer: der Knopf steht direkt neben der Kachel, und ein
Fehlgriff würde eine Woche Übung wegräumen. Der zweite Tipper sagt
ausdrücklich, was verschwindet.

Der Rauchtest geht die ganze Kette ab — Knopf da, erster Tipper fragt nach,
zweiter löscht wirklich, danach ist der Knopf weg. Er steht **zuletzt** in
der Sitzung: der erste Anlauf stand davor und meldete prompt „kein einziger
Aufkleber" — der Test hatte sich selbst die Grundlage entzogen.

### Die Stimme

Drei Änderungen, und die wichtigste ist keine Einstellung, sondern eine
Auswahl:

**Satzweise statt am Stück.** „Klasse! Das ist Australien und Ozeanien." als
*eine* Ausgabe klingt heruntergelesen — die Sprachausgabe zieht über den
Punkt hinweg. Als zwei Ausgaben hintereinander entsteht die Pause von
selbst, und genau diese Pause ist der Unterschied zwischen einem Ansagetext
und jemandem, der einen lobt. Der Jubel liegt dabei eine Spur höher als die
Sache danach: der Unterschied zwischen „Klasse!" und „Klasse."

**Tonhöhe 1,15 → 1,06.** 1,15 klang jung, aber gepresst.

**Die Stimme ist wählbar.** Welche es gibt, entscheidet das Gerät — ein
iPhone bringt je nach Fassung ein knappes Dutzend deutscher mit, ein
Schreibtischbrowser oft nur eine. Eine feste Namensliste ist deshalb eine
Voreinstellung und kein Ergebnis. Im Elternbereich steht jetzt, was *dieses*
Gerät anbietet; Antippen spielt einen Satz aus dem Spiel vor, nicht „Test
1 2 3" — man wählt eine Stimme für das, was sie wirklich sagen wird. Dazu
der Hinweis, wo iOS bessere Stimmen nachlädt.

Ein Fehler unterwegs, den der Rauchtest sechzehnmal auf einmal meldete: die
Stimmensuche läuft beim Laden und griff auf `Einst`, das erst weiter unten
deklariert wird. Ein `let` ist bis dahin nicht lesbar, und die App startete
gar nicht mehr. Der Wunsch steht jetzt in einer eigenen Variablen.

### Zwei Tore maßen, bevor die Karte stand

Ausgelöst hat es eine Gegenprobe, die „aus einem anderen Grund" durchfiel.
Dahinter lag ein Rennen — und zwar im **Tor**, nicht in der App: zwei Läufe
der Bildabnahme endeten der eine über Australien, der andere über
**Afrika**.

`kartenGroesse()` setzt Breite und Höhe der Karte in zwei aufeinander
folgenden Bildern. Wer die Bildschirmkoordinaten eines Ankers vorher liest,
bekommt sie aus der noch ungesetzten Karte und zieht dann irgendwohin.
`ansicht` meldete so 3,6 % Unterschied bei unverändertem Code, und dieselbe
Falle steckte in `ziehen` — sie erklärt, warum die gemessene Nachsicht
zwischen Läufen zwischen 60 und 80 Punkten schwankte.

Beide warten jetzt, bis die Karte wirklich steht. Drei Läufe hintereinander:
**null Bildpunkte Unterschied**, Nachsicht stabil bei 60.

### Und `proben` räumt jetzt auch beim Abbruch auf

Ein Lauf, der von der Zeitgrenze beendet wurde, ließ `if (false){` in der
Bestätigungsabfrage stehen. Der nächste Bau übernahm es, und die
Bildschirmfotos danach zeigten einen beschädigten Stand — gesehen habe ich
das erst, weil `proben` beim nächsten Start den schmutzigen Baum meldete.

„Ein Werkzeug, das den Baum schlechter zurücklässt, als es ihn vorgefunden
hat, ist gefährlicher als keines" stand schon da. Es galt nur für den
geordneten Fall. Jetzt hängt es an `SIGINT`, `SIGTERM` und `SIGHUP`.

---

## Antippen oder Ziehen

Für Lea war das Ziehen ein Umweg: sie weiß, welches Bundesland das ist, und
will es sagen können. Für Fiona ist genau dieser Zug der Lerninhalt — sie
verbindet einen Namen mit einem **Ort** auf der Karte.

Beides ist richtig, nur nicht für dasselbe Kind. Also beides, und ein
Umschalter dazwischen:

| | voreingestellt | was ein Tipper bedeutet |
|---|---|---|
| Fiona | **ziehen** | den Namen vorlesen |
| Lea | **antippen** | die Antwort geben |

**Gezogen werden kann immer.** Die Weise entscheidet nur, was ein *Tipper*
bedeutet — wer im Antipp-Modus trotzdem zieht, soll nicht ins Leere greifen.

Der Umschalter steht dort, wo er etwas zu schalten hat: unter den Antworten,
neben „Weiß ich nicht", und nur bei einer Auswahl mit Etiketten. Beim
Tippfeld gibt es nichts umzuschalten. Er heißt, was er tut — „Lieber
ziehen" beziehungsweise „Lieber antippen" —, wirkt **mitten in der Aufgabe**
(ein Neuaufbau würde die begonnene Aufgabe zurücksetzen) und merkt sich die
Wahl **je Kind**, nicht je Gerät: sonst stellt die eine der anderen das
Spiel um.

### Der Rauchtest spielt jetzt so, wie das Kind spielt

Er zog bisher immer — auch dort, wo ein Kind antippt. Damit hätte er den
neuen Weg nie berührt. Die Weise steht als **Datenfeld** am Umschalter, und
der Test liest sie dort ab, statt einen deutschen Satz zu zerlegen. Am Ende
steht eine Zeile, die zeigt, welche Wege wirklich gegangen wurden:

```
Antwortwege:   fiona: ziehen · lea: antippen
```

Fehlt einer der beiden, ist der Umschalter entweder weg oder wirkungslos —
und die Hälfte der Bedienung ungeprüft. Genau das prüfen die beiden neuen
Gegenproben nach.

### Ein Vorbild flackerte

`proben` meldete `ansicht` als *schon ohne Eingriff rot* — die Prüfung, die
es seit der Übergangsrunde gibt. Vier Spielbilder waren schlicht veraltet
(der neue Umschalter), aber eines nicht: **`mg-belohnung`** wich um 0,94 %
ab und war danach dreimal grün.

Der Entwurf spielt die Belohnung ab, wenn sie ins Bild **scrollt**
(`IntersectionObserver`, Schwelle 0,4) — und die Aufnahme scrollt sie selbst
hinein. Ob der Stern beim Auslösen schon da war, entschied das Rennen
zwischen beidem.

Ein Vorbild, das gelegentlich rot wird, ist schlimmer als keines: es erzieht
dazu, Rot zu übersehen. Die Aufnahme holt das Abgebildete jetzt erst ins
Bild und wartet, bis es **wirklich fertig** ist. Vier Läufe hintereinander:
neun von neun grün.

---

## Die Vorleserunde

Zwei Rückmeldungen von den Kindern, und die erste war ein Befund über die
ganze App.

### Fiona konnte sie nicht bedienen

Ihr Profil trägt seit dem ersten Entwurf `vorlesen: true` — *liest noch
nicht*. Abgefragt wurde es an **keiner einzigen Stelle**. Sie sah „Wie heißt
dieses Bundesland?" und vier Namen, und nichts davon sprach. Sie konnte
raten, welche Kachel wohin führt.

Jetzt sagt jeder Bildschirm beim Öffnen, was er ist, und die Aufgabe wird
mit ihren Möglichkeiten vorgelesen — so, wie ein Mensch fragen würde:

> „Wie heißt dieses Bundesland? Thüringen, Mecklenburg-Vorpommern, Berlin
> oder Rheinland-Pfalz?"

**Die Frage allein hätte nicht gereicht.** Ein Kind, das die vier Antworten
nicht lesen kann, wüsste dann, was gefragt ist, aber nicht, was zur Wahl
steht.

Zwei Details, die es braucht: die Ansage kommt **nach** dem Bildwechsel
(`zeige()` blendet 320 ms, und eine Stimme, die während des Übergangs
anfängt, gehört hörbar noch zum vorigen Bildschirm), und sie hängt am
**Kind**, nicht am Gerät — für Lea wäre dieselbe Ansage nur Lärm. Vor der
Profilwahl wird immer angesagt: dort ist noch nicht bekannt, wer davorsitzt.

### Das Forscherbuch sah nach Arbeit aus

Vorher standen dort alle rund sechzig Gebiete nebeneinander, die noch nicht
gesammelten grau mit einem Fragezeichen. Am Anfang war die Seite also fast
leer — sechzig leere Kästen. Ein Aufkleberalbum, in dem neunundfünfzig
Plätze leer sind, macht nicht stolz, sondern klein.

Jetzt steht dort, **was da ist** — größer, mit Namen. Was fehlt, kommt als
kurze Vorschau ans Ende: drei Stück aus der Ebene, an der gerade gearbeitet
wird. Nicht als Mahnung, sondern als nächster Schritt. Wer noch nichts hat,
bekommt einen Satz und drei Formen statt sechzig grauer Kästen.

**Und die Aufkleber sind jetzt Aufkleber.** Vorher trug jeder den Ausschnitt
seiner Karte: ein Kontinent stand im Maßstab der ganzen Weltkarte in seinem
Kästchen. Afrika füllte es knapp, **Europa war ein grüner Fleck von zwölf
Bildpunkten**. Jeder wird jetzt auf seine eigene Form gerahmt, aus dem Pfad
gerechnet, mit acht Prozent Luft.

### Drei neue Zusagen im Rauchtest

Ob eine App vorliest, lässt sich nicht ansehen — `speechSynthesis` gibt
nichts zurück. Der Rauchtest schreibt deshalb mit, was gesprochen wird:

```
Aufgaben vorgelesen:   Fiona 8, Lea 0  (von je 8 Ebenen)
Forscherbuch:          5 von 8 Aufklebern
```

Fehlt Fiona eine Ansage, ist die Ebene für sie nicht spielbar. Bekommt Lea
eine, hängt die Ansage nicht am Kind. Und das Buch darf höchstens drei mehr
zeigen, als wirklich gesammelt sind.

Zwei Anläufe dieser Prüfungen waren selbst falsch, beide auf dieselbe Art —
sie maßen, was leichter zu messen war:

- Der erste zählte *irgendeine* Sprachausgabe und meldete „Lea bekam 8
  Aufgaben vorgelesen". Gemessen war das **Lob** der vorigen Aufgabe, das
  beide Kinder hören. Der Mitschnitt wird jetzt geleert, bevor die Ebene
  aufgeht, und gezählt wird die Frage.
- Der zweite zählte die Aufkleber mit der Klasse `da`. Die Gegenprobe, die
  einfach alle als gesammelt zeichnete, kam damit durch: sie fälschte genau
  die Zahl, gegen die geprüft wurde. Gezählt wird jetzt gegen die **Ablage**.

---

## Offen

| | Was | Wer |
|---|---|---|
| O4 | **BKG VG250.** Der Host ist durch die Netzrichtlinie gesperrt (403 auf CONNECT). Die Bundesländer stehen auf Natural Earth 1:10m — gut genug zum Entwerfen, zu grob zum Ausliefern. Umstellung sind zwei Zeilen. | ihr oder Freigabe |
| — | **Pages einschalten**: Settings → Pages → Source = *GitHub Actions*. Ein Klick, und die Auslieferung läuft. | ihr |
| — | **Die Entwürfe und den Prototyp auf dem iPad ansehen.** Kein Tor läuft auf iOS. | ihr |
| — | Schriftentscheidung: Plus Jakarta Sans oder Nunito, am Gerät | ihr |
| — | M1: Vite und Svelte. PWA, Service Worker und Ablage stehen bereits. | ich |
| D31 | Der Beweis für den Lagernamen (F13): zwei Installationen an zwei Pfaden in denselben Browser setzen und nach der zweiten die erste ohne Netz starten. Heute prüft `pwa` nur die Form des Namens. | ich |
| D28 | `ansicht` auf dem Runner: nur im festgenagelten Playwright-Abbild sinnvoll, samt dort aufgenommener Vorbilder | ich |
| — | Leitner, Elternbereich, Protokoll | ich |

---

## Die Audit-Runde

> Auftrag: *„eine echte Schleife, ob wir irgendwo noch Fehler, Lücken oder
> Inkonsistenzen haben … Wir möchten einen Fortschritt sehen. Wir möchten
> Sterne sehen, vielleicht ein paar Sticker."*

Zwei Hälften, und die erste hat die zweite gerettet: **das Tor `inhalt` war
tot**, seit Antarktika gestrichen wurde. Hätte diese Runde nur gebaut und
nicht gesucht, wären sieben Prüfungen weiter stumm geblieben.

### Wie gesucht wurde

Nicht durch Lesen. Vier Durchgänge, jeder mit einem Werkzeug, das etwas
zählt, das ein Blick nicht zählt:

| Durchgang | Was gemessen wurde | Was gefunden wurde |
|---|---|---|
| Zustandsfelder | Welches Feld an `Sitzung`, `Einst`, `P` wird gelesen, welches nur geschrieben | F2 |
| Tote Verweise | Funktionen ohne Aufruf, CSS-Klassen ohne Markup, `var(--x)` ohne Definition, Marken ohne Verwendung | F1, F5 |
| Die Tore selbst | Jedes Tor einzeln fahren, statt sich auf den letzten grünen Lauf zu verlassen | F6, F7, F8 |
| Der Blick aufs Zielgerät | Bildschirmfotos bei 844 × 390, dem Fenster, auf dem geurteilt wird | F3, F4, F9, L1 |

### Neun Befunde

| | Befund | Wie er durchgekommen ist |
|---|---|---|
| **F1** | `--r5` war nie definiert und wurde benutzt: `padding: var(--r3) var(--r5)` am gezogenen Schild. Eine ungültige `var()` macht die **ganze** Deklaration ungültig, und weil `padding` nicht erbt, blieb null übrig — der Name klebte an beiden Rundungen. | Kein Tor misst Polsterung. `passt` misst Überlauf, `lesbarkeit` Kontrast, und das Vorbild im Bildvergleich hielt den Fehler **fest**. |
| **F2** | `st.richtig` und `st.versuche` wurden bei jeder Antwort hochgezählt und nirgends gelesen — Reste der alten Sternformel. | Ein toter Zähler tut nichts Falsches. Er lädt nur die nächste Formel ein, sich an ihm zu bedienen: genau so entstanden die zwei Sternformeln. |
| **F3** | Endbildschirm: der Balken zeigte die mittlere Fachhöhe (25 %), der Satz direkt darüber „Im Buch: **0** von 4". Zwei richtige Zahlen, die sich widersprechen, weil sie übereinanderstehen — und ein Kind liest den Balken. | Beide Zahlen waren für sich korrekt. |
| **F4** | Die Namensfahne stand „neben" dem Gebiet — um die halbe Gebiets**breite** plus die halbe Fahnenbreite. „Australien und Ozeanien" landete im Querformat mitten auf **Südamerika**. | Die Leitlinie war da. Wer sie nicht verfolgt, liest den Namen als Beschriftung des Kontinents darunter. |
| **F5** | `--flaeche-l` und `--flaeche-c` standen im Markensystem und wurden **nie benutzt**; ihre Werte waren siebenmal daneben ausgeschrieben. Wer an der Marke drehte, änderte nichts. | Das Tor `marken` verglich die sieben Zahlen **miteinander** — gleich waren sie. |
| **F6** | `tor/inhalt.mjs` importierte `src/geo/antarktika.fein.js`, gelöscht beim Streichen von Antarktika. **Sieben Prüfungen** — inhalt, topologie, beruehrung, marken, schrift, symbol, doku — stürzten vor ihrer ersten Zeile ab. | Ein abgestürztes Tor erfüllt jede Gegenprobe, die „muss rot werden" verlangt. `proben` fängt das (es fragt bei jedem roten Tor nach dem gesunden Stand) — aber seit dem Löschen war kein voller Probenlauf mehr gefahren. |
| **F7** | `●` und `○` in der neuen PIN-Anzeige, beide außerhalb des Schriftschnitts `latin`. **Zwanzig Zeilen darüber** stand, warum genau diese Zeichen gezeichnet und nicht getippt gehören. | Sie kamen aus der Systemschrift und sahen fast richtig aus. Gefunden hat es das Tor `schrift` — in derselben Minute, in der es wieder lief. |
| **F8** | `CLAUDE.md` nannte die Kette mit **zwölf** Toren, gefahren wurden **achtzehn**. `rhythmus`, `spielprobe`, `budget`, `passt`, `lesbarkeit` und `ziehen` fehlten. | Die Datei wird zu Beginn jeder Sitzung gelesen. Wer sie las, hielt sechs Tore für nicht vorhanden. |
| **F9** | Im kurzen Querformat stand `.kachel{padding:…}` — und tat **nichts**: `.kachel.bunt` setzt dieselbe Eigenschaft mit zwei Klassen. | Die Regel war zur Platzersparnis geschrieben worden. Gemessen: die Kachel blieb bei 16/24 Punkten, egal was dort stand. Genau diese 16 Punkte haben jetzt die dritte Kachelreihe wieder ins Bild geholt. |
| **F10** | `lob()` würfelte, **bis es passt**: `do { i = Math.random… } while (i === letztesLob)`. Das terminiert nur, solange der Würfel sich ändert. Im Tor `ansicht` ist `Math.random` festgenagelt — nach der zweiten richtigen Antwort stand die Schleife, der Anzeigefaden mit ihr, und die Seite antwortete auf gar nichts mehr. | Im Spiel würfelt niemand festgenagelt, der Fehler war nie zu sehen. Eine unbegrenzte Wiederholschleife im Anzeigefaden bleibt trotzdem eine: sie hat keine obere Schranke, nur eine Wahrscheinlichkeit. Gefunden hat ihn erst die neue Aufnahme, die den ganzen Bildschirm durchspielt — **zwanzig Minuten Torlauf ohne eine Zeile Ausgabe**. |
| **F12** | Dieselbe Schwelle an **vier** Stellen mit **drei** Namen. `istGekonnt` = Fach 5 und `HAT_AUFKLEBER` = 3 standen im Leitner-Modul; Fach 2 stand **zweimal als nackte Zwei** in `prototyp/spiel.js` — unter dem Namen `gekonnt`, den das Forscherbuch für Fach 5 benutzt. Und der Haken, den diese Zwei auf die Karte malt, sieht aus wie das Siegel, das im Buch „sicher" heißt. | Jede Stelle war für sich richtig. Erst nebeneinander gelegt fällt auf, dass ein Wort drei Zahlen bedeutet. Gefunden beim Nachrechnen einer neuen Aufnahme: zwei Kontinente trugen einen Haken, deren Fach 2 und 3 war. |
| **F11** | Sieben Marken in den Entwürfen (`--app-tinte`, `--app-gut`, `--app-linie`, `--app-tinte2`, `--app-tinte3`, `--tinte-leise`, `--tinte-weich`) gab es nicht mehr — Reste einer Umbenennung. | Bei `color:` fällt eine ungültige `var()` auf den geerbten Wert zurück, und der war hier zufällig derselbe. Der Bildvergleich meldete nach der Reparatur **null** geänderte Bildpunkte: der Fehler war unsichtbar, aber die nächste Änderung an einer dieser Marken wäre wirkungslos geblieben. |

Und eine, die die alte Fassung mitgenommen hat: `die Karte wechselt die
Farbe` suchte die ausgeschriebene Farbe `--f1: oklch(0.74 0.135 25)`, die es
seit F5 nicht mehr gibt. Sie dreht jetzt an `--flaeche-c` — und ist damit
zugleich die Gegenprobe auf die Ableitung selbst: greift sie nicht durch,
hängen die sieben Farben doch nicht an der Marke.

**Nicht bestätigt**: der Verdacht, `proben` prüfe den gesunden Stand zu spät.
Nachgesehen — `istGesund` läuft bei **jedem** roten Tor, also auch bei einem
abgestürzten. Keine Lücke, und der Verdacht steht hier, damit ihn niemand
ein zweites Mal hat.

### Drei neue Tore, aus drei Befunden

**Jede benutzte Marke muss es geben** (in `marken`). Der Fehler, der das
ausgelöst hat, ist F1 — und er ist die ganze Begründung: eine ungültige
`var()` macht nicht einen Wert ungültig, sondern die **ganze Deklaration**.
Bei `padding` (erbt nicht) bleibt null übrig, bei `color` (erbt) der
geerbte Wert. Beides sieht im Browser nach nichts aus. Das Tor sammelt jetzt
alle gesetzten Marken (auch die aus `setProperty`) und legt sie neben alle
benutzten; gerechnete Namen wie `var(--f${…})` werden übersprungen. Beim
ersten Lauf fand es **acht** — `--r5` und die sieben aus F11.


**Die Kette vergleicht sich selbst** (in `doku`). `CLAUDE.md` wird neben
`npm run tor` in `package.json` gelegt — und neben die Überschriften der
Tore, die weitere in sich tragen (`inhalt` fährt sieben, `pwa` zwei). Gezählt
wird dort, wo die Tore sich melden, nicht in einer dritten Liste, die wieder
veralten kann. Verglichen werden Mengen, keine Reihenfolgen: die Reihenfolge
steht in `package.json` und braucht keine zweite Fassung.

**Die Flächenfarben leiten sich ab** (in `marken`). Die alte Prüfung verglich
sieben ausgeschriebene Helligkeiten miteinander; nach der Ableitung hätte sie
null Farben gefunden und wäre rot geworden, ohne dass etwas kaputt war. Sie
prüft jetzt die **Form**, die die Gleichheit trägt: jede der sieben muss
dieselbe Marke benutzen, die Marke steht je Modus genau einmal, ihre
Helligkeit liegt zwischen 0,60 und 0,86 (darüber trägt der dunkle Textton
nicht mehr), und der Abendmodus ist dunkler als der Tag. Wer eine einzelne
Farbe wieder festnagelt, fällt durch.

### Fortschritt, Sterne, Aufkleber — dort, wo das Kind hinsieht

Der Wunsch war nicht „mehr Grafik", sondern **etwas zu sehen bekommen**. Drei
Stellen:

**Die Ebenenwahl.** Auf dem Zielgerät stand je Kachel „0 von 4" — und sonst
nichts: der Balken und die Überzeile waren im kurzen Querformat ausgeblendet,
damit acht Kacheln passen. Fiona liest keine Zahlen. Jetzt trägt jede Kachel
eine **Sternreihe**, die Zahl der **Aufkleber** mit ihrem Zeichen und einen
**Balken** — im kurzen Querformat alles drei in *einer* Zeile, damit die
Kachel nicht höher wird als vorher. Die Sterne kommen aus derselben Formel
wie im Spiel (`sterneFuer`), nur mit einer anderen Grundgesamtheit: nicht
„glatt in dieser Runde", sondern „im Buch von dieser Ebene". Eine Formel,
drei Anzeigen.

**Der Balken, überall derselbe.** Zwei Streifen mit je einer Bedeutung:
*fest* = hat einen Aufkleber (genau die Zahl daneben), *unterwegs* = wie weit
die Gebiete im Schnitt sind. `unterwegs` wird auf `fest` hochgezogen — ein
Gebiet in Fach 3 zählt als Aufkleber, trägt zum Mittel aber nur die Hälfte
bei, und der helle Streifen säße sonst unter dem dunklen. Damit ist F3
geschlossen: der Balken sagt dasselbe wie der Satz darüber.

**Der Endbildschirm.** Ein **Hauptknopf** statt drei gleich leiser
(„Noch einmal" trägt jetzt dieselbe Tiefe wie ein Antwort-Etikett — genau ein
lauter Knopf je Bildschirm), der Aufkleberstand als **Zeichen mit Zahl**
statt als Nebensatz, und der Erklärsatz „Beim zweiten Mal richtig gibt es
einen Aufkleber" nur noch, **solange** noch keiner da ist.

### Das Tor `ansicht` sieht endlich das Zielgerät

Bis zu dieser Runde entstanden alle Vorbilder bei **1240 × 1000** — kein
Gerät, das jemand benutzt, sondern die Größe, bei der zufällig die erste
Aufnahme entstand. Das Fenster, auf dem geurteilt wird (iPhone quer,
844 × 390), hat **eigene Regeln** (`max-height:440px`), und die hatten kein
Bild gesehen. Eine davon war überdies wirkungslos (F9).

Vier neue Aufnahmen, alle bei 844 × 390: **Ebenenwahl, Spielbildschirm,
Endbildschirm, Forscherbuch** — also genau die drei Bildschirme, auf denen
Fortschritt, Sterne und Aufkleber leben und die vorher **überhaupt kein**
Vorbild hatten.

Der Lernstand dafür wird **gesetzt, nicht erspielt**: vier Kontinente in vier
verschiedenen Fächern. Ein Bildschirm mit lauter Nullen zeigt von Sternen und
Aufklebern nichts — wer eine Wirkung abbilden will, muss sie einschalten.

Der Endbildschirm brauchte zwei Umwege, und beide sagen etwas über die App:
Fiona **zieht**, und ein Antippen ist dort ausdrücklich keine Antwort — der
Durchlauf kam nach vierzig Aufgaben nicht ans Ende. Lea **tippt** die
Kontinente, dort gibt es gar keine Auswahl zum Anklicken. Also wird Fionas
Antwortweise gesetzt: dieselbe Einstellung, die im Spiel unter „Lieber
antippen" steht.

Und dieser eine Durchlauf hat F10 gefunden — die Endlosschleife im Lob. Kein
anderes Tor spielt eine Runde bis zum Schluss **mit festgenageltem Würfel**.

### Zehn neue Gegenproben

Wer ein Tor ändert, trägt dort eine Probe nach. Aus 36 sind **46** geworden,
und der volle Lauf braucht dafür 35,6 Minuten — smoke allein 30 davon.
Drei stammen aus dem ersten Teil der Runde (Sterne im Kopf, Fortschrittsband,
PIN), sieben aus dem zweiten:

| Probe | Tor | Was sie nachstellt |
|---|---|---|
| eine benutzte Marke gibt es nicht | `marken` | F1, wörtlich: `gap:var(--gibtsnicht)` |
| die Karte zeigt den Fortschritt erst viel später | `smoke` | F12: `SITZT` von 2 auf 5 — die eine Stelle, an der die Schwelle noch steht |
| eine Flächenfarbe hängt sich vom System ab | `marken` | F5: eine der sieben wieder festgenagelt |
| CLAUDE.md verschweigt ein Tor der Kette | `doku` | F8: `spielprobe` aus der Aufzählung gestrichen |
| die Ebenenwahl zeigt keine Sterne und Aufkleber mehr | `smoke` | die Kachel ohne Sternreihe |
| Balken und Aufkleberzahl laufen wieder auseinander | `smoke` | F3: der Balken zeigt wieder die mittlere Fachhöhe |
| auf dem Zielgerät verschwindet der Kachelbalken | `ansicht` | L1: geändert wird etwas, das **nur** im kurzen Querformat gilt — bleibt `ansicht` grün, fotografiert es das Zielgerät nicht |

Die letzte ist die wichtigste: sie prüft nicht die Anzeige, sondern **das
Tor**. Bei 1240 × 1000 greift die geänderte Regel gar nicht — wer die neuen
Aufnahmen wieder herausnimmt, fällt hier durch.

### Was das Fotografieren des Zielgeräts sonst noch gekostet hat

Zwei Nebenbefunde, beide aus derselben Ecke:

`.klebermarke` stand zuerst in `--tinte-3`. Das Tor `lesbarkeit` meldete sie
**sechzehnmal** — 3,8:1 gegen die bunten Kacheln am Tag, 3,1:1 am Abend, nötig
sind 4,5:1. Der Unterschied zwischen „schon welche" und „noch keine" steckt
jetzt im Zeichen, nicht in der Lesbarkeit der Zahl.

Und das Startbündel ist von 131,7 auf 140,2 KB gewachsen (von 400 erlaubt) —
die Ratsche hat es gemeldet, und die Antwort ist ja: Vorlesen, Umschalter,
Forscherbuch, Fortschrittsband, Sterne und Aufkleber sind seit dem letzten
Stand dazugekommen. Neu festgehalten.


---

## Die Temporunde

> *„Was sind denn die ganzen Gegenproben und warum dauert das so lange? Ich
> möchte gerne schneller Anforderungen live schalten."*

Die Frage hat zwei Dinge zusammengefasst, die getrennt gehören. Gemessen,
nicht geschätzt — jede Zahl aus einem Lauf auf diesem Rechner:

| Bis LIVE, jede Auslieferung | | Das Ritual, jede 3. Runde | |
|---|---|---|---|
| `smoke` | 109 s | `proben` voll | **35,6 min** |
| `ansicht` | 33 s | davon `smoke` | 30,0 min |
| `passt` | 30 s | | (16 Proben × 110 s) |
| `ziehen` | 26 s | | |
| `lesbarkeit` | 4 s | | |
| `pwa` + `bauen` | 3 s | | |
| `inhalt` und der Rest | 1 s | | |
| **lokal** | **3,5 min** | | |
| **auf dem Runner** | **4,2 min** | | |

**Die 36 Minuten stehen nie im Weg.** `proben` läuft weder bei der
Auslieferung noch auf dem Runner — der fährt `tor:runner`. Zwischen „fertig"
und dem iPhone liegen vier Minuten.

### `proben --geaendert`

Der volle Lauf beweist etwas, das sich in einer Runde mit zwei geänderten
Dateien meist gar nicht ändern **kann**. Die Grundlinie ist der Commit, der
im Stand steht — also „was ist seit dem letzten vollständigen Beweis
passiert". Eine Probe läuft, wenn die Datei, in die sie eingreift, oder das
Tor, das sie fährt, seither angefasst wurde.

Erster Lauf: **15 von 49 Proben, 36 Sekunden.**

Was sie **nicht** fängt, und das steht als Kommentar daneben: die mittelbare
Kopplung. Wer `prototyp/spiel.js` ändert, kann eine Probe brechen, die in
`src/marken/marken.css` eingreift — der Rauchtest verhält sich anders, der
Eingriff kommt an, und das Tor meldet etwas anderes als erwartet.

Deshalb schreibt die Abkürzung **keinen Stand**: `vollerLauf` ist jetzt
`NUR.length === 0 && !GEAENDERT`. Täte sie es, wäre `rhythmus` grün, ohne
dass je ein vollständiger Beweis stattgefunden hätte — die Regel „alle drei
Runden" wäre still ausgehebelt, und das ist genau die Sorte Loch, die dieses
Werkzeug aufdecken soll.

### Die Vorschau-Auslieferung

Ein eigener Ablauf auf dem Zweig `vorschau`: nur die Tore **ohne Browser**
(`inhalt` mit seinen sieben, `spielprobe`, `vergleich`, `budget` — zusammen
unter drei Sekunden), kein `playwright install` (allein 39 s), Ziel
`/vorschau/`. Rund anderthalb Minuten von „mach das" bis „schau es dir an".

Drei Dinge, die daran nicht offensichtlich waren:

**Beide Abläufe stellen beide Hälften zusammen.** Pages kennt eine Seite je
Verzeichnis. Täte es nur einer, löschte jede Auslieferung die Vorschau,
während jemand sie ansieht — und jede Vorschau setzte das Spiel der Kinder
auf einen älteren Stand zurück. `tools/seite-zusammenstellen.mjs` holt die
jeweils andere Hälfte aus ihrem Zweig in einen Nebenbaum und baut sie dort.

**Die Marke steht in der gebauten Seite, nicht in der App.** Ein Zweig im
Programm, den nur die Vorschau nimmt, wäre Code, den kein Tor je sieht — und
das ausgelieferte Spiel trüge ihn ungenutzt mit.

**Das Tor `doku` hält die Abkürzung kurz.** Die Auslieferung muss weiter die
volle Kette fahren, die Vorschau darf nicht auf `main` laufen, und was sie
nicht prüft, muss namentlich in ihr stehen. Beim ersten Lauf fehlte
`rhythmus` in der Liste.

### F13: der Service Worker räumte fremde Lager ab

Ein echter Fehler, den es ohne die Vorschau nie gegeben hätte — und der mit
ihr beim ersten Blick auf `activate` sichtbar wurde:

```js
if (name.startsWith('smart-kids-') && name !== LAGER) await caches.delete(name);
```

Solange es **eine** Installation gab, war das richtig: aufräumen, was von
älteren Fassungen übrig ist. Cache Storage gilt aber je **Herkunft**, nicht
je Geltungsbereich. Mit `/` und `/vorschau/` gibt es zum ersten Mal zwei —
und jeder Blick in die Vorschau hätte dem ausgelieferten Spiel den
Offline-Vorrat gelöscht. Beim nächsten Start im Zug wäre es nicht mehr da
gewesen.

Der Lagername trägt jetzt den Pfad (`smart-kids-Smart-Kids-vorschau-`…).
Das Tor `pwa` prüft die **Form** des Namens — und sagt in seinem Kommentar
ausdrücklich, dass es die Form prüft und nicht die Wirkung. Der Beweis wäre,
zwei Installationen an zwei Pfaden in denselben Browser zu setzen und nach
der zweiten die erste ohne Netz zu starten. Steht unten als offener Punkt.

### Der Versand geht nicht aus dem Zweig heraus — und braucht trotzdem keine Einstellung

Der erste Lauf auf dem Zweig `vorschau`:

```
Schnelle Tore   ✓ erfolgreich   23 s
Nach Pages      ✗ fehlgeschlagen 1 s   ohne Runner, ohne einen Schritt, ohne Protokoll
```

Die schnelle Hälfte stimmt und ist gemessen: **23 Sekunden**, besser als die
anderthalb Minuten, mit denen ich gerechnet hatte. Der Versand fällt durch,
bevor er anfängt.

**Zur Ursache:** null Schritte, kein Runner, leeres `output` über die API —
die Signatur der Umgebungsregel, die Auslieferungen auf den Standardzweig
beschränkt. Belegt war sie zunächst **nicht**; das Protokoll eines Jobs, der
nie lief, gibt es nicht, und ich hatte sie trotzdem als Tatsache
hingeschrieben. Der Umbau unten war deshalb zugleich der Beweisversuch.

**Er ist gelungen, und damit ist die Diagnose belegt:** derselbe
`deploy-pages`-Schritt, der aus dem Zweig `vorschau` nach einer Sekunde
ohne Runner durchfiel, läuft aus dem Zusammenhang von `main` in sechs
Sekunden durch. Am Schritt hat sich nichts geändert, nur am Zweig, in dem
er läuft.

Statt einer Einstellung ein zweiter Ablauf. `workflow_run` löst das ohne
jeden Klick: ein so ausgelöster Ablauf läuft **im Zusammenhang des
Standardzweigs**, darf also versenden.

```
vorschau.yml           Push auf `vorschau` → nur die schnellen Tore. Prüft, versendet nicht.
vorschau-versand.yml   workflow_run "Vorschau" → baut main, stellt beide
                       Hälften zusammen, liefert aus. Läuft auf main.
```

Damit fällt auch `--rolle` weg: beide Abläufe stellen jetzt aus demselben
Zweig heraus dasselbe zusammen. Eine Verzweigung, die niemand nimmt, ist
eine Verzweigung, die niemand prüft.

**Gemessen am fertigen Weg** (Lauf vom 29.08.):

```
Vorschau            23 s   npm ci, die vier Tore ohne Browser, bauen
Vorschau versenden  22 s   Nachfrage 0 s · npm ci 6 · bauen 2 ·
                           zusammenstellen 1 · hochladen 1 · deploy-pages 6
────────────────────────
zusammen            45 s   von `git push` bis im Netz
```

Gegen 4,2 Minuten über `main`. Und die Nachfrage, ob dieser Stand die Kette
bestanden hat, kostet **null Sekunden** — sie ist ein API-Aufruf.

**Das Loch, das dabei aufging.** Der Versand baut `main` neu, ohne die Kette
zu fahren — das ist ja die eingesparte Zeit. Damit könnte eine Vorschau
einen **roten** `main`-Stand unter `/` schieben, dorthin, wo die Kinder
spielen. Zwei Riegel:

- Der Ablauf fragt bei GitHub nach, ob es für genau diesen Commit eine
  **erfolgreiche Auslieferung** gibt (`head_sha=…&status=success`). Sonst
  bricht er ab.
- `seite-zusammenstellen.mjs` weigert sich, wenn `HEAD` nicht auf `main`
  liegt (`git merge-base --is-ancestor`).

Und das Tor `doku` prüft die Eigenschaft statt der Zuständigkeit: **jede**
Ablaufdatei, die einen Pages-Anhang hochlädt, muss vorher die Seite
zusammengestellt haben — sonst löscht sie die andere Hälfte.

### Drei neue Gegenproben

| Probe | Tor |
|---|---|
| die Vorschau verschweigt ein Tor, das sie nicht fährt | `doku` |
| die Vorschau läuft auf main | `doku` |
| ein Ablauf schickt nur seine halbe Seite nach Pages | `doku` |
| die Vorschau schiebt einen ungeprüften Stand unter / | `doku` |
| der Lagername vergisst den Ort | `pwa` |

**56 Gegenproben, alle schlagen an.** Und die Regel hat sofort zugebissen:
nach dem Hinzufügen war die Kette rot — *„Es stehen 49 Proben im Baum,
festgehalten sind 46"*. Neue Proben dürfen nicht ungefahren mitlaufen.

---

## Die Mathe-Runde (Runde 2 des ANTON-Fahrplans)

> *„Wie weiter?"* — und die Antwort war nicht die spaßigste Runde, sondern
> die tragfähigste: bis heute war eine „Aufgabe" in dieser App immer **ein
> Gebiet auf einer Karte**. Ein Rechenblatt hat keine.

### Was sich an der Architektur geändert hat (C3)

Weniger, als es aussah — weil `starten()` schon fast allgemein war. Es lädt
den Stand, baut den Vorrat, macht eine Leitner-Sitzung. Kartenspezifisch war
genau eine Zeile: welcher Bildschirm kommt.

```
EBENEN   { id:'rechnen:plusminus', art:'rechnen', wer:['fiona'], mischung }
vorrat() erzeugt statt aufzulisten
starten() zeige(ebeneArt(id) === 'rechnen' ? rechenschirm : spielschirm)
```

`wer` ist neu und trägt weiter: Fiona rechnet Plus und Minus, Leas Reihen
sind die nächste Runde. Ohne das stünde bei beiden dieselbe Kachel, und eine
davon wäre die falsche.

**Was jetzt an EINER Stelle steht**, weil es zwei Bildschirme gibt:

| | |
|---|---|
| `werten()` | was eine Antwort BEWIRKT — Leitner, „glatt", Band, Aufkleber, Ablage |
| `kopfNachziehenIn()` | Sterne und Fortschrittsband nachziehen |
| `aufgabenKopf()` | der Kopf mit Band und Sternen |
| `lobsatz()` | der Satz nach der Antwort |

Die Aufgabenart entscheidet nur noch das eine, was bei ihr wirklich anders
ist: **ob** die Antwort stimmt. Genau so sind hier schon einmal zwei
Sternformeln entstanden — dieselbe Sache, an zwei Stellen gerechnet.

Und das Herauslösen hat sofort einen Fehler gemacht: `fachVorher` wanderte
mit in die neue Funktion, wurde im Protokolleintrag aber weiter gebraucht.
`ReferenceError: fachVorher is not defined`, zwölfmal — vom Rauchtest in
derselben Minute gemeldet.

### Fionas Plus und Minus (C1)

100 Aufgaben: **45 Additionen** (a, b ≥ 1, a + b ≤ 10) und **55
Subtraktionen** (1 ≤ b ≤ a ≤ 10). Gefragt wird im Verhältnis **80 zu 20** —
und das ist die Mischung der SITZUNG, nicht die des Vorrats: der Leitner
wählt nach Fälligkeit, nicht nach Rechenart. Er wird deshalb je Art einmal
gefragt, mit der Länge, die auf sie entfällt, und danach wird gemischt —
sonst kämen erst fünf Plus- und dann eine Minusaufgabe, und die Reihenfolge
wäre die Antwort.

**„Wenig mit 0" ist zu einer Regel geworden**, weil „wenig" keine Zahl ist:
die Null kommt **nur als Ergebnis** vor. `6 − 6 = 0` bleibt — was übrig
bleibt, wenn man alles wegnimmt, ist eine Aufgabe. `7 + 0` fällt weg. Wäre
die Null als Summand erlaubt, wären es 21 von 66 Additionen, ein knappes
Drittel; das ist nicht „wenig". Die Entscheidung steht im ANTON-Abgleich,
nicht nur hier.

**Die drei falschen Antworten sind die, die ein Kind wirklich gibt:** ±1
(verzählt beim Weiterzählen), ±2, und die Gegenrechnung (`a − b` statt
`a + b`). Wer zufällig wählt, macht die Aufgabe leichter, weil die falschen
Antworten offensichtlich sind.

### Angetippt, nicht gezogen — und warum das kein Sparen ist

Auf der Karte lernt das Ziehen etwas: dieser Name gehört an DIESEN Ort.
`3 + 4` hat keinen Ort. Eine Zahl in ein Kästchen zu schieben wäre Motorik
ohne Lehre. Der Abgleich sagt für Fionas Profil ausdrücklich „vier
Möglichkeiten zum Antippen"; der Umschalter „Lieber ziehen" erscheint auf
Rechenebenen deshalb gar nicht. Nebenbei bleibt damit die Ziehmechanik
unangetastet, und dort liegen sechs Gegenproben.

### Das Forscherbuch sammelt etwas ohne Umriss (C3c)

Heute IST der Aufkleber der Umriss. Gelöst **ohne ein einziges neues Bild**:
gesammelt wird die **Aufgabe selbst**, groß und in der Kinderschrift.
`3 + 4` in einem Kästchen ist so wiedererkennbar wie die Form von Afrika —
und ehrlicher als ein erfundenes Symbol, das mit dem Gelernten nichts zu tun
hätte. Verdeckt wird bei einer offenen Aufgabe die **Antwort**, nicht die
Rechnung: sonst stünde in der Vorschau ein Fragezeichen, das nichts darüber
sagt, was als Nächstes kommt.

### Die Zahlen stehen im Dokument, nicht im Code

Zahlenraum, die 80/20 und die Vorratsgrößen stehen im ANTON-Abgleich, und
das Tor `doku` legt sie neben das, was `rechnen.js` wirklich erzeugt.
Dieselbe Mechanik wie beim Tor `budget`, das seine Grenzen aus dem Konzept
liest: zwei Zahlen an zwei Orten veralten getrennt, die eine wird gepflegt,
die andere gilt.

### Was die Tore dazugelernt haben

| Tor | neu |
|---|---|
| `doku` | Zahlenraum, Anteile und Vorratsgrößen gegen den Abgleich; Null nur als Ergebnis; keine zwei Aufgaben mit derselben Kennung |
| `spielprobe` | alle 100 Aufgaben × 4 Möglichkeiten — 843 statt 443 Antworten. Jede Rechnung gegen die zweite Meinung von JavaScript |
| `smoke` | spielt die Rechenebene wirklich; prüft, dass sie bei Fiona steht und bei Lea NICHT; „Fiona 9 von 9 vorgelesen" (die feste Acht war mit der neunten Ebene falsch geworden) |
| `ansicht` | `quer-rechnen` — der erste Bildschirm ohne Karte, auf dem Zielgerät |
| `passt` | neun Kacheln auf sieben Größen, grün |

**Fünf neue Gegenproben, 56 insgesamt.** Eine davon hat zuerst nichts
bewiesen und dabei etwas gezeigt: der erste Riegel gegen „ein Ablenker ist
die richtige Antwort" greift bei b ≥ 1 nie — ±1 und ±2 sind nie das
Ergebnis, und die Gegenrechnung nur bei b = 0, was der Vorrat ausschließt.
Er steht trotzdem zu Recht dort, weil die Probe daneben die Null wieder als
Summanden zulässt. Geprobt wird jetzt der zweite Riegel, im Auffüllen: bei
`10 − 10 = 0` bleiben nach ±1, ±2 und Gegenrechnung nur zwei Zahlen übrig,
und aufgefüllt wird ab 0 — also genau mit der richtigen Antwort.

### Offen aus dieser Runde

Die Ebenenwahl hat jetzt **neun** Kacheln, und die neunte steht allein in
der dritten Reihe. `passt` ist grün, aber schön ist es nicht. Das ist genau
der Punkt, an dem D4 aus dem Abgleich fällig wird: **Fachwelten** — Erdkunde
und Mathe als zwei Welten mit eigenem Gesicht, statt einer Liste, die immer
länger wird. Mit Leas Reihen kommt die zehnte Kachel.

---

## Der Wal im Rauchtest

> *„Weiter und voller Lauf dauert viel zu lange"*

Die Temporunde hatte den Weg **live** verkürzt — vier Minuten bis aufs
iPhone, 45 Sekunden für die Vorschau. Was sie nicht angefasst hat, war das
**Ritual**: der volle Probenlauf, alle drei Runden fällig, 35,6 Minuten.

Die Messung von damals sagt schon, wo sie liegen:

| | |
|---|---|
| `proben` voll | 35,6 min |
| davon `smoke` | 30,0 min |

Ein Tor, siebzehn Proben, 84 % der Zeit. Und der Grund ist nicht, dass der
Rauchtest langsam wäre — er ist es nicht, 109 Sekunden für die ganze App —,
sondern dass **jede** dieser siebzehn Proben ihn **ganz** fuhr, um einen
seiner fünf Durchgänge rot zu sehen. Wer prüft, ob die PIN-Sperre hält,
lässt vorher die Erdkunde, die Ablage, das Tippen und vier Ebenen laufen.

### Dasselbe Mittel, das `ziehen` schon hat

```
npm run smoke -- --nur=spielen,tippen
```

Fünf Abschnitte: `spielen` · `ablage` · `tippen` · `ebene4` · `durchgang`.
Zwei Dinge waren dabei nicht offensichtlich:

- **`ablage` braucht `spielen`.** Die Ablage prüft, was ein gespielter
  Durchgang hinterlassen hat — allein gefahren prüft sie eine leere Ablage
  und ist grün. Also zieht der Wähler die Voraussetzung selbst nach
  (`BRAUCHT`), statt sie in siebzehn Probenzeilen zu wiederholen.
- **Ein unbekannter Abschnittsname bricht ab.** Ohne das wäre ein Tippfehler
  in einer Probe ein Rauchtest, der gar nichts fährt und grün meldet — also
  genau die Verfallsart, gegen die dieses ganze Werkzeug gebaut ist.

Gemessen, je Abschnitt einzeln:

| Abschnitt | Dauer |
|---|---|
| `spielen` | 28 s |
| `ablage` | 32 s |
| `tippen` | 1 s |
| `ebene4` | 15 s |
| `durchgang` | 67 s |

### Die Gegenprobe, die zweimal Verschiedenes sagte

Erster Lauf über die siebzehn: **fünfzehn schlugen an, zwei meldeten
„beweist nichts"** — die Rechenebene, die plötzlich beiden Kindern gehört,
und „von vorne", das nichts löscht. Einzeln gefahren schlugen beide an, 142 s
und 69 s. Ein zweiter voller Durchgang: **17 von 17.**

Die Zuordnung stimmt also. Was der Grund war, weiß ich nicht — und das ist
der wichtigere Befund. **Eine Gegenprobe, die zweimal Verschiedenes sagt,
ist schlimmer als eine fehlende**, weil man ihr danach nicht mehr glaubt und
sie trotzdem stehen lässt.

Der Verdacht: kurz zuvor war ein Probenlauf per Zeitüberschreitung **hart**
abgeschossen worden, und sein Chromium lief vermutlich weiter. Nachträglich
beweisen lässt sich das nicht mehr. Also wird aus dem unsichtbaren Verdacht
eine **laute Weigerung** — `proben` sieht vor dem ersten Eingriff nach, ob
schon ein Browser läuft, und verweigert dann den Dienst, mit `--trotzdem`
als Ausweg. Das beweist den Zusammenhang immer noch nicht. Aber er kann kein
zweites Mal unbemerkt gewesen sein.

**Und die Weigerung selbst brauchte sofort ihre eigene Gegenprobe.** Der
erste Entwurf las `ps -eo pid,args` und suchte darin nach „chrome" — und
verweigerte prompt den Dienst, obwohl kein Browser lief: gefunden hatte er
die **eigene Shell-Zeile**, in der das Wort vorkam. Eine Weigerung, die
immer anschlägt, ist so wertlos wie ein Tor, das nie etwas meldet. Gesucht
wird jetzt am Programmnamen (`comm`), nicht an der Befehlszeile, und beide
Richtungen sind gemessen: still ohne Browser, laut mit einem.

### Was es gebracht hat

| | vorher | nachher |
|---|---|---|
| die 17 Rauchtest-Proben | ~31 min | **16,3 min** |
| `proben` voll | 35,6 min | **22,3 min** |

Gemessen am vollen Lauf, nicht gerechnet: **52 Proben in 22,3 Minuten**,
dazu die vier `rhythmus`-Proben am frischen Stand — **56 von 56 schlagen
an, keine beweist nichts.** Der Rauchtest steht darin mit 981 s, also
16,3 min; die zweitgrößte Last ist `ansicht` mit 111 s.

Der volle Lauf bleibt das, was er ist: das Ritual alle drei Runden, das nie
zwischen „fertig" und dem iPhone steht. Er dauert jetzt nur noch halb so
lange — und das ist der Unterschied zwischen einer Regel, die man befolgt,
und einer, die man abkürzt.

---

## Leas Reihen (C2)

Runde 3 des ANTON-Fahrplans, und sie steht auf Runde 2: der Aufgabentyp
ohne Karte war schon da, der Leitner konnte schon erzeugte Gegenstände,
und der Rechenschirm gab es. Neu sind **die Zahlen, eine zweite
Eingabeweise und ein Regler**.

### Vier Sorten, damit sich eine steuern lässt

| Sorte | was | wieviele |
|---|---|---|
| `mal` | 6 × 1 … 9 × 9 | 36 |
| `zehner` | alles, worin eine 10 steckt | 14 |
| `geteilt` | 56 : 7 — die Umkehrung der Reihe | 50 |
| `leicht` | 2 × 1 … 5 × 10, die Verschnaufpause | 40 |

**140 Aufgaben.** Lea sieht zwischen den ersten dreien keinen Unterschied
— getrennt sind sie, weil die *Mischung* sie trennen muss: der Leitner
wählt nach Fälligkeit, nicht nach Sorte.

Und damit ist aus „weniger × 10" eine **Zahl** geworden, so wie bei Fiona
aus „wenig mit 0" eine Regel wurde. Von Natur aus steckt in 14 der 50
Reihenaufgaben eine Zehn, also 28 %; eingestellt sind 10 % der
Multiplikationen. Weggenommen wird sie nicht: eine Aufgabe, die nicht im
Vorrat steht, kann das Kind nie lernen. Das Tor rechnet den natürlichen
Anteil **selbst** aus und verlangt, dass der eingestellte darunterliegt —
sonst hätte „weniger" nichts verringert.

### Der Regler hat genau eine Stellschraube

Im Elternbereich verschiebt er Multiplikation gegen Division, von 90/10
bis 50/50. Alles andere folgt daraus: von dem, was der Multiplikation
bleibt, geht je ein Zehntel an `zehner` und an `leicht`. Vier Zahlen, die
zusammen 1 ergeben müssen, ergeben irgendwann nicht mehr 1.

### Der Fund: an der Voreinstellung gab es keine Division

Das ist der Grund, warum der Regler eine eigene Gegenprobe bekommen hat —
und sie hat beim ersten Lauf sofort zugeschlagen, nicht am Regler, sondern
an der Sitzung dahinter.

Eine gemischte Sitzung wurde bisher so aufgeteilt: jeden Anteil einzeln
runden, den Rest auf die **letzte** Sorte legen. Bei Fionas zwei Sorten
war das harmlos. Bei Leas vier:

```
Regler 10 %   mal 6 · zehner 1 · leicht 1 · geteilt 0     ← KEINE Division
Regler 50 %   mal 3 · zehner 0 · leicht 0 · geteilt 5     ← statt vier
```

**An der Voreinstellung wurden aus den zugesagten 10 % Division null.**
Kein bestehendes Tor hätte das gemeldet: die Sitzung hatte acht Aufgaben,
alle rechenbar, alle richtig gewertet. Von aussen war nichts zu sehen.

Verteilt wird jetzt nach dem **größten Rest** (`Leitner.verteilen`) — die
Rechnung, mit der Sitze auf Stimmen verteilt werden. Die Summe stimmt
immer, und niemand wird bevorzugt, weil er zufällig hinten steht:

```
Regler 10 %   mal 6 · zehner 1 · leicht 0 · geteilt 1
Regler 50 %   mal 3 · zehner 1 · leicht 0 · geteilt 4
Fiona (6)     plus 5 · minus 1                            ← unverändert
```

### Gemessen wird am Ende der Kette

Zwischen dem Regler und dem, was Lea vorgelegt bekommt, liegen vier
Stationen: Regler → `Einst.reihenGeteilt` → `EBENEN.mischung()` → die
Sitzung. Jede kann still ausfallen, und ein Regler, der sich schieben
lässt und sich beschriftet, sieht dabei genauso aus wie einer, der wirkt.

Der neue Rauchtest-Abschnitt `regler` stellt ihn deshalb auf 50 %, spielt
**acht Aufgaben durch** und zählt: genau vier müssen Divisionen sein. Das
ist keine Schätzung — die Verteilung ist rechenbar. Ein eigener Abschnitt,
weil er als einziger eine ganze Sitzung spielt: so bezahlt ihn nur die
Gegenprobe, die ihn braucht.

Daneben prüft `spielprobe` die Verteilung **ohne Browser**, in einer
Sekunde: fünf Sitzungslängen × elf Reglerstellungen, und die Zusage
lautet, dass keine Sorte leer ausgeht, der ein ganzer Platz zusteht.

### Schreiben statt antippen

Lea schreibt das Ergebnis, Fiona tippt eine von vier Zahlen an — so steht
es im Abgleich, und es hängt am **Profil**, nicht an der Ebene. Umschalten
lässt es sich unter der Aufgabe, neben „Weiß ich nicht", mit demselben
leisen Knopf wie auf der Karte.

Beide Felder werden gebaut und eines versteckt, statt beim Umschalten den
Bildschirm neu zu bauen. Ein Neuaufbau setzte `versuch` zurück: wer nach
dem zweiten Fehlversuch umschaltet, bekäme drei neue geschenkt — und die
Auflösung nach drei Fehlern wäre nie erreichbar.

Leer auf „Prüfen" zu tippen ist **kein** Fehlversuch. Ein Kind, das den
Knopf sucht, hat sich nicht verrechnet.

### Die Ablenker sind andere als bei Fiona

Bei Plus und Minus greift ein Kind nach ±1 und nach der Gegenrechnung.
Beim Einmaleins nach den **Nachbarn in der Reihe**: wer 7 × 8 nicht weiß,
sagt 49 oder 63, nicht 57. Also ±a und ±b, und erst danach die kleinen
Verzähler. Bei der Division sind die Nachbarn im *Ergebnis* die
Versuchung, nicht im Dividenden.

Welcher Satz gilt, entscheidet `ablenkerFuer` — nicht der Bildschirm.
Sonst wüsste die Anzeige, was eine Zehnerreihe ist.

### Zahlwörter bis 100

`gesprochen(56)` sagt jetzt „sechsundfünfzig". Die Eins heißt im Verbund
„ein", nicht „eins" — „einsundzwanzig" wäre der klassische Schnitzer.
Über 100 kommt nichts vor: der größte Wert im ganzen Vorrat ist 10 × 10.

---

## Fachwelten (D4)

Neun Kacheln auf einem Bildschirm, die neunte allein in der dritten Reihe.
Der Abgleich sagt dazu: *„Wenn Mathe dazukommt, braucht der Startbildschirm
eine Ebene darüber: Erdkunde und Mathe als zwei Welten mit eigenem
Gesicht."*

### Der Umweg, den die Messung abgeschnitten hat

Der erste Entwurf hat die Welten **nicht** als eigenen Bildschirm gebaut,
sondern als zwei getönte Gruppen auf dem einen. Das Argument dafür war
zählbar: „Rechnen" hält je Kind genau **eine** Kachel, und ein Tipper, der
zu einer einzigen Kachel führt, ist keine Reise, sondern eine Tür.

`passt` hat widersprochen, und zwar mit Zahlen:

```
14 FEHLER: Elemente laufen über den Rand.
   Ebenenwahl: „Rechnen Plus" — 174 px über den Rand
   Ebenenwahl: „Rechnen"      — 195 px im Bereich des Telefons
```

Zwei Weltenköpfe plus zwei getönte Gründe kosten rund hundert Punkte Höhe,
und 844 × 390 hat sie nicht. Damit war die Frage entschieden — nicht durch
das bessere Argument, sondern durch das Gerät. **Das Soll kommt aus der
Referenz, nicht aus mir**, und das Maß vom Zielgerät, nicht aus meiner
Vorstellung.

### Was jetzt dasteht

Ein eigener Bildschirm zwischen Profilwahl und Ebenenwahl: zwei große
Karten, jede mit ihrer Farbe, ihrem Zeichen, ihrer Zahl von Übungen und
ihrem eigenen Stand. Danach zeigt die Ebenenwahl nur noch die Ebenen
**dieser** Welt — acht statt neun, in zwei ruhigen Reihen zu vier statt
drei Reihen mit einer Kachel allein.

Die Zuordnung wird **abgeleitet**, nicht je Ebene hingeschrieben: `art`
sagt schon, wie gefragt wird. Ein zweites Feld daneben wäre dieselbe
Auskunft an zwei Orten, und eines von beiden veraltet.

Buch, PIN und Elternbereich führen jetzt in die **Weltenwahl** zurück, nicht
in eine Ebenenliste: sie hängen am Kind, nicht an einem Fach. Wer das Buch
aus der Erdkunde heraus öffnet, käme sonst dort wieder an — obwohl darin
seit C3c auch die Rechenaufgaben kleben.

### Was der Blick gefunden hat und kein Tor

`passt` war grün, als die beiden Karten noch dieselbe Höhe hatten wie eine
Ebenenkachel: zwei breite Balken unter einer halbleeren Fläche. Und die
Zeile „8 Übungen" fehlte ganz — das kurze Querformat blendet **jede**
Überzeile aus, weil dort sonst acht Kacheln nicht passen. Auf einer Karte,
von der es nur zwei gibt, ist sie aber das einzige, was sagt, wie groß eine
Welt ist.

Beides steht in keinem Tor und ist auf der Aufnahme sofort zu sehen.
**Regel 4**, unverändert gültig: ein Tor prüft, ob etwas funktioniert —
nicht, ob man es spielen kann.

### Ein Zwischenschritt kostet sechs Tore

Sechs Tore klicken sich nach der Profilwahl in eine Ebene. Stünde der neue
Schritt in jedem einzeln, wäre er sechsmal aufgeschrieben und beim nächsten
Umbau fünfmal gepflegt — deshalb steht er einmal in `tor/chromium.mjs` als
`zurEbenenwahl(seite, ebene)`.

Zwei Dinge kamen dabei heraus, die nichts mit D4 zu tun haben und trotzdem
echt sind:

- **Der Bildschirmwechsel blendet über.** Der alte Bildschirm liegt rund
  340 ms darüber und fängt Tipper ab — Playwright meldete „subtree
  intercepts pointer events", und vier Antwortwege fehlten auf einmal.
  Gelöst nicht mit einer Wartezeit, sondern an der Sache: gewartet wird,
  bis nur noch **ein** `.schirm` da ist. Eine Zahl wäre auf einem
  langsameren Rechner zu kurz und hier zu lang.
- **Auf der Weltenwahl führt „Zurück" zur Profilwahl.** Mein Wächter im
  Rauchtest nahm an, er stünde immer auf einer Ebenenwahl, klickte sich
  eine Ebene zu weit hinaus und wartete dann dreißig Sekunden auf eine
  Weltenkarte.

### Und die teuerste halbe Stunde dieser Sitzung

Regel 9 sagt: **erst einchecken, dann gegenproben.** `npm run proben`
verweigert bei schmutzigem Baum den Dienst, weil das in diesem Verzeichnis
schon viermal Arbeit gekostet hat.

Ich habe die Regel gebrochen — mit `--trotzdem`, um schnell eine einzelne
neue Gegenprobe zu prüfen. Der Lauf hat danach mit `git checkout -- .`
aufgeräumt und die gesamte D4-Runde gelöscht: die Weltenwahl, sechs
angepasste Tore, zwei Dokumente. Wiederherstellbar war es nur, weil die
Entwürfe daneben lagen.

Die Regel stand da. Sie wurde trotzdem gebrochen — **weil die Weigerung
mit der Fahne verschwindet und dann gar nichts mehr übrig ist.** Also
bekommt sie jetzt ein Netz statt eines weiteren Satzes: bei `--trotzdem`
auf schmutzigem Baum legt `proben` den Stand vorher als echtes Git-Objekt
weg (`git stash create`) und schreibt die Zeile hin, mit der man ihn
zurückholt. Aus einem unwiderruflichen Griff wird ein ärgerlicher.

*Eine Regel, die nur aufgeschrieben ist, wird gebrochen — und eine, die
nur verbietet, hilft nicht, wenn jemand das Verbot umgeht.*

---

## Der Ton (A2)

Der letzte offene Punkt aus Reihe A — und laut Abgleich das, was ein Kind
**zuerst** wahrnimmt: vor dem Satz, vor der Farbe, vor dem Haken.

### Gerechnet, nicht geladen

`src/kern/klang.js` erzeugt zwei Hüllkurven über `AudioContext`. Zwei
Klangdateien wären je nach Format 5 bis 30 KB im Startbündel, das bei
400 KB gedeckelt ist; die beiden Kurven sind zusammen unter einem
Kilobyte — das Bündel wuchs von 151,6 auf **155,2 KB**. Und sie lassen
sich stimmen, ohne ein Werkzeug zu öffnen.

| | |
|---|---|
| richtig | 660 Hz, dann 990 Hz — zwei kurze Töne aufwärts, eine Quinte |
| falsch | 330 Hz weich fallend auf 247 Hz, um ein Drittel leiser |

Der Fehlerton ist **kein Summer**. Ein Kind, das eine Aufgabe übt, macht
Fehler — das ist der Zweck der Übung —, und ein Geräusch, das sich wie eine
Niederlage anhört, macht aus jedem Fehler ein Ereignis. Aufgelöste Aufgaben
(„Weiß ich nicht") bleiben ganz stumm: die App sagt dazu schon „Kein
Problem", ein Ton obendrauf machte aus dem Ausweg eine Niederlage.

Der Kontext wird **spät** angelegt, beim ersten Ton. iOS gibt Ton erst nach
einer Berührung frei, und ein Kontext, der vorher entsteht, bleibt
„suspended" — er spielt dann den Rest der Sitzung nichts, ohne einen Fehler
zu werfen. Der erste Ton ist immer eine Antwort, also immer nach einer
Berührung.

### Eine Stelle entscheidet, wie eine Antwort klingt

`klangZu(ergebnis)` — ausgelöst dort, wo die App ohnehin schon entscheidet,
wie die Antwort ausging. Der richtige Ton steht **in `werten()`**, durch das
beide Bildschirme laufen; der falsche an den zwei Fehlerzweigen. Und er
hängt am selben Schalter wie die Sprache: wer „Ton aus" sagt, meint nicht
„nur die Stimme aus".

### Ein Tor kann nicht hören — aber es kann anderes

Chromium hier hat kein Tongerät, und `AudioContext` gibt nichts zurück, was
man ansehen könnte. Der Rauchtest baut es deshalb nach und schreibt mit,
**welche** Schwingungen angelegt wurden — dasselbe Mittel wie bei
`speechSynthesis.speak`. Geprüft wird an einer falschen und einer richtigen
Antwort hintereinander an derselben Aufgabe:

```
Ton bei falsch/richtig:     330→247  |  660→660 990→990
Mit „Ton aus":              0 Schwingungen (erwartet 0)
```

- Es kommt überhaupt einer.
- Die beiden sind **verschieden**. Ein Ton, der bei richtig und falsch
  derselbe ist, sagt dem Kind nichts — und sieht in jedem Mitschnitt aus
  wie zwei.
- Die **Richtung** stimmt: das Lob steigt, der Hinweis fällt. Ein
  steigender Fehlerton klänge wie ein zweites Lob.
- Bei „Ton aus" bleibt es still.

Die vierte Prüfung ist nachträglich dazugekommen, und zwar weil ihre
Gegenprobe sonst **nichts bewiesen hätte**: bei eingeschaltetem Ton ändert
das Entfernen der Sperre nichts, was zu sehen wäre. Regel 1, wieder —
*wer eine Wirkung misst, schaltet sie zuerst ab.*

**Ob sie gut klingen, sagt das alles nicht.** Das hört man auf dem iPhone
und nirgends sonst; im Abgleich steht dafür seit der ersten Fassung: *„Für
A2: einmal Hören auf dem iPhone."*

---

## Der Prozess selbst auf dem Prüfstand

> *„Für solche kleinen Anpassungen kann es nicht sein, dass wir über 20
> Minuten Proben- und Testläufe am Ende haben. Das steht in keinem
> Verhältnis."*

Stimmt. Und die Ursache war kein Preis für Sicherheit, sondern ein
Konstruktionsfehler — einer, der sich nicht als Fehler zeigte, sondern als
Geduld.

### Wo die Zeit lag

Gemessen am vollen Lauf vor dem Umbau, 1513 s:

| Tor | Zeit | Anteil | Proben |
|---|---|---|---|
| `smoke` | 1141 s | **75 %** | 25 |
| `ansicht` | 111 s | 7 % | 2 |
| `passt` | 99 s | 7 % | 2 |
| `ziehen` | 86 s | 6 % | 6 |
| `pwa` | 33 s | | 3 |
| `inhalt` | 18 s | | **20** |
| Rest | 25 s | | 11 |

Zwanzig Proben in `inhalt` kosten 18 Sekunden, fünfundzwanzig in `smoke`
kosten 1141. Faktor 63 je Probe.

### Der Befund: der volle Lauf war gar nicht „alle drei Runden"

Die Frist, auf die sich alle verlassen haben, hat **nie gegriffen**. Was
griff, stand in `tor/rhythmus.mjs`:

```js
const zahl = (jetzt.match(/\{ n:'/g) || []).length;
if (zahl !== stand.proben) fehler.push(`Es stehen ${zahl} Proben im Baum …`);
```

`proben-stand.json` war **ein einziger Datensatz für alle**: ein Datum, ein
Commit, eine Zahl. Wer eine Gegenprobe dazuschrieb, entwertete damit den
Nachweis für die anderen achtundsechzig — und musste alles neu fahren.

Und eine Runde, die etwas Neues baut, schreibt fast immer eine Gegenprobe
dazu. Das ist ja die Hausregel. Also lief in der Praxis **jede** Runde der
volle Satz: in einer einzigen Sitzung viermal, rund hundert Minuten. Die
Frist kam nie an die Reihe, weil die Zahl vorher rot wurde.

### Hebel 1: der Nachweis gehört zur Probe, nicht zum Satz

`proben-stand.json` hält jetzt je Probe fest, wann sie zuletzt angeschlagen
hat:

```json
"eine Division geht nicht mehr auf": { "commit": "49061e7", "zeit": "2026-08-29" }
```

`rhythmus` prüft daraus dreierlei: jede Probe im Baum hat einen Nachweis,
keiner ist älter als drei Code-Runden, und keiner zeigt auf einen Commit,
den es nicht mehr gibt. Eine neue Probe kostet damit **diese** Probe.

Und `--geaendert` rechnet ab jetzt gegen den **eigenen** Nachweis jeder
Probe statt gegen einen gemeinsamen Commit: gefahren wird, was keinen
Nachweis hat oder dessen Datei oder Tor sich seither bewegt hat. Deshalb
darf es jetzt auch Stand schreiben — unter einem Datensatz für alle wäre
das eine stille Aushebelung gewesen, unter einem je Probe ist es genau die
Wahrheit.

Drei Dinge sind dabei weggefallen, weil sie ihren Gegenstand verloren
haben: die Marke `"lauf": "abgebrochen"` (ein abgebrochener Lauf
hinterlässt jetzt Lücken, und die fängt dieselbe Prüfung wie eine neue
Probe), die Zahl `"proben": 69`, und der gemeinsame Commit `"fassung"`.

Ein Henne-Ei blieb: die vier `rhythmus`-Proben prüfen `rhythmus`, und
`rhythmus` verlangt, dass jede Probe einen Nachweis hat — auch sie selbst.
Ohne Vorschuss wäre das Tor schon **ohne** Eingriff rot, nämlich wegen
dieser vier, und alle vier meldeten „war schon vorher rot" statt zu
beweisen. Sie bekommen ihren Eintrag deshalb vor dem Lauf und verlieren ihn
wieder, wenn sie nicht anschlagen. Genau das leistete früher die Marke
„vollständig", die bei einem Fehlschlag auf „abgebrochen" zurückgesetzt
wurde.

### Hebel 3: `proben` fasst den Arbeitsbaum nicht mehr an

Geprobt wird in einer Wegwerf-Kopie — `git worktree` auf denselben HEAD,
und was im Arbeitsbaum anders ist, wird hineinkopiert. Geprüft ist damit,
was du **siehst**, und gerechnet wird wie zu Hause: `rhythmus` zählt mit
`git rev-list`, und ein Stash-Commit hätte neben der Historie gehangen
statt in ihr.

Das erledigt drei Dinge auf einmal:

- **Die Gefahr ist weg.** Der Befehl, der dieser Sitzung eine halbe Stunde
  gekostet hat — `git checkout -- .` —, läuft jetzt in der Kopie und kann
  nichts mehr treffen als sich selbst. Nachgewiesen: eine angehängte Zeile
  in `prototyp/spiel.js` und eine unverfolgte neue Datei haben einen
  vollständigen Probenlauf überlebt. Unter dem alten Code wären beide weg.
- **Die Regel ist weg.** „Erst einchecken, dann gegenproben" stand seit
  vier Verlusten in `CLAUDE.md` und hat den fünften nicht verhindert. Sie
  war ein Verbot, und ein Verbot hilft nicht, wenn jemand es umgeht.
  *Weggefallen ist nicht die Umgehung, sondern der Grund.* Mit ihr fällt
  die Zeremonie „commit, proben, nachbessern, nochmal committen" weg — ein
  Umweg pro Runde.
- **Die Proben sind unabhängig geworden.** Sie teilten sich genau eine
  Sache: den Arbeitsbaum. Alle sechs Browser-Tore binden ohnehin schon
  `server.listen(0)`, also einen freien Port. Damit ist der Weg frei, sie
  nebeneinander zu fahren — das ist Hebel 4 und noch nicht gebaut.

### Hebel 2 und 4: abkürzen und nebeneinander

**`--sofort`** — aufhören, sobald der erste Fehler feststeht. Eine
Gegenprobe will eine einzige Auskunft: schlägt das Tor an, und mit welcher
Meldung. Die Richtung ist sicher: abgebrochen wird **erst**, wenn schon ein
Fehler in der Liste steht — grün werden kann dadurch nichts.

Der Gewinn ist ungleich verteilt, und das ist der interessante Teil:

| Probe | vorher | mit `--sofort` |
|---|---|---|
| „eine richtige Antwort wird nicht mehr gewertet" | 71 s | **9 s** |
| „Antippen antwortet nicht mehr" | 71 s | 78 s |

Der erste Fehler fällt **während** des Spiels auf, der zweite erst in der
Schlussrechnung („kein einziger Zug über…"). Manche Aussagen sind ihrer
Natur nach Summen — dort kann nichts abgekürzt werden, und ein Werkzeug,
das so täte, würde lügen.

**`--kurz`** — der Durchgang spielt je Profil drei Ebenen statt neun: die
erste Karte, die Auswahl-Ebene und das Rechnen. Damit ist jede *Art* von
Bildschirm dabei, beide Welten und alle vier Antwortwege — nur nicht jede
einzelne Länderebene. Dass die spielbar sind, prüft die **Kette**, und dort
läuft der Durchgang weiterhin vollständig. Bliebe eine Probe dadurch grün,
meldete der Lauf „TOR BLEIBT GRÜN": die Abkürzung kann nichts verstecken,
sie kann nur auffallen.

Nachgewiesen: **alle 25 Rauchtest-Gegenproben schlagen weiter an**, in
6 min statt 12.

**Nebenläufig.** Nicht die Maschinerie wurde umgebaut — ein
Nebenläufigkeits-Umbau mitten in dem Werkzeug, das die Beweise führt, wäre
die Sorte Änderung, bei der ein Fehler still bleibt. Stattdessen startet
der Lauf sich **selbst** dreimal, jedes Kind mit einem Teil der Arbeit und
einer eigenen Kopie. Innen bleibt alles, wie es war.

Geteilt wird nach **Gruppen** — alle Proben mit demselben Tor und denselben
Argumenten —, weil sie sich den gesunden Lauf teilen. Auseinandergerissen
würde der mehrfach gefahren, und beim Rauchtest ist er so teuer wie eine
Probe.

Eine Kleinigkeit fiel dabei sofort auf: die Ausgabe schrieb erst den Namen
und später das Ergebnis dahinter. Sobald drei Kinder nebeneinander laufen,
schiebt sich das eine in die halbe Zeile des anderen, und übrig bleibt ein
„schlägt an 15 s" ohne Namen. Eine Zeile fällt jetzt in einem Stück.

### Was es gebracht hat — und was nicht

Alles auf diesem Rechner: vier Kerne, Chromium unter SwiftShader.

| | vorher | nachher |
|---|---|---|
| Runde, die Dokumente und Werkzeuge anfasst | 25 min | **2,7 s** |
| Runde, die `prototyp/spiel.js` anfasst (29 Proben) | ~25 min | **7 min 11 s** |
| voller Lauf, alle 69 | 25–31 min | **17 min 8 s** |
| Verlust ungesicherter Arbeit | vier Mal passiert | **strukturell unmöglich** |

**Das Ziel waren zwei bis drei Minuten für die gewöhnliche Runde. Erreicht
sind sieben.** Die Wahrheit dazu, damit niemand später rät:

Die Parallelität bringt nur **1,5×**, nicht 3×. Der Rechner hat vier Kerne,
und drei Chromium-Instanzen unter Software-Rasterung sättigen ihn. Auf mehr
Kernen skaliert es besser — das ist eine Eigenschaft der Messstelle, nicht
des Entwurfs.

Und der Boden liegt woanders: jede Rauchtest-Probe zahlt noch rund 25
Sekunden, davon ein großer Teil **feste Wartezeiten** — nach jeder Antwort
`waitForTimeout(2600)`, dazu 900 und 1500 ms an anderen Stellen. Das sind
bei sechs Durchläufen je Probe rund dreißig Sekunden reines Schlafen. Sie
durch echte Bedingungen zu ersetzen (`waitForFunction` auf den nächsten
Bildschirm) wäre der nächste Hebel — und zugleich der riskanteste: genau
diese Wartezeiten stehen dort, weil Übergänge animiert sind, und eine
Gegenprobe, die zweimal Verschiedenes sagt, ist schlimmer als eine
fehlende. Das wäre eine eigene Runde mit eigener Messung, nicht ein
Nebenbei.

---

## R2 · Eine Kachelsprache für alle drei Wahlbildschirme

Gewählt war Entwurf **B · Bild** auf **W2** — reinweißer Grund, kräftigere
Kachel. Umgesetzt ist genau das, plus vier Dinge, die erst der Blick auf die
Aufnahmen gezeigt hat.

### Der Grund ist weiß, und das steht jetzt so da

`--grund` und `--grund-2` sind `oklch(1 0 0)`. Die alte Begründung
(„Eine flache weiße Fläche ist der schnellste Weg, eine App älter aussehen
zu lassen, als sie ist") steht weiter in `marken.css` — zitiert und
ausdrücklich als überstimmt gekennzeichnet. Eine Begründung, die
stillschweigend verschwindet, wird in drei Runden erneut erfunden.

Auf Weiß trägt nicht mehr die Fläche, sondern der **Rand**: 26 % Füllung aus
dem eigenen Ton, 52 % Rand daraus.

### Jede Kachel zeigt ihren Umriss

Die Umrisse kommen nicht aus dem Netz. `bauen.mjs` backt sie beim Bauen aus
denselben Natural-Earth-Daten in `D.silhouetten` — Kontinente auf 16 Punkte
vereinfacht, Deutschland auf 8. **13,4 KB**, Startbündel 151,6 → 162,7 von
400 KB.

Der Weg dahin war nicht gerade. `teilen()` schneidet `pfad` aus dem
Startbündel heraus — die Umrisse, die der Entwurf zeigte, waren zur Bauzeit
gar nicht da. Naives Ausdünnen („jeder 32. Punkt") zerlegte Afrika in
Splitter, und ein gleichfarbiger Strich schloss die Lücken nicht. Getragen
hat erst der **äußere** Umriss: ein Kontinent ist ein einziges Polygon und
dünnt sauber aus.

### Vier Befunde, die kein Tor hatte — nur der Blick (Regel 4)

**1. Das Wasserzeichen lief aus der Kachel heraus.** Bei 150 % Höhe war
Afrika ein Fleck und Deutschland ein Schmier; erkennbar war keins von
beiden. Ein Wasserzeichen, das man nicht erkennt, ist Dekoration und keine
Auskunft. Es sitzt jetzt ganz in der Kachel (86 % Höhe, höchstens 52 %
Breite), und die **Höhe steht im Stylesheet, je Kachelart einmal** — am
Aufruf steht keine Zahl mehr.

**2. Die Rechenwelt hatte kein Bild.** Erdkunde bekam eine Weltkarte,
Rechnen eine leere Fläche — das sah nach einem Fehler aus. Die Rechenwelt
und ihre Ebenen zeigen jetzt ihre **Zeichen** (`+ ×`, `+ −`, `× ÷`),
gezogen statt gefüllt.

**3. Das kleine Eckzeichen sagte dasselbe noch einmal, nur kleiner.** Ein
Globus auf einer Weltkarte, ein `+×` über einem `+ ×`. Es ist weggefallen —
mitsamt seinen zwei Symbolen und dem Feld `zeichen` in `WELTEN`, das damit
tot gewesen wäre.

**4. Der Baustempel stand größer da als „6 Jahre · sprechen und ziehen".**
Er trug die Klasse `.unter`, und die ist für Erklärtexte gemacht. Er hat
jetzt seine eigene, leise Klasse — auf dem ersten Bildschirm, den die Kinder
sehen.

Damit das nächste Mal nicht wieder der Zufall entscheidet: die **Profilwahl
hat ein Vorbild bekommen** (`quer-profile`). Ausgerechnet der Bildschirm,
den beide Kinder als erstes sehen, war bis hierher unfotografiert — 15
Aufnahmen, 16 jetzt.

### Das Überlappungs-Tor sitzt in `passt`, nicht daneben

`passt` fährt bereits 7 Größen × 9 Bildschirme ab. Ein zweites Werkzeug
hätte dieselbe Tour ein zweites Mal beschrieben und wäre auseinandergelaufen
(Regel 6). Die Prüfung ist deshalb ein zweiter Ausgang desselben Sammlers:
jedes Paar von Elementen **im Fluss**, deren Rechtecke sich um mehr als 1 px
schneiden, ist ein Befund. Was absolut liegt, liegt absichtlich übereinander
und hat seine eigene Prüfung.

Gemeldet wird nur der **innerste** Kasten. Ohne das erschien ein Befund
vierfach — Hülle gegen Hülle, Hülle gegen Kachel, Kachel gegen Hülle,
Kachel gegen Kachel.

**Die Abnahme sagte „eine Kachel um 4 px verschieben". Das ist falsch, und
zwar aus einem lehrreichen Grund:** die Lücke zwischen den Reihen ist
größer als 4 px, es überlappte gar nichts. Das Tor blieb zu Recht grün.
Ein Eingriff, der nichts bewirkt, sieht aus wie ein bestandenes Tor
(Regel 10). Die stehende Gegenprobe verschiebt jetzt um **60 px** und meldet
`199×52 px`.

### `lesbarkeit` bezeugte etwas, das es nie geprüft hatte (Regel 1)

Das Tor läuft den **Elternbaum** hoch, um den Grund zu finden. Ein
Wasserzeichen ist aber ein **Geschwister** — es lag ab R2 unter jeder
Kachelschrift, und das Tor hätte weiter gegen die nackte Füllung gemessen
und grün gemeldet.

`grundVon` sammelt jetzt zusätzlich jedes absolut liegende Geschwister, das
den Textkasten schneidet, mischt seine Farbe mit seiner Deckung auf die
Fläche und misst gegen **beides**. Beim ersten Lauf schlug es sofort an —
**zehn Fehler**, die es vorher nicht gab und die trotzdem schon da waren:

| | war | ist |
|---|---|---|
| `.ueber` „8 Übungen", Tag | 4,08:1 | grün |
| `.klebermarke` „0", Abend | 3,22:1 | grün |

Drei Ursachen, alle drei Gestaltung, die sich am Kontrast bediente:
`.kachel.welt .ueber{opacity:.85}` (Text dimmen, damit es hübsch aussieht),
42 % Ton in der Schriftfarbe, und `--tinte-2` für eine Zahl, die auf dem
Wasserzeichen steht. Dazu ist das Wasserzeichen selbst leiser geworden
(0,50 → 0,34). Alle vier Werte sind **gemessen** eingestellt, nicht geraten.

### Und ein Wert, der sich vor dem System versteckt hatte

Die Blende des Wasserzeichens stand zweimal im Stylesheet
(`mask-image` und `-webkit-mask-image`) und enthielt `#000`. Das Tor
`marken` hat es als Farbe am System vorbei gemeldet — zu Recht, denn als
Wert im Stylesheet ist es eine. Sie steht jetzt als `--blende-umriss` in
`marken.css`: einmal, und mit dem Vermerk, dass das `#000` darin keine
Farbe ist, sondern Deckung 1.

### Stand

19 Tore grün, 16 Vorbilder erneuert, **71** stehende Gegenproben (zwei
neue, beide schlagen an). Startbündel 162,7 von 400 KB.

---

## Die Auslieferung war fünf Runden rot — aus drei Gründen

Gemeldet wurde: „Run, Fail, jedes Mal." Es waren **drei voneinander
unabhängige Fehler**, und zwei davon konnten den dritten nicht einmal
erreichen.

### 1. `rhythmus` maß etwas, das es nur auf diesem Rechner gibt

Der Runner meldete: *„Für 66 Proben ist der notierte Commit nicht mehr
auffindbar."* Hier war dasselbe Tor grün.

Der Grund: 66 der 71 Nachweise zeigten auf zwei Commits namens
`wip Hebel 2+4` und `wip Hebel 5 kurz` — sie hingen **an keinem Zweig**
und wurden nie gestoßen. Lokal findet `git` sie noch im Objektspeicher,
auf einem frischen Klon nicht.

Und das ist nicht der schlimmere Teil. Der schlimmere ist das **Grün hier**:
für einen Commit, der kein Vorfahr von `HEAD` ist, rechnet
`git rev-list --count X..HEAD` klaglos eine Zahl aus. Sie bedeutet nur
nichts. Das Tor hat fünf Runden lang eine Zahl gemeldet, die keine
Messstelle hatte (Regel 5).

Der Kommentar an genau dieser Stelle **hat den Fall beschrieben und die
Lösung genannt** — „gezählt wird an der Standdatei" — und umgesetzt war sie
nicht. Ein Kommentar, der eine Absicht statt des Codes beschreibt, ist eine
Lüge mit Vorlaufzeit.

Jetzt zwei Wege, und der erste zählt nur, wenn er zählen darf:

1. Der notierte Commit ist ein Vorfahr von `HEAD` → genau abzählen.
2. Sonst: den Commit suchen, in dem die **Standdatei** diesen Eintrag zum
   ersten Mal trägt. Die steht immer in der Historie, weil sie zu dem
   Commit gehört, der die Runde trägt.

Geprüft wurde das nicht durch Nachdenken, sondern durch einen **frischen
Klon** (`git clone --no-local`). Der sagt jetzt Wort für Wort dasselbe wie
der Arbeitsplatz — vorher das eine grün, das andere rot.

### 2. `Vorschau versenden` fiel durch, wenn alles in Ordnung war

Der Ablauf sah **einmal** nach, ob der Stand von `main` eine erfolgreiche
Torkette hat, und fiel sonst durch. Werden `main` und `vorschau` zusammen
gestoßen, ist die Vorschauprüfung nach drei Sekunden fertig und die
Torkette braucht vier Minuten. Das Rennen war nicht zu gewinnen.

Sechs rote Läufe an einem Nachmittag, sechs E-Mails, **kein einziger echter
Befund** — und dann noch einmal dieselbe E-Mail für den echten Fehler aus
Punkt 1, ununterscheidbar von den fünf falschen.

Jetzt **wartet** er bis zu zehn Minuten auf die Entscheidung, und wenn die
Kette rot ist, bleibt er **stehen statt durchzufallen**: mit einer Notiz,
warum nichts versandt wurde. Die Torkette hat den Befund bereits gemeldet.
Ein zweiter roter Lauf für dieselbe Ursache sagt nichts Neues — er
verdoppelt die E-Mail und verdeckt beim nächsten Mal, welcher der beiden
gemeint war.

### 3. Ein Vorschau-Versand konnte die laufende Torkette abbrechen

`concurrency: group: pages` stand am **Ablauf**, nicht am Versand-Job. Damit
lagen Torkette und Vorschau-Versand in derselben Schlange, und ein Versand,
der während einer laufenden Kette eintraf, hat sie abgeräumt. Die
Auslieferung von `96d21d5` steht als `cancelled` im Protokoll, ohne dass an
ihr irgendetwas falsch war.

Die Schlange sitzt jetzt am Job `ausliefern`. Zwei Auslieferungen können
sich immer noch nicht überschreiben — das war ihr Zweck —, aber eine
Vorschau kann keine Prüfung mehr abwürgen.

### Was daran lehrreich ist

Zwei der drei Fehler waren **Lärm, der wie ein Befund aussah**. Solange sie
dastanden, war der echte Fehler nicht zu finden: sechs identische E-Mails,
eine davon berechtigt. Ein Alarm, der bei jedem Lauf angeht, ist kein Alarm.

---

## Das Forscherbuch, R1, und drei Tore, die weniger gesehen haben als gedacht

### Der Endbildschirm braucht die Kachelsprache nicht

Geplant war, R2 auf Endbildschirm und Forscherbuch auszudehnen. Der Blick
auf die Aufnahmen (Regel 4) hat die Hälfte davon erledigt: der
Endbildschirm ist typografisch geführt, hat keine Karten und liest sich auf
Weiß gut. Ihm Kacheln aufzuzwingen wäre schlechter als ihn zu lassen. Eine
geplante Arbeit nicht zu tun ist auch ein Ergebnis.

### Das Forscherbuch war für `passt` unsichtbar

`.aufkleber` stand nicht in seiner Auswahl. Der Bildschirm mit den **meisten**
Kästen — anklickbar, in einem scrollenden Behälter — wurde von dem Tor, das
Überlauf prüft, überhaupt nicht angesehen. Es meldete grün, weil es dort
nichts zu sehen hatte.

Auf Weiß war die Karte selbst dann noch unsichtbar: `background:var(--papier)`
plus `border:none`. Zu sehen war nur der Schatten an der Unterkante, und die
Umrisse schwebten frei im Raum. Jetzt trägt auch hier der Rand.

### `lesbarkeit` sah vier von neun Bildschirmen

`passt` fährt neun Bildschirme ab, `lesbarkeit` fuhr vier. Forscherbuch,
Elternbereich und Endbildschirm wurden nie auf Kontrast gemessen —
ausgerechnet das Forscherbuch, in dem die einzige absichtlich
zurückgenommene Schrift der App steht.

Der erweiterte Rundgang fand sofort **drei Fehler** (4,41:1 im Abendmodus)
und misst jetzt **160 statt 104** Texte. Der Endbildschirm fehlt weiter, und
zwar ausdrücklich: dorthin kommt man nur durch ein ganzes Spiel.

### Und `lesbarkeit` rechnete die Deckung der Vorfahren nicht mit

`opacity` wirkt auf den ganzen Teilbaum, steht im `computedStyle` des Kindes
aber als `1`. Ein Etikett in einer Karte mit `opacity:.45` wurde deshalb
gemessen, als stünde es voll da — 7,4:1 für eine Schrift, die das Auge bei
3,3:1 sieht. Dieselbe Verwechslung wie beim Wasserzeichen, nur andersherum:
dort fehlte der Grund, hier die Farbe darüber.

Der Ausschluss „unter 0,5 gar nicht erst ansehen" bleibt daneben stehen — er
meint das Element **selbst**, das dann absichtlich verborgen ist.

## R1 · Von vorne, mitten im Spiel

Das Kreuz im Spiel führte wortlos zur Ebenenwahl. Es führt jetzt auf einen
**Pausenbildschirm**: Weiterspielen · Übung beenden · Von vorne anfangen.

Kein vierter Knopf im Kopf: links das Kreuz, in der Mitte das
Fortschrittsband, rechts die Sterne — im Querformat ist die Zeile voll. Und
eine Taste, die eine Woche Übung wegräumt, gehört nicht neben das Kreuz. Der
Umweg über diesen Bildschirm **ist** der Schutz; das Löschen selbst braucht
danach noch einen zweiten Tipper.

Der neue Bildschirm steht sofort in beiden Rundgängen — `passt` und
`lesbarkeit`. Ein neuer Bildschirm, den kein Tor ansieht, ist genau die
Lücke, die das Forscherbuch eine Runde lang hatte. `lesbarkeit` hat den
Warnknopf dann auch prompt gemeldet: 2,92:1, nötig 3:1.

### Die Gegenprobe, die dreimal nichts bewies

Zwei Dinge können brechen, und nur eines davon ist von außen zu sehen:

1. Das Löschen löscht nicht. → Sofort gefangen.
2. Es löscht, aber die Sitzung **zählt weiter**. `starten()` liest den
   Leitner-Stand neu; ohne `Stand = {}` begänne die neue Runde mit den alten
   Fächern — dieselben Aufgaben, dasselbe Fach, nur ohne Häkchen. Von außen
   sieht das aus wie ein sauberer Neuanfang.

Die zweite Gegenprobe blieb grün, obwohl der Fehler drin war — dreimal, aus
zwei verschiedenen Gründen:

**Erstens:** der Test öffnete die Pause, während die Sitzung noch bei
Aufgabe eins stand. Dann sieht ein Neuanfang genauso aus wie ein
Weiterzählen. Der Test wartete auf „irgendein Punkt ist gefärbt" — aber der
erste Punkt färbt sich **sofort** nach der richtigen Antwort, weitergerückt
wird erst 2,6 s später. Er wartet jetzt darauf, dass der **laufende** Punkt
weitergerückt ist, und sagt es laut, wenn das nicht passiert.

**Zweitens:** die Gegenprobe suchte „zählt weiter", der Test schrieb
„zaehlt weiter". In diesem Verzeichnis ist der Quelltext deutsch und die
**Ausgabe** trägt Umlaute; die Kommentare nicht. Ein Tor, das rot wird und
das Falsche sagt, ist kein bestandener Beweis — `proben` hat genau das
gemeldet: „wird rot, meldet aber nicht … — es fällt vielleicht aus einem
anderen Grund durch."

### `proben` warf einundzwanzig Minuten Arbeit weg

Ein `process.exit(1)` stand **vor** dem Festhalten. Beim vollen Lauf
schlugen 65 von 67 Proben an, zwei bewiesen nichts — und weil der Lauf damit
rot war, wurde **kein einziger** Nachweis geschrieben.

Das ist nicht nur teuer, es ist eine Falle mit Rückkopplung: ohne Nachweise
altern alle Proben weiter, `rhythmus` wird rot, und die Antwort darauf ist
wieder ein voller Lauf — der am selben Befund wieder nichts schreibt. Genau
so sind 66 Nachweise fünf Runden alt geworden.

`rhythmus` liest den Stand **je Probe**. Eine Probe, die angeschlagen hat,
hat angeschlagen — unabhängig von ihrer Nachbarin. Was nicht angeschlagen
hat, bekommt weiterhin keinen Eintrag und fällt als „hat noch nie
angeschlagen" auf. Der Befund bleibt sichtbar, der Beweis bleibt erhalten.

### Und ein Vorbild, das sich von selbst änderte

`quer-profile` — die Aufnahme, die in dieser Runde neu dazukam — enthielt
den **Baustempel mit Uhrzeit**. Im Arbeitsbaum fiel das nicht auf, weil dort
die Zeitstempel der Quelldateien stehenbleiben; in einem frischen Auschecken
sind sie neu, und damit ist es die Uhr auch: `15:59` gegen `16:52`, 2556
Bildpunkte Unterschied.

Gefunden hat es `npm run proben`. Die Aufnahme friert die Zeile jetzt auf
einen festen Satz **derselben Bauart** ein — nicht auf einen leeren: Lage und
Größe bleiben geprüft, nur der Inhalt nicht. Dass Fassung und Datum stimmen,
prüft `doku`.

---

## R3 · Der Vorlauf: anschauen, bevor man rät

Vor jeder Ebene ein Blättern statt eines Rätsels — alle Gegenstände mit
Bild und Namen, antippen liest vor, unten „Jetzt starten". Beim **ersten**
Betreten je Kind und Ebene von selbst, danach über „anschauen" an der
Kachel.

### Er ersetzt die Stadtstaaten-Einheit, statt neben sie zu treten

Das war die Frage, die im Backlog ausdrücklich offen stand. Beim Hinsehen
war sie leichter als gedacht: die Stadtstaaten-Lerneinheit hatte **schon
die richtige Form** — Titel, ein erklärender Satz, ein Gitter aus
antippbaren Umrissen, ein Knopf. Der Vorlauf ist ihre Verallgemeinerung.
Es kommt also eine Form dazu und eine fällt weg, statt dass zwei
nebeneinander stehen.

Der Satz wird **abgeleitet**, nicht je Ebene hingeschrieben — dieselbe
Regel wie beim Kartenhinweis. Sonst hätte die vierte Karte keinen. Bei den
Hauptstädten ist es der Stadtstaaten-Satz, und er erklärt dort jetzt
zugleich, warum Berlin, Hamburg und Bremen im Gitter fehlen: `vorrat()`
lässt sie aus, weil sie ihre eigene Hauptstadt sind.

Die Karten sind die des Forscherbuchs. Das ist kein Sparen: es ist
derselbe Gegenstand in derselben Sprache, und ein Kind, das im Buch
geblättert hat, erkennt ihn hier wieder.

### Was der Blick gefunden hat, bevor ein Tor etwas sagen konnte

**Sechzehn Kästen mit dem Wort „undefined".** `teilen()` schneidet die
Pfade aus dem Startbündel heraus; ohne `ebeneLaden` hat jedes Stück ein
leeres `pfad`, und der Vorlauf malte die Rechenaufgaben-Variante mit
`undefined`. Genau die Falle, die R2 schon einmal gestellt hatte — und ich
bin ein zweites Mal hineingelaufen. `starten()` lädt in derselben
Reihenfolge; wer den Vorrat anfasst, muss vorher laden.

**Der Erklärsatz stand halb über dem oberen Rand.** `justify-content:center`
in einem Behälter, der überläuft, schneidet an **beiden** Enden ab — und
nach oben kann man nicht scrollen. `safe center` fällt in dem Fall auf
`flex-start` zurück.

**Und die Namen waren abgeschnitten.** Im Forscherbuch sind drei Punkte in
Ordnung: dort steht, was man schon kennt. Hier soll das Kind den Namen
**lernen**, und „Sachsen…" neben einem echten „Sachsen" ist schlimmer als
kein Name. Der erste Versuch mit `overflow-wrap:anywhere` schrieb dann
„Brandenbur / g" — ein einzelner Buchstabe auf einer Zeile. `break-word`
trennt erst, wenn das Wort allein nicht auf eine Zeile passt, und nimmt
vorher jede Fuge: „Rheinland- / Pfalz", „Mecklenburg- / Vorpommern".

### Die engste Stelle wurde gemessen, nicht geschätzt

`passt` meldete beim ersten Lauf **elf bis achtundneunzig Punkte**
Überlauf: auf dem iPhone SE quer im Vorlauf der Bundesländer, auf dem
Zielgerät bei den Hauptstädten, und — nicht erwartet — auf der
**Ebenenwahl**, weil der neue Knopf „anschauen" dort eine Zeile kostet.

Geholt wurden die Punkte in vier Runden am Stylesheet, jede gegen eine
neue Messung. Die Karten sind im kurzen Querformat kleiner, die zweite
Zeile schmaler, die Kachelpolsterung enger; die Schrift blieb, wo sie war.
Ein Vorlauf mit Zuordnung bekommt **breitere** Karten als einer ohne — er
trägt zwei Namen je Karte statt einem.

### Ein Zwischenschritt, fünf Tore

Der Vorlauf steht jetzt zwischen Ebenenwahl und Aufgabe, und **fünf Tore**
klickten sich daran vorbei: `smoke` (an neun Stellen), `passt`,
`lesbarkeit`, `ziehen`, `ansicht`. Dieselbe Geschichte wie bei der
Weltenwahl in D4 — und dieselbe Antwort: **ein** Weg, in
`tor/chromium.mjs`. Wer ihn an neun Stellen nachbaut, pflegt ihn an acht
nicht.

`passt` prüft damit jetzt **14 Bildschirme je Größe** statt 9,
`lesbarkeit` misst **216 Texte** statt 104 vor dieser Sitzung.

---

## Der Prozess, zum zweiten Mal auf dem Prüfstand — und diesmal richtig

Der erste Anlauf hat den **Probenlauf** beschleunigt: 25 min → 17 min voll,
7 min für die gewöhnliche Runde. Das Ziel waren zwei bis drei Minuten, und
es wurde nicht erreicht. Der Grund, rückblickend: ich habe das Falsche
optimiert. Schneller machen, was man nicht braucht, ist nicht dasselbe wie
es weglassen.

### Erst messen

| | |
|---|---|
| ganze Kette | **336 s** |
| davon im Browser | **335 s** |
| ohne Browser (inhalt · spielprobe · vergleich · budget) | **0,8 s** |

Und im Rauchtest, der allein 163 s davon ausmacht:

| Abschnitt | Dauer |
|---|---|
| `durchgang` — jede Ebene für beide Kinder | **83 s** |
| `ablage` | 38 s |
| `spielen` — spielt, legt ab, übersteht Neustart | 29 s |
| `regler` | 27 s |
| `ebene4` | 16 s |
| `tippen` | 2 s |

Damit ist die Frage nicht mehr „wie machen wir das schneller", sondern
**„was davon muss ich vor dem Stoßen sehen"**.

### Drei Bahnen

| Bahn | Wann | Dauer | Wer bezahlt |
|---|---|---|---|
| **`npm run schnell`** | jede Änderung | **44,7 s** | ich |
| `npm run tor` | auf Wunsch | ~5 min | ich, freiwillig |
| Runner bei jedem Push | automatisch | 3–4 min | niemand |
| Runner nachts | automatisch | ~20 min | niemand |

`schnell` fährt alles, was nichts kostet (0,8 s), und dann die **zwei**
Browser-Tore mit der größten Ausbeute **nebeneinander**: den Rauchtest auf
dem Hauptweg und den Bildvergleich. Zwei Chromium auf vier Kernen — die
Temporunde hatte gemessen, dass drei den Rechner sättigen.

**336 s → 44,7 s.** Das Ziel ist erreicht, und zwar nicht durch schnellere
Prüfungen, sondern durch die Frage, wer wartet.

### Die Gegenproben laufen nachts

Sie prüfen die **Tore**, nicht die App. Das ist wertvoll — sie haben in
dieser Sitzung ein Vorbild gefunden, das sich von selbst änderte, und eine
Kontrastrechnung, die ein Wasserzeichen nicht sah. Und sie dauern zwanzig
Minuten.

`rhythmus` stand vorn in der Kette und verlangte, dass kein Nachweis älter
als drei Runden ist. Das hat in **einer** Sitzung dreimal einen vollen Lauf
mitten in der Arbeit ausgelöst. Die Frist ist richtig; falsch war, **wer
sie bezahlt**. Sie steht jetzt in `.github/workflows/proben.yml`, läuft um
drei Uhr nachts und schreibt den Stand zurück.

### Was es gekostet hat, und was nicht

**Was `schnell` nicht sieht:** Überlauf auf sieben Gerätegrößen, Kontrast,
die Nachsicht beim Ziehen, PWA und Offline, und den gründlichsten
Rauchtest-Abschnitt. Ein Layoutfehler auf dem iPhone SE fällt damit nicht
mehr sofort auf, sondern drei Minuten später im Ablauf.

**Was trotzdem nicht passieren kann:** dass Ungeprüftes bei den Kindern
landet. Die Auslieferung fährt die volle Kette und schickt nur bei Grün.
Die Prüfung ist nicht weniger geworden — sie ist nur nicht mehr im Weg.

### Zwei Dinge, die dabei nebenbei herauskamen

**`LOBPAUSE`.** Die 2,6 s nach jeder richtigen Antwort standen **dreimal**
als nackte Zahl im Quelltext. Jetzt einmal — und mit `?flott` auf 250 ms
kürzbar. Der Schalter ist noch ungenutzt: der Versuch, den Rauchtest damit
zu beschleunigen, hat ihn rot gemacht, und ich habe zurückgebaut statt an
elf Wartestellen zu raten. Er liegt bereit für die nächste Runde, in der
das mit Bedingungen statt mit Fristen gemacht wird.

**`serviere()`.** Der kleine Testserver stand **sechsmal** im Verzeichnis,
Zeile für Zeile derselbe — und sechsmal mit demselben Fehler: `/?flott`
wurde zum Verzeichnispfad `/` und damit 404. Jetzt einmal.

Und dabei hat das Zusammenlegen fast etwas verloren, das die Kopie in
`pwa.mjs` allein hatte: `if (!netz) q.socket.destroy()`. Das ist der ganze
Offline-Test — eine 404 wäre eine **Antwort**, und der Service Worker
verhält sich dann anders. Das Tor wurde rot und hat es gemeldet. Sechs
Kopien sind nicht sechsmal dasselbe; eine davon trägt immer etwas
Besonderes, und das findet man erst beim Zusammenlegen.

## Der Vorlauf auf dem Zielgerät — angesehen, nicht gemessen

`passt` war grün. Der Blick war es nicht.

**Ein Drittel der Karte war leer.** Die Zeilenhöhe des Gitters richtet sich
nach der höchsten Karte — „Mecklenburg-Vorpommern" braucht zwei Zeilen, also
sind alle so hoch —, und unter „Sachsen" stand deshalb eine leere Fläche,
mit dem Umriss als Fleck darüber.

Der erste Schluss war falsch: den Umriss mit `flex:1` in den Rest wachsen
lassen. Dann wachsen die **Karten**, und die zweite Reihe fiel unten heraus.
Das Loch war nie zu wenig Bild, sondern schlecht verteilter Platz — dagegen
hilft Zentrieren, nicht Wachsen.

**Vier Namen brachen mitten im Wort:** „Niedersachs / en",
„Brandenbur / g", „Baden-Württembe / rg". Auf einem Bildschirm, dessen
einziger Zweck es ist, diese Namen beizubringen. Die Karten waren mit 76
Punkten zu schmal; bei **88** nimmt der Umbruch die Fugen —
„Rheinland- / Pfalz", „Mecklenburg- / Vorpommern" — und es kostet **keine
Reihe**: sechzehn Karten stehen auf dem Zielgerät so oder so in zweien.

Wie breit sie sein dürfen, hat `passt` gesagt, nicht ich: 88 grün, und bei
den Paarkarten 96.

### Und der Vorlauf hatte kein Vorbild

Dieselbe Lücke wie beim Forscherbuch eine Runde zuvor: der Bildschirm mit
den meisten Kästen, der schwierigsten Typografie und einer auf zwei Punkte
ausgemessenen Bildhöhe — und **kein Tor sah ihn an**. `passt` sagt, ob
alles im Bild ist; ob „Brandenbur / g" dasteht, sagt es nicht.
`quer-vorlauf` ist die siebzehnte Aufnahme.

### Ein blindes `sed` und das Tor, das es gefangen hat

Beim Durchprobieren der Kartenbreite (88 · 84 · 80) hat mein Suchmuster
**auch das Forscherbuch** getroffen: `.kleber.vorschau` endet auf dieselbe
Zeichenfolge und stand danach auf 80 statt 120 Punkten. Gemerkt habe ich
es nicht — `quer-buch` wurde rot, 1,8 % der Bildpunkte anders.

Das ist genau der Fall, für den der Bildvergleich da ist: eine Änderung,
die niemand wollte, an einer Stelle, an die niemand gedacht hat.

---

## R4 · Adam

Die dritte Kachel steht und ist spielbar: **158 Aufgaben** in drei Sorten,
ohne PIN, ohne neue Daten.

### Der Vorrat ist durch die Regel begrenzt, nicht durch einen Deckel

| Sorte | Regel | Anzahl |
|---|---|---|
| `mal-gross` | 11…19 × 11…19, **ohne** die Quadrate | 72 |
| `quadrat` | 12² bis 25² | 14 |
| `geteilt-gross` | die Umkehrung von `mal-gross` | 72 |
| | | **158** |

Der erste Entwurf im Konzept lautete „Zahlenraum 1000, zweistellig ×
einstellig, dreistellige Division" — **321 200 Aufgaben allein für die
Addition**. Das bricht drei Dinge auf einmal: das Forscherbuch zeichnet
jeden Gegenstand einer Ebene, `spielprobe` rechnet jeden nach, und der
Leitner braucht Wiederholung — bei 321 200 Aufgaben sieht man dieselbe nie
zweimal.

`mal-gross` lässt die Quadrate aus, weil sie ihre eigene Sorte sind: 13 × 13
zu können ist etwas anderes, als 13 × 17 zu rechnen.

### Zwei Fehler, beide vom selben Muster

**„null Jahre · tippen und ziehen".** Die Zeile unter dem Namen war
`${p.alter} Jahre · ${p.eingabe.includes('sprechen') ? … : …}` — zwei
Annahmen in einer Zeile, und beide brachen, sowie ein drittes Profil
dazukam. Adam hat kein Alter und zieht nicht. Eine Verzweigung mit zwei
Ästen beschreibt zwei Profile; sie ist keine Regel, sondern eine
Aufzählung mit anderen Mitteln.

**Und Leas sechzehn Möglichkeiten.** Die Aufgabe lautete, die Auswahl zu
einer Eigenschaft des Profils zu machen. Ich habe dafür die feste Vier bei
den Bundesländern gelöscht — und Lea (`kandidaten:99`) bekam prompt
sechzehn Möglichkeiten statt vier. Der Rauchtest lief in einen Zeitablauf.

Richtig ist die Trennung: die **Ebene** schlägt eine Auswahl vor
(Bundesländer schreibt man nicht, man erkennt sie), das **Profil** kann sie
verbieten (`kandidaten:0`). Zwei verschiedene Dinge, die zufällig beide
eine Zahl sind.

### Was die Tore dazu gelernt haben

`spielprobe` rechnet **398** Aufgaben nach statt 240 — und hat dabei zwei
eigene Grenzen als falsch entlarvt: `?? 100` als Auffangwert für den
Zahlenraum (19 × 19 ist 361), und die Annahme, eine Möglichkeit außerhalb
des Antwortbereichs sei keine Versuchung. Für Fionas geschlossenen Raum bis
10 stimmte das; bei einer Division mit Antworten 11…19 sind **20 und 21
genau die Versuchung**. Die Grenze meint die plausible Nachbarschaft, nicht
den Vorrat.

`doku` liest die Tabelle **aus dem Backlog** und vergleicht sie mit dem
gebauten Vorrat. Die Zahlen 72 · 14 · 72 stehen an zwei Orten; genau dafür
ist das Tor da.

Der Rauchtest spielt **27** Ebenen × Profile statt 18 — und prüft
zusätzlich, dass Adam **nie** eine Auswahl bekommt. Das ist der Teil, den
man nur dort sieht.

## R4, zweite Hälfte · Zwölf Länder je Kontinent

Adams Profil versprach `laenderTiefe:12` und bekam **fünf** — die Daten
gingen nicht tiefer. Das war die einzige Zusage seines Profils, die nicht
eingelöst war.

### Die Befürchtung im Konzept war falsch, und die Messung lag bereit

Das Backlog sagte: *„107 KB. Zwölf Länder sprengen das voraussichtlich."*

Gemessen: **107,4 → 107,6 KB**, bei 25 → 60 Ländern. Zwei Zehntel.

Der Grund stand die ganze Zeit im gebauten Bündel, man musste nur
hineinsehen: Europas Bündel ist 314 KB, davon **220 KB `umgebung`** — 46
namenlose Hintergrundformen. `backen-laender.mjs` backt **jedes** Land des
Kontinents in derselben Stufe; der Unterschied zwischen Spielziel und
Kulisse ist `name` und `rang`, sonst nichts. Sieben Länder mehr zu benennen
heißt, sieben Formen von der einen Liste in die andere zu schieben.

Eine Schätzung, die zwei Zehntel Kilobyte für „sprengt das Budget" hält,
ist keine Schätzung, sondern eine Vermutung — und drei Zeilen Messung
hätten sie jederzeit widerlegt.

### Die Reihenfolge der ersten fünf bleibt

Fiona spielt Rang 1–3, Lea 1–5. Wer die fünf umsortiert, ändert unbemerkt,
was die Kinder üben — ihr Leitner-Stand hängt an der Kennung, nicht am
Rang, also fiele es nirgends auf. Die Ränge 6 bis 12 kommen nach
**Einwohnerzahl** dazu: bekannter heißt leichter, und die Reihenfolge muss
steigen, sonst ist `laenderTiefe` keine Schwierigkeitsstufe.

### Drei Anläufe für eine Gegenprobe

Der teuerste denkbare Fehler dieser Runde wäre, dass die Ränge 6–12
mitrutschen und vor einem Sechsjährigen zwölf Länder stehen. Die Gegenprobe
dafür hat dreimal nichts bewiesen, jedes Mal aus einem anderen Grund:

**Erstens gab es die Prüfung gar nicht.** Der Rauchtest zählte nie, wie
viele Länder ein Profil sieht. Jetzt zählt er die Karten im Vorlauf — dort
steht genau der Vorrat der Ebene.

**Zweitens las die Prüfung ihr Soll aus dem Prüfling.** Ich hatte
`laenderTiefe` aus `prototyp/spiel.js` gelesen — und die Gegenprobe baut den
Fehler genau dort ein. Beide Seiten wanderten mit, der Test blieb grün.
Regel 3 in Reinform: *das Modell darf nicht vom Gemessenen abhängen.* Das
Soll kommt jetzt aus der Tabelle im Backlog, also von dort, wo die Zahl
entschieden wurde.

**Drittens schlug `--kurz` die Ebene gar nicht auf.** Die Abkürzung des
Rauchtests spielt „jede Art von Bildschirm" — Kontinente, Auswahl-Ebene,
Rechnen. Seit die Ländertiefe je Profil verschieden ist, ist eine
Länderebene eine **eigene Art**. Sie steht jetzt in der Auswahl.

Beim vierten Anlauf schlug sie an.

## Der dritte Name heißt „Eltern" — und der Bereich heißt anders

R4 hatte die dritte Kachel **Adam** getauft, mit einem Argument, das ich
weiterhin für richtig halte: sie steht neben Fiona und Lea, und eine Kachel
„Eltern" zwischen zwei Vornamen liest sich wie eine Einstellung, nicht wie
ein Mitspieler. Der Nutzer hat anders entschieden. Damit ist es entschieden.

Umbenannt wurde **samt Kennung** (`adam` → `eltern`) — nicht nur die
Beschriftung. Das kostet den einen gespeicherten Fortschritt unter der
alten Kennung; er war eine Stunde alt. Eine Kennung, die anders heißt als
das, was sie bezeichnet, kostet dagegen jedes Mal wieder etwas, wenn jemand
sie liest.

Dadurch hießen zwei verschiedene Dinge gleich: das **Profil** und der
Bereich hinter der PIN. Auf dem Bildschirm heißt der Bereich jetzt
**„Für Eltern"** — an einer Stelle (`BEREICH_ELTERN`), von der Türschild,
PIN-Schirm und Kopfzeile lesen. Vorher stand das Wort dreimal ausgeschrieben
da, und einmal in einem Satz, der es gar nicht brauchte: „Voreingestellt ist
0000 — im Elternbereich änderbar" steht **auf der Tür** dieses Bereichs. Es
heißt jetzt „drinnen änderbar".

Im Quelltext heißt die Funktion weiter `elternbereich`. Dort liest kein Kind
mit, und ein Bezeichner, der mit einer Beschriftung mitwandert, ist die
nächste Umbenennung.

## R7 · Der Elternbereich kennt drei Profile

Die Abnahme steht seit M6 im Konzept: *Der Elternbereich beantwortet ohne
Nachfrage: Was kann Lea noch nicht?* Er konnte es nicht — und zwar nicht
seit R4, sondern seit immer. R4 hat es nur unübersehbar gemacht.

Was er tat: alle Protokolleinträge in einen Topf werfen. Fionas Polen und
Leas Polen standen in **derselben** Zeile der Wackelkandidaten. Zwölf
Antworten waren zwölf Antworten, egal von wem. Und der Löschknopf hieß
„Alles von Fiona löschen", weil man als Fiona hereingekommen war — wer als
Lea hereinkam, wurde Fionas Daten nicht los.

### Drei Stellen, eine Liste

Übersicht, Wackelkandidaten und Löschen lesen jetzt `PROFILE`, nicht die
Einträge. Der Unterschied ist nicht Geschmack: ein Profil, das noch nie
gespielt hat, **muss** dastehen. Sonst sieht „hat noch nicht gespielt" aus
wie „gibt es nicht" — und genau das ist die Frage, die ein Elternteil hier
stellt.

Ein viertes Profil steht damit von selbst auf allen drei Listen.

### Ein Fehler, den kein einziges Tor gesehen hätte

`NAMEN` — die Tabelle, die aus einer Kennung einen lesbaren Namen macht —
war aus **zwei** Rechenvorräten aufgezählt. Seit R4 gibt es **drei**. Die
158 Aufgaben der Eltern standen im Elternbereich also als `g12*13` da statt
als „12 × 13" — im Protokoll und in der CSV-Ausfuhr genauso.

Nichts wurde davon rot. Das Protokoll ist das eine, was Eltern wirklich
lesen, und es log sie an.

Gebaut wird die Tabelle jetzt aus der **Ebenenliste**: alle Ebenen mit
`art:'rechnen'`, was immer das für welche sind. Eine Liste neben einer Liste
veraltet (Regel 6) — diese kann es nicht mehr.

### „Zuletzt geübt"

Zehn Zeilen: wann, wer, welche Aufgabe, wie ausgegangen. Der Anlass war ein
Prüfproblem — die falschen Namen wurden erst in den Wackelkandidaten
sichtbar, und dorthin kommt ein Gegenstand erst nach zwei Versuchen. Der
Nutzen ist der eigentliche Grund, sie zu behalten: „was hat sie gerade
gemacht" ist die Frage, die man nach dem Aufschließen zuerst stellt.

### Was die Prüfung dieser Runde gekostet hat

Vier Anläufe, jeder aus einem anderen Grund — und alle vier hat das Tor
selbst gemeldet, keiner kam aus dem Nachdenken:

1. `PROFILNAMEN` stand tausend Zeilen **unter** seinem Gebrauch. Der
   Abschnitt `ablage` läuft lange vor dem Abschnitt `durchgang`; JavaScript
   meldet das als „Cannot access before initialization". Beide Leser der
   Backlog-Tabelle stehen jetzt zusammen ganz oben.
2. Der Namensleser baute `'Fiona' + rest` statt `'Fiona|' + rest` und
   erwartete daraufhin ein Profil namens „Fiona Lea".
3. Die Prüfung „steht die Aufgabe mit ihrem Namen da" las **alle** zehn
   Zeilen und meldete „Mecklenburg-Vorpommern" als Kennung. Sie hätte nie
   grün werden können. Gefiltert wird jetzt auf Ziffern — kein Land trägt
   eine, jede Rechenaufgabe schon.
4. Und weil damit eine leere Liste möglich wurde: eine leere Liste ist
   **rot**, nicht grün. Eine Prüfung, die nichts zu prüfen fand, hat nichts
   bewiesen (Regel 5).

### Nachtrag: zwei Gegenproben, die seit R4 nichts bewiesen haben

Beim Nachziehen der Nachweise für die umbenannten Proben schlug eine nicht
an — und dann noch zweimal nicht. Sie hieß *„Eltern bekommt doch eine
Auswahl"* und war seit R4 grün, ohne je etwas geprüft zu haben.

**Erstens kam der Eingriff nicht an.** Sie prüfte, ob `P.kandidaten > 0`
aus dem Bündel **verschwunden** ist. Der Ausdruck stand aber zweimal in
`spiel.js` — bei `istAuswahl` und zwölf Zeilen weiter bei `wieviel`. Er
fehlte also nie. Regel 3, und die Probe meldete es selbst.

**Zweitens fing die zweite Sperre den Eingriff auf.** Genau dieselbe
Doppelung: `istAuswahl` auszuhebeln half nichts, weil `wieviel` für
`kandidaten:0` immer noch null Möglichkeiten ausrechnete. Zwei Sperren für
eine Sache sehen nach Sorgfalt aus und sind das Gegenteil — die zweite
rettet still, was die erste durchlässt, und niemand erfährt, dass die
erste kaputt ist. Es gibt jetzt eine: `const darfWaehlen = P.kandidaten > 0`.

**Drittens konnte die Prüfung im Tor gar nicht anschlagen.** Sie führte
eine Verbotsliste `['eltern: antippen']` über die vermerkten Antwortwege.
„Antippen" wird aber nur vermerkt, wenn der Umschalter `#weise` auf dem
Bildschirm steht — und den bekommt nur, wer **zwei** Eingabewege hat. Das
Profil „Eltern" hat einen. Die Liste hätte nie einen Eintrag gesehen.

Geprüft wird jetzt an der Stelle, an der ein ausgefallenes Verbot wirklich
sichtbar wird: auf dem Kartenbildschirm steht dann eine Auswahl statt eines
Tippfelds. Und *wer* nie eine Auswahl bekommt, liest das Tor aus der Zeile
„Auswahl statt Tippen" im Backlog — nicht aus `spiel.js`, das die Gegenprobe
fälscht.

Drei Anläufe für eine einzige Zusage. Der Wert der stehenden Gegenproben
liegt genau hier: die Zusage *stand* im Programm, sie war sogar richtig
umgesetzt — nur bewiesen war sie nicht, und das sieht von außen identisch
aus.

## R6 · Hauptstädte in Europa

Die zweite Hälfte von R6. Die erste war mit R5 schon erledigt — die Eltern
spielen `laender:europa` in Tiefe 12 —, offen war die Ebene, die auf diesen
Daten aufsetzt: `hauptstaedte:europa`. Zwölf Länder, zwölf Hauptstädte, für
Lea die ersten fünf, für die Eltern alle zwölf. Fiona nicht: sie liest noch
nicht, und eine Stadt hat keinen Umriss, den man ziehen könnte.

### Nicht eine zweite Mechanik, sondern dieselbe mit anderem `kont`

Die Kennung sagt beides: `hauptstaedte` **wie** gefragt wird, `europa`
**wo**. Alles andere leitet sich daraus ab — Rahmen, Umgebung, Farbkreis,
der Umriss auf der Kachel, welche Karte nachgeladen wird.

Das war nicht der erste Entwurf, sondern das Ergebnis eines Fundes: der
Bezug „welche Karte trägt diese Ebene" stand **an vier Stellen einzeln** da,
jedes Mal als `art === 'laender' ? D.vbL[kont] : D.vbD`. Eine Ebene, die
`hauptstaedte:europa` heißt, ist nicht `laender` — sie hätte an allen vier
Stellen den Deutschland-Rahmen um eine Europakarte gelegt. Es gibt jetzt
eine Ableitung (`vbVon`), und die drei Fundstellen lesen von dort.

### Die Fakten kommen aus den Daten, die Ablenker nicht — und das ist gemessen

Die **Hauptstädte** stehen nirgends im Quelltext: Natural Earth führt sie
als `Admin-0 capital` und trägt den deutschen Namen selbst mit (`NAME_DE` —
Moskau, Kiew, Bukarest, Brüssel). Dieselbe Quelle wie bei den sechzehn
Landeshauptstädten.

Die **Ablenker** wären aus denselben Daten zu rechnen — „die zwei größten
Städte außer der Hauptstadt". Nachgesehen, bevor es gebaut wurde, und das
Ergebnis ist Unsinn:

- `POP_MAX` ist die **Ballungsraum**-Zahl. In Polen steht damit Katowice
  (2,7 Mio) vor Warschau (1,7 Mio); in Deutschland Stuttgart und Frankfurt
  vor Hamburg.
- `NAME_DE` trägt historische **Exonyme**, die heute niemand mehr sagt:
  „Klausenburg" für Cluj-Napoca, „Galatz" für Galați, „Lüttich" für Liège.
  Als Ablenker wären sie nicht schwer, sondern rätselhaft.

Also von Hand, mit dem Grund daneben. Fünfzehn Minuten Nachsehen gegen eine
Ebene, die sich richtig anfühlt und falsch ist.

### Die eine echte Falle steht in den Daten

In Deutschland liegt bei **fünf** von sechzehn Ländern die größte Stadt
nicht in der Hauptstadt — dort sitzt der ganze Lernwert von Ebene 4. In
Europas Top 12 ist es **eines**: die Niederlande, Den Haag gegen Amsterdam.
Und Natural Earth sagt es selbst: Den Haag steht dort als
`Admin-0 capital alt`, der abweichende Regierungssitz.

Deshalb wird `falle` nicht behauptet, sondern **abgeleitet** — wahr genau
dort, wo die Daten einen abweichenden Regierungssitz kennen. Und das Tor
`inhalt` legt beides nebeneinander: steht der Regierungssitz nicht vorn
unter den Ablenkern, ist die Frage nach Amsterdam so leicht wie die nach
Berlin, und das Tor sagt es.

**Ehrlich dazu:** für einen Erwachsenen ist diese Ebene leicht. Zwölf
europäische Hauptstädte sind kein Rätsel, und eine einzige Falle trägt keine
Ebene „für Erwachsene". Ihr Wert liegt bei **Lea** — fünf Städte, und die
Karte, auf der sie schon Länder gelernt hat — und bei den Rängen 6 bis 12,
wo Bukarest und Charkiw stehen.

### „Wie heißt die Hauptstadt von Vereinigtes Königreich?"

So stand die Frage im ersten Lauf auf dem Bildschirm. Deutsche Ländernamen
sind meist artikellos — „die Hauptstadt von Polen" stimmt einfach —, drei
sind es nicht: das Vereinigte Königreich, die Ukraine, die Niederlande.
Sie tragen jetzt `wovon` bei den Fakten (`vom Vereinigten Königreich`,
`von der Ukraine`, `von den Niederlanden`); überall sonst wird die Form aus
dem Namen abgeleitet. Gefunden hat das kein Tor, sondern der Blick auf die
Aufnahme (Regel 4).

### Zwei Fehler, die die schnelle Bahn gefangen hat

**`rechnen:plusminus` ging gar nicht mehr auf.** Beim Nachladen hatte ich
`art !== 'laender'` durch „hat etwas hinter dem Doppelpunkt" ersetzt — und
`rechnen:plusminus` hat das auch. Die App zog `daten/laender-plusminus.json`,
bekam 404 und blieb stehen. Der Bildvergleich meldete es nach vierzig
Sekunden.

**Die Ebene gehört zwei Profilen, und der Rauchtest kannte das nicht.** Seine
Prüfung „keine fremde Ebene" hieß „gehört einem anderen" — bei einer Ebene,
die Lea *und* den Eltern gehört, meldete sie beide. Sie heißt jetzt „gehört
einem anderen **und nicht mir**".

### Und einer, den erst die volle Kette gefunden hat

Der Rauchtest liest das Ziel aus dem **eingebetteten** Datensatz, nicht aus
dem laufenden Programm. Dort stand die Hauptstadt nicht: `teilen()` schneidet
für das Startbündel alles heraus außer Kennung, Name, Rang und Aussprache —
die Hauptstadt kam erst mit der nachgeladenen Karte. Der Test suchte nach
„undefined" unter vier Städtenamen. Die zwölf Namen bleiben jetzt im leichten
Verzeichnis: rund 150 Byte, und der eingebettete Datensatz enthält keine
Aufgabe mehr, zu der die Antwort fehlt.

## Der Rauchtest wartet nicht mehr blind

**Gemessen vorher:** 180 s Laufzeit, davon **45,5 s in 84 festen Pausen** aus
18 Aufrufstellen — ein Viertel des Laufs verbracht mit Warten auf etwas, das
längst da war. **Nachher:** 138 s, null feste Pausen.

Die Zahl steht jetzt im Bericht (*„Blind gewartet: 0,0 s in 0 festen
Pausen"*). Nicht aus Stolz: eine Frist schleicht sich beim nächsten
schwierigen Fall wieder ein, und dann soll sie sichtbar sein.

### Jede Pause hatte eine Bedingung, auf die sie eigentlich gewartet hat

Die Ansage im Mitschnitt. Der Ton. Das Ziffernfeld nach dem Tipp auf „PIN
ändern". Die Nachfrage am Löschknopf. Der Balken auf der Kachel, der sagt,
dass der Stand aus der Ablage gelesen ist. Der Eintrag in der Ablage selbst.
Achtzehn Stellen, achtzehn Bedingungen.

Die Grenzen darin sind großzügig (drei bis vier Sekunden). Das kostet
nichts, solange die Bedingung eintritt — anders als eine feste Pause, die
**immer** kostet.

### Zwei Stellen prüfen ein AUSBLEIBEN, und darauf kann man nicht warten

**Die Ansage.** Fiona muss sie hören, Lea nicht. Gewartet wird jetzt nur bei
den Profilen, die sie hören *müssen* — welche das sind, steht in der Zeile
„Vorlesen" derselben Backlog-Tabelle, aus der schon Tiefe, Namen und
Auswahlverbot kommen. Wer nichts hört, wird erst **nach** der Antwort
gelesen; dann ist die halbe Sekunde, nach der die App ansagen würde, längst
vorbei, und ein Ausbleiben ist genauso beweisbar wie vorher. Die Gegenprobe
*„die Ansage hängt nicht mehr am Kind"* schlägt weiter an — das ist der
Beweis, dass die Verschiebung nichts gekostet hat.

**„Ton aus".** Hier wird auf die Wertung gewartet. Steht sie, ist der Ton
entweder gekommen oder er kommt nicht mehr.

### Drei Fehler dabei — alle drei hat das Tor selbst gemeldet

**Die Fahne.** Gewartet wurde darauf, *dass* eine da ist. Die Fahne der
vorigen Aufgabe stand aber noch: die Bedingung war sofort wahr, die Messung
las die alte Fahne, und das Tor meldete genau den Befund, gegen den das
Warten da ist — *„in zwölf Aufgaben nur die Sorte daneben"*. **Ein Warten
auf etwas, das schon dasteht, ist kein Warten.** Jetzt wird auf die Fahne
*dieser* Aufgabe gewartet.

**Die neue PIN.** Gewartet wurde auf „drinnen ODER Fehlerzeile". Die
Fehlerzeile stand vom Versuch mit 0000 noch da — dieselbe Falle, eine Zeile
tiefer.

**Und der teuerste: `ueberblendungMessen`.** Es maß ein Fenster von 1500 ms
ab Aufruf, mit dem Kommentar *„der Wechsel kommt 1600 ms nach der Antwort,
gemessen wird ab rund 800 ms danach"*. Diese 800 ms waren **keine Zusage**,
sondern die zufällige Summe der Wartezeiten davor — die weggefallene
250-ms-Pause war ihr größter Posten. Ohne sie begann die Messung früher,
endete früher und sah den Wechsel **gar nicht mehr**. Sie meldete 0.00, also
„kein Doppelbild", und war grün. Regel 5 in Reinform: eine Zahl, deren
Messstelle an fremden Wartezeiten hängt, misst irgendwann etwas anderes.

Sie läuft jetzt, *bis* sie zwei Bildschirme gesehen hat und wieder einen —
das ist der Wechsel, an welcher Stelle er auch kommt. Und sie gibt **-1**
zurück, wenn sie gar keinen gesehen hat: eine Messung, die nichts gemessen
hat, darf nicht wie ein guter Wert aussehen (Regel 5).

### Der Bildvergleich: 12 s geschenkt, und die Bilder sind identisch

`durchspielen` wartete nach jeder Antwort 1800 ms. Ersetzt durch „der
Endbildschirm steht da, oder es liegt ein anderes Ziel an und der Wechsel
ist durch". `ansicht` fällt von 63 auf 51 s — und alle **18 Vorbilder
bleiben bitgleich**, ohne dass eines neu gesetzt wurde. Das ist der Beweis,
dass dort nur gewartet und nichts abgebildet wurde.

### Was das für die tägliche Runde bringt: nichts

Ehrlich gemessen: `npm run schnell` liegt weiter bei **39 s**. Der Grund ist
die Aufteilung, nicht die Wartezeit — die schnelle Bahn fährt drei Browser
nebeneinander, und ihr längster ist eine **Hälfte des Bildvergleichs mit
35,5 s**, nicht der Rauchtest mit 28. Die 42 gesparten Sekunden liegen in
den Abschnitten, die `schnell` gar nicht fährt (`durchgang`, `ablage`,
`ebene4`) — also auf dem Runner und im nächtlichen Probenlauf.

Der nächste Hebel für die tägliche Runde ist deshalb die **Balance der
beiden Hälften**: 35,5 gegen 27,0 Sekunden. Vier Kerne tragen keinen
vierten Browser; was hilft, ist eine Aufteilung nach Aufwand statt reihum.

Und für die volle Kette: sie steht jetzt bei **5:04**. Ein Vorher-Wert für
genau diesen Stand existiert nicht — R6 und R7 haben im selben Zeitraum
Arbeit dazugelegt (eine Ebene mehr im Durchgang, eine Aufnahme mehr, zwei
gewachsene Bildschirme in `passt` und `lesbarkeit`). Was gemessen ist, sind
die beiden Bausteine: Rauchtest 180 → 138 s, Bildvergleich 63 → 51 s. Die
Kettenzahl daraus zu rechnen wäre eine Schätzung, und die steht hier nicht
neben gemessenen Zahlen (Regel 5).

### Eine Gegenprobe hat seit Wochen nichts bewiesen

Beim Nachfahren aller 36 Proben des Rauchtests fiel eine durch: *„die
Aufgabe wird nicht mehr vorgelesen"* — **Suchtext nicht gefunden**. Ihr
Muster endete auf `}, 500);`. Seit `?flott` die Ansage verkürzt, heißt es
`}, FLOTT ? 60 : 500);`.

Sie hat seitdem nichts geprüft, und aufgefallen ist es erst jetzt: seit die
Proben nachts laufen, wurde der volle Satz hier nie wieder gefahren. Genau
die Verfallsart, gegen die `rhythmus` da ist — nur dass `rhythmus` das Alter
des Nachweises misst und nicht, ob er noch trifft.

Und dabei noch etwas: `CLAUDE.md` nannte für `proben` die Schalter `--tor`
und `--nur`. Beide gibt es nicht. Wer sie benutzt hätte, hätte den vollen
Satz gefahren — zwanzig Minuten statt einer Probe, und keine Fehlermeldung.

## Ton je Profil — und ein Tor, das nie gemessen hat, was es behauptet

Zwei Schritte waren bestellt: der Endbildschirm soll Eltern nicht wie ein
Kind ansprechen, und der Elternbereich soll endlich eine Aufnahme bekommen.
Beides ist da. Dazwischen lag ein Fund, der größer ist als beide.

### Der Ton

`ton: 'kind' | 'sachlich'` steht am Profil — eine Eigenschaft wie
`vorlesen` oder `streng`, keine Abfrage auf den Namen. Die Texte stehen an
**einer** Stelle (`TON`), und die Regel dahinter passt in einen Satz:

> **kindlich ruft, sachlich stellt fest.**

Am Ausrufezeichen ist das mechanisch zu erkennen, und genau darauf prüfen
beide Tore — `inhalt` an den Listen, der Rauchtest am Bildschirm nach einer
richtigen Antwort. Geprüft wird die *Eigenschaft*, nicht der Wortlaut; eine
Liste erlaubter Sätze im Tor wäre eine Abschrift aus `spiel.js`, und die
fälscht die Gegenprobe (Regel 3). Welches Profil welchen Ton trägt, steht
in der Zeile „Ton" der Backlog-Tabelle.

Sachlich heißt: „Sitzung beendet." statt „Geschafft!", „Richtig." /
„Stimmt." / „Korrekt." / „Sitzt." statt „Super gemacht!", und „Ab dem
zweiten Mal richtig kommt ein Gebiet ins Buch." statt „Beim zweiten Mal
richtig gibt es einen Aufkleber."

**Zwei Nebenfunde beim Anfassen:**

`vorlesen('Geschafft!')` lief **unbedingt**, an jedem Profil vorbei. Der
Endbildschirm rief auch Lea und den Eltern hinterher, obwohl beide
`vorlesen: false` tragen. Aufgefallen ist es nie, weil der Rauchtest nur
die *Ansage der Aufgabe* zählt und dieser Satz keine ist. Und `FAST_LOB`
— ein Vorrat aus drei Sprüchen — wurde seit dem Tag, an dem er geschrieben
wurde, **nie gelesen**. Er ist weg statt mitgewandert.

**Offen, und keine Entscheidung, die ich allein treffe:** auf dem
Endbildschirm stehen für die Eltern weiter drei goldene Sterne und der
Knopf „Forscherbuch". Die Sterne sind die Wertung der Sitzung, das Buch ist
der Name der Sammlung in der ganzen App. Beides umzubenennen hieße, das
Vokabular je Profil zu spalten.

### Der Fund: `ctx.newPage()` nimmt keine Optionen

Beim Nachmessen für die Aufnahme fiel auf, dass ein Bildschirmfoto
1280 × 720 groß war, wo 844 × 390 stehen sollte. Nachgesehen:

```js
const p = await ctx.newPage({ viewport, deviceScaleFactor: 2 });
```

`BrowserContext.newPage()` nimmt **keine** Optionen. Beide Werte wurden
stillschweigend verworfen; die Seite bekam die Größe des Kontexts, also die
Voreinstellung **1280 × 720**. An sechs Aufrufstellen stehen 844 × 390,
1180 × 820 und 390 × 844.

**Der Rauchtest hat nie auf dem Zielgerät gemessen.** Die Hochkant-Prüfung
lief nie hochkant. Kein Tor konnte das melden: eine verworfene Option wirft
nicht, sie tut nichts. Der Test prüft die Größe jetzt selbst nach — was er
misst, muss er auch bekommen.

### Was dabei sichtbar wurde, und was daran wirklich ein Fehler war

Auf 844 × 390 ist die Deutschlandkarte rund **170 px breit**;
„Mecklenburg-Vorpommern" ist bei 21 px Schrift **260 px lang**. Der erste
Lauf auf der echten Größe meldete prompt zwei Befunde. Angesehen (Regel 4),
und beide waren **Fehler der Prüfung**, nicht der App:

**„steht außerhalb des Kartenfelds".** Die Fahne steht neben der kleinen
Karte, vollständig sichtbar, mit einer Linie zum Gebiet — genau wofür die
Fahne gebaut wurde. Gemessen wurde gegen den Kasten der Karte; gemeint ist
der **Bildschirm**. Über den Rand hinaus darf sie nie, und das ist die
Zusage, die jetzt geprüft wird. Wie oft eine Fahne neben der Karte steht,
sagt der Bericht als Auskunft.

**„nur die Sorte daneben".** Die Forderung, dass beide
Beschriftungssorten vorkommen, ist bei 170 px Kartenbreite nicht
erfüllbar — kein Landesname passt dort in sein Gebiet. Die Forderung war
nicht falsch, sie hatte nur **keine Messstelle**: im Browser hängt die
Kartenbreite an der Fenstergröße. Sie steht jetzt in `inhalt`, wo sie eine
hat (Karte 470 px, Befund G10): 2 innen, 14 als Fahne.

Beides ist Regel 5 — eine Zahl ohne ihre Messstelle. Und beides war
zwanzig Runden lang unsichtbar, weil das Tor auf einer Größe lief, die
niemand gewählt hatte.

### Die Aufnahmen

Zwei: `quer-eltern` (der Bereich, wie er aufgeht) und
`quer-eltern-tabellen` (die beiden Tabellen darunter, zu denen der
Bildschirm gerollt wird). Beide mit **gesetztem Protokoll** — ohne
Einträge stünden dort drei Zeilen Striche, und die Aufnahme bezeugte von
den Tabellen nichts.

Die Zeiten im Protokoll sind fest, und die Seite läuft ausdrücklich in
`Europe/Berlin`: sonst wäre die Aufnahme auf jedem Rechner eine andere.
Gerollt wird zu einer **Überschrift**, nicht um eine Zahl von Punkten —
verschiebt sich etwas darüber, zeigt die Aufnahme weiter dasselbe.

Auf `quer-eltern-tabellen` steht unter „Zuletzt geübt" die Zeile
*Eltern · 12 × 13 · richtig*. Das ist der Fund aus R7, jetzt in einem
Vorbild festgehalten: vorher stand dort `g12*13`.

## Die Fahne bricht um — und die App redet nicht mehr an jedem Profil vorbei

Beides folgt aus der letzten Runde: seit der Rauchtest die Größe misst, die
er nennt, war die Fahne sichtbar zu breit; und seit der Endbildschirm einen
Ton hat, war die Frage offen, wer sonst noch angesprochen wird.

### Der Umbruch

Auf dem Zielgerät ist die Deutschlandkarte rund **170 Bildschirmpunkte
breit**, „Mecklenburg-Vorpommern" bei 21 px Schrift **260**. Die Fahne ließ
sich dann nicht mehr in die Karte klemmen: die Korrektur nach rechts und die
nach links schoben gegeneinander, die letzte gewann, und der Name hing links
heraus. Kein Rundungsfehler — eine Klemmung, die zwei widersprüchliche
Bedingungen nacheinander erfüllt, erfüllt am Ende nur eine.

Umgebrochen wird am **Bindestrich** oder an einer **Lücke**, und zwar an der
Stelle, die der Mitte am nächsten liegt: „Mecklenburg-" / „Vorpommern", nicht
„Mecklenburg-Vorpom-" / „mern". Der Bindestrich bleibt am Ende der ersten
Zeile, wie es sich gehört.

**Ein einzelnes langes Wort wird nicht getrennt.** Dafür bräuchte es ein
Wörterbuch, und eine falsche Trennfuge liest sich schlimmer als eine breite
Fahne. Für diesen Fall steht die Fahne jetzt **mittig über** statt auf einer
Seite heraus — auf jeder Seite gleich viel ist das kleinere Übel.

Gemessen wird gegen die **Karte**, nicht gegen den Bildschirm: neben der
Karte stehen die Antwortknöpfe.

Von den sechzehn Bundesländern brechen zwei um (Schleswig-Holstein,
Mecklenburg-Vorpommern). Auf der Weltkarte keines — sie ist breit genug, und
alle zwanzig Vorbilder blieben ohne eine Änderung grün. Der Umbruch greift
genau dort, wo er muss.

Aus der Auskunft *„1 davon neben der Karte"* ist eine **Zusage** geworden:
verlässt eine Fahne die Karte, meldet es der Rauchtest mit Foto. Kommt
irgendwann ein Name dazu, der sich nicht trennen lässt, fällt das dort auf —
Schweigen wäre die schlechtere Antwort.

### Zwei Achsen

Dreizehn Stellen riefen `vorlesen` unbedingt und damit an jedem Profil
vorbei. Sie rufen jetzt `sagen`, und die beiden Eigenschaften meinen
Verschiedenes:

| | was es heißt | Wirkung |
|---|---|---|
| `vorlesen` | „lies mir die **Aufgabe** vor, ich kann noch nicht lesen" | eine Hilfe — nur Fiona braucht sie |
| `ton` | „wie redet die App mit mir, wenn sie **von sich aus** redet" | kindlich darf jubeln, sachlich schweigt |

Fiona hört alles. Lea hört Lob und Hinweise, aber keine Aufgabenansage — sie
liest. Die Eltern hören nichts.

**Was ausdrücklich nicht dazugehört:** was jemand angetippt hat, um es zu
hören — die Karten im Vorlauf, die Aufkleber im Buch, die Stimmprobe im
Elternbereich. Drei Stellen, und sie bleiben unbedingt. Eine Bitte wird
nicht vom Profil beantwortet.

Geprüft wird beides am Bildschirm: nach einer richtigen Antwort darf bei
„sachlich" weder ein Ausrufezeichen stehen noch überhaupt etwas gesprochen
worden sein. Gelesen wird nach der Antwort — auf ein Ausbleiben kann man
nicht warten.

**Die Entscheidung kam vom Nutzer.** Ich hatte gefragt, weil beide Lesarten
vertretbar sind und die falsche Lea das Lob genommen hätte, das sie heute
hört.

## Die Aussprache gegengehört — und „Irak" wurde als Iran gewertet

Zwei Schritte: die Siegsterne auf dem Endbildschirm der Eltern, und die
35 Aussprachevarianten, die seit R5 nie durch den Abgleich gelaufen sind.
Der zweite hat einen echten Fehler zutage gefördert.

### Die Sterne

Auf dem Endbildschirm zeigt der sachliche Ton keine Siegsterne mehr. Nicht
aus Geschmack, sondern wegen **Redundanz**: drei Sterne heißen „alles auf
Anhieb richtig", und genau das steht eine Zeile tiefer als „12 von 12 auf
Anhieb richtig" — nur genauer. Was zweimal dasteht, veraltet einmal
(Regel 6), und von den beiden ist die Zahl die haltbarere.

Im **Kopf während der Sitzung** bleiben sie: dort sind sie der einzige
laufende Punktestand, also nicht doppelt. Dieselbe Regel, zwei Ergebnisse —
das ist kein Widerspruch, sondern der Unterschied zwischen „doppelt" und
„einzig".

**„Forscherbuch" bleibt.** Es ist der Name der Sammlung in der ganzen App;
je Profil umbenannt wären es zwei Namen für eine Sache.

Und weil ein fehlender Schlüssel in einem der beiden Töne `undefined`
ergäbe — und `undefined` ist falsch, nicht laut, die Sterne wären dann für
**alle** weg —, prüft `inhalt` jetzt, dass beide Töne dieselben Schlüssel
tragen. Ein Tippfehler im Schlüssel sähe sonst aus wie eine Entscheidung.

### 213 Formen, und keine war je gelaufen

R5 legte 35 Länder dazu (Rang 6 bis 12), jedes mit zwei erfundenen
Aussprachevarianten. Im Korpus stand davon **nichts** — der deckte 16 Ziele
ab, darunter sechs Länder. Keine der neuen Varianten war je durch den
Abgleich gelaufen.

Das ließ sich ohne Aufnahmen prüfen, weil es aus den Daten selbst folgt:
**jede Form eines Gebiets — Name, Alias, Variante — muss in der Menge ihres
Kontinents auf ihr eigenes Gebiet fallen.** Eine Variante, die der Abgleich
nicht annimmt, ist umsonst erfunden; eine, die er dem falschen Land
zuschlägt, ist schlimmer als keine.

213 Formen, alle richtig. Der erfundene Korpus bleibt daneben stehen: er
prüft das Misslingen, diese Stelle das Gelingen.

### Der Fund

Geprüft wurden auch **Nahfälle** — echte Nachbarländer, die es im Spiel
nicht gibt. Uruguay gegen Paraguay: sauber getrennt. Sudan gegen Südafrika:
sauber. Dominica, Taiwan, Süd-Sudan: alle abgelehnt. Einer rutschte durch:

> **„Irak" wurde glatt als IRAN angenommen.**

Zwei echte Länder, ein Buchstabe Unterschied bei vier. Der Grund steckt in
der Regel für „sicher": *nah genug **oder** Vorsprung vor dem Zweitbesten*.
Der Vorsprung sagt aber nur „kein anderer Kandidat ist nah" — nicht „dieser
ist nah genug". In einer geschlossenen Menge ist das meistens dasselbe;
nicht, wenn jemand ein **anderes echtes Wort** sagt, das zufällig neben
einem Kandidaten liegt. Der Rest Asiens ist von „Irak" weit weg, also war
der Vorsprung groß — und ein falsches Land wurde als richtig gewertet.

`GRENZE_NAH` deckelt das: der Vorsprung zählt nur, solange der Abstand
selbst noch anständig ist.

**Der Wert ist gemessen, nicht gesetzt.** Durchprobiert von 0,12 bis 0,34:

| Grenze | Trefferquote | davon Rückfrage | Falsch-Positiv | „Irak" |
|---|---|---|---|---|
| 0,12 | 100 % | 8 | 2,3 % | gefangen |
| 0,18 | 100 % | 5 | 2,3 % | gefangen |
| **0,22** | **100 %** | **3** | **2,3 %** | **gefangen** |
| 0,25 | 100 % | 3 | 2,3 % | rutscht durch |
| 0,34 (vorher) | 100 % | 3 | 2,3 % | rutscht durch |

Die Trefferquote bleibt überall bei 100 % — es geht nichts verloren, nur
manches wird zur Rückfrage. **0,22 ist der größte Wert, der „Irak" noch
fängt**, kostet also die wenigsten Rückfragen. Auf „Irak" heißt die Antwort
jetzt *„Meintest du Iran?"* statt „richtig" — und genau dafür gibt es die
Rückfrage.

### Zwei Reparaturen am Tor selbst

**Die Kandidatenmenge war nicht die des Spiels.** Sie hieß „das Ziel plus
die ersten sechs Geschwister aus der Gesamtliste" — für ein Land oft sechs
Länder von anderen Kontinenten. Im Spiel stehen die Länder **desselben**
Kontinents zur Wahl, und genau dort sitzen die gefährlichen Paare. Eine
Messung an einer Menge, die es nicht gibt, misst die falsche Aufgabe
(Regel 5).

**Eine Ratsche statt einer Zielzahl.** Auf der erfundenen Hälfte gilt kein
Prozentsatz — wer den Korpus schreibt und den Abgleich einstellt, ist
Prüfling und Prüfer zugleich. Was aber gilt: es darf nicht *mehr*
durchrutschen als heute. Ein Prozentsatz taugt dafür nicht, er sinkt schon
dadurch, dass der Korpus wächst. Also steht die eine bekannte Ausnahme
namentlich da — „aussen → asien", seit K1 — und alles andere ist rot.

Der Korpus hat jetzt 92 Treffer- und 70 Nichttreffer-Eingaben (vorher 61
und 43).

## „aussen" ist nicht mehr „Asien"

Die letzte bekannte Fehlannahme, seit K1 im Tor vermerkt: ein Kind sagt
„aussen", das Spiel wertet **Asien** als richtig. Bisher stand sie als
geduldete Ausnahme in der Ratsche. Nachgerechnet, statt sie weiter zu
dulden:

| | Kölner Code |
|---|---|
| `aussen` | **086** |
| `asien` | **086** |
| `aasien` (Variante) | **086** |

Die Kölner Phonetik gibt jedem Vokal die 0 und streicht sie danach bis auf
die erste. **„au" wird damit zu nichts.** Und weil die Variante „aasien"
auch noch genau so lang ist wie „aussen", fiel die Längenstrafe weg — der
Abstand landete bei 0,1167 und damit unter der Grenze für einen *sicheren*
Treffer (0,12). Nicht knapp daneben: knapp darunter.

### Ein Diphthong ist ein Laut, kein Vokalpaar

Er bekommt jetzt einen Code, der die Nullstreichung überlebt:

| | Code | warum |
|---|---|---|
| `au` | **A** | „aussen" ist nicht „Asien" |
| `eu`, `aeu`, `oi` | **9** | „Europa" **ist** „Oiropa" — derselbe Laut, dieselbe Zeile |

Das zweite ist kein Beiwerk: genau dafür ist eine Phonetik da. „Oiropa"
steht als Aussprachevariante in den Daten, weil ein Kind es so sagt, und
sie muss weiter passen.

**„ei" und „ai" bleiben absichtlich draußen.** Im Deutschen stehen sie oft
*nicht* für einen Diphthong — „Uk-ra-i-ne" —, und die Variante „ukrajine"
hängt daran. Gemessen: mit ihnen fällt sie durch. Eine Regel, die
sprachlich stimmt und die Daten bricht, ist die falsche Regel.

### Gemessen

**Falsch-Positiv 2,3 % → 0,0 %** (0 von 70). Trefferquote bleibt bei
100 %, drei Rückfragen wie vorher. Die Paare, die gleich bleiben mussten,
bleiben gleich: `australien`/`austraaljen`, `europa`/`oiropa`,
`deutschland`/`doitschland`. Alle 213 Formen aus den Daten fallen weiter
auf ihr eigenes Gebiet.

Die Ausnahmeliste im Tor steht damit **leer** da — sichtbar leer, nicht
gelöscht. Wer wieder etwas einträgt, soll sehen, dass er eine Ausnahme
*macht*.

## Der Endbildschirm der Eltern — und was er die schnelle Bahn gekostet hat

Er ist ein anderer als der der Kinder (keine Siegsterne, „Sitzung
beendet.") und hatte kein Vorbild. Jetzt schon: gespielt werden die
**Kontinente**, weil das sechs Aufgaben sind und nicht zwölf wie beim
großen Einmaleins — und **getippt**, weil das Profil nie eine Auswahl
bekommt. `durchspielen` antwortet dafür so, wie das Profil antwortet.

### Und dann war die schnelle Bahn 13 Sekunden langsamer

56 s statt 43. Der Grund war die Aufteilung: reihum geschnitten standen
**beide** Aufnahmen, die eine ganze Sitzung durchspielen, in derselben
Hälfte — 52,7 gegen 30,8 Sekunden. Die Kommentarzeile am Schnitt sagte,
reihum sei besser als ein Blockschnitt, „weil die teuren Aufnahmen
beieinander stehen". Das stimmt. Es verteilt sie aber auch nur zufällig,
und der Zufall kippte mit der einundzwanzigsten Aufnahme.

Geteilt wird jetzt **nach Aufwand**: gierig, die schwerste zuerst, immer
in die Hälfte, die gerade am leichtesten ist. Der Aufwand steht der
Aufnahme an und braucht keine Stoppuhr, die veraltet — `tun:'durch'` spielt
eine Sitzung, eine `spiel`-Aufnahme spielt sich einmal hin, der Rest ist
ein Bildschirm.

**46 s bei 39,4 gegen 43,1.** Gegenüber dem Stand vor dieser Runde (43 s
bei 20 Aufnahmen) kostet die neue Aufnahme damit drei Sekunden statt
dreizehn.

## Der Vorlauf einer Rechenebene war die Einmaleins-Tafel

Bestellt war ein **Vorbild** für den Vorlauf der Rechenebenen — der
einzige Bildschirm dieser Art ohne eines. Beim Fotografieren fiel auf,
warum ihn noch niemand angesehen hatte: er passt nicht auf ein Bild.

**Gemessen auf dem Zielgerät (844 × 390):**

| Ebene | Karten | Bildschirme |
|---|---|---|
| Fiona · Plus und Minus | **100** | **2,8** |
| Lea · Reihen 6 bis 10 | 140 | — |
| Eltern · Großes Einmaleins | **158** | **4,2** |

Das ist kein Blättern mehr, das ist die Einmaleins-Tafel — und sie stand
vor der **ersten** Sitzung einer Sechsjährigen.

### Eine Regel, die für Gebiete gedacht war

R3 sagte: *„Alle Gebiete der Ebene mit Namen, Umriss; antippen liest vor."*
Für sechzehn Bundesländer ist das ein Bildschirm, und danach kennt man sie.
Die Rechenebenen haben die Regel still geerbt — nur ist ihr Vorrat
**erzeugt**. Eine Zahl, die für eine Liste stimmt, stimmt nicht für einen
Generator.

Kein Tor hat das gemeldet, und keines hätte es können: der Bildschirm war
vollständig, bedienbar und im Rahmen. Er war nur sinnlos. Das ist genau der
Fall, für den Regel 4 dasteht — *kein Tor ersetzt den Blick*.

### Was jetzt dasteht

So viele Beispiele, wie gleich kommen: **`P.sitzung`** — 6 für Fiona, 8 für
Lea, 12 für die Eltern. Die Zahl steht schon im Profil und wird nicht neu
erfunden.

Genommen wird **jede n-te**, nicht der Anfang. Bei „Plus und Minus" stünden
sonst acht Mal `1 + irgendwas` da und kein einziges Minus; mit dem Schritt
sind es drei Plus und drei Minus. Ein Beispiel, das nur eine Sorte zeigt,
erklärt die Ebene falsch.

Der Satz sagt es mit: *„So sehen die Aufgaben aus — hier ein paar davon,
gleich kommen 6."*

### Und die Zusage steht im Rauchtest

Die Zahl der Karten muss die **Sitzungslänge** sein, und die liest der Test
aus der Zeile „Aufgaben je Sitzung" derselben Backlog-Tabelle, aus der schon
Tiefe, Namen, Ton und Auswahlverbot kommen — nicht aus `spiel.js`, das die
Gegenprobe fälscht.

Dazu das Vorbild, das gefehlt hat: `quer-vorlauf-rechnen`. Zweiundzwanzig
Aufnahmen, und die schnelle Bahn bleibt bei 46 s — die Aufteilung nach
Aufwand fängt die neue ab.

---

## Runde: was einmal geschafft war, bleibt geschafft

Die Frage, mit der die Runde anfing, war eine andere: *das Forscherbuch
sammelt bei den Rechenebenen 100 bis 158 Aufkleber — ist eine Sammlung, die
man nie vollbekommt, noch eine Sammlung?*

### Die Antwort auf die Frage: doch, sie ist vollzubekommen

Ein Jahr Spiel durchgerechnet, vier Sitzungen die Woche, 85 % richtig
(`src/kern/leitner.js` gegen die echten Vorräte, nicht geschätzt):

| Ebene | Vorrat | 1. Stern | 2 Sterne | voll |
|---|---|---|---|---|
| Fionas Plus und Minus | 100 | Woche 11 | Woche 22 | Woche 50 |
| Leas Reihen | 140 | Woche 8 | Woche 17 | Woche 37 |
| Große Zahlen (Eltern) | 158 | Woche 9 | Woche 19 | Woche 41 |

Ein Schuljahr für hundert Rechenaufgaben ist kein „nie". Die Prämisse der
Frage war falsch — **und das Messen hat etwas Schlimmeres gefunden.**

### Aufkleber fielen wieder aus dem Buch

`istGesammelt` las das **laufende** Leitner-Fach. Das fällt bei jeder
falschen Antwort auf 1 zurück — das ist die Wiederholungslogik, und daran
ist nichts falsch. Falsch war, dass daraus auch alles abgeleitet wurde, was
über die **Vergangenheit** spricht. Im selben Jahr Spiel:

| | |
|---|---|
| Aufkleber, die wieder verschwanden | 122 bis 251 je Ebene |
| Sitzungen, in denen mindestens einer verschwand | 47 bis 74 von 208 |
| Sitzungen, in denen Fionas zweite Kontinentrunde wieder **zu** war | 47 von 208 |

Bei den sieben Kontinenten hieß das: Höchststand 7 Aufkleber, Stand nach
einem Jahr **2**. Ein Aufkleberalbum, aus dem Aufkleber herausfallen, ist
keins. Und einer Sechsjährigen Asien wieder wegzunehmen, weil sie es einmal
falsch geraten hat, ist keine Wiederholung, sondern eine Strafe.

Obendrein meldete der Endbildschirm denselben Aufkleber ein zweites und
drittes Mal als „neu" — dieselbe Wurzel.

### Zwei Zeitformen statt einer Zahl

Der Leitner-Stand trägt jetzt `hoechstes`: die höchste je erreichte
Fachhöhe, die nie fällt.

| | fragt | |
|---|---|---|
| Haken auf der Karte | heutiges Fach | „sitzt **gerade**" — darf verschwinden, das ist die Rückmeldung |
| Aufkleber im Buch | Höchststand | „hast du gefunden" — bleibt |
| offene Kontinentrunde | Höchststand | einmal offen, immer offen |
| Siegel „sicher" (Fach 5) | heutiges Fach | eine Aussage über heute |

Alte Stände in der Ablage haben das Feld nicht; für sie gilt das heutige
Fach als Höchststand. Das ist die vorsichtige Richtung — es nimmt niemandem
etwas weg, was er heute sieht.

### Und die Gegenprobe, die nichts bewiesen hat

Die erste Fassung der Kontinentrunden-Probe hing an `spielprobe`. Sie blieb
**grün**, obwohl der Fehler drin war: `spielprobe` rechnet die Runden-Regel
selbst nach und befragt die App nicht — sie bezeugte damit nur, dass
`warGesessen` monoton ist. Jetzt stellt der **Rauchtest** den Rückfall in der
Ablage (alle vier der ersten Runde schon einmal in Fach 3, heute wieder in
Fach 1) und zählt, wie viele Kontinente die Ebene danach kennt: 6 von 6.

Das ist Regel 1 in Reinform — wer eine Wirkung misst, schaltet sie zuerst
ab. Die Probe, die ihre eigene Abschrift prüft, ist der häufigste Weg, wie
eine Prüfung leise aufhört zu beweisen.

## Und der Vorlauf füllt sein Band

Sechs Beispielkarten standen **linksbündig** in einer Reihe von acht Spuren:
`auto-fill` legt die Spuren nach einer festen Mindestbreite an, sechs davon
wurden belegt, rechts blieb ein Loch von vierhundert Punkten — und darüber
und darunter je ein Drittel leeres Band.

Jetzt kommen beide Zahlen aus der Zahl der Karten: höchstens acht
nebeneinander, ab vier Karten zwei gleich lange Reihen. Die Reihen teilen
sich die Höhe des Bandes (`1fr`), gedeckelt durch das Höchstmaß einer Karte
— ungefähr quadratisch, die Form eines Aufklebers.

Sechzehn Bundesländer stehen wie bisher acht und acht, aber die Umrisse sind
jetzt so groß, dass man sie erkennt statt sie zu erahnen. Sechs
Rechenaufgaben stehen drei und drei, zentriert.

Zwei Fehlversuche unterwegs, beide gemessen und nicht geraten:

- Die Karte selbst zu deckeln (`max-height` + `align-self:center`) hat sie
  **zum Einsturz** gebracht — ein Gitterkind bemisst sich dann an seinem
  Inhalt, und der darf hier auf null schrumpfen. Übrig blieben sechs flache
  Striche mit übereinanderliegender Schrift.
- Nacktes `1fr` für die Reihen: die Spaltenzahl ist ein **Wunsch**, auf
  schmalen Geräten legt `auto-fit` weniger an. Auf dem iPhone SE quer
  standen die dreizehn Hauptstadtkarten dann in drei gequetschten Reihen —
  `passt` hat es gemeldet, 2 px über den Rand. `minmax(min-content,1fr)`
  löst es.

Dazu ein Werkzeug, das gefehlt hat: `node tor/ansicht.mjs --nur=quer-vorlauf`
nimmt nur die genannten Bildschirme auf. Am Bildschirm zu arbeiten heißt, ihn
oft anzusehen — fünf Sekunden statt einer Minute.

---

## Runde: das Buch braucht keinen dritten Zustand — aber sein Band ist zu klein

Die Frage war: seit `hoechstes` zeigt das Forscherbuch Aufkleber, deren
Gegenstand heute wieder in Fach 1 steht, genauso wie sichere. Braucht es
einen dritten, leisen Zustand?

### Gemessen: nein

Ein Jahr Spiel, vier Sitzungen die Woche, 85 % richtig:

| Ebene | Aufkleber im Schnitt | davon wackelt | davon **sicher** |
|---|---|---|---|
| Kontinente | 6 | 2 (28 %) | 3 |
| Bundesländer | 16 | 2 (16 %) | 10 |
| Plus und Minus | 73 | 9 (14 %) | 50 |
| Leas Reihen | 111 | 9 (9 %) | 86 |

Zwei Zahlen entscheiden. Erstens: **das Siegel gibt es schon.** Zwischen
50 und 86 % der Aufkleber tragen es, und es sagt genau das, was ein
dritter Zustand sagen würde — nur andersherum und ohne Vorwurf. Ein
Aufkleber ohne Siegel ist noch nicht sicher; ob er auf dem Weg nach oben
oder gerade zurückgefallen ist, ändert für ein Kind nichts.

Zweitens: **die Eltern haben die Liste bereits.** Der Verdacht war, ihre
„Wackelkandidaten" (die fünf mit den meisten Fehlversuchen, aus dem
Protokoll) sagten etwas anderes als der Leitner-Stand (was heute
zurückgefallen ist). Nachgespielt über ein Jahr, mit Gegenständen
unterschiedlicher Schwierigkeit: **4 von 5** stehen auf beiden Listen. Wer
oft danebenliegt, fällt auch zurück.

Ein Zeichen, das nichts ändert, ist Dekoration — und aus dem Buch war die
graue To-do-Wand schon einmal bewusst entfernt worden. Also bleibt es bei
zwei Zuständen: **Aufkleber** (hast du gefunden) und **Siegel** (sitzt).

### Was das Messen stattdessen gefunden hat

Beim Nachsehen auf 844 × 390: das Buch rollte mit **zwei** Aufklebern
schon — 358 Punkte Inhalt bei 322 sichtbaren. Die Vorschau unter „Als
Nächstes" stand zur Hälfte unter dem Rand: zwei graue Halbkarten, von
denen ein Kind nicht weiß, dass darunter noch etwas ist.

Die Bildhöhen (96 und 72 Punkte) sind für den Schreibtisch gewählt. Im
kurzen Querformat sind es jetzt 64 und 48; damit passt das fast leere Buch
in einen Bildschirm. Dass ein **volles** Buch rollt, bleibt richtig — ein
Album wächst.

`passt` konnte das nicht melden: dort darf `.rollen` rollen. Geprüft wird
es jetzt im Rauchtest, und zwar als Regel und nicht als Punktzahl —
*solange höchstens acht Karten drin sind, steht nichts unter dem Rand*.
Die Prüfung meldet auch, wenn es mehr als acht werden: dann prüft sie
nicht mehr, was sie zu prüfen behauptet.

---

## Runde: der Rohdatenpfad zeigte in ein Sitzungsverzeichnis

`tools/geo-backen.mjs` setzte die Rohdaten fest auf
`/tmp/claude-…/scratchpad/roh`. Das hat funktioniert, solange die Sitzung
lief, in der der Pfad entstanden ist, und danach nie wieder.

Interessant ist nicht der Pfad, sondern dass **zwei andere Stellen es
richtig sagten**: `.gitignore` nennt `roh/`, die README schreibt „braucht
`roh/`". Zwei von drei waren einig — und die dritte war die, die zählt. Wer
`npm run backen` aufrief, bekam ein nacktes `ENOENT` auf ein Verzeichnis,
das er nie gesetzt hatte.

Jetzt: `process.env.LERNKISTE_ROH || path.join(process.cwd(), 'roh')`, und
statt des `ENOENT` eine Auskunft —

```
  Die Rohdatei „ne_50m_admin_0_countries.geojson" fehlt in <repo>/roh.

  Holen:     npm run geo-holen   (rund 400 MB, Natural Earth, Public Domain)
  Anderswo:  LERNKISTE_ROH=<verzeichnis> npm run backen

  Zum Bauen und Spielen wird sie NICHT gebraucht — nur zum Neurechnen
  der Karten. Das Ergebnis liegt eingecheckt in src/geo/.
```

Gedruckt und beendet, nicht geworfen: ein Stapelabzug über acht Zeilen
verdeckt genau die Auskunft, um die es geht. Sieben Lesestellen in sechs
Werkzeugen gehen jetzt durch **eine** Funktion, also gibt es die Meldung
einmal.

Nachgewiesen, dass der Umbau nichts kaputt gemacht hat: mit gesetztem
`LERNKISTE_ROH` läuft `backen-kontinente` durch und schreibt **dieselben
Dateien** — Hausdorff 0,72 / 0,71 / 0,74 px, `git status src/geo` leer.

Und weil genau die Uneinigkeit der drei Stellen der Fehler war, prüft
`inhalt` sie jetzt gegeneinander: der Ordnername muss relativ zum
Arbeitsverzeichnis stehen, in `.gitignore` auftauchen und in der README
genannt sein.

### Was die vier Runden zusammen an Laufzeit gekostet und gebracht haben

Gemessen mit derselben Messstelle vorher und nachher, auf demselben
Rechner:

| | vorher | nachher |
|---|---|---|
| Rauchtest (Hauptweg) | 28,8 s | 20,1 s |
| Bildvergleich, seriell | 114,9 s | 96,8 s |
| `npm run schnell` | 48,4 s | **46 s** — bei 23 statt 21 Aufnahmen und einer Prüfung mehr im Rauchtest |
| `npm run tor` | 5:04 | **4:48** |

Der Gewinn aus `schauPause` ist größer als die Tabelle zeigt: er hat die
zwei neuen Aufnahmen (`quer-pause`, und `quer-vorlauf-rechnen` aus der
Runde davor) und die Buchprüfung mitbezahlt.

---

## Nachtrag: der erste volle Probenlauf seit langem — sieben stumme Gegenproben

Alle vier Runden oben sind mit **ausgewählten** Gegenproben abgesichert
worden (`node tor/proben.mjs "<name>"`). Das ist die richtige Arbeitsweise
in der Runde — und sie kommt an eine ganze Klasse von Fehlern nie heran:
eine Probe, die man nicht anfasst, wird nicht gefahren, und eine Probe, die
nicht gefahren wird, kann **still aufhören zu beweisen**.

Der volle Lauf am Ende der Sitzung (41,9 min, 115 Proben):

```
104 schlagen an, 2 beweisen nichts, 5 kamen nicht an.
```

### Fünf trafen ihren Suchtext nicht mehr

| Probe | was sich geändert hatte |
|---|---|
| die Seite wächst unbemerkt | `const LOB = [` gibt es seit der Ton-Runde nicht mehr |
| ein Fehlwurf bleibt stumm | `vorlesen` → `sagen` (Ton-Runde) |
| nach „von vorne" läuft die alte Sitzung weiter | dasselbe, zweite Stelle |
| Fiona bekommt die Länder der Eltern zu sehen | die Profilzeile hat ein Feld mehr bekommen |
| der Vorlauf zeigt die falsche Zahl an Gebieten | `vorrat` → `vorlaufVorrat` |

**Drei davon habe ich in dieser und der letzten Sitzung selbst entwaffnet** —
mit Änderungen, deren eigene Gegenproben grün waren. Das Muster ist immer
dasselbe: ein Suchtext hält mehr fest, als er braucht. Die Fiona-Probe
schrieb die ganze Profilzeile ab, obwohl es ihr um ein einziges Feld geht;
sie ging kaputt, als ein anderes Feld dazukam.

### Zwei meldeten das Falsche

*„ein Vorsprung allein genügt wieder"* erwartete **„ist neu"**. Der
gelockerte Wert lässt aber **zwei** durchrutschen, also schreibt das Tor
„sind neu". Eine Erwartung, die die Einzahl mitfesthält, geht kaputt, sobald
der Eingriff einen Fall mehr öffnet.

*„die Ansage hängt nicht mehr am Kind"* lief in `--sofort`. Der Eingriff
lässt auch das Elternprofil sprechen — der Rauchtest meldet das zehnmal und
bricht ab, **bevor** er die vorgelesenen Aufgaben zählt. Die Probe sah ein
rotes Tor mit der falschen Meldung. Dafür gibt es jetzt `ohneSofort`: eine
Abkürzung, die den ersten Fehler zum einzigen macht, taugt nicht für eine
Probe, deren Fehler der elfte ist.

### Und ein Kreis, aus dem vier Proben nicht mehr herauskamen

`rhythmus` schlägt an, wenn eine Probe keinen frischen Nachweis hat — und
seine **eigenen vier** Proben sind genau solche Proben, solange sie nicht
angeschlagen haben. Sie konnten nicht anschlagen, weil das Tor rot war, und
das Tor war rot, weil sie nicht angeschlagen hatten. Einmal aus dem Fenster
von drei Runden gefallen, kamen sie nie wieder hinein.

Aufgelöst mit einem **schärferen** Maß statt eines schwächeren
(`auchWennRot`): die erwartete Meldung muss ohne den Eingriff **fehlen** und
mit ihm **da sein**. Das zeigt mehr als „grün wird rot" — nämlich dass genau
dieser Satz an genau diesem Eingriff hängt.

Zwei der vier brauchten dafür eine schärfere Erwartung. „älter als" steht
auch da, wenn irgendein anderer Nachweis veraltet ist; jetzt „älter als
**-1** Runden" — die Zahl, die nur die Schraube der Gegenprobe erzeugt.
„nie angeschlagen" ebenso; jetzt hängt die Erwartung am **Namen** der Probe,
deren Eintrag der Eingriff entfernt.

Stand danach: **115 von 115 mit frischem Nachweis**, `rhythmus` grün.

### Was daraus folgt

Der nächtliche Lauf auf dem Runner ist kein Komfort, sondern die einzige
Stelle, an der diese Fehlerklasse überhaupt auffällt. Läuft er nicht, oder
schaut niemand ins Protokoll, verfällt der Beweiswert schleichend — genau
das, was `rhythmus` messen soll und was ihm hier selbst passiert ist.

**Nachgesehen statt vermutet — und die erste Antwort war falsch.** Beim
ersten Blick meldete die Liste der Läufe `total_count: 0`; daraus stand hier
„hat noch nie gelaufen". Eine Stunde später standen dort **zwei** Läufe, und
der erste war der **planmäßige** von 08:02 UTC. Eine Zahl aus einer Liste,
die noch nicht vollständig ist, sieht aus wie ein Befund.

Was der planmäßige Lauf wirklich sagt, Schritt für Schritt:

| Schritt | Ergebnis |
|---|---|
| Alle Gegenproben (28 min) | rot — genau die sieben stummen Proben von oben |
| **Stand zurückschreiben** | **grün**, Commit „Probenstand (nächtlicher Lauf)" |
| Was nicht angeschlagen hat | rot, wie vorgesehen |

Damit ist die offene Frage beantwortet: **das Zurückschreiben funktioniert**
(`git push` aus dem Lauf heraus, `permissions: contents: write`). Und die
Regelung hat beim allerersten Mal genau das getan, wofür sie da ist — sie
hat die sieben stummen Gegenproben gemeldet, in derselben Nacht, in der sie
zum ersten Mal lief.

Eine Feinheit im Protokoll, die täuschen kann: der Schritt „Alle
Gegenproben" trägt `continue-on-error: true`. Seine **conclusion** ist
deshalb `success`, auch wenn er rot war — der rohe Ausgang steht in
**outcome**, und nur der letzte Schritt macht den Lauf rot. Wer auf die
conclusion sieht, liest grün, wo rot steht.

---

## Runde: „undefined" auf jedem Aufkleber

Gesucht war etwas anderes — ob die Vorschau im Forscherbuch zu weit links
hängt. Beim Messen mit gesetztem Lernstand stand auf **jeder Karte** das
Wort `undefined`.

### Der Fehler

Die Umrisse der Bundesländer und der Länder liegen **nicht im
Startbündel**. Sie werden geholt, wenn die Ebene betreten wird — `budget`
hat sie ausgelagert, 56 von 94 KB Geometrie gehörten allein Deutschland.

`forscherbuch()` rief `vorrat()` für jede Ebene und nahm, was gerade da
war. Ohne `pfad` fällt der Kasten auf die **Rechen-Darstellung** zurück und
setzt `x.frage` — die es bei einem Gebiet nicht gibt.

Der Weg dorthin ist der normale: gestern Bundesländer gespielt, heute die
App öffnen, auf „Deutschland", dann aufs Forscherbuch. Sechzehn
Länderebenen und die Bundesländer sind betroffen; die Kontinente nicht, die
liegen im Startbündel.

**Warum kein Tor es gemeldet hat**, und warum keines es konnte: der
Rauchtest öffnet das Buch, *nachdem* er die Ebene gespielt hat — da ist die
Geometrie längst geladen. Und das Vorbild `quer-buch` zeigt Kontinente.
Beide Prüfungen gehen genau an dem Weg vorbei, auf dem der Fehler liegt.

### Was jetzt dasteht

Das Buch holt nach, was es zeigt — und nur das: die Ebenen mit Aufklebern
plus die eine, aus der die Vorschau kommt. Wer alles holte, zöge sechs
Kontinente und Deutschland nach, um drei Aufkleber zu zeigen. Dafür läuft
die Funktion jetzt in zwei Durchgängen: erst die Stände zählen (das geht
ohne Umrisse — der leichte Stand hält Kennung, Name und Anker), dann laden,
dann bauen.

Geprüft wird es dort, wo es hingehört: der Rauchtest öffnet das Buch **auf
dem Weg über die Ebenenwahl, ohne die Ebene zu betreten**, und verlangt,
dass jede Karte eines Gebiets einen Umriss trägt.

### Und die Frage, mit der die Runde anfing

Die Vorschau steht links, mit 416 bis 555 Punkten Leere rechts — und sie
kann sich nie füllen, es sind höchstens drei Karten. Angesehen: das ist
**kein** Fehler. Sie steht bündig unter derselben linken Kante wie die
Sammlung darüber und wie die Überschrift; ein Album füllt sich von links.
Zentriert wäre sie der einzige zentrierte Block auf einer sonst linksbündig
gesetzten Seite.

Die Sammlung selbst füllt die Breite ab sechs Aufklebern vollständig
(gemessen: 2 → 499 px rechts leer, 6 → 0, 14 → 0). Das ist der Unterschied
zum Vorlauf, wo `auto-fill` acht Spuren für sechs Karten anlegte und der
Rest **nie** dazukam.

---

## Runde: `rhythmus` zählte Commits, wo es Tage messen sollte

Nach der letzten Sitzung stand das Tor auf **47 Runden Rückstand** — obwohl
jede Probe am selben Tag bezeugt worden war. Ein Tor, das nach jeder
Arbeitssitzung rot ist, ist auf dem Weg, ignoriert zu werden. Und genau das
ist die Verfallsart, die es abfangen soll.

### Die Größe war falsch, nicht die Grenze

Gezählt wurden „Runden am Code": Commits, die `src`, `prototyp`, `tor`,
`tools` oder `package.json` anfassen. Ein Commit ist aber **kein Maß für
Veränderung** — ich mache viele kleine, jemand anders macht einen großen.
Die Zahl hing an der Commit-Gewohnheit, nicht an der Sache.

Was das Tor laut seinem eigenen Kopf abfangen soll, steht dort seit jeher:
*dass der volle Lauf nicht mehr stattfindet*. **Das misst man in Tagen.**
Der Runner fährt ihn jede Nacht, also ist alles null oder einen Tag alt,
solange er fährt. Drei Tage lassen ein verpasstes Wochenende durch.

Damit fallen **achtzig Zeilen Git** weg: `rev-list --count`, `merge-base
--is-ancestor`, ein Durchgang durch alle Fassungen der Standdatei, um zu
finden, wo ein Eintrag zuerst auftaucht. Jede Zeile hatte ihren Grund, und
alle Gründe hingen daran, dass in Commits gezählt wurde. Diese Rechnerei hat
die Auslieferung einmal fünf Runden rot gehalten und verlangte
`fetch-depth: 0` in zwei Arbeitsabläufen. Ein Datum steht in der Datei.

### Die Frage, für die in Commits gezählt wurde, ist damit offen — und besser beantwortet

„Ist eine Probe seit ihrem Nachweis durch eine Änderung stumm geworden?" —
dafür war das Zählen gedacht, und dafür hat es nie funktioniert.

`inhalt` beantwortet sie jetzt **in einer Millisekunde, bei jeder
Änderung**: findet jede Gegenprobe ihren Suchtext noch? **Fünf der sieben
stummen Proben** aus dem letzten vollen Lauf hätten genau daran
angeschlagen — am Tag ihres Todes statt sechs Wochen später.

Das ersetzt den vollen Lauf nicht: ob ein Tor *wirklich* anschlägt und dabei
das Richtige meldet, sagt nur er. Aber die häufigste Verfallsart ist jetzt
in der Kette, und zwar zum Nulltarif.

Dafür steht die Probenliste in **`tor/proben-liste.mjs`** und wird gelesen
statt aus dem Quelltext geklaubt. Der alte Ausdruck in `rhythmus`
(`/^\s*\{ n:'([^']+)'/gm`) hat schon einmal einen Namen aus einem *Kommentar*
mitgezählt und siebzig Proben gemeldet, wo neunundsechzig standen.

### Drei Anläufe für eine Gegenprobe — jedes Mal Selbstbezug

Die neue Prüfung braucht eine Gegenprobe: *eine Gegenprobe greift ins
Leere*. Sie ist dreimal danebengegangen, und jedes Mal unauffällig:

1. Sie nahm den Suchtext einer anderen Probe wörtlich — und traf damit als
   erstes **ihre eigene Zeile** in derselben Liste. Verstellt wurde die
   Gegenprobe, das Ziel blieb unberührt, `inhalt` meldete grün.
2. Umgangen mit `SITZ[T]` im Ausdruck (trifft `SITZT`, aber nicht sich
   selbst) — und traf dann die **`fehlt`-Zeile**, in der derselbe Text noch
   einmal steht.
3. Erst der dritte Anlauf ließ den schlaueren Ausdruck weg und wechselte das
   **Ziel**: eine Zeile in `spiel.js` ändern, die zwei Proben als Suchtext
   tragen. Der Eingriff sitzt jetzt dort, wo im Ernstfall auch gearbeitet
   wird, und die Liste bleibt unberührt.

Eine Gegenprobe, die in die Liste greift, in der sie selbst steht, ist ein
Sonderfall von Regel 1 — und einer, den man nur sieht, wenn man den
Eingriff nachrechnet statt ihm zu glauben.

### Und eine, die das Falsche traf

*„ein Nachweis, dessen Alter sich nicht bestimmen lässt"* setzte ein
ungültiges Datum — und traf das `"zeit"` **ganz oben** in der Standdatei,
das des Laufs statt das eines Eintrags. `rhythmus` liest es gar nicht. Der
Eingriff kam an und traf das Falsche: die unauffälligste Art,
danebenzugreifen, denn „angekommen" meldet der Lauf brav.

---

## Runde: ein Suchtext trifft genau einmal — und der Weg zum Sprachkorpus

### 1 · Was „steht der Text noch da" nicht fängt

Die Suchtext-Prüfung von gestern fängt den Text, der **weg** ist. Sie fängt
nicht den, der noch da ist und ab jetzt **woanders** steht: `replace` nimmt
die erste Fundstelle, und bei zwei Fundstellen entscheidet ihre Reihenfolge,
welche verstellt wird.

Das ist an einem einzigen Tag dreimal passiert — `.rechenkleber{` traf zwei
CSS-Zeilen, und die Gegenprobe zur Suchtext-Prüfung traf zweimal **sich
selbst** statt ihres Ziels. Beide Male sah der Lauf einen angekommenen
Eingriff.

Gemessen über alle 120 Proben: **vier** treffen nicht genau einmal.

| Probe | wie oft | Urteil |
|---|---|---|
| ein Zeichen außerhalb des geladenen Schnitts | 2× | **echt** — „Lass es auf dem Land los." steht zweimal in `spiel.js`, als Text und als Ansage |
| der letzte Probenlauf liegt zu lange zurück | 121× | Absicht — der Eingriff ändert nichts, er sitzt in der Umgebung |
| ein Nachweis, dessen Alter sich nicht bestimmen lässt | 120× | Absicht — einer von hundertzwanzig Einträgen genügt |
| die Beschriftung fällt immer gleich aus | 2× | Absicht — das `g` **ist** der Eingriff |

Die drei tragen jetzt `mehrfach:true` und schreiben dazu, warum. Die vierte
ist eng gefasst. Und die Regel steht in `inhalt`: **genau einmal, oder sag,
dass du es anders meinst.**

### 2 · M4: der Engpass ist kleiner als „Aufnahmen"

`vergleich` sagt in jedem Lauf, dass seine Zahlen nichts bezeugen — die
erfundene Hälfte des Korpus ist von derselben Hand wie der Abgleich, den sie
prüft. Bis hierher stand dagegen „braucht echte Aufnahmen", und das klang
nach Tonstudio.

Nachgesehen: **die App schreibt es längst mit.** Bei jeder gesprochenen
Antwort hält das Protokoll fest, was ankam (`roheingabe`) und wonach gefragt
war (`gebietId`); der Elternbereich gibt das als JSON aus. Was fehlte, war
der Weg vom Export zum Korpus.

Den gibt es jetzt: `npm run korpus`. Drei Schritte, und der mittlere ist
Handarbeit — **absichtlich**:

```
1.  npm run korpus -- <export.json>     Urteilsliste anlegen
2.  je Zeile "ja" / "nein" / "weg"      von Hand
3.  npm run korpus -- --einfrieren      Korpus bauen
```

**Warum Schritt 2 nicht automatisch geht**, und das ist der ganze Punkt: der
naheliegende Weg wäre, `ergebnis: 'richtig'` als Treffer zu nehmen. Genau
das ist verboten — `ergebnis` ist die Entscheidung des Abgleichs, und ein
Korpus, der sie übernimmt, kann ihm nicht widersprechen. Er würde 100 %
Trefferquote messen, immer, und nichts beweisen. Regel 14 in Reinform.

**Wieviel gesammelt werden muss, und warum diese Zahl.** Gezählt werden
*verschiedene Formen*, nicht Äußerungen: wer vierzigmal sauber „Europa"
sagt, hat den Abgleich einmal geprüft. Im Versuchslauf wurden aus 146
Äußerungen **zwölf Formen** — es braucht also viele Sitzungen, nicht eine.

| Formen | eine Standardabweichung |
|---|---|
| 25 | 6,0 Prozentpunkte |
| 50 | 4,2 |
| 100 | 3,0 |
| 200 | 2,1 |

Bei fünfundzwanzig Formen liegt ein Lauf zwölf Punkte daneben — eine solche
Zahl kann eine 90-Prozent-Grenze weder halten noch reißen, sie würfelt.
Deshalb: **100 Treffer, 50 Nichttreffer**, und das Werkzeug verweigert
darunter den Dienst. Für die Falsch-Positiv-Zahl reicht auch das noch nicht
(2 % von fünfzig ist ein einziger Fall); das steht dort, statt so zu tun,
als wäre es anders.

Der ganze Weg ist mit einem erfundenen Export durchgespielt: Urteilsliste,
Größengrenze, Bau — und danach schaltet `vergleich` von „keine Zielzahl" auf
`ROT: unter 90 % Trefferquote` um. Die Prüfdateien sind wieder gelöscht.

**Was jetzt fehlt, ist eine Sache:** Fiona muss mit dem **Mikrofon** spielen
statt zu ziehen. Ihr Profil kann es (`eingabe: ['ziehen','sprechen']`).
Danach im Elternbereich „Als JSON sichern" und die Datei an
`npm run korpus` geben.

Zwei Kleinigkeiten am Rand: die Urteilsliste trägt **keinen Zeitstempel** —
der Korpus braucht ihn nicht, und er würde daraus eine Spur machen, wann ein
Kind was geübt hat. Und die Größengrenze in `vergleich` ist die **einzige
Prüfung im Verzeichnis ohne Gegenprobe**: ihren Gegenstand gibt es noch
nicht. Sobald die Datei da ist, gehört eine nachgetragen.

### Nachtrag: das Werkzeug wird jetzt selbst durchgespielt

Ein Werkzeug, das darüber entscheidet, ob die Zahlen eines Tors etwas
bezeugen, darf nicht das einzige sein, das niemand prüft. `vergleich` fährt
es deshalb in einem **Wegwerf-Verzeichnis** sechsmal durch — Export ohne
gesprochene Antwort, offene Urteile, erfundenes Urteil, Größengrenze,
zweiter Export, und die eine, um die es geht:

> Ein Eintrag, den der Abgleich für richtig hält (`ergebnis: 'richtig'`),
> aber ein Mensch für falsch (`urteil: 'nein'`), **muss bei den Nichttreffern
> landen.** Käme er bei den Treffern an, hätte das Werkzeug `ergebnis`
> abgeschrieben — und der Korpus könnte dem Abgleich nie widersprechen.

Vier Eingriffe von Hand gegengeprobt, jeder mit geprüfter Ankunft, jeder mit
der richtigen Meldung.

**Und die Gegenprobe hat die Probe selbst verbessert**, zweimal:

- Der erste Anlauf schlug scheinbar *nicht* an — bis auffiel, dass ich nicht
  nachgesehen hatte, ob der Eingriff überhaupt ankam (Regel 10). Er kam an;
  die Probe hatte recht und meldete es als **Stapelabzug**: das Werkzeug
  verweigerte aus einem anderen Grund, die Korpusdatei entstand nicht, das
  Lesen warf `ENOENT`. Jetzt wird jede Probe eingewickelt — ein Wurf ist ein
  Befund, kein Absturz.
- Dabei blieb auch das Wegwerf-Verzeichnis liegen, weil das Aufräumen nach
  dem Wurf nie drankam. Jetzt räumt es immer auf; nachgemessen an einem
  grünen und einem roten Lauf: null Reste unter `/tmp`.
- Und der Eingriff ließ das Werkzeug wegen der **Größe** verweigern statt
  wegen der Sache — die Probe schlug an, aber mit der falschen Auskunft.
  Ein Nichttreffer mehr in den Prüfdaten, und der Grund bleibt der Grund.

---

## Runde: die Entwürfe holten ihre Schrift aus dem Netz

Gesucht war, ob der Bildvergleich in mehr Teile zerfallen sollte. Die
Messung fand etwas anderes: **eine einzige Aufnahme kostete 13,5 s**, alle
zweiundzwanzig anderen zusammen 22.

### Der Fund

`entwuerfe/mg.html` trug im Kopf einen `<link>` auf
`fonts.googleapis.com`. Ohne freies Netz läuft die Anfrage in die
Zeitüberschreitung: **12,5 s bei jedem Seitenaufbau**, und der
Bildvergleich baut die Seite bei jedem Lauf auf.

Das war der kleinere Schaden. Danach steht die Seite in der
**Ersatzschrift** da — die Vorbilder `mg-fiona-kontinente` und
`mg-lea-deutschland` zeigten seit jeher eine Systemschrift statt Plus
Jakarta Sans. Ein Entwurf, der die Typografie zeigen soll, zeigte eine
fremde.

`ansicht` hat gegen genau das eine Prüfung — sie lief nur für die
App-Bildschirme. Jetzt für jede Aufnahme.

### Und die Prüfung war leer

Beim Gegenproben blieb sie grün, obwohl der Google-Link wieder drin war.
`document.fonts.check()` sagt nur, ob die **angemeldeten** Faces geladen
sind; gibt es gar keine `@font-face`, ist die Menge leer und die Antwort
lautet grün. Also genau im Fall, für den sie geschrieben wurde.

Gemessen wird jetzt die **gesetzte Breite**: ein Wort in der gesuchten
Schrift gegen dasselbe Wort in einer Sippe, die es sicher nicht gibt. Sind
beide gleich breit, wird die Ersatzschrift gesetzt — egal, was der Lader
meint.

### Was es gebracht hat

| | vorher | nachher |
|---|---|---|
| Aufbau von `mg.html` | 12 500 ms | **620 ms** |
| `npm run schnell` | 46 s | **23,8 s** |
| `npm run tor` | 4:48 | **4:41** |

### Und die Ausgangsfrage beantwortet sich selbst

Mit den 12,5 s ist der Bildvergleich nicht mehr der Engpass. Gemessen, alle
am selben Tag, Wanduhr der ganzen Gruppe:

| Teile | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| Wanduhr | 27,1 s | **20,1 s** | 20,7 s | 21,0 s | 22,5 s |

Ab drei Teilen bestimmt der **Rauchtest** mit seinen zwanzig Sekunden den
Boden. Ein vierter Chromium teilt nur noch Arbeit auf, die ohnehin früher
fertig wäre. Also drei.

Der alte Kommentar sagte „drei Chromium sind die Grenze, gemessen" — das
galt, bis die Zusammensetzung sich änderte. Eine gemessene Zahl gilt für
den Tag, an dem sie gemessen wurde; wer sie erbt, erbt ihre
Voraussetzungen mit (Regel 5).

`npm run ansicht -- --zeiten` sagt jetzt, was jede Aufnahme kostet — damit
die Gewichte der Aufteilung eine Messstelle haben statt einer Schätzung.

## Die Ebenenwahl bei vollem Lernstand

Das Vorbild dafür fehlte: `quer-ebenen` zeigt **eine** Kachel mit
Fortschritt und sieben auf null. Jetzt gibt es `quer-ebenen-voll` — acht
Kacheln mit Sternen, Aufkleberzahlen und Balken nebeneinander, der Fall
nach ein paar Wochen. Der Stand wird aus den **Daten der Seite** gestellt,
nicht aus einer Liste im Tor, damit die nächste Ebene nicht fehlt.

Gemessen sind alle Zahlen in sich stimmig:

| Ebene | Sterne | Aufkleber | von | Balken |
|---|---|---|---|---|
| Asien | 2 | 2 | 3 | 0,67 |
| Bundesländer | 1 | 9 | 16 | 0,56 |
| Hauptstädte | 1 | 7 | 13 | 0,54 |

Sterne und Balken sind **Anteile**, die Zahl ist **absolut**. Nebeneinander
liest sich das als Widerspruch: neun Aufkleber und ein Stern, daneben zwei
Aufkleber und zwei Sterne.

---

## Runde: sieben Sekunden, in denen nichts passiert

Die Frage war, was das Nachladen des Forscherbuchs kostet. Gemessen auf
844 × 390, einmal mit und einmal ohne das Lager des Service Workers:

| | 1 Ebene | 3 Ebenen | 5 Ebenen |
|---|---|---|---|
| mit Lager | 662 ms | 664 ms | 662 ms |
| mit Lager, 3G gedrosselt | 691 ms | 663 ms | 709 ms |
| **ohne Lager, 3G** | **2 986 ms** | **4 468 ms** | **7 477 ms** |

Die erste Sorge war unbegründet: **die Drossel ändert nichts**, weil der
Service Worker alle Ebenendaten vorsorglich ins Lager legt (`vorrat` in
`prototyp/bauen.mjs`, mit genau dieser Begründung). Nach dem ersten Besuch
liegt alles auf dem Gerät.

Der Fall davor ist der Fund: beim **allerersten** Besuch, bevor das Lager
steht, dauert es bis zu siebeneinhalb Sekunden — und die ganze Zeit steht
der **alte** Bildschirm da. Ein Kind tippt auf „Forscherbuch", und nichts
passiert. Dasselbe gilt nach jeder neuen Fassung, solange das Lager neu
aufgebaut wird.

### Ein Wartezeichen, aber erst nach einem Augenblick

Die Entscheidung fällt in **`zeige()`** und nicht an den Aufrufstellen:
jeder Bildschirm, der je auf etwas wartet, ist damit versorgt — auch der
nächste, an den heute niemand denkt.

Nach 300 ms erscheinen drei atmende Punkte. Kein Wort: es erscheint für ein
Kind, das nicht liest. Ein Zeichen, das *sofort* käme, blitzte im Normalfall
nur auf und machte die App unruhig.

Gemessen danach: **Wartezeichen nach 321 ms, Buch nach 4 126 ms.**

### Vier Anläufe für die Prüfung, und jeder war eine eigene Lehre

Der Rauchtest sollte den schlimmsten Fall stellen. Er meldete dreimal rot
über etwas, das in Ordnung war:

1. `t0` lag **vor** `q.click()` — und Playwrights `click()` wartet erst auf
   Erreichbarkeit und Ruhe. 2,7 s davon landeten in der gemessenen Spanne.
2. Verdacht auf `requestAnimationFrame` im Hintergrund. Falsch, aber die
   Lehre bleibt: gemessen wird jetzt mit einer `evaluate`-Schleife, die in
   jedem Fall läuft, statt mit `waitForFunction`.
3. Der eigentliche Grund: der **gemeinsame Kontext hat längst einen
   Service Worker** — die früheren Abschnitte haben ihn registriert. Ein
   `delete navigator.serviceWorker` im Seitenskript hilft dagegen nicht;
   ein aktiver Worker übernimmt die Seite beim Navigieren, ganz ohne die
   JS-Schnittstelle. Die Daten kamen also aus dem Lager, es gab nichts
   nachzuladen, und die Probe suchte ein Wartezeichen für eine Wartezeit,
   die es nicht gab.

Der Ausweg ist ein eigener Kontext mit `serviceWorkers: 'block'`. Und die
Prüfung sagt selbst, wenn sie nichts mehr prüft: dauert das Buch unter
600 ms, meldet sie „die Drossel greift nicht" statt grün.

Nebenbei hat das **Markentor** die drei Animationsdauern gefangen, die ich
frei in die Stilvorlage geschrieben hatte — sie stehen jetzt als
`--d-warten` und `--d-warten-versatz` im Markensystem, mit Werten für
`prefers-reduced-motion` dazu.

### Eine Gegenprobe, die wieder gestrichen wurde

Zur Aufräum-Zusage („das Zeichen bleibt nicht stehen") stand hier eine
zweite Gegenprobe: die Uhr nicht abbestellen. Ihr Schatten ist viel größer
als gedacht — die Wartezeichen stapeln sich über der Bedienung, **jeder**
Klick läuft auf, und der Rauchtest wird schon im ersten Abschnitt rot, mit
„page.click: Timeout". Der erwartete Satz kam nie.

Eine Gegenprobe, deren Wirkung das Tor an einer früheren Stelle umbringt,
beweist nichts über die spätere. Und den erwarteten Satz auf „Timeout"
umzustellen hieße, eine Zufallsmeldung zum Nachweis zu erklären. Also
gestrichen, mit der Begründung an ihrer Stelle — die Zusage wird im
Rauchtest geprüft und hier nicht noch einmal behauptet.

---

## Runde: das Backlog neu geordnet — nach Nutzen statt nach Tragfähigkeit

Vier neue Anforderungen kamen dazu (Eltern aufteilen, Buchstaben schreiben,
Buchstaben nach Ansage schreiben, Zahlen 1 bis 20), und mit ihnen eine
Änderung, die größer ist als sie klingt: **die Liste wird ab jetzt nach
Nutzen für die Spieler sortiert, nicht mehr nach Tragfähigkeit.**

### Warum das keine Kosmetik ist

Tragfähigkeit war das richtige Maß, solange das Gerüst gebaut wurde — jede
Runde sollte auf der vorigen stehen können. Der Preis fällt erst auf, wenn
man das Ergebnis anschaut: eine Reihenfolge nach Tragfähigkeit schiebt das,
was ein Kind *merkt*, immer wieder nach hinten. A3 („der Fehler wird auch
beim Ziehen benannt") steht seit dem ANTON-Abgleich offen und trifft
**beide** Kinder in **jeder** Erdkunderunde; vor ihm lagen sieben Runden
Gerüst.

Nutzen ist jetzt eine einzige Frage: *wer merkt was davon, in der nächsten
Sitzung, ohne dass es ihm jemand erklärt?* Drei Stufen, mehr nicht.

Tragfähigkeit ist damit nicht verschwunden, sondern vom Sortierkriterium
zum **Zwang** geworden. Es gibt genau drei echte, und sie stehen in § 0.

### Der Fund, den das Umschreiben gebracht hat

Das Backlog ist nicht nur Text. `tor/smoke.mjs` liest daraus die
Profilnamen, die Ländertiefe, die Sitzungslänge, das Auswahlverbot, den Ton
und das Vorlesen; `tor/inhalt.mjs` liest den Ton je Profil und zählt die
158 Rechenaufgaben der Eltern nach. **Beide lesen die Spalten der Reihe
nach** (`fiona`, `lea`, `eltern`).

Damit hat die neue Anforderung „Elternprofil aufteilen" eine technische
Kante, die man ihr nicht ansieht: eine vierte Spalte in dieser Tabelle
verschiebt `eltern` von Index 2 auf Index 3, und die Tore prüfen dann
lautlos das Falsche. Die Tabelle und `PROFILE` in `spiel.js` müssen in
**einem** Schritt geändert werden. Das steht jetzt als Zwang in § 0 und als
Kern der Runde N1.

Geprüft, nicht angenommen: nach dem Umbau wurden alle sechs Ausdrücke gegen
die neue Datei laufen gelassen, bevor ein Tor lief — Namen, Vorlesen, Ton,
Auswahl, Tiefe, Sitzung, dazu die drei Rechensorten mit Summe 158. `npm run
schnell` ist grün.

### Und ein Fund, der nichts mit dem Auftrag zu tun hatte

Beim Nachschlagen einer Regelnummer fiel auf, dass sie nicht stimmte. Also
gezählt statt geschätzt:

```
92 Verweise „Regel N" in tor/, tools/, src/, prototyp/, docs/
11 Eiserne Regeln in CLAUDE.md
47 Verweise auf Regel 5, 13 oder 15
```

**Mehr als die Hälfte der Verweise zeigt auf nichts.** Die gemeinten Regeln
gibt es alle — sie stehen nur unter anderen Nummern: die Messstelle ist
hier Regel 5 und nicht 12, „erst abschalten, dann messen" steckt in Regel 1
und nicht in 13, „was zweimal dasteht" ist Regel 6 und nicht 15. Die
Verweise folgen der Nummerierung eines anderen Verzeichnisses; sie sind aus
dem Gedächtnis geschrieben, und das Gedächtnis hatte die falsche Liste
offen.

Das ist genau der Schaden, vor dem Regel 6 warnt. Eine Begründung, die man
nicht nachschlagen kann, ist keine. Steht als P4 im Backlog — mit dem
Vorschlag, nicht 47 Kommentare zu korrigieren, sondern ein Tor zu bauen,
das jede Nummer gegen `CLAUDE.md` prüft. Zehn Zeilen, und der Fehler kann
nicht wiederkommen.

### Nachtrag derselben Runde: die vier Weichen sind gestellt

Auf die vier Rückfragen kamen vier Antworten, und sie stehen jetzt als § 6
im Backlog — mit dem, was sie **kosten**, nicht nur mit dem, was sie sagen.
Zwei davon haben den Zuschnitt der nächsten Runde verändert:

**„Beides gestuft" teilt das Schreibspiel in zwei Runden.** Erst der
Strichvergleich (N2a), dann der Klassifikator als Auffangnetz (N2b) — nicht
aus Bequemlichkeit, sondern weil ein Auffangnetz nur prüfbar ist, wenn man
weiß, was durchfällt. Vor N2a gibt es diese Menge nicht, und eine Prüfung,
die nie etwas meldet, ist kein Beweis. Die Abnahme von N2b nennt deshalb
zwei Zahlen (wieviel zu Unrecht Abgelehntes wird gerettet, wieviel Falsches
kommt durch) und schaltet für die Gegenprobe das Netz ab.

**„Dritte Welt, nur für Fiona" ist ein Umbau, kein Zusatz.** Die
Weltenwahl trägt zwei Karten und ist auf 844 × 390 gemessen eng — als zwei
Weltenköpfe auf einen Bildschirm sollten, fand `passt` vierzehn Überläufe.
Der Bildschirm sieht ab N2a **je Profil verschieden** aus: drei Karten für
Fiona, zwei für Lea und die Eltern. `passt` muss beide Fassungen sehen,
sonst prüft es die halbe Wahrheit.

Die anderen beiden sind billiger, als sie klingen: der Elternvergleich
läuft auf `glatt` und die Zeit — beides wird längst gezählt, es entsteht
keine neue Zahl —, und die Strenge wird nicht geschätzt, sondern eingestellt:
an absichtlich krummen Zügen, die das Tor selbst erzeugt, bis echte Züge von
Fiona vorliegen.

---

## Runde N2a: Fiona schreibt

Die größte neue Sache seit Mathe, und die erste, die einem Kind etwas
beibringt statt es abzufragen: eine dritte Welt, **nur für Fiona**, in der
sie Buchstaben nachfährt und dann selbst schreibt.

### Eine Quelle für die Form und für die Messung

Ein Zug steht als Pfadzeichenkette da — `M20 90 L50 10`. Dieselbe
Zeichenkette zeichnet das SVG auf dem Bildschirm **und** wird abgetastet,
wenn gemessen wird, ob der Finger auf ihr geblieben ist.

Der erste Entwurf hatte zwei Fassungen: Punktlisten zum Messen, Pfade zum
Zeichnen. Das ist genau die Falle „was zweimal dasteht, veraltet einmal" —
und sie wäre unsichtbar gewesen: die Vorlage auf dem Bildschirm liefe
langsam von der Vorlage weg, gegen die geprüft wird, und das Kind bekäme
gesagt, es sei danebengefahren, obwohl es genau auf der Linie war.

Der Preis ist ein eigener Abtaster, weil `getPointAtLength` einen Browser
braucht und das Tor in Node läuft. Er kann M, L und Q — mehr braucht kein
Druckbuchstabe.

### Die Schwellen sind gemessen, nicht gegriffen

Erkennung heißt hier: Form (ein symmetrischer Punktabstand) plus Zug gegen
Zug mit Richtung, Reihenfolge und Anzahl. Zwei Schwellen entscheiden —
wie weit darf es weg sein, und wieviel Vorsprung braucht der Beste vor dem
Zweiten.

Der erste Entwurf setzte 13 und 1,2. Dann wurde der **Raum durchprobiert**:
1040 künstlich verkrummte Fassungen der 26 Vorlagen gegen 400 Gekritzel.

```
  Abstand  Vorsprung |  richtig erkannt  |  Gekritzel angenommen
     10       1,2    |       97 %        |       0,0 %
     11       1,6    |       97 %        |       0,0 %
     13       1,2    |       97 %        |       7,0 %
     14       1,2    |       97 %        |      10,0 %
```

Von 13 auf 11 herunter kostet **keinen einzigen** richtig erkannten
Buchstaben und drückt das angenommene Gekritzel von 7 % auf null. Blind
nachjustieren heißt, durch ein Schlüsselloch zu schauen — das hat T15 im
anderen Verzeichnis drei Runden gekostet, und hier eine Viertelstunde
gespart.

Das **Soll** steht dabei nicht in `schreiben.js`, sondern im Backlog,
Abschnitt 2.3. Stünde es im Prüfling, würden die Schwellen so lange
verschoben, bis das Tor grün ist.

### Drei Fehler, die nur der Blick gefunden hat

**1. `hidden` bedeutete nicht hidden.** Die Regel des Browsers für
`[hidden]` ist eine Vorgabe, und jede eigene Regel mit `display` schlägt
sie. `.zahlen{display:flex}` tat genau das: **Lea sah beim Rechnen die vier
Antwortknöpfe UND das Tippfeld**, obwohl das Feld ordentlich `hidden`
gesetzt war. Ein alter Fehler, und kein Tor konnte ihn sehen — `passt`
misst Überlauf, der Rauchtest tippt ins Eingabefeld und kommt damit durch,
und die einzige Aufnahme eines Rechenbildschirms ist Fionas, die gar kein
Tippfeld hat. Gefunden beim Bau von etwas ganz anderem.

**2. `aspect-ratio` auf einem SVG tut nicht, was man denkt.** Gemessen kamen
820 × 180 Punkte heraus statt eines Quadrats: ein SVG ohne eigene Breite
fällt auf 100 % zurück, und das Verhältnis kommt nicht mehr zum Zug. Die
Folge war unsichtbar — gezeichnet wurde an der richtigen Stelle, gemessen
an der falschen, und nichts galt. Jetzt hält ein gewöhnlicher Kasten das
Verhältnis, und die Umrechnung Finger → Vorlage läuft über
`getScreenCTM()` statt über den Rahmen. Damit hängt die Richtigkeit nicht
mehr am Stilblatt.

**3. `hidden` gibt es auf einem SVG-Element gar nicht.** Der grüne
Anfangspunkt stand auch dann noch da, als die Vorlage längst weg war — er
zeigte auf einen Zug, den es nicht mehr gab.

### Und einer, den `passt` mit 59 Meldungen auf einmal gefunden hat

Meine Schreibfläche hieß `.feld`. So heißt der **Kartenbereich des
Spielbildschirms** auch. `.feld{display:block}` hat dessen `display:flex`
überschrieben: die Antwortliste stand danach unter der Karte statt neben
ihr und lief auf allen vier Querformaten aus dem Bild.

Bemerkenswert daran ist nicht der Fehler, sondern der Weg dorthin: 59
Meldungen, und **keine einzige nannte den Schreibschirm**. Der Schaden lag
woanders als die Ursache. Zu finden war das nur, indem der Stand von vorher
noch einmal gefahren wurde — ein Arbeitsbaum an der alten Fassung, dieselbe
Prüfung, grün. Erst damit stand fest, dass es an dieser Runde lag und nicht
schon vorher rot war.

### Was das Tor selbst gefunden hat

**O und Q waren überhaupt nicht nachzufahren.** Die Richtungsprüfung fragte,
ob der erste Punkt näher am Anfang der Vorlage liegt als an ihrem Ende. Bei
einem geschlossenen Kreis ist der Anfang das Ende — „näher" ist nie wahr.
Jetzt wird der ganze Zug gegen die Vorlage gelegt, einmal vorwärts und
einmal rückwärts.

**Ein halb gezogener kurzer Strich galt als fertig.** Die Deckung zählt,
wieviel der Vorlage in Reichweite eines Fingers liegt, und bei einem kurzen
Zug reicht die Toleranz weit: der Querbalken des A ist 36 Kastenpunkte
lang, wer die Hälfte fährt, deckt mit 14 Punkten Nachsicht 89 Prozent ab.
Vier Züge verhielten sich so. Jetzt muss der Finger auch dort ankommen, wo
der Zug endet.

### Was jetzt dasteht

- **`npm run schreiben`**: 26 von 26 Vorlagen erkennen sich selbst, 96,9 %
  der krumm geschriebenen werden richtig gelesen, 0,7 % werden verwechselt,
  **0 von 400** Gekritzeln gelten als Buchstabe. Und die Gegenprobe im Tor
  selbst: bei drei Punkten mehr Nachsicht kämen 40 durch — der Vorrat kann
  also überhaupt etwas beweisen.
- **Vier stehende Gegenproben**, alle schlagen an. Drei davon zielen auf
  die Hälfte, die zählt: dass etwas ABGELEHNT wird.
- Der Rauchtest spielt einen Buchstaben ganz durch — nachfahren, zweimal
  Unsinn (der nicht gelten darf), dann richtig — und prüft, dass der
  Fortschritt im Leitner ankommt.
- `passt` sieht 17 Bildschirme je Größe statt 14, darunter die
  **Weltenwahl in beiden Fassungen**: drei Karten für Fiona, zwei für Lea.
- Drei neue Vorbilder, `quer-welten` erneuert.

### Zwei Zahlen, die dazugehören

Das Startbündel wächst von 180,3 auf **197,2 von 400 KB** (gzip) — die
ganze Schreibwelt kostet 17 KB. Für N2b, den Klassifikator als Auffangnetz,
bleiben damit gut 200 KB Luft.

Und der Vorlauf: das Abc steht in **drei Reihen zu neun**. Vier Reihen
passten nicht — die letzte lag acht Punkte im Streifen des iPhone. Die
Breite gibt dafür nach: 85 statt 96 Punkte je Karte, und das trägt auch
„Xylofon". Offen bleibt ein Hinweis: die Karten sind 42 statt 44 Punkte
hoch (S3 im Backlog).

---

## Runde N3: Fiona schreibt, was sie hört

Der nächste Schritt: kein Vorbild mehr. Das Spiel sagt *„Schreib ein Q. Q
wie Quelle."*, und Fiona schreibt es mit dem Finger.

### Eine eigene Ebene, kein Schalter

Der erste Plan war ein Modus an der Nachfahr-Ebene. Beim Bauen kippte das,
und der Grund ist einer, den man dem Bildschirm nicht ansieht: **einen
Buchstaben nachfahren zu können heißt nicht, ihn aus dem Gehör schreiben
zu können.** Wären es dieselben Gegenstände, würde das eine Können für das
andere gutgeschrieben — der Leitner hätte einen Stand, den es nicht gibt,
und niemand sähe es, weil er einfach weiterrechnet.

Deshalb `bu:A` und `di:A`, zwei Ebenen, zwei Stände. Der Rauchtest weist
nach, dass sie sich nicht berühren; das Tor `schreiben` prüft, dass keine
Kennung in beiden Vorräten steht.

### Die Eigenschaft, die diese Ebene ausmacht, ist eine negative

Der Buchstabe steht **nirgends**. Nicht im Blatt, nicht in der Frage, nicht
in einer Beschriftung. Solche Eigenschaften verschwinden lautlos: man sieht
einem Bildschirm nicht an, dass er zuviel zeigt, wenn man nicht weiß, dass
er weniger zeigen sollte.

Geprüft wird sie deshalb so, wie Fiona sie erlebt — der gesuchte Buchstabe
wird aus der **Ansage** gelesen, nicht vom Bildschirm. Wer ihn vom
Bildschirm liest, kann anschließend nicht mehr behaupten, dass er dort
nicht steht. Zwei stehende Gegenproben zielen genau darauf: eine lässt die
Vorlage stehen, eine schreibt den Buchstaben in die Frage. Beide schlagen an.

### Drei Entscheidungen im Kleinen

- **Die Ansage nennt Buchstaben und Merkwort.** „Q" allein heißt gesprochen
  /kuː/, und ein Kind hört „Kuh". „Q wie Quelle" hängt den Laut an etwas auf
  — dasselbe Merkwort, das im Vorlauf unter dem Buchstaben steht.
- **„Noch mal hören" spricht immer**, auch wo ein Profil sonst nichts
  vorgelesen bekäme. Wer ausdrücklich darauf tippt, hat gebeten, und eine
  Bitte wird nicht vom Profil beantwortet.
- **Im Tadel wird der gesuchte Buchstabe nicht genannt.** *„Das sieht aus
  wie ein O. Versuch es noch einmal."* — was falsch gelesen wurde, ist eine
  Auskunft; den gesuchten nachzuliefern wäre die Lösung nach dem ersten
  Fehlversuch. Beim Nachfahren, wo er ohnehin dasteht, wird er weiter genannt.

### Und einer im Bild

Auf dem Diktat-Bildschirm stand das leere Blatt links und die Knöpfe rechts
am Rand — dazwischen bis zu 200 Punkte Leere, und der Bildschirm sah aus,
als fehle etwas. Feld und Werkzeug stehen jetzt als **Paar in der Mitte**.
Aufgefallen ist das an der Aufnahme, nicht an einer Zahl: `passt` war grün,
weil nichts überlief.

Das ist der Bildschirm, auf dem am wenigsten steht — und deshalb der, bei
dem das Wenige stimmen muss.

### Nachtrag: die Sackgasse, die aus dem Torlauf fiel

Einzeln gefahren war der neue Rauchtest-Abschnitt grün, im vollen Lauf
meldete er *„im Diktat wird kein Buchstabe angesagt"*. Die Ursache war
eine Kopplung zwischen zwei Abschnitten: `regler` schaltet den Ton ab und
legt das in der Ablage ab — und die gehört dem **Zusammenhang**, nicht der
Seite. Wer danach im selben Zusammenhang eine neue Seite aufmacht, erbt
„Ton aus".

Der Abschnitt bekommt jetzt seinen eigenen Zusammenhang. Aber das ist die
kleinere Hälfte des Befunds, und die größere gehört nicht in die Testerei:

> **Mit abgeschaltetem Ton hat das Diktat gar keine Aufgabe.**

Ein Kind, das den Ton einmal ausgeschaltet hat — der Knopf steht auf der
Profilwahl —, bekäme ein leeres Blatt und keine Auskunft, worauf es wartet.
Von einem kaputten Spiel ist das nicht zu unterscheiden.

Die App schaltet den Ton **nicht** eigenmächtig wieder an; das wäre eine
Entscheidung des Kindes, die man ihm nicht wegnimmt. Sie sagt stattdessen,
woran es liegt (*„Für diese Übung brauchst du den Ton."*), und derselbe
Knopf, der sonst „Noch mal hören" heißt, heißt dann „Ton einschalten".

Der Rauchtest prüft beides, und eine stehende Gegenprobe nimmt den Hinweis
weg. Aus derselben Runde kam noch eine kleine Schuld: der Diktat-Satz stand
nach dem Ton-Fix an zwei Stellen — und die erste Gegenprobe fiel prompt
darauf herein („Eingriff nicht angekommen", weil die zweite Abschrift
stehenblieb). Er steht jetzt einmal.

---

## Runde N4: Zahlen — und eine Messung, die sich selbst betrogen hat

Zehn Ziffern zum Nachfahren, zwanzig Zahlen zum Hören. Damit ist die letzte
der vier Anforderungen vom 30.08. gefahren.

### Der Aufbau ersetzt die Prüfung

„Vierzehn" ist zweimal etwas: die Zahl, die man hört, und die zwei Zeichen
1 und 4, die man schreibt. Der Bildschirm stellt deshalb **so viele Felder
hin, wie die Zahl Ziffern hat** — links die 1, rechts die 4. Damit ist
„beide Ziffern, in der richtigen Reihenfolge" keine Prüfung mehr, sondern
die Form des Bildschirms. Der Rauchtest weist trotzdem nach, dass
vertauscht nicht gilt: 51 statt 15 wird abgelehnt.

Der Vorrat sind **zehn** Vorlagen, nicht zwanzig — die Regel aus R4. Die
Zahlen sind Aufgaben darauf.

### Erkannt wird gegen die Ziffern, nicht gegen alle 36 Zeichen

Eine 0 und ein O sind dieselbe Form. Eine 1 und ein I auch. Gemessen:
gegen alle 36 Zeichen fallen die Ziffern von 92,0 auf 91,3 Prozent, und die
Ausfälle sind fast alle „unsicher" statt „falsch" — der Vorsprung vor dem
Zweiten fällt auf null, weil der Zweite dieselbe Form ist. Der Satz, gegen
den verglichen wird, ist deshalb eine Eigenschaft der Aufgabe.

### Die Messung, die den Preis nicht sehen konnte

Der Zug-Aufschlag (`STRAFE_ZUGZAHL`) bestraft, wenn jemand mehr oder
weniger Striche macht als die Vorlage. Die Tabelle sagte klar: ein
Aufschlag von 8 statt 5 ist in **jeder** Spalte besser — mehr richtig
erkannt, kein Gekritzel mehr angenommen.

Das war falsch, und der Fehler lag nicht in der Tabelle, sondern im
Vorrat: er verzerrte Lage, Größe, Drehung und Zittern — aber er **änderte
nie die Zahl der Züge**. Genau daran hängt der Aufschlag. Eine Messung, die
den Preis einer Sache nicht abbilden kann, empfiehlt sie immer.

Mit verbundenen und geteilten Zügen im Vorrat — ein Kind setzt den Finger
nicht immer ab — kostet der Aufschlag von 8 **neun Prozentpunkte**:

```
Strafe |  Buchstaben richtig  |  Gekritzel angenommen
     3 |        89,5 %        |   154/400
     5 |        89,6 %        |    11/400
     8 |        80,9 %        |     0/400
```

Die Fünf bleibt. Und im selben Zug wanderte der beste Punkt der beiden
Schwellen: von 11 / 1,6 auf **10 / 1,2** — zwei Punkte mehr richtig
erkannte Buchstaben (89,6 → 91,7 %) und kein angenommenes Gekritzel mehr,
in beiden Sätzen. Die alte Einstellung stammte aus dem blinden Vorrat.

Das Soll im Backlog ist entsprechend neu abgeleitet und nennt jetzt seinen
Vorrat mit.

### Drei Fehler dieser Runde

- **Der Absturz bei einstelligen Zahlen.** Eine Zahl hat keine eigenen
  Züge — sie besteht aus ihren Ziffern. Der erste Anlauf griff auf
  `ziel.zuege.length` zu; der Bildschirm stand da und nahm nichts an.
- **`#vorlage` war eine Kennung, jetzt ist es eine Klasse** — mit zwei
  Feldern kann es die Kennung nicht mehr geben. Drei Tore suchten weiter
  nach `#vorlage` und fanden nichts; der Durchgang meldete daraufhin
  „weder Vorlage noch Ansage".
- **Der Ton-aus-Test nahm den Zahlen die Ansage.** Derselbe Fehler wie eine
  Runde zuvor, eine Ebene tiefer: er schaltet den Ton ab und legt das in
  der Ablage ab. Ein Test, der etwas ABSCHALTET, gehört ans Ende seiner
  Reihe — jetzt steht er dort, mit dem Grund daneben.

Und einer, den nur der Blick fand: die Ziffern einer Zahl standen im
Forscherbuch vierzig Punkte auseinander — „1 0" statt „10". Eine Zahl ist
ein Wort, keine zwei Bilder.

Startbündel **202,1 von 400 KB**. `passt` sieht 21 Bildschirme je Größe.

---

## Runde N1: Stephan und Violeta

Aus einer Kachel „Eltern" werden zwei. Gleiche Aufgaben, gleiche Tiefe,
gleicher Ton — verschieden ist nur, wer gespielt hat. Und im Elternbereich
ein Bildschirm, der beides nebeneinanderstellt.

### Verglichen wird, was ohnehin gezählt wird

**Auf Anhieb richtig** und die Zeit. Keine erfundene Punktzahl — die wäre
`glatt` noch einmal, nur mit einem Faktor davor, und in diesem Verzeichnis
steht keine Zahl an zwei Stellen. Eine Aufgabe ist dabei ein Eintrag, der
sie *beendet* (`richtig` oder `gezeigt`); die Fehlversuche dazwischen
stehen als eigene Zeilen im Protokoll und dürfen nicht mitzählen, sonst
hätte der Ungeduldigere mehr „Aufgaben" als der Gründliche.

Gleichstand ist ein Ergebnis und wird als solcher angezeigt. Ihn zu einem
Sieger zu runden wäre die einzige Stelle, an der dieser Vergleich etwas
behaupten könnte, was nicht gemessen ist.

### Der Umbau lag woanders, als er aussah

Ein zweites Profil hinzuzufügen ist eine Zeile. Die Arbeit lag in den
Toren: **vier von ihnen lasen die Spalten der Backlog-Tabelle der Reihe
nach** — `['fiona','lea','eltern']`, fest hingeschrieben. Eine vierte
Spalte hätte jede Zeile um eins verschoben, und Violetas Ländertiefe,
Sitzungslänge und Ton wären als Stephans geprüft worden. Rot geworden wäre
nichts.

Die Kennungen kommen jetzt aus der **Kopfzeile** der Tabelle: das erste
Wort einer Spalte, klein geschrieben. Eine fünfte Spalte würde von selbst
mitgeprüft.

### Und die Lücke, die dabei sichtbar wurde

Fällt eine Spalte *weg*, prüft jedes Tor stillschweigend ein Profil
weniger — und **keines wird rot**, weil ihnen allen dasselbe Soll fehlt.
Das ist die gefährlichste Sorte Lücke: sie macht die Kette leiser, nicht
roter.

Der Rauchtest vergleicht deshalb die Zahl der Profile, die die App kennt,
mit der Zahl der Spalten in der Tabelle. Die zugehörige Gegenprobe nimmt
der Tabelle eine Spalte — und schlägt an.

### Der alte Stand geht nicht verloren

Er lag unter `eltern:<ebene>` und wäre nach der Umbenennung unerreichbar
gewesen: vorhanden, aber von nichts mehr gelesen — die unangenehmste Sorte
Datenverlust, weil nichts weg ist und trotzdem nichts wiederkommt. Er zieht
beim ersten Start zu **Stephan** um. Das Protokoll wird dagegen beim
**Lesen** umgeschrieben, nicht in der Ablage: ein Mitschnitt wird nicht
rückwirkend geändert.

Startbündel **204,6 von 400 KB**. Vier Profilkacheln passen auf 844 × 390
in eine Reihe; `passt` ist auf allen sieben Größen grün.

---

## Runde S1 und A3: was die Kinder jeden Tag sehen

Zwei alte Befunde, beide aus dem Audit, beide mit hohem Nutzen und kleinem
Aufwand — und beide an Stellen, an denen ein Kind jeden Tag vorbeikommt.

### S1: Die Sterne gehören der Sitzung

Dieselbe Sternform stand an zwei Orten und meinte zweierlei: im Kopf und auf
dem Endbildschirm die **Sitzung** (drei Sterne = fehlerfrei), auf der
Ebenenkachel den **Lebensfortschritt**. Ein Kind spielte fehlerfrei, sah
drei Sterne, tippte auf „Weiter" — und sah auf der Kachel einen.

Daneben lag S2, und die Aufnahme zeigte beide auf einmal:

```
Bundesländer   ★☆☆   9 Aufkleber
Asien          ★★☆   2 Aufkleber
```

Anteil neben Anzahl. Wer die Kacheln vergleicht — und Kinder vergleichen
sie —, liest daraus das Gegenteil dessen, was dasteht.

**Eine Entscheidung löst beides:** die Sterne gehören der Sitzung. Auf der
Kachel bleiben die Aufkleberzahl (mit anteilig gefülltem Zeichen) und der
zweiteilige Balken. Zwei Aussagen statt vier, und keine widerspricht einer
anderen.

Geprüft wird an der **Zahl**, die hineingeht, nicht an der Stelle, an der
gezeichnet wird: jeder Aufruf von `sterneFuer` bekommt `st.glatt`. Wer die
Sterne künftig woanders hinsetzen will, darf das — solange sie dasselbe
meinen. Der erste Anlauf dieser Prüfung wurde prompt rot, weil er die
Funktionsdefinition für einen Aufruf hielt.

### A3: Der Fehler wird benannt

*„Das ist Schleswig-Holstein. Thüringen liegt weiter unten."*

Zwei Auskünfte, und beide nur, wenn sie stimmen: der Name des Gebiets unter
dem Finger (den gibt es nur für Gebiete dieser Ebene — auf einer
Kontinentkarte liegt ringsum Umgebung ohne Namen) und die Richtung vom
Ablegepunkt zum Anker des gesuchten.

Gerechnet wird in **Bildschirmpunkten**, nicht in Kartenkoordinaten: der
Satz beschreibt, was das Kind sieht. Auf einer anders ausgeschnittenen
Karte wäre „oben" in Kartenkoordinaten etwas anderes als oben auf dem
Schirm.

Und wer **weniger als 40 Punkte** danebenliegt, bekommt keine Richtung. Er
hat nicht in die falsche Richtung gedacht, sondern den Finger nicht genau
genug gesetzt; „weiter oben" wäre dort falscher als nichts.

### Zwei Funde in den Prüfungen selbst

**Mein Ausdruck war zu eng.** Die volle Kette meldete „der Hinweis nennt
keine Richtung" — bei „Das ist Saarland. Sachsen liegt weiter rechts." Eine
waagerechte Richtung allein kam im Suchmuster gar nicht vor. Die App war
richtig, die Prüfung falsch.

**Und die Gegenprobe war so gut wie die Würfel des Leitners.** Der erste
Anlauf zog das am weitesten entfernte Bundesland — welche Achse dabei
herauskommt, hängt an der Aufgabe. Bei Thüringen war es senkrecht, bei
Saarland waagerecht. Die Gegenprobe, die oben und unten vertauscht, hätte
im zweiten Fall gar nicht anschlagen können. Jetzt wird **je Achse** das
Gebiet mit dem größten Abstand in dieser Achse genommen, und es wird
zweimal danebengezogen — einmal senkrecht, einmal waagerecht.

Geprüft wird dabei das **Vorzeichen** jeder genannten Richtung, nicht das
Wort: die Schwelle, ab der eine Achse genannt wird, gehört der App. Wer sie
im Tor nachrechnete, prüfte die Rechnung gegen sich selbst.

Startbündel **206,5 von 400 KB**. 137 Gegenproben, alle mit Nachweis.

---

## F13 · Der Sprachmodus hatte keinen Ausgang

**Der Befund kam vom Gerät, nicht von einem Tor.** Sprachmodus an,
Mikrofon angetippt, „ich höre", hineingesprochen — und dann nichts mehr:
kein Beenden, keine Auswertung.

Nachgestellt: es waren **drei** Fehler auf einmal. Es gab nirgends ein
`stop()`, also konnte niemand „fertig" sagen — ein zweiter Tipp baute
einen zweiten Erkenner neben den ersten, und auf iOS wirft das. Es gab
kein `onend`, also blieb „… ich höre" stehen, wenn die Erkennung von
selbst endete — bei Stille ist das auf iOS der Normalfall. Und es gab
keine Frist.

Der vierte war nur zu **sehen**: der Ring am Mikrofon atmete immer, auch
wenn nichts lief. Die App sah aus, als hörte sie zu, während sie es nicht
tat — und als hörte sie weiter zu, nachdem sie aufgehört hatte. Ein
Zustand, den man nicht erschließen kann, wenn man nur den Code liest.

Der Knopf ist jetzt ein **Schalter**, und jeder Ausgang — Ergebnis,
Fehler, Ende, Frist — führt durch ein einziges `aufhoeren()`. Genommen
wird `stop()`, nicht `abort()`: `stop()` liefert das bis dahin
Verstandene, `abort()` wirft es weg. Wer mitten im Wort abbricht, soll
nicht auch noch das Wort verlieren.

### Ein Weg, den kein Tor je angefasst hat

Der Sprachweg war ungeprüft, weil es im Prüfbrowser keine
Spracherkennung gibt. Das ist kein Grund, es zu lassen — es ist ein
Grund, sie **nachzubauen**. `neueSeite` installiert jetzt ein
`SpeechRecognition`, das Starts und Stopps zählt und beim zweiten Start
wirft, so wie iOS es tut; `window.__sprich(text, final)` spricht hinein,
`window.__endeVonSelbst()` lässt die Erkennung von selbst enden.

Damit prüft der Abschnitt `sprechen` vier Dinge: Antippen beginnt und man
sieht es · **ein zweiter Tipp beendet es** — der gemeldete Fehler · ein
Ende ohne Ergebnis hinterlässt keine Sackgasse · ein gesprochener Name
wird gewertet. Zwei stehende Gegenproben halten die beiden ersten Fehler
fest; beide schlagen mit der Meldung an, auf die es ankommt.

Was der Nachbau **nicht** beweist: dass das Mikrofon auf dem iPhone im
Querformat auslöst. Er prüft die Logik, nicht das Gerät. M4r bleibt
offen, und drei Ebenen hängen daran.

Startbündel **208,2 von 400 KB** (der festgehaltene Stand lag noch bei
197,1 und war seit der Schreibwelt nicht nachgezogen). 139 Gegenproben,
alle mit Nachweis.

---

## F14 · Ein Satz ist kein Wort

Der Sprachmodus ließ sich beenden (F13) — und verstand trotzdem nichts.
Wieder kam der Befund vom Gerät, nicht von einem Tor. Und wieder waren es
mehrere Fehler auf einmal.

**Der erste ist der lehrreichste.** Ein Diktiergerät liefert „Ich glaube das
ist Asien", nicht „Asien". Der Abgleich fiel darüber — an seiner
**Längenstrafe**, also an genau der Vorrichtung, die ihn davor bewahrt,
„euro" für Europa und „bayer" für Bayern zu nehmen. Sie war nicht der
Fehler; der Fehler war, ihr eine ganze Äußerung vorzuwerfen. Jetzt bekommt
jede zusammenhängende Wortgruppe ihre Chance, und die Strafe bleibt
Wächter: „amerika" allein wird gegen „nordamerika" weiterhin abgelehnt.

Vorher stand da eine **Füllwortliste**. Sie zählte auf, was weggelassen
werden darf — und war damit immer unvollständig, weil niemand alle
Redewendungen eines Kindes kennt. Gemessen fielen 4 von 18
wirklichkeitsnahen Äußerungen durch: „Ich glaube das ist Asien", „Afrika,
glaube ich", „Ähm Europa", „äh, Afrika".

**Der zweite ist der peinlichste.** `maxAlternatives = 3` stand seit dem
ersten Tag da, und drei Zeilen weiter wurde nur die erste Lesart gelesen.
Die Erkennung liefert ihre eigene Unsicherheit frei Haus. Wir müssen gar
nicht raten, welche Lesart stimmt — die Antwortmenge ist geschlossen, wir
können alle fragen.

**Der dritte hat diese Fehlersuche fast verhindert.** „Das habe ich nicht
verstanden" sagt niemandem, ob das Mikrofon nichts gehört hat oder der
Abgleich nichts zuordnen konnte. Jetzt steht da, was angekommen ist.

**Der vierte ist der, der wehtut.** Nicht verstanden zählte als
Fehlversuch. Nach drei Verständnisfehlern löste die App die Aufgabe auf —
das Kind hatte kein einziges Mal falsch geraten. „Ich habe dich nicht
gehört" ist eine Aussage über mich, nicht über das Kind.

### Der Rückschritt, den der Korpus in derselben Minute gemeldet hat

Ausschnitte sind gefährlich: sie werfen Wörter weg. Beim ersten Lauf mit
der neuen Rechnung stand im Bericht:

```
✗ süd sudan → SDN
```

Ein echtes Nachbarland, das es im Spiel nicht gibt, glatt als **Sudan**
gewertet. Ein Fenster darf deshalb kein **Bestimmungswort** abschneiden,
das direkt daneben steht — nord, süd, ost, west, neu, alt. Das ist die
Umkehrung der alten Liste, und daran liegt es: die zählte auf, was
weggelassen werden darf (offen, unvollständig), diese zählt auf, was nicht
weggelassen werden darf (klein, fest, aus der Erdkunde selbst).

### Und warum das Tor 100 % meldete, während nichts ging

Es maß `abgleich` mit nackten Wörtern. Die App rechnet `hoerAbgleich` mit
ganzen Äußerungen. Ein Tor, das die Stufe **darunter** misst, bezeugt eine
Rechnung, die niemand fährt — die Zahl trägt ihre Messstelle mit
(Regel 5), wieder einmal, und diesmal hat es
einen Fehler gedeckt, den das Zielgerät in dreißig Sekunden fand.

Der Korpus kennt jetzt beide Formen: **121 Treffer, 91 Nichttreffer**, in
beiden Hälften ganze Sätze — auch solche, in denen ein *falscher* Name
steht („ich glaube das ist Afrika", gefragt war Asien). Gemessen:
**100 % Treffer, 0 % falsch-positiv.**

### Zwei Funde in meinen eigenen Prüfungen

Beide kamen von den Gegenproben, nicht von mir.

**Der geprüfte Satz war der falsche.** Der Rauchtest sprach „Das ist X"
hinein — genau die Wendung, die in der alten Füllwortliste stand und auch
vorher schon durchkam. Die Gegenprobe stellte den alten Zustand her, und
der Rauchtest blieb grün. Jetzt heißt der Satz „Ich glaube das ist X": die
Liste streicht genau ein Füllwort, danach steht immer noch „das ist X" da.

**Die Prüfung sah ihren eigenen Gegenstand nicht.** „Ist die Aufgabe noch
offen?" suchte nach der Marke des *Treffers*. Aufgelöst wird aber mit
`.loesung`, und die stand da unverändert — die Prüfung konnte nicht
anschlagen, auch wenn der Fehler drin war.

144 Gegenproben, alle mit Nachweis.

---

## F15 · Vier Hebel für die Sprachqualität

Diesmal kein Fehlerbericht, sondern ein Bauchgefühl — „funktioniert
halbwegs, aber noch nicht ganz" — und eine klare Forderung: beim Sprechen
muss der Lautsprecher aus sein.

**Die Forderung war die richtige, und sie war größer als sie klingt.** Das
Mikrofon hörte den eigenen Lautsprecher mit: die Aufgabe wird angesagt, das
Kind tippt währenddessen auf das Mikrofon, und die Erkennung bekommt „Wie
heißt dieser Kontinent" ins Ohr statt Fionas Antwort. Darin findet niemand
einen Kontinent — und die App sagt dann „sag es noch einmal", obwohl das
Kind alles richtig gemacht hat.

Umgesetzt als **ein Riegel an einer Stelle**, nicht als Aufräumen an
dreizehn Aufrufstellen. Jede Stimme läuft durch `vorlesen`, jeder Ton durch
`klangZu`; wer eine vierzehnte Stelle dazubaut, ist automatisch abgedeckt.
Das ist dieselbe Überlegung wie bei der Regel, dass im Menü keine
Spielbedienung sichtbar sein darf: eine Ableitung, kein Schalter, den man
vergessen kann.

### Was ich beim Nachsehen noch gefunden habe

**Das Gerät schneidet eine Äußerung an der Atempause** — `ev.results` hat
dann mehrere Abschnitte, und gelesen wurde nur der letzte. Wer „Ich glaube |
das ist Asien" sagte, verlor die eine Hälfte; wer „Asien | glaube ich"
sagte, die andere. Welche, hing an der Atempause.

**Zwischenergebnisse wurden weggeworfen.** Endet die Erkennung ohne
Endergebnis — bei Stille auf dem Telefon der Normalfall —, war alles weg,
obwohl das letzte Zwischenergebnis oft schon der volle Satz ist. Das Kind
wurde gebeten, noch einmal zu sagen, was es gerade gesagt hatte.

### Der größte Hebel stand seit Monaten als Kommentar da

Der Abgleich kennt drei Ausgänge, und über den mittleren steht in seinem
eigenen Quelltext: er „verwandelt eine Erkennungsschwäche in eine
Bestätigungsfrage — und die kann ein Kind beantworten".

**Konnte es aber nicht.** „Meintest du Hessen?" stand auf dem Schirm, und im
selben Augenblick war die Aufgabe vorbei und als nicht gekonnt verbucht. Die
Frage war rhetorisch, und sie ging zulasten des Kindes.

Gemessen am Korpus: **3 von 121 richtigen Äußerungen** enden so — „hessn",
„hesen", „chiena". Das Kind hat den Namen gesagt. Unsicher war das Gerät.
Bezahlt hat das Kind.

Jetzt stehen zwei Knöpfe da. **Ja** wertet, was bestätigt wurde; **Nein**
kostet keinen Versuch, denn der Irrtum lag beim Gerät. Und „Ja" auf einen
*fremden* Namen zählt weiterhin falsch — sonst wäre die Rückfrage ein
Freifahrtschein.

### Drei Messungen, die zu einem Nein geführt haben

**Die Annahmegrenze lockern**, damit mehr Äußerungen als beantwortbare
Rückfrage statt als „nicht verstanden" enden: die Trefferquote liegt schon
bei 100 %. Es wäre nichts zu holen — nur mehr falsche Vorschläge.

**Nach „nicht verstanden" automatisch weiterhören**: das war F13. Ein
Zustand, der sich selbst neu startet, ist wieder einer, aus dem man nicht
herauskommt.

**`SpeechGrammarList`** — der Erkennung die sechs möglichen Wörter nennen —
wäre der größte Hebel überhaupt. Safari auf iOS ignoriert sie. Eine Zeile,
die nichts tut, gehört nicht in den Quelltext, und schon gar nicht mit dem
Kommentar „hilft der Erkennung".

### Und ein Fund in meiner eigenen Prüfung

Der Rauchtest sprach den Namen der *vorigen* Aufgabe in die neue, weil eine
neue Prüfung dazwischen eine Aufgabe verbraucht. Er meldete „nichts
gewertet", obwohl die App richtig lag. Eine Probe, die ihre eigene
Reihenfolge nicht kennt, misst die falsche Aufgabe.

Der Abschnitt `sprechen` prüft jetzt sieben Dinge; vier neue Gegenproben
halten die vier Eingriffe fest. 148 Gegenproben, alle mit Nachweis.

---

## B3 · Die umgekehrte Frage — und S3, wo der Backlog sich verschätzt hatte

### „Wo liegt Bayern?"

Dieselbe Karte, andersherum gelesen. Bis hierher stand das gesuchte Gebiet
hervorgehoben da und die Frage war „wie heißt das?". Jetzt steht bei jeder
dritten Aufgabe der Name in der Frage und die Karte ist **leer** — kein
Puls, kein Zeiger, keine Farbe.

Das ist die billigste neue Aufgabenform (sie braucht keine neuen Daten) und
die mit dem größten Zugewinn: einen Namen wiedererkennen und ein Gebiet
**finden** sind zwei verschiedene Fähigkeiten, und geübt wurde bisher nur
die erste.

Geantwortet wird mit einem Tipp auf die Karte — mit **demselben**
Treffertest, der auch ein abgelegtes Etikett auffängt. Zwei Rechnungen für
dieselbe Frage wären zwei Stellen, an denen sie auseinanderlaufen können.
Und der Hinweis bei einem Fehlgriff ist der aus A3, der hier sogar besser
passt als dort, wo er entstanden ist: beim Ziehen kennt das Kind den Namen
schon, hier sucht es ihn.

```
„Wo liegt Berlin?" ohne Markierung
daneben getippt → „Das ist Saarland. Berlin liegt weiter oben rechts."
```

### Zwei eigene Fehler, beide vom Hinsehen gefunden

**Die Frage beantwortete sich selbst.** Das gesuchte Gebiet trug weiterhin
die Klasse `ziel` — und die bekommt in der Stilvorlage die Akzentfarbe. Auf
dem ersten Bild war Berlin angemalt, während danebenstand „Wo liegt
Berlin?". Kein Tor hätte das je gemeldet: sie messen Größen und Zustände,
nicht den Sinn. Dasselbe galt für den Haken auf schon gekonnten Gebieten —
fehlte er ausgerechnet beim gesuchten, wäre **das** der Hinweis gewesen.

**Und „Lieber ziehen" stand daneben**, ohne etwas zu schalten zu haben.

Dazu ein dritter, den die Sprache selbst gefunden hat: der Schalter stand
erst weiter unten bei den Antwortwegen — dort, wo er inhaltlich hingehört.
Die Flächen werden aber sechzig Zeilen früher gerechnet, und `const` gilt
erst ab seiner Zeile. Der Bildschirm baute sich gar nicht mehr, und der
Rauchtest meldete nur „Karte nicht da".

### S3 · Der Backlog hatte sich um mehr als zwei Punkte verschätzt

Dort stand „die 26 Karten des Abc sind 42 pt hoch, die Zielmarke ist 44".
Nachgemessen war es kein Feinschliff: das Gitter legte **acht** Spalten an
statt neun, die Karten fielen in **vier** Reihen statt drei, und jede war
**77 × 42** statt **88 × 62**.

Die Ursache ist der alte Bekannte aus Regel 2 — eine **absolute** Grenze
neben einer **gerechneten**: `max(72px, 100 % / 9 − Abstand)`. Auf dem
Zielgerät ergibt die Rechnung 68, die 72 gewinnen, und neun Spalten zu 72
brauchen 680 Punkte, wo 644 sind. Der Notnagel überstimmte den Wunsch.

Und er stand **zweimal** — im Grundsatz und im kurzen Querformat. Gepflegt
wurde die obere Fassung, gegolten hat auf dem iPhone die untere. Regel 6,
zum wiederholten Mal. Jetzt ist es eine Marke an einer Stelle.

**Warum es überhaupt so lange lag:** `passt` führte zu kleine Flächen als
HINWEIS, nicht als Fehler — und das aus gutem Grund, denn der Zurück-Pfeil
ist absichtlich schmal. Ein **Aufkleber** ist es nie: er ist eine Karte mit
Bild und Wort, und wenn er unter das Maß fällt, ist ein Gitter
zusammengerutscht. Für ihn ist die 44-Punkt-Grenze jetzt ein Fehler.

Ein Hinweis, den niemand liest, ist dasselbe wie keiner.

Sieben neue Gegenproben (drei für B3, eine für S3, dazu die drei aus F15).

---

## B2 · Der Test ohne Hilfen

Das Spiel konnte bis hierher nur eines: helfen. Vier Möglichkeiten statt
sechzehn, ein Zeiger auf die gesuchte Fläche, „Weiß ich nicht", und nach
drei Fehlversuchen die Antwort. Alles richtig — beim Üben. Nur konnte
niemand zeigen, dass er es **ohne** kann.

Der Test lässt alles davon weg. Er ist damit die erste Runde, in der eine
falsche Antwort etwas kostet — und die erste, in der ein richtige etwas
beweist.

### Sechs Entscheidungen

**Offen erst, wenn die Ebene ganz gesammelt ist.** Vorher wäre es kein
„Test am Ende", sondern eine zweite Art zu üben.

**Nur wer liest.** Das ist die einzige Entscheidung, bei der ich gegen den
ersten Impuls entschieden habe: Fiona *könnte* den Test bekommen, die Frage
wird ihr ja vorgelesen. Aber ihre Auswahl aus vier Möglichkeiten ist ihr
**Eingabeweg**, nicht ihre Hilfe. Nimmt man sie weg, bleibt für sie nichts
übrig, womit sie antworten könnte. Ein Test, den ein Kind nicht bestehen
*kann*, ist kein Test, sondern eine Sperre.

**Alle Gegenstände, einmal, gemischt — nicht der Leitner.** Der wählt nach
Fälligkeit. Ein Test, der nur die wackeligen Gegenstände abfragt, misst
nicht, was jemand kann; er misst, was der Leitner gerade für wackelig hält.

**Ein Versuch je Aufgabe.** „Keine Lösung nach drei Fehlern" allein wäre zu
wenig gedacht gewesen: ohne Auflösung könnte man beliebig oft raten, und
bei vier Möglichkeiten hat man nach dreimal Raten recht.

**Bestanden ab vier Fünfteln.** Nicht alles richtig — bei sechzehn
Bundesländern hinge der Pokal sonst an einem einzigen Verrutscher, und der
Test würde zu einer Sache, die man wieder und wieder anfängt. Nicht die
Hälfte — dann steht der Pokal für etwas, das man auch raten kann.

**Der Pokal liegt bei den Einstellungen, nicht im Fortschritt.** „Von
vorne" löscht eine Ebene. Einen bestandenen Test löscht es nicht: was man
gezeigt hat, hat man gezeigt.

### Was der Test nicht tut

Er macht nichts vor. Ein Fehlversuch beendet die Aufgabe, und die Antwort
bleibt weg — was hier fehlt, gehört in die nächste Übungsrunde, nicht in
die Prüfung. Der Leitner erfährt es trotzdem; sonst wäre ein Test eine
Runde, die den Lernstand nicht anfasst, und ausgerechnet die Gegenstände,
die durchfallen, kämen nicht wieder.

### Ein Platzhalter, der sich als Prüfung ausgab

Beim Schreiben des Rauchtests stand da eine Weile:

```js
const beiFiona = await p.evaluate(() => { ... return !!D; });
void beiFiona;   // „die eigentliche Pruefung steht unten"
```

Sie stand nicht unten. Der Abschnitt wäre grün gewesen und hätte für
„Fiona bekommt keinen Test" nichts bezeugt. Jetzt wechselt er wirklich das
Profil — und füllt vorher **auch Fionas Ebene**, sonst bewiese das Fehlen
des Knopfes nur, dass sie noch nichts gesammelt hat.

### Und beim Hinsehen

Der Pokal war tintenfarben wie ein Bedienzeichen und wurde auch so gelesen.
Jetzt ist er golden mit Tintenkontur — dieselbe Sprache wie die Sterne.
Und er stand absolut positioniert über der Kachel, mitten auf der Zahl der
Aufkleber; jetzt steht er daneben, wo er hingehört: beide sagen dasselbe,
nämlich was du hier hast.

157 Gegenproben, alle mit Nachweis.

---

## G12 · Die Kacheln gehören jetzt jemandem

Bis hierher unterschieden sich die vier Profilkacheln durch eine Farbe und
einen Buchstaben. Für Lea, Stephan und Violeta reicht das — sie lesen
ihren Namen. Für Fiona nicht: sie liest nicht, der Buchstabe ist ihr ein
Zeichen wie jedes andere, und übrig blieb der Farbfleck.

Gewünscht waren Farben — Fiona türkis, Lea hellgrün, Stephan blau. Das
allein hätte die Sache verschlechtert: Türkis und Hellgrün liegen
45 Grad auseinander, vorher waren es Pink und Hellblau mit 100. Deshalb
kam der Streu dazu, und er ist nicht Zierat, sondern das, was den
Unterschied jetzt trägt: eine Kachel voller Meerestiere und eine voller
Totenköpfe verwechselt niemand, auch nicht mit sechs.

### Was aus der Palette kam und was neu ist

Die Farben sind **getauscht**, nicht gemischt. Die sieben Flächenfarben
sind auf gleiche Helligkeit geeicht — das ist die Bedingung dafür, dass
derselbe dunkle Textton auf allen sieben lesbar ist. Eine achte Farbe
daneben wäre die eine, auf der der Name nicht mehr trägt.

Neu sind nur die Streufarben, und die dürfen leuchten, weil auf ihnen
kein Text steht: Rot, Blau, Gelb, Leuchtgelb, Leuchtgrün, Pink, Orange,
Lila. Dazu die drei für den Totenkopf — Knochenweiß, ein grüner Umriss,
und zwei Marken für den Augenverlauf. „Schillern" ist kein Farbwert,
sondern ein Übergang; die Augen tragen deshalb einen Verlauf von Blau
nach dunklem Grün und einen weißen Lichtpunkt.

### Drei Motive waren keine Motive

Der erste Entwurf war fertig, grün und falsch. Auf der Aufnahme war zu
sehen, was kein Tor gemeldet hatte — kein Tor ersetzt den Blick (Regel 4):

- Die **Schildkröte** war ein Karo. Die Flossen lagen unter dem Panzer,
  und ein Gitter darauf machte aus dem Rest ein Muster. Jetzt stehen alle
  vier Flossen und der Kopf deutlich über den Panzerrand hinaus, und der
  Panzer trägt einen Ring statt eines Gitters.
- Die **Muschel** war ein Heißluftballon — falsch herum, das Schloss
  obenauf. Eine Muschel hängt am Schloss: unten schmal, nach oben
  auffächernd, obere Kante gewellt.
- Das **Seepferdchen** war die Ziffer Drei. Hals, Schnauze und
  Ringelschwanz sind bei 21 Punkten kein Tier mehr. Es ist jetzt ein Wal.

Und drei weitere Motive lagen auf dem Namen. Sie sind umgezogen; die
kleine graue Zeile darunter darf überdeckt werden, das große fette Wort
nicht.

### Das Tor, von dem ich dachte, es sehe nichts

In den Quelltext hatte ich geschrieben: „Der Streu liegt unter Name und
Zeile, und **kein Tor** sieht das — `lesbarkeit` sucht den Grund im
Elternbaum, und der Streu ist ein Geschwister." Das war falsch, und die
Kette hat es sofort gezeigt: `lesbarkeit` sucht seit R2 ausdrücklich nach
absolut liegenden **Geschwistern** hinter dem Text — genau deswegen, wegen
des Wasserzeichens.

Es hat den Streu gefunden und **sechs** Texte rot gemeldet, darunter „6
Jahre · ziehen und sprechen" mit **1,16:1**. Auf jeder Aufnahme ist die
Zeile einwandfrei zu lesen.

Der Grund war das Modell, nicht die Messung. Das Tor nimmt den **Kasten**
des Geschwisters in dessen Farbe — richtig für ein Wasserzeichen, das
seinen Kasten füllt. Der Streu ist das Gegenteil: eine fast leere Schicht
mit einem Dutzend kleiner Motive, jedes mit seiner eigenen Farbe am `<i>`.
Für die Schicht selbst gibt es weder Hintergrund noch gemalte Farbe, und
`cs.color` lieferte dort die **geerbte Tinte** — eine dunkle Fläche, die
nirgends auf dem Bild steht.

Das Tor schaut jetzt in die Kinder einer solchen Schicht hinein, wenn es
welche gibt: jedes mit eigenem Kasten, eigener Farbe, eigener Deckung.
Gibt es keine, bleibt alles wie zuvor — und die Gegenprobe zum
Wasserzeichen schlägt weiter an. Nachgemessen, beide.

Danach blieb ein **echter** Befund stehen: Fionas Zeile mit 4,46:1 statt
4,5. Repariert ist die Ursache, nicht das Symptom — nicht der Streu wird
blasser, die Leuchtfarben waren ausdrücklich gewünscht, sondern der Text
auf dem unruhig gewordenen Grund dunkler. Auf der Aufnahme sieht man den
Unterschied.

### Zwei weitere Prüfungen, die nichts bewiesen

Die interessanteste Stelle der Runde. Der Rauchtest sollte belegen, dass
die Kachel überall antippbar bleibt: ein Tipp mitten auf die große
Muschel muss ins Spiel führen, sonst fängt der Streu den Finger. Die
Gegenprobe schaltete `pointer-events:auto` — und der Rauchtest blieb
grün.

Zu Recht. Der Streu liegt **im** Knopf, und ein Tipp auf ein Kind eines
Knopfes löst den Knopf aus. Die Prüfung konnte gar nicht durchfallen.
`pointer-events:none` bleibt stehen, es hält die Motive aus der
Treffersuche heraus — aber die Bedienbarkeit trägt es nicht, und
behaupten durfte es das nicht mehr (Regel 1).

Der Ersatz war ebenfalls blind: Fionas Kachelhöhe gegen Stephans, für den
Fall, dass `.streu` aus der `:not()`-Liste fällt. Die vier Kacheln stehen
in einem **Raster**, und ein Raster gleicht die Höhen einer Reihe an — die
Zahl war mit und ohne Fehler dieselbe. Erst der dritte Anlauf misst, was
wirklich passiert: der Streukasten fällt auf 0 × 0 zusammen, weil die
Motive selbst absolut liegen, und nimmt sie mit. Die große Muschel saß
24 Punkte **über** dem oberen Rand.

Zweimal hintereinander hat also die Gegenprobe nicht das Tor entlarvt,
sondern die Prüfung. Genau dafür ist sie da.

### Und was es kostet

Das Startbündel wächst um **5,8 KB gzip** (170,0 statt 164,2 KB für die
Seite). Beim Nachmessen kam ein zweiter Befund heraus: der festgehaltene
Stand lag bei 208,2 KB, gemessen wurden 223,9 — von den 15,7 KB stammen
**9,9 aus B2**. Die Ratsche schlägt erst über 5 % an und hält den Stand
nur, wenn jemand „ja, Absicht" sagt; B2 lag mit +4,75 % darunter und hat
nichts nachgehalten. Die Frage landete damit bei der falschen Runde. Steht
als **P5** im Rückstandsverzeichnis.

166 Gegenproben, alle mit Nachweis.

---

## D2 · Ein Abzeichen ist ein Satz

Bis hierher konnte die App zählen. Sterne je Sitzung, Aufkleber je
Gegenstand, seit B2 ein Pokal je bestandenem Test — drei Zählwerke, und
keines davon sagt etwas darüber, **was ein Kind kann**. „Du hast 47
Aufkleber" ist eine Zahl. „Du kennst die drei Stadtstaaten" ist ein Satz,
den Lea am Abendbrottisch sagen kann.

### Was aus den Vorbildern kam

Drei, und jedes hat genau eine Sache beigetragen. **Duolingo** hängt eine
nächste Sprosse an eine endlose Leiter — davon bleibt der sichtbare
nächste Schritt, denn ein Abzeichen, das erst beim Erreichen erscheint,
ist bis dahin unsichtbar. **Khan Academy** macht den Namen der Fähigkeit
zum Abzeichen — davon bleibt: der Text ist die Belohnung, das Bild nur die
Marke dafür. Das **Panini-Album** teilt sich in benannte Gruppen, und
„vollständig" gilt je Gruppe — davon bleibt, dass die Menge einen Namen
braucht, den ein Kind kennt, und klein genug sein muss, um sie zu Ende zu
bringen.

### Die Menge kommt aus den Daten, nicht aus einer Liste

Das ist der Punkt, an dem so etwas veraltet. Eine Tafel mit Kennungen
(„Berlin, Hamburg, Bremen") stimmt genau so lange, bis jemand die Daten
anfasst. Also steht dort eine **Regel**: `x.stadtstaat`. Die fünf
Reihenabzeichen entstehen aus **einem** Eintrag über `rechenart` und `a`.
Die Buchstaben des eigenen Namens kommen aus dem Profilnamen — für Fiona
F I O N A, für Lea L E A, und für ein drittes Kind ohne eine Zeile Code.

Ausnahme sind die neun Nachbarn Deutschlands. Nachbarschaft ist
Weltwissen und steht in keinem unserer Datensätze. Der Eintrag steht
deshalb von Hand da — und das Tor prüft, dass jede der neun Kennungen in
den Europadaten wirklich vorkommt. Ein Abzeichen mit einer leeren Menge
wäre für immer unerreichbar, und das fiele niemandem auf.

### Was ich absichtlich nicht gebaut habe

„Zehn Tage hintereinander" steht im ANTON-Abgleich als Beispiel, und das
Protokoll trägt die Tage — es wären zwanzig Zeilen. Es steht trotzdem
nicht da: **A4** ist mit dem ausdrücklichen Zusatz „kein Streak-Zwang"
aufgeschrieben, und ein Abzeichen für zehn Tage am Stück ist der stärkste
Streak-Zwang, den es gibt. Es bestraft einen Krankheitstag. Das Prinzip,
um das es geht — Abzeichen, die etwas über das Kind sagen —, wird von den
Mengen besser bedient als von einem Kalender.

### Drei Fehler, und keinen hat ein Tor gefunden

**Ein Abzeichen stand ohne Bild da.** Die Tafel wollte `deutschland`, die
Bildtafel kennt `karte`. Der Satz stand da, die Fläche daneben war leer.
Gesehen auf der ersten Aufnahme. Daraus wurde das achte Tor `abzeichen`,
das die drei stillen Ausfälle prüft: eine Menge, die nichts auswählt (das
Abzeichen erscheint nie), eine, die alles auswählt (es steht beim ersten
Aufkleber schon da und sagt nichts), und ein Bild, das es nicht gibt.

**Das Abzeichen aus dem Abgleich kann niemand bekommen.** „Du kennst alle
Nachbarn von Deutschland" ist der Satz, den der ANTON-Abgleich als
Beispiel nennt, und er war der erste Eintrag der Tafel. Er ist wieder
raus.

Die App liefert **zwölf** europäische Länder. Die gebackene Geometrie hat
einundfünfzig Umrisse, aber ins Spiel kommt nur, was in `erdkunde.js`
einen Rang hat — Geometrie ist kein Vorrat. Von den neun Nachbarn
Deutschlands sind vier dabei: Frankreich, Belgien, Polen, die
Niederlande. **Dänemark, Luxemburg, die Schweiz, Österreich und
Tschechien kommen im Spiel gar nicht vor.** Das Abzeichen wäre für jedes
Profil ein Ziel gewesen, das ewig offen steht.

Das ist genau die Verfallsart, gegen die ich in derselben Runde ein Tor
geschrieben habe — und es hat sie nicht gefunden, weil es gegen
`LAENDER_EUROPA_FEIN` maß statt gegen das, was gebaut wird. Regel 5,
wörtlich: die Zahl und ihre Messstelle gehören zusammen. Gefunden hat es
die **Gegenprobe**: sie schlug nicht an, dreimal hintereinander nicht,
und jedes Mal hatte sie recht.

**Und meine Begründung war zweimal falsch.** Ich habe „die Menge kommt
aus dem vollen Vorrat" zuerst damit begründet, ein Abzeichen ließe sich
sonst *verlieren*, weil Fionas Kontinentrunde wächst — die Gegenprobe
schlug nicht an, und richtig: die Runde wächst genau dann, wenn die Menge
voll ist, und verlieren kann man ohnehin nichts, weil `istGesammelt` den
Höchststand liest. Dann habe ich sie damit begründet, sonst stimme der
*Satz* bei den Nachbarn nicht — auch das fiel weg, mit dem Abzeichen.

Übrig blieb ein dritter Grund, und der ist jetzt belegt: die **Zahl**
neben einem offenen Abzeichen muss die ganze Menge zählen. Fiona mit drei
von vier Kontinenten ihrer ersten Runde liest „Dir fehlen noch 3" — nicht
„noch eins", was ihr Vorrat sagen würde, obwohl es sechs Kontinente sind.
Mit dem Nachbarn-Abzeichen ist auch die Regel „nicht anbieten, was das
Kind nicht erreichen kann" weggefallen: sie hatte keinen Fall mehr, und
eine Regel ohne Fall prüft niemand.

**Und `loese()` zog auf den Anker.** Der Rauchtest zieht das Etikett auf
den Anker des Ziels; das ist die Stelle, an der die Beschriftung hängt.
Bei Berlin — 19 Punkte Trefferradius, ringsum Brandenburg — landet man
damit auf dem Nachbarn. Regel 12, wörtlich: ein Raster ist nur so fein wie
sein kleinstes Ziel. Der `durchgang` hatte die bessere Suche längst,
eingebaut in seine eigene Auswertung; sie steht jetzt einmal als
`zielPunkt` in `chromium.mjs` und wird von beiden benutzt — Trefferkreis,
Anker, Raster, Kastenmitte, in dieser Reihenfolge. Der erste Versuch ließ
den Anker weg und machte den Abschnitt `spielen` rot: das Spiel
entscheidet nach dem **Trefferkreis**, nicht nach dem Umriss, und ein
Punkt weit außen auf einem großen Land liegt schon im Kreis des Nachbarn.

174 Gegenproben, alle mit Nachweis.

---

## F16 · Brandenburgs Anker lag in Berlin

Diese Runde war als Abschluss von D2 gedacht: Kette fahren, einchecken,
liefern. Die Kette meldete zwei Fehler, und der zweite war keiner von D2.

### Was die Kette sagte

```
✗ forscherbuch: das Buch rollt schon bei 5 Karten (340 Punkte Inhalt,
                322 sichtbar) — die Vorschau steht halb unter dem Rand
✗ abzeichen:    page.waitForFunction: Timeout 4000ms exceeded.
```

Der erste Satz sagt, was los ist. Der zweite sagt gar nichts — eine
Zeitüberschreitung ohne Ort. Und der Abschnitt lief **allein aufgerufen
grün**, zweimal; nur in der vollen Kette fiel er um. Das riecht nach
Reihenfolge oder Zufall, und beides führt erfahrungsgemäß zu einer
Vermutung statt zu einem Befund.

Also habe ich `loese()` einen Satz sagen lassen, bevor es aufgibt — was
steht auf dem Schirm, welches Gebiet war gemeint, wo wurde losgelassen —
und die volle Kette noch einmal gefahren. Dreizehn Minuten für einen Satz:

```
Ziel: Brandenburg    „Das ist Berlin. Brandenburg ist ganz nah —
                      schau noch mal genau hin."
```

### Die Ursache, in drei Schritten rückwärts

**Am Bildschirm.** Gemessen am gebauten `dist/`, iPhone quer 844 × 390,
Ebene Bundesländer: Brandenburgs Anker liegt **1,8 Bildpunkte** neben dem
Mittelpunkt von Berlins Trefferkreis, und der hat **10 Bildpunkte
Radius**. Wer auf Brandenburgs Anker zeigt, zeigt auf Berlin.

**In den Daten.** Von sechzehn Bundesländern hat genau eines seinen Anker
nicht im eigenen Gebiet: `[804.7, 446.1]` — mitten in Berlin. Berlin liegt
vollständig in Brandenburg; das steht sogar in `tor/inhalt.mjs` als
erwartetes Loch.

**Im Werkzeug.** `tools/backen-staedte.mjs` las den Pfad in Ringe zurück
und machte daraus `polys.map(r => [r])` — **jeder Ring ein eigenes Polygon
ohne Loch**. Direkt darüber stand der Kommentar: „Aussenringe und Loecher
trennen: ein Ring, der in einem anderen liegt, ist ein Loch." Der
Kommentar beschrieb, was zu tun war; der Code tat es nicht. Der Suchlauf
für den größten einbeschriebenen Kreis kannte das Loch damit nicht — und
die Mitte von Brandenburg ist Berlin.

### Was das im Spiel war

Der Anker ist nicht nur eine Zahl in einer Datei. An ihm hängen der
**Zeiger**, der dem Kind zeigt, wo es hinziehen soll, das **Häkchen** für
ein gekonntes Gebiet, die **Namensfahne** und der **Trefferkreis**. Auf
der Aufnahme vorher steht Brandenburgs Zeiger oben im Land, direkt auf
Berlins Häkchen; nachher sitzt er unten rechts, im Land, weit weg von
Berlin.

Anders gesagt: Fiona bekam „Wie heißt dieses Bundesland?", die App zeigte
ihr die Stelle — und wer dorthin zog, bekam „Das ist Berlin."

### Das Tor, das genau das prüfen sollte

`topologie` prüft „Anker liegt IM Gebiet". Es prüfte gegen
`imPolygon(anker, [groesster])` — **nur den Außenring, ohne Loch**. Ein
Anker im Loch ist im Außenring. Das Tor meldete „16 Anker geprüft, 0
außerhalb", und es hatte, an seinem eigenen Maßstab, recht.

Die stehende Gegenprobe schlug an — sie schiebt den Anker nach `[5, 5]`,
weit vor die Küste. Genau deshalb bewies sie nichts über den Fall, der
wirklich eingetreten ist. **Regel 1, wieder:** eine Prüfung ist erst
dann eine, wenn sie ohne die Sache messbar ausschlägt — und „ohne die
Sache" heißt hier: ohne den Fehler, den es *gibt*, nicht ohne einen
ausgedachten.

Es gibt jetzt eine zweite Gegenprobe, und sie setzt den Anker ein, der
bis heute wirklich in den Daten stand: `[804.7, 446.1]`. Mit der alten
Fassung des Tores wäre sie grün geblieben.

### Vier Änderungen, eine Ursache

| Wo | Was |
|---|---|
| `tools/geo-backen.mjs` | `pfadZuRingen` und `ringeZuPolygonen` — Ringe nach Fläche sortieren, jeden in seinen Wirt hängen. Einmal, statt dreimal fast gleich (Regel 6). |
| `tools/backen-staedte.mjs` | benutzt beides; rechnet die Anker jetzt auch **ohne Rohdaten**, weil sie nur an den eingecheckten Umrissen hängen |
| `src/geo/staedte.js` | Brandenburg `[804.7, 446.1] → [874, 537.7]`, Radius 106,8 → 74,6. Niedersachsen um 2 Punkte (auch ein Loch: Bremen). Sonst nichts. |
| `tor/inhalt.mjs` | `topologie` prüft gegen Außenring **und** Löcher |
| `tor/chromium.mjs` | `zielPunkt` prüft den Anker, bevor es ihn zurückgibt — mit derselben Regel, nach der das Spiel entscheidet |

Der letzte Punkt ist der, der beim nächsten Mal Zeit spart. Ein Helfer,
der einen Punkt zurückgibt, ohne ihn zu prüfen, meldet den nächsten
Datenfehler wieder als Zeitüberschreitung ohne Ort.

**Was die Berichtigung nicht braucht:** die 400 MB Natural Earth. Ein
Anker hängt allein an `DEUTSCHLAND_FEIN`, und das liegt eingecheckt im
Baum. Ohne diesen Zweig hätte die Korrektur auf Rohdaten gewartet, die
zum Bauen und Spielen niemand braucht. Fehlen sie, übernimmt das Werkzeug
die Stadtpunkte aus der eingecheckten Fassung, rechnet nur die Anker neu
— und **schreibt das über den Lauf**, damit niemand glaubt, er hätte auch
die Orte neu bestimmt.

### Und der erste Fehler: das Buch war randvoll

Das Abzeichenband kostet 44 Punkte, und das Forscherbuch stand auf dem
Zielgerät mit Browserleiste vorher bei **322 in 322 sichtbaren** — also
bei null. Nicht „knapp": bei null. Jede Zeile, die irgendwer hinzugefügt
hätte, wäre unten herausgefallen.

Zurückgeholt nicht am Band — 44 Punkte sind die Fingergrenze und keine
Zahl, die man weiter drückt —, sondern an den zwei
Gruppenüberschriften: sie trugen zusammen **90 Punkte für zwei Wörter**
(je 26 hoch, dazu 14 und 8 Punkte Rand) auf einem Bildschirm, der 322
hat. Mit `--s0` statt `--s1` und engeren Rändern sind es 68, die
Fußpolsterung gibt sechs weitere her. Gemessen: das Buch rollt nicht
mehr.

Dieselbe Begründung, die in diesem Block schon für die Bildhöhen steht:
die Maße sind für den Schreibtisch gewählt und auf dem Telefon zu groß.

175 Gegenproben, alle mit Nachweis.

---

## P1 · Die Torkette ist kein `&&` mehr

`npm run tor` war eine Zeile in `package.json`: vierzehn `npm run …`,
verbunden mit `&&`. Das hat zwei Dinge erzwungen, die beide falsch sind.

**Alles lief hintereinander.** Sechs der Tore fahren einen eigenen
Chromium auf einem eigenen Zufallsport (`serviere` bindet auf `0`) und
schreiben in keine Datei, die ein anderes liest — nachgesehen, nicht
angenommen. Sie sind vollständig unabhängig und liefen trotzdem
nacheinander, auf einem Rechner mit vier Kernen.

**Beim ersten Rot war Schluss.** Wer `passt` rot bekam, sah `smoke` erst
im nächsten Lauf — fünf Minuten später, und dann vielleicht auch rot.

Jetzt steht die Kette als **Liste** in `tor/kette-liste.mjs`, und
`tools/kette.mjs` fährt sie: die billigen Tore nacheinander und weiterhin
mit Abbruch beim ersten Rot (ein Tippfehler im Inhalt soll keine fünf
Browserminuten kosten), dann `bauen`, dann die sechs Browsertore in einem
Becken.

### Die Zahlen — und was an den alten falsch war

Gemessen am 31.08.2026, jedes Tor **allein**, auf demselben Rechner
(vier Kerne, `dist/` frisch gebaut):

| Tor | in `schnell.mjs` stand | jetzt gemessen |
|---|---|---|
| `smoke` | 163 s | **293 s** |
| `passt` | 54 s | **183 s** |
| `ansicht` | 43 s | **79 s** |
| `ziehen` | 48 s | **57 s** |
| `lesbarkeit` | 9 s | 9 s |
| `pwa` | 19 s | **4 s** |

Die alte Zeile war nicht nur alt, sondern **irreführend**: `passt` misst
seit P14 jeden Knopf statt einer Auswahl und ist dreimal so teuer,
`smoke` hat vier Abschnitte dazubekommen — und `pwa` ist umgekehrt von 19
auf 4 s gefallen. Genau nach dieser Zeile ist entschieden worden, was in
die schnelle Bahn gehört und was nicht. Regel 5, wieder einmal: eine
geerbte Zahl gilt für den Tag, an dem sie gemessen wurde, und wer sie
erbt, erbt auch ihre Voraussetzungen.

### Die Breite des Beckens ist gemessen, nicht geraten

An der vollen Kette, derselbe Rechner, derselbe Tag:

```
Becken 3   307,7 s   <- eingestellt
Becken 4   308,4 s
nacheinander        633 s
```

Der Gleichstand ist kein Zufall, sondern die Auskunft, **wo der Engpass
liegt**: `smoke` allein braucht 295 s, die ganze Kette 308. Auf die zwei
übrigen Bänder verteilen sich 337 s, also 222 auf dem längeren — immer
noch unter `smoke`. Ein viertes Chromium kann deshalb nichts mehr
abkürzen und kostet nur einen Kern; ein zweites reichte nicht, dann lägen
337 s auf einem Band.

**Der nächste Hebel ist also nicht die Breite, sondern `smoke` selbst.**
Seine vierzehn Abschnitte ließen sich in Teilläufe zerlegen, so wie
`ansicht` seine Aufnahmen. Das ist eine eigene Runde: `ablage` braucht
`spielen`, die Abschnitte sind nicht frei schneidbar.

Auf dem Runner sind es zwei Kerne, nicht vier. Die Breite folgt deshalb
der Kernzahl (`Math.max(2, Math.min(3, os.cpus().length))`) — nie mehr
Bänder als Kerne, und nach oben bleibt es bei drei.

### Die Kette stand dreimal da

`tor/inhalt.mjs` hielt CLAUDE.md gegen `package.json`, `tor/rhythmus.mjs`
prüfte, ob jedes Tor der Kette einen Probenstand hat, und `tor/proben.mjs`
prüfte, ob jedes Tor eine Gegenprobe hat — alle drei lasen `scripts.tor`
und spalteten an `&&`. Alle drei lesen jetzt `tor/kette-liste.mjs`
(Regel 6). Ohne das wäre die Umstellung selbst der Fehler gewesen, den
diese drei Prüfungen fangen sollen.

### Was die Umstellung sofort gekostet und eingebracht hat

Drei Tore haben im ersten Lauf der neuen Kette angeschlagen, alle drei zu
Recht:

- **`inhalt`** meldete, dass die Gegenprobe „ein neues Tor steht in der
  Kette, aber nicht im Stand" ihren Suchtext (`"tor": "npm run `) nicht
  mehr findet — sie wäre still wirkungslos geworden. Sie hängt jetzt am
  Kopf der Liste.
- **`regeln`** meldete drei neue Verweise ohne Stichwort. Zwei davon
  waren echte Fehler: ein Satz über eine Aufnahme verwies auf zwei
  Nummern aus der Liste des *anderen* Verzeichnisses (dort stehen unter
  sieben und acht Dinge, die hier ganz woanders stehen). Gemeint war
  Regel 4 — kein Tor ersetzt den Blick.

  Und die Zeile, die das hier aufschreibt, ist selbst daran
  angeschlagen: im ersten Entwurf stand der falsche Verweis wörtlich
  zitiert da, und das Tor kann ein Zitat nicht von einer Behauptung
  unterscheiden. Es hat recht — ein zitierter Verweis wird beim
  Nachschlagen genauso gelesen wie ein gemeinter.
- **`doppelt`** meldete 118 Token, die in `tools/kette.mjs` und
  `tools/schnell.mjs` gleichzeitig standen — der Prozessstarter und die
  Zeitnahme. Sie stehen jetzt in `tools/laeufer.mjs`. Was *nicht*
  dorthin gehört: Reihenfolge, Becken und Abbruch — das ist genau der
  Unterschied zwischen der schnellen Bahn und der vollen Kette.

### Die Gegenprobe für das Becken

Mit `&&` gab die Shell den Rückgabewert weiter; jetzt sammelt der Läufer
ihn selbst ein. Ein `await` zu wenig, und ein rotes Tor wäre still grün —
die teuerste Art, Tore abzuschalten, weil alle stehen bleiben und keines
mehr etwas bezeugt.

Die Gegenprobe fährt die Kette in einer **kurzen Fassung**
(`SMARTKIDS_KETTE_PROBE=1`): `pwa` und `lesbarkeit` im selben Becken,
zusammen elf Sekunden. `pwa` wird rot gemacht, `lesbarkeit` bleibt grün —
geprüft wird also nicht nur, dass ein Rot durchkommt, sondern dass es
**neben einem Grün** durchkommt. Die volle Kette wären fünf Minuten je
Probe, und eine Probe, die niemand fährt, beweist nichts (Regel 1).

Der Schalter nimmt bewusst **keine Liste** entgegen. Ein Schalter, mit dem
man sich Tore aussuchen kann, ist eine Art, die Kette still abzuschalten
(Regel 9); dieser kann nur das eine, wofür er da ist, sagt es in jedem
Lauf laut dazu, und die Auslieferung setzt ihn nirgends.

194 Gegenproben.

---

## P2 · Der Rauchtest zerfällt in drei

Nach P1 lag der Engpass offen: `smoke` allein brauchte 295 der 308 s der
ganzen Kette. Die fünf anderen Browsertore liefen längst nebeneinander, er
lief als ein Stück.

`--teil=i/n` verteilt jetzt **ganze Abschnitte** auf n Prozesse. Nicht nach
Anzahl — jeder Abschnitt einzeln gemessen (`--nur=<name>`, drei
nebeneinander, abzüglich der rund 4,6 s, die Browser und Server jeden
Prozess kosten):

```
durchgang 79 · ablage+spielen 52 · schreiben 45 · test 31 · abzeichen 18
umgekehrt 13 · ebene4 11 · regler 10 · pausen 8 · tippen 5 · sprechen 2
hinweis 0 · streu 0
```

Nach Anzahl geteilt läge `durchgang` mit 79 s vielleicht neben `schreiben`
mit 45, und ein Teil bräuchte fast so lange wie vorher das Ganze. Verteilt
wird deshalb gierig: das schwerste Stück zuerst, immer in den bis dahin
leichtesten Topf. Das ist deterministisch — derselbe `i` bekommt in jedem
Lauf dieselben Abschnitte.

`ablage` braucht, was `spielen` abgelegt hat: die beiden sind **ein**
Stück und können nicht auf zwei Prozesse fallen.

### Gemessen

```
smoke am Stück      295,0 s
smoke in drei       101,6 · 97,5 · 99,6 s
ganze Kette         308,1 s  →  237,6 s
```

Die drei Teile liegen vier Sekunden auseinander. Das ist keine Feinarbeit,
sondern was die gewichtete Verteilung leistet — sie hat die Zahlen, nach
denen sie packt.

### Der Engpass ist jetzt `passt`

183 s, und die Kette braucht 238. Das ist der nächste Schritt, und er ist
schon benannt: `passt` misst seit P14 **jeden** Knopf auf sieben Größen.

### Zwei Nachzählungen, und warum sie verschieden sind

Ein Teillauf, der die Hälfte vergisst, meldet „grün", und niemand sieht,
worüber. Bei `smoke` wird deshalb die **Menge** verglichen, nicht die
Anzahl: zwei Teile, die beide `durchgang` fahren und `schreiben` keiner,
kämen sonst auf vierzehn. Jeder Teillauf schreibt beide Seiten hin — was
er fährt und was es gibt —, damit die Liste der vierzehn Namen nicht
zweimal dasteht und eine der beiden veraltet (Regel 6).

Bei `ansicht` bleibt es beim Zählen. Es teilt streng nach Index und kann
dieselbe Aufnahme nicht zweimal vergeben; 32 Namen in jede Teilausgabe zu
schreiben wäre eine lange Zeile für nichts.

Dazu ein dritter Fall, der leicht zu übersehen ist: sagt **kein** Teil
etwas dazu, ist das ein Fehler und kein Grund durchzuwinken. Sonst hätte
die Zeile eines Tages ihren Namen geändert, und die Nachzählung hätte
seither nichts mehr gemeldet — eine Prüfung, die nie etwas meldet, ist kein
Beweis (Regel 1).

### Die Gegenprobe — und was sie nicht abdeckt

Die Verteilung liest eine **zweite** Liste (`STUECKE`) neben `ABSCHNITTE`,
und zwei Listen, die dasselbe aufzählen, laufen auseinander. `smoke` zählt
deshalb selbst nach, bevor es verteilt, und die Gegenprobe „ein Abschnitt
fehlt in der Verteilung des Rauchtests" nimmt `tippen` heraus und erwartet
den Abbruch.

Sie läuft mit `--teil=11/13`: bei dreizehn Töpfen fällt in diesen nur
`hinweis` und `streu`, zusammen vier Sekunden. Die Prüfung selbst hängt
nicht an `i` und `n` — sie läuft, bevor verteilt wird.

**Was keine Gegenprobe hat:** die Nachzählung im Läufer selbst. Sie zu
proben hieße, `smoke` in der Kette zu fahren, also hundert Sekunden je
Probe, und das zweimal (gesund und krank). Der Fehler, den sie fängt, ist
dafür in der Datei nebenan zu sehen und nicht verteilt — aber
aufgeschrieben gehört es trotzdem, sonst hält es eines Tages jemand für
bewiesen.

195 Gegenproben.

---

## P3 · `passt` wartete 73 Sekunden auf etwas, das abgeschaltet war

Nach P2 war `passt` der Engpass: 183 s bei 238 s Kettenzeit. Die erste
Messung war die interessante — jede der sieben Größen kostete **gleich
viel**, 25,4 bis 26,2 s. Kein Ausreißer, nichts zu optimieren, wo es weh
tut. Also musste die Zeit woanders liegen als in der Arbeit.

Sie lag in einer Zeile:

```js
await p.waitForTimeout(450);   // der Bildschirmwechsel muss durch sein
```

`passt` öffnet **jeden** Kontext mit `reducedMotion: 'reduce'`. Die App
setzt darunter jede Dauer auf 1 ms — `--d-schirm` eingeschlossen. Gewartet
wurde also 450 ms auf einen Übergang, den es in diesem Kontext gar nicht
gibt: 21 Bildschirme × 7 Größen = 147 Pausen, **66 der 183 Sekunden**.

Jetzt eine Bedingung statt einer Zahl: keine laufende Animation mehr — die
endlosen ausgenommen, denn der Zielpuls und das Hüpfen des Zeigers hören
nie auf —, dann zwei Bilder Ruhe, damit der Grundriss steht. Unter
`reduce` ist das sofort wahr, ohne `reduce` wartet es so lange wie nötig.
Dieselben 147 Aufnahmen kosten jetzt **5,1 s statt 66**.

### Und die zweite Zahl, an der ich mich verrechnet habe

Auf dem Zahlenbildschirm stand `waitForTimeout(1500)` zwischen zwei
Aufgaben. Wonach die Zahl gewählt war, stand nirgends. Ich habe 600 ms
eingesetzt — und alle sieben Größen meldeten „nach zwölf Aufgaben kam
keine zweistellige". Die Pause war nicht großzügig, sie war **nötig**, nur
eben nicht in dieser Höhe messbar.

Der Fehler war, überhaupt eine Zahl zu wählen. `aufloesen()` setzt die
Frage auf `.loesung` und lässt sie stehen, bis die nächste Aufgabe den
Bildschirm neu baut. Also: **keine `.loesung` mehr und wieder ein
Schreibblatt da**. Das kann nicht zu kurz sein — und es ist schneller als
1500 ms.

### Gemessen

```
passt vorher      183,0 s   (7 × 25,7 s)
passt nachher     110,0 s   (7 × 15,7 s)
davon Warten        5,1 s   auf Ruhe, in 147 Aufnahmen
davon blind         0,0 s   in 0 festen Pausen
```

Die Zeile „blind gewartet" steht in der Ausgabe, obwohl sie null zeigt.
Das ist Absicht: eine feste Pause, die niemand sieht, wächst nach. Der
Rauchtest führt dasselbe Konto seit langem, und dort steht es aus
demselben Grund.

### Was daran nicht gemessen ist

Dass die Prüfung noch dieselbe ist. Eine Wartezeit zu kürzen ist die
bequemste Art, ein Tor blind zu machen: es sieht den Bildschirm dann vor
dem Umbruch und findet nichts mehr. Dagegen stehen die fünf Gegenproben
von `passt` — ein zu breiter Knopf, zwei Kacheln übereinander, eine Karte
außerhalb des Fensters, die Bühne ohne sicheren Bereich, zusammengerutschte
Buchstabenkarten. Sie sind mit der neuen Bedingung gelaufen und schlagen
alle noch an.

### Und damit war die Breite des Beckens wieder falsch

In P1 stand im Läufer **drei**, und das war damals richtig gemessen: `smoke`
brauchte am Stück 295 s und war der Boden, unter den kein Becken kam —
Becken 3 und 4 lagen auf 0,7 s gleichauf.

Nach P2 und P3 ist die Kette nicht mehr durch **einen** langen Lauf
begrenzt, sondern durch den Durchsatz. Damit zählt jedes weitere Band.
Nachgemessen, alles am selben Tag auf demselben Rechner:

```
Becken 3   209,5 s
Becken 4   171,3 s
Becken 5   151,0 s
Becken 6   130,3 s   <- eingestellt
Becken 8   133,1 s
```

Mehr Bänder als Kerne, und es hilft trotzdem — diese Tore **rechnen** kaum,
sie warten: auf einen Bildschirmwechsel, auf einen Selektor, auf den eigenen
Server. Ab acht kippt es.

Auf dem Runner sind es zwei Kerne. Übernommen wird deshalb nicht die Zahl,
sondern ihr Verhältnis: anderthalb Bänder je Kern, höchstens sechs. Auf vier
Kernen kommt genau die gemessene Sechs heraus, auf zweien drei. **Das ist
eine Schätzung**, und sie steht auch so im Quelltext — die Laufzeit des
Runners sagt, ob sie stimmt.

### Wo die Kette jetzt steht

```
vor P1              633 s   alles nacheinander
nach P1             308 s   Browsertore nebeneinander, Becken 3
nach P2             238 s   smoke in drei Teilen
nach P3             209 s   passt ohne blinde Pausen
mit Becken 6        130 s
```

Der Boden ist jetzt `passt` mit 117 s allein. Wer weiter will, teilt es
nach Größen auf — sieben, die nichts voneinander wissen.

---

## P4 · `passt` in drei — und ein Blick, der sich selbst widerlegt hat

### Zuerst: zwei der vier Schritte waren schon erledigt

Ich hatte als nächste Schritte notiert, den **Wegweiser** (P15) und das
**Auge in der Kachel** (P16) in `ansicht` einzufrieren — „beide sind nur im
Markup vom Rauchtest geprüft, im Bild von keinem Tor". Das war falsch. Ein
Blick in die eingefrorenen Aufnahmen zeigt beides: der Wegweiser steht in
`quer-nadeln`, das Auge in `quer-ebenen` und `quer-ebenen-voll`. `ansicht`
vergleicht Bildpunkte — wer eines von beiden entfernt, bekommt drei rote
Aufnahmen.

Die Lehre ist dieselbe wie sonst, nur diesmal gegen mich: **nachsehen, bevor
man Arbeit vorschlägt.** Ein Vorschlag ist eine Behauptung über den Zustand,
und der ist nachzusehen wie jede andere Zahl.

### `passt` teilt sich in drei

Nach P3 war `passt` mit 117 s der längste Einzellauf und damit der Boden der
Kette. Die sieben Größen wissen nichts voneinander — jede bekommt ihren
eigenen Kontext, ihre eigene Seite, ihre eigene Reise durch die App.

Verteilt wird **reihum**, nicht nach Gewicht: gemessen kosten alle sieben
zwischen 15,6 und 15,8 s. Wo nichts zu wiegen ist, wäre eine Waage nur eine
Stelle mehr, die veraltet.

```
Kette   124,8 s   (vorher 129,7)
passt   51,0 · 35,2 · 34,7 s   (3 Größen, 2, 2)
```

Der Boden ist jetzt wieder `smoke` mit rund 110 s.

### Ein Trennzeichen, das im Text vorkommt, ist keines

Die Nachzähl-Zeile trennt die Namen erst mit Komma. `passt` hat eine Größe,
die **„iPhone quer, Leiste"** heißt. Beim Nachzählen zerfiel sie in zwei
Größen, von denen keine existiert — und die Nachzählung hätte gemeldet, ein
Teil fahre sie nicht. Jetzt `|`.

### Eine Deckungsart, die dastehen MUSS

Drei Tore teilen sich jetzt auf, und der Läufer zählt bei jedem nach. **Wie**
er zählt, sagt `deckung` in `tor/kette-liste.mjs` — `'namen'` vergleicht
Mengen, `'zahl'` addiert. Fällt der Eintrag weg, zählte er bei diesem Tor gar
nicht mehr. Deshalb wirft die Liste beim Einlesen, wenn ein geteiltes Tor
keine Deckungsart nennt, und eine Gegenprobe nimmt sie weg.

Geprobt an `inhalt`, nicht an `tor`: `inhalt` liest dieselbe Liste und fällt
beim Einlesen um. **Drei Sekunden statt zwei Minuten**, geprüft ist dieselbe
Zeile.

Dazu ein Fall, der mir beim Einrichten selbst begegnet ist: `smoke
--teil=12/13` bekam **keinen einzigen** Abschnitt, weil dreizehn Stücke auf
dreizehn Töpfe nicht aufgehen, sobald zwei gleich schwer sind. Ein leerer
Teillauf meldet grün, ohne etwas geprüft zu haben. Er bricht jetzt ab.

### Der Blick auf die Nadeln — und was er falsch gesehen hat

Auf `quer-nadeln` (Nordamerika, 844 × 390) sah die Ecke um Mittelamerika eng
aus. Mein Augenschein sagte: drei Köpfe hängen neben der Karte im Weißen, und
zwei liegen fast aufeinander. **Gemessen stimmt beides nicht:**

```
Karte                    352 × 280 bei x 46, y 98
Nadelköpfe               7, davon 0 außerhalb des Kartenkastens
engster Kopfabstand      44,3 pt   (die Fingergrenze ist 44)
```

Was das Auge **richtig** gesehen hat, ist etwas anderes, und es hat einen
Namen bekommen: die **Fadenlänge**.

```
Fäden   54 · 114 · 44 · 154 · 44 · 84 · 74 pt
```

Einer misst **154 pt auf einer 352 pt breiten Karte** — 44 % der Kartenbreite.
Ein Kopf, der so weit von seinem Land entfernt liegt, sagt nicht „hier",
sondern „irgendwo da drüben". Und genau „hier" ist der ganze Zweck der Nadel.

### Zwei Zahlen ohne Referenz — also eine Ratsche

Woraus sollte ein Soll für „engster Kopfabstand" oder „längster Faden"
kommen? Aus keiner Referenz, die ich habe. Ein ausgedachtes Soll wäre hier
schlimmer als keines: es stünde entweder sofort rot oder nie.

Also eine Ratsche, wie bei `budget` und `regeln`: was heute gemessen ist,
steht in `tor/nadeln-stand.json`, und rot wird es nur, wenn es **schlechter**
wird. Verglichen wird **je Ebene**, nicht über alle — ein kürzerer Faden in
Europa darf einen längeren in Nordamerika nicht zudecken.

```
laender:europa        eng 68,3 pt   Faden  64 pt (19 %)
laender:nordamerika   eng 44,3 pt   Faden 154 pt (44 %)
```

Zwei Gegenproben greifen in den **Stand**, nicht in die App: sie behaupten
einen besseren Zustand, als heute gemessen wird. Genau so herum passiert es
auch wirklich — jemand bestätigt einen Stand von einer anderen
Fenstergröße und merkt nicht, dass die Karte danach schlechter geworden ist.

**Was damit nicht behoben ist:** die 154 pt selbst. Die Ratsche hält sie
fest, sie macht sie nicht kürzer. Ob ein Faden über die halbe Karte für ein
Kind noch lesbar ist, sagt keine Zahl — das ist der nächste Blick, und er
gehört aufs Gerät, nicht in ein Tor.

198 Gegenproben.

### Nachgeprüft auf dem Runner — und die Begründung war falsch

Die Beckenbreite folgt seit P3 der Kernzahl: anderthalb Bänder je Kern,
höchstens sechs. Im Quelltext stand dazu, für den Runner sei das eine
**Schätzung**, weil `ubuntu-latest` zwei Kerne habe.

Beides war falsch. Der Runner hat **vier** Kerne — und er schreibt es seit
P1 in jeden Lauf: „10 Browserläufe, 6 nebeneinander (**4 Kerne**)". Die
Zeile stand da, ich habe sie nur nicht gelesen. Eine Zahl, die das Werkzeug
selbst mitliefert, ist kein Anlass zum Schätzen.

Gemessen am Kettenschritt der Auslieferung, beide Male auf `ubuntu-latest`:

```
Lauf 74–77   serielle Kette          ~10 min gesamt
Lauf 78      P1, Becken 3            303 s
Lauf 79      P3, Becken 6            130 s
```

Hier auf dieser Maschine waren es an denselben Ständen 308 s und 130 s. Der
Runner läuft also praktisch gleich schnell, und die Formel trifft auf ihm
genau die gemessene Sechs.

Die Formel bleibt trotzdem eine Formel und keine feste Sechs: sie soll auch
stimmen, wenn der Runner sich ändert oder jemand das Verzeichnis auf einer
kleineren Maschine fährt. Nur ist sie für den heutigen Runner keine
Schätzung mehr.

### Und der Runner hat sofort einen echten Fehler gefunden — meinen

Der erste Lauf nach P4 war **rot**:

```
✗ ansicht: kein Teillauf nennt seine Zahl („der N Aufnahmen")
  — die Nachzählung prüft nichts mehr.
```

Das ist mein eigener neuer Wächter, und er hatte halb recht. `ansicht`
läuft auf dem Runner **ausdrücklich nicht** (`SMARTKIDS_OHNE_ANSICHT=1`):
Bildpunktvergleiche gelten nur bei gleicher Zeichenumgebung. Bis P4 war die
Nachzählung nachsichtig (`if (soll && …)`) und ging still darüber hinweg;
streng gemacht, meldete sie den Fall sofort.

Die Unterscheidung, die gefehlt hat: **„hat sich übersprungen" ist etwas
anderes als „hat nichts gesagt".** `ansicht` sagt seit jeher laut
ÜBERSPRUNGEN — daran wird es jetzt erkannt, nicht am Fehlen einer Zeile.
Denn „hat nichts gesagt" ist ja gerade der Fall, den die Nachzählung fangen
soll.

Zwei Dinge daran sind bemerkenswert. Erstens hat die Auslieferung getan,
wofür sie da ist: der Fehler kam nicht auf das Gerät der Kinder, weil nur
bei Grün etwas nach `/` geht. Zweitens ist die Lücke aus P2 damit
geschlossen — dort stand die Nachzählung im Läufer als **ungedeckt**
aufgeschrieben, weil eine Gegenprobe die volle Kette gebraucht hätte. Die
kurze Fassung fährt jetzt `ansicht` mit (übersprungen, eine halbe Sekunde),
und eine Gegenprobe nimmt das Wort ÜBERSPRUNGEN aus der Meldung.

```
Lauf 80   P4, Becken 6   115 s bis zum Abbruch am Ende
          smoke  104,0 · 99,3 · 102,5     passt  51,9 · 36,1 · 33,3
```

199 Gegenproben.

---

## P5 · `durchgang` zerfällt nach Profil — und die Beckenbreite zum dritten Mal

Nach P4 war `smoke` mit rund 104 s je Drittel wieder der längste Lauf, und
`durchgang` war mit 79 s das schwerste Stück darin. Er spielt jede Ebene
für **jedes Profil**, und die vier wissen nichts voneinander — jedes bekommt
seinen eigenen Kontext, seine eigene Seite. Gemessen:

```
fiona 31,4 · lea 17,7 · stephan 17,8 · violeta 16,7
```

Fiona kostet fast doppelt so viel wie die anderen: sie hat die Schreibwelt,
und jede ihrer Aufgaben wird zusätzlich angesagt.

### Der erste Versuch brachte null

Mit `durchgang:<profil>` als vier Stücken bei **drei** Teilen:

```
vorher   104,0 · 99,3 · 102,5 s     Kette 122,8 s
nachher  108,1 · 108,6 · 106,7 s    Kette 126,3 s
```

Perfekt ausgeglichen — und nicht schneller. Bei drei Töpfen hatte die
gierige Packung `durchgang` längst neben lauter kleine Stücke gelegt; seine
79 s waren gar nicht der Engpass. Ich hatte den Hebel an der falschen
Stelle vermutet und es nicht gemessen, bevor ich ihn gebaut habe.

### Wo er wirklich wirkt

Erst mit **vier** Teilen zeigt sich, wofür die Zerlegung gut ist:

```
smoke in vier   76,7 · 79,9 · 76,2 · 83,2 s
```

Ohne die Zerlegung wäre der Boden bei 79 s gelegen — `durchgang` am Stück.
Nur: die Kette wurde davon auch nicht schneller (132,5 s bei sechs Bändern),
denn sie ist längst **durchsatzgebunden** und nicht mehr durch den längsten
Lauf begrenzt.

### Also die Beckenbreite, zum dritten Mal

```
Becken  6   126,3 s
Becken  8   109,5 · 109,5 · 110,9 s
Becken 10    97,8 · 100,1 · 101,2 s   <- eingestellt
Becken 12   109,9 s
Becken 16   107,4 s
```

Acht und zehn sind je dreimal gemessen: der Unterschied ist reproduzierbar,
die Streuung liegt unter 3 s. Zweieinhalb Bänder je Kern.

**Diese Zahl hat sich jetzt dreimal geändert, und jedes Mal war die alte
richtig gemessen und trotzdem falsch geworden:**

| | Wert | Warum er galt |
|---|---|---|
| P1 | 3 | `smoke` am Stück 295 s — der Boden, 3 und 4 lagen gleichauf |
| P3 | 6 | Nicht mehr ein langer Lauf begrenzte, sondern der Durchsatz. „Ab acht kippt es" galt für die damaligen **zehn** Läufe |
| P5 | 10 | Dreizehn kleinere Läufe, und acht kippt nicht mehr |

Die Voraussetzung dieser Zahl ist die **Zusammensetzung** der Kette, und die
ändert sich mit jedem Umbau. Eine gemessene Zahl gilt für den Tag, an dem
sie gemessen wurde — hier heißt das: sie gilt für die Kette, an der sie
gemessen wurde.

```
vor P1  633 s · nach P1  308 · P2  238 · P3  209 · P4  125 · P5  99,9 s
```

### Die neue stille Falle, und ihre Gegenprobe

Ein Teillauf sieht seit P5 nur seine eigenen Profile. Die Urteile im
Durchgang — „Fiona bekam nur 0 von 13 Aufgaben vorgelesen", „kein einziger
Zug über `lea: antippen`" — hängen deshalb an `PROFILE_HIER`. Ohne diese
Bedingung meldete der Teil, der Lea spielt, einen **Fehlalarm über Fiona**,
die er gar nicht gemessen hat. Ein Tor, das über Ungemessenes urteilt, ist
schlimmer als eines, das schweigt.

Die Gegenprobe nimmt die Bedingung weg und fährt `--teil=5/16`: bei sechzehn
Töpfen fällt in diesen **nur** `durchgang:lea`, also 27 s statt hundert. Und
genau dieser Topf ist der Fall, um den es geht.

Dazu vergleicht die Nachzählung im Läufer jetzt **Stücke** statt Abschnitte
(17 statt 14). Sonst stünde `durchgang` in zwei Teilen, die Menge wäre
vollständig, und niemand sähe, dass ein Profil in keinem Teil läuft.

200 Gegenproben.

---

## P6 · Der Probenlauf: 39 Minuten auf 19

Der Gegenprobenlauf war die letzte Bahn, die niemand vermessen hatte.
Zuerst die Grundlinie, ganz gefahren:

```
200 Proben, 3 Arbeiter nebeneinander   2348 s = 39,1 min
```

Und beim Zusehen der eigentliche Befund: **nach 32 Minuten lief noch genau
ein Prozess.** Die anderen zwei waren längst fertig.

### Reihum ist keine Verteilung

Im Läufer stand: „Reihum nach Gruppen, damit die Arbeit ungefähr gleich
fällt — die Gruppen sind sehr unterschiedlich groß, aber die teuren sind
auch die zahlreichen." Der zweite Halbsatz war eine Vermutung, und sie ist
falsch. Aus dem Lauf gerechnet:

```
200 Proben · 33 Gruppen · zusammen 5649 s
ansicht 1057 s · smoke --nur=ablage 974 · passt 702 · smoke --nur=durchgang 485
… und zwölf Gruppen unter zehn Sekunden
```

### Erst rechnen, dann fahren

Ein Versuch kostet 39 Minuten — zu teuer, um Einstellungen durchzuprobieren.
Also aus den gemessenen Zeiten die Packung **durchgespielt**, statt sie zu
raten:

```
 n    reihum   gewichtet     (vorhergesagte Wanduhr)
 3      2355        1884
 4      2053        1415
 5      2268        1132
 6      1642        1057
10      1376        1057
```

Die Vorhersage für die heutige Einstellung lautete **2355 s**, gemessen
waren **2348**. Damit ist das Modell am echten Lauf geprüft und nicht bloß
plausibel — und die Zeile „reihum, 5 ist schlechter als reihum, 4" zeigt
nebenbei, wie unberechenbar Reihum ist.

Verteilt wird jetzt gierig nach Gewicht: die schwerste Gruppe zuerst, immer
in den bis dahin leichtesten Topf. Dasselbe Verfahren wie bei `smoke --teil`
(P2), aus demselben Grund.

### Woher das Gewicht kommt

Aus dem **Stand**: jede Probe trägt seit diesem Umbau ihre gemessene Dauer
(`s`) neben ihrem Nachweis. Eine neue Probe ohne Wert bekommt den Mittelwert
der anderen — nicht null, denn null landete immer im vollsten Topf. Fehlt
der Stand ganz, fällt es auf reihum zurück: dann ist nichts gemessen, und
Raten wäre schlechter als die alte Ordnung.

Die 200 Werte aus der Grundlinie sind eingetragen, damit der erste Lauf nach
dem Umbau schon gewichtet fährt statt erst der zweite.

### Gemessen

```
vorher    3 Arbeiter, reihum       2348 s = 39,1 min
nachher   6 Arbeiter, gewichtet    1157 s = 19,3 min
vorhergesagt waren               1057 s
```

Die 100 s Unterschied zur Vorhersage sind die **Konkurrenz der Prozesse**:
sechs Chromium auf vier Kernen machen jede einzelne Probe langsamer, und
das kennt das Modell nicht. Es sagt die Packung voraus, nicht die Physik.

Mehr als sechs Arbeiter bringen nichts: die schwerste **einzelne** Gruppe
ist `ansicht` mit 1057 s, und eine Gruppe teilt sich nicht — ihre Proben
teilen sich den gesunden Lauf, das ist ja ihr Sinn. Wer darunter will, muss
die Gruppe aufbrechen und den gesunden Lauf mehrfach bezahlen.

### Vier Proben, die nicht mehr beweisen

Der Lauf hat ausserdem gemeldet, was sonst niemand fragt:

- **die Rechenebene gehört plötzlich beiden Kindern** — der Eingriff kam
  nicht an. `fehlt: "wer:['fiona']"` konnte nie zutreffen, weil dieser Text
  seit der Schreibwelt **sechsmal** in `dist` steht; fünf bleiben stehen,
  wenn man einen entfernt. Jetzt am ganzen Satz verankert, der genau einmal
  vorkommt. **Behoben.**
- **eine Spalte fehlt in der Profiltabelle** — `smoke` wird rot, aber mit
  einer anderen Meldung.
- **die umgekehrte Frage kommt auch für Winzlinge** — `smoke` bleibt grün,
  obwohl der Fehler drin ist.
- **die Buchstabenerkennung nimmt alles an** — `schreiben` wird rot, aber
  nicht deswegen.
- **eine falsche Antwort bleibt stumm** — der Suchtext trifft nicht mehr.

Die vier offenen sind **nicht** in dieser Runde behoben: jede ist eine
eigene Untersuchung am Tor, nicht am Läufer. Sie stehen hier, damit sie
nicht als „schon bekannt" untergehen.

196 von 200 Gegenproben schlagen an.

---

## P7 · Die Nadeln: dieselbe Regel, zwei sehr verschiedene Karten

Zwei Fragen standen offen. Die eine: warum greift die Nadelschwelle in
Europa anders als in Nordamerika — neun Gebiete unter 44 pt und nur **zwei**
Nadeln dort, neun und **sieben** hier? Die andere: was ist mit dem Faden von
154 pt, den die Ratsche seit P4 festhält?

### Die Schwelle greift gar nicht anders

Die Regel steht in `nadelplanFuer` und hat zwei Bedingungen, die **beide**
zutreffen müssen:

```
n.gross * k < MIN_PT          die Form ist kleiner als 44 pt auf dem Schirm
kreisAmOrt(n) * 2 < MIN_REST  und selbst am Ort kommen keine 20 pt zusammen
```

Die erste trifft in beiden Karten neunmal zu. Die zweite ist der
Unterschied: in Mittelamerika liegen sieben Länder so eng, dass auch die
zwanzig nicht mehr reichen; in Europa nur Belgien und Luxemburg. **Es ist
dieselbe Regel — die Karten sind verschieden.**

Von aussen war das nicht zu sehen. `ziehen --nur=treffer` schreibt die drei
Stufen jetzt hin:

```
laender:europa        Nadel 2 · am Ort 7 · Verzicht 0
                      am Ort: CZE 20, DNK 33.9, POL 30.9, GRC 44,
                              AUT 20, CHE 24.9, NLD 20
laender:nordamerika   Nadel 7 · am Ort 2 · Verzicht 0
                      am Ort: CUB 20, PAN 20
bundeslaender         Nadel 0 · am Ort 4 · Verzicht 0
```

Zwei Dinge fallen dabei auf, die vorher niemand sagen konnte. **Verzicht
steht überall auf null** — kein Gebiet ist unerreichbar. Und **fünf Gebiete
sitzen exakt auf dem Boden von 20 pt** (CZE, AUT, NLD, CUB, PAN): erreichbar
nur nach der Definition der App, mit weniger als der halben Fingergrenze.

### Der lange Faden — und eine Vermutung, die falsch war

Meine Vermutung: die Nadeln werden von oben nach unten gelegt, wer zuletzt
drankommt findet die nahen Plätze besetzt, also ist der 154er ein Artefakt
der Reihenfolge. Gebaut, gemessen — **nichts geändert.** Und die Gegenprobe
dazu (die Annahmebedingung abschalten, also *jeden* gefundenen Platz
nehmen) ändert ebenfalls nichts: die Suche findet für jede Nadel exakt den
Platz, den sie schon hat. Der Nachbesserungs-Durchgang ist deshalb wieder
draussen — Code, der nie etwas ändert, ist kein Code, sondern Ballast.

### Die wirkliche Ursache ist die Karte, nicht die Nadel

Dieselbe Karte, drei Fenstergrössen:

| Fenster | Karte | unter 44 pt | Nadeln | längster Faden |
|---|---|---|---|---|
| **844 × 390 (Zielgerät)** | 352 × 280 | 9 | **7** | **154 pt (44 %)** |
| 1180 × 820 (iPad) | 857 × 696 | 6 | 2 | 44 pt (5 %) |
| 1400 × 900 | 954 × 776 | 6 | **0** | — |

Auf dem Zielgerät bekommt die Karte **352 von 844 Punkten Breite — 42 %**,
den Rest hält die Antwortspalte. Auf dem iPad sind es 857 von 1180, also
73 %, und dort braucht Mittelamerika zwei Nadeln statt sieben.

Der Faden ist also kein Fehler der Nadelsuche, sondern ihre Folge: sie muss
einen Kopf im Meer finden, 44 pt von jedem anderen Kopf entfernt, und bei
352 Punkten Kartenbreite liegt der nächste freie Platz für Costa Rica
154 Punkte weit weg.

**Was daraus folgt, ist eine Layoutfrage und keine Nadelfrage** — und sie
ist zu gross für diese Runde: die Antwortspalte schmaler zu machen berührt
`passt` auf sieben Grössen, jede eingefrorene Aufnahme und den Grundriss
selbst. Sie steht damit als nächster Schritt, aber mit einer Zahl davor:
die Karte hat auf dem Gerät der Kinder weniger als die Hälfte der Breite.

---

## A4 · Sprechen für alle, ein Hörknopf für Fiona, mehr Karte für alle

Drei Wünsche in einer Runde, und alle drei haben ihre eigene Falle gehabt.

### Sprechen ist keine Kinderkrücke mehr

`sprechen` stand nur in Fionas Profil, weil sie nicht schreibt. Es ist aber
auch der Weg von jemandem, der schreiben **kann und nicht will**: „Wie heißt
dieses Land?" mit siebzehn Ländern im Vorrat sind siebzehn getippte Namen,
und der Sinn der Übung ist das Land, nicht die Tastatur. Alle vier Profile
haben es jetzt.

Es bleibt eine **Option**: das Mikrofon erscheint nur, wenn der Sprachmodus
im Elternbereich an ist, und das Schreibfeld bleibt daneben stehen. Der
Rauchtest prüft beides — dass Stephan das Mikrofon bekommt **und** dass ihm
das Feld nicht weggenommen wird. Zwei Gegenproben, eine je Hälfte.

### Der Hörknopf — und warum der erste Entwurf unprüfbar war

Fiona liest nicht: Aufgabe und Möglichkeiten kommen nur als Ton. Wer beim
ersten Mal überhört wurde, hatte keinen Weg zurück außer aufzugeben.

Der erste Entwurf war elegant und falsch. `ansagen()` ist der eine Trichter,
durch den jede Ansage geht — also merkte er sich die letzte, und der Knopf
wurde angehängt, **wenn sie kam**. Sie kommt aber in einem `setTimeout`
(500 ms nach dem Bildwechsel, damit die Stimme nicht in den Übergang
spricht). Damit war der Knopf auf den eingefrorenen Aufnahmen mal da und mal
nicht, und `ansicht` meldete drei Bilder rot, die sich gar nicht geändert
hatten.

**Ein Knopf, der von einer Uhr abhängt, ist nicht prüfbar.** Jetzt bekommt
er seinen Satz mitgegeben und steht sofort; gesagt wird der Satz weiterhin
erst nach dem Übergang. Zwei Läufe von `ansicht` hintereinander: 32 grün,
32 grün.

Er hängt am **Profil**, nicht am Bildschirm: Lea liest, für sie wäre er ein
Knopf, der schweigt. Auch das ist geprüft — und gegengeprobt, in beide
Richtungen.

### Das Zeichen, viermal gezeichnet

„Mit einem sauberen Icon" war die Bitte, und das entscheidet sich bei
**26 Punkten**, nicht bei 78. Vier Entwürfe nebeneinander gerendert und in
beiden Größen angesehen:

- Lautsprecher + Bogen ohne Spitze → verschmilzt zum Klumpen
- Lautsprecher + **Kreispfeil mit Spitze** → klar getrennt ✓
- Lautsprecher + zwei Wellen → heißt „Ton an", nicht „noch einmal"
- Lautsprecher + Welle + Pfeil → zu voll

### Die Karte breiter — und was das nicht bringt

Die Antwortspalte im kurzen Querformat stand auf `min(46vw, 392px)`.
Gemessen auf 844 × 390, Fionas Weltkarte:

```
46vw / 392px   Karte 444 × 241
42vw / 356px   Karte 478 × 259
38vw / 320px   Karte 512 × 278   <- eingestellt
34vw / 286px   Karte 539 × 280
```

Bei 38vw ist die Karte an ihrer **Höhengrenze** angekommen; weiter zu gehen
brächte nur wieder Luft an den Seiten.

`passt` hat das sofort rot gemacht, und zu Recht: auf dem **iPhone SE quer**
(667 breit) sind 38vw nur 253 Punkte, und „Mecklenburg-Vorpommern" stand
zehn Punkte über seinen eigenen Knopf hinaus. Deshalb ein Boden von 307 —
genau das, was die Spalte dort vorher hatte. Das kleinste Gerät behält seine
Breite, nur das größere gibt etwas ab.

**Was es nicht bringt:** den Länderkarten. Nordamerika bleibt bei jeder
Spaltenbreite 352 × 280, weil es schon an der Höhe hängt — die sieben Nadeln
und der Faden von 154 Punkten bleiben. Die Vermutung aus P7, eine schmalere
Spalte würde sie erledigen, ist damit auch von der anderen Seite widerlegt.

### Und ein Fehler, den `passt` gefangen hat

Die Profilkachel zeigte `p.eingabe.join(' und ')`. Mit der dritten
Eingabeart stand dort „ziehen und tippen und sprechen" — kein Deutsch, und
breit genug, dass Violetas Kachel **15 Punkte in den Bereich des Telefons**
rutschte, gefunden auf der Größe mit Leiste.

Zwei Dinge daran waren falsch, nicht eines. `aufzaehlen` statt `join` macht
daraus „ziehen oder tippen". Und `sprechen` steht nur da, **wenn der
Sprachmodus wirklich an ist** — es ist eine Option hinter einem Schalter;
wer sie immer läse, bekäme ein Versprechen, das der Bildschirm nicht hält.
Fiona sah bis A4 genau das.

204 Gegenproben, `npm run tor` grün in 103,0 s.

## A5 — „Australien" heißt Australien, und der Kopf gibt Höhe ab

### Nur noch Australien

Der Kontinent hieß im Spiel „Australien und Ozeanien". Das ist die Sprache
eines Atlas, nicht die eines Kindes: Fiona hört einen Satz mit vier Wörtern,
Lea tippt sechzehn Buchstaben, und beide meinen dasselbe Land, das auf der
Karte liegt. Er heißt jetzt **Australien** — im Knopf, in der Ansage, im
Lob nach der richtigen Antwort.

Was NICHT verschwunden ist: „Australien und Ozeanien" und „Ozeanien" stehen
weiter als **Aliasse**. Wer den langen Namen tippt oder spricht, bekommt
weiter ein Richtig. Ein umbenannter Gegenstand darf niemandem eine Antwort
wegnehmen, die vorher gezählt hat.

### Der Kopf gibt Höhe ab — 154 auf 134

Aus P7 war eine Zahl offen geblieben: auf `laender:nordamerika` hängt der
längste Nadelfaden **154 Punkte** weit vom Land weg, und zweimal war die
Vermutung, woran das liegt, falsch — weder die Reihenfolge der Nadeln noch
die Breite der Antwortspalte hat etwas bewegt. Die Karte hängt an der
**Höhe**:

```
Fenster 390 = Kopf 68 + Fragesatz 30 + Feld 292 (Karte 280 + 12 Innenabstand)
```

Also durchprobiert, jede Zeile ein Bau — erst den Raum ansehen, dann
justieren:

```
Kopf 68 px   Karte 352 × 280   Nadeln 7   längster Faden 154
Kopf 60 px   Karte 362 × 288   Nadeln 7   längster Faden 134
Kopf 52 px   Karte 371 × 296   Nadeln 7   längster Faden 134
Kopf 44 px   Karte 371 × 296   Nadeln 7   längster Faden 134
```

Zwei Dinge stehen in dieser Tafel, und man muss sie auseinanderhalten.

**Der Faden hört schon bei 60 auf zu fallen.** Was die 134 dann noch hält,
ist die Breite, nicht die Höhe. Weiter nachzugeben zahlt nur noch in
Kartenpunkten.

**Und unter 60 ist gar nicht erreichbar.** Die `min-height` löst nur den
Boden von 68; die Höhe setzt danach der *Inhalt* — das Kreuz misst 44 Punkte
und schrumpft nicht, dazu zweimal 8 Punkte Innenabstand. Nachgemessen im
Browser: `.kopf` ist **60 px** hoch, `min-height` steht auf 52 und greift
nicht. Die 52 steht trotzdem da, weil sie die 68 aufhebt; wer sie streicht,
bekommt die 68 zurück.

Das ist der Grund, warum die Zeilen 52 und 44 in der Tafel bleiben durften,
obwohl sie nicht eingestellt sind: sie sagen, was das Nachgeben **noch**
brächte, und dass es nicht reicht, um dafür das Kreuz unter die 44 Punkte zu
drücken.

Beide Ratschen sind neu bestätigt und stehen jetzt **enger** als vorher:

```
laender:nordamerika   engster Kopfabstand 44.3 → 44.5   längster Faden 154 → 134
laender:europa        engster Kopfabstand 68.3 → 78.2   längster Faden  64 →  64
```

`passt` grün auf allen sieben Größen — das war die eigentliche Frage am
kleineren Kopf: ob er seine Knöpfe noch hält. 32 Aufnahmen neu eingefroren,
weil sich auf jedem Querformat alles um acht Punkte gehoben hat.

## A6 — Mittelamerika bekommt seine eigene Karte

### Die Frage war, wie groß ein Ausschnitt sein muss

Auf der Nordamerikakarte hingen sieben Länder an einer Nadel neben der
Karte, mit Fäden bis zu 134 Punkten — ein Fächer unter Mittelamerika, in
dem nicht mehr zu sehen war, welcher Faden zu welchem Land gehört. Die
naheliegende Antwort ist die des Schulatlas: eine **Nebenkarte** in einer
Ecke, größerer Maßstab, Rahmen darum.

Gemessen, mit derselben Projektion, mit der gebacken wird — jede Zeile ist
die größte Ausdehnung des Landes in Bildschirmpunkten:

```
Kasten       GTM  HTI  CUB  DOM  HND  NIC  SLV  CRI  PAN   ≥44  ≥20
120 ×  90     16   10   39   14   23   19    9   22   23     0    4
260 × 195     35   23   85   29   51   41   20   47   49     4    8
362 × 288     49   31  118   41   71   57   27   66   69     6    9
480 × 288     57   36  136   47   82   66   32   76   79     7    9
600 × 450     81   52  196   68  117   95   45  110  114     9    9
```

Eine Nebenkarte, die in eine Ecke passt, ist 120 bis 180 Punkte breit —
**dort ist kein einziges der neun zu treffen.** Erst der ganze
Kartenkasten bringt alle neun über 20 Punkte, also über die Schwelle, ab
der die App gar keine Nadel mehr setzt. Die Idee war nicht zu klein
umgesetzt, sie war unmöglich: der Ausschnitt musste die Karte werden, nicht
ein Kasten darin — und eine eigene Karte ist eine eigene Ebene.

Das ist auch die Antwort der Vorbilder: der Diercke gibt Mittelamerika eine
eigene Seite, Seterra ein eigenes Quiz, eine Kartenanwendung einen eigenen
Zoom. Keines quetscht die Landbrücke in die Nordamerikakarte.

### Was daraus geworden ist

`laender:nordamerika` hat drei Ziele (USA, Mexiko, Kanada),
`laender:mittelamerika` neun. Gemessen im Browser auf 844 × 390:

```
vorher   laender:nordamerika   Karte 362×288 ·  9 von 12 unter 44 pt · 7 an der Nadel, längster Faden 134
nachher  laender:nordamerika   Karte 362×288 ·  0 von  3 unter 44 pt · keine Nadel
nachher  laender:mittelamerika Karte 429×288 ·  3 von  9 unter 44 pt · keine Nadel
```

**Keine der beiden Karten hat noch eine einzige Nadel.** Die neun bleiben
auf der Nordamerikakarte gezeichnet — grau, als Umgebung, wie jedes Land
ohne Rang; die Karte bleibt vollständig, nur gefragt wird nach ihnen
woanders. Der Ausschnitt schneidet Mexiko und Kolumbien an, und das ist
Absicht: sie sind dort Umgebung, und ein Kartenrand mitten durch ein
Nachbarland ist das, was jeder Atlas an dieser Stelle tut.

Der Lernstand zieht mit um. Wer Kuba dreimal richtig hatte, fände es sonst
als frisches Gebiet wieder und der Aufkleber wäre weg — für ein Kind ist
das kein Datenschema, das ist gelöschte Arbeit. Kopiert, nicht verschoben:
wer eine Fassung zurückrollt, hat seinen Stand noch.

### Vier Tore sind nacheinander gefallen, und jedes hat etwas anderes gesagt

Das ist der eigentliche Ertrag der Runde.

**`inhalt`** meldete „Elternknoten mittelamerika fehlt" — es prüfte, dass
jeder Schlüssel in `LAENDER` ein Kontinent ist. Das war richtig, solange es
nur Kontinente gab. Jetzt steht in `erdkunde.js` ein Verzeichnis
`AUSSCHNITTE`, das sagt, aus welchem Kontinent ein Ausschnitt geschnitten
ist — und das Tor lässt einen Schlüssel weiter nur durch, wenn er das eine
oder das andere ist.

**`spielprobe`** behauptete, neun Länder hätten „keine Fläche auf der
Karte". Die Karte lag daneben; das Tor führte eine eigene Tafel
`{ europa: …, afrika: … }` von Hand — und dieselbe Tafel stand ein drittes
Mal im Bau. Drei Abschriften, drei rote Tore, drei verschiedene Meldungen.
Sie lesen jetzt **ein erzeugtes Verzeichnis** (`src/geo/karten.grob.js`),
das aus derselben Schleife entsteht, die die Karten schreibt, und ihnen
deshalb nicht hinterherhinken kann.

**Der Bau** meldete „81 Länder" statt 65. Die Tafel `a3 → Land` war flach
über alle Kontinente — das ging gut, solange jedes Land auf genau einer
Karte lag. Guatemala liegt jetzt auf zweien und wurde prompt auf beiden zum
Ziel. Die Zugehörigkeit hängt jetzt am Schlüssel, unter dem ein Land in
`erdkunde.js` steht, und der Bau **vergleicht die Summe**: 65 gebaut, 65 in
den Daten, sonst bricht er ab.

**Der Rauchtest** starb an einer nackten Zeitüberschreitung. Sein Abschnitt
„umgekehrte Frage" stellte einen Lernstand, in dem nur die sieben kleinen
Länder Nordamerikas fällig sind — die es dort nicht mehr gibt. Also bekam
jedes Land Fach 5, die Sitzung war leer, und er wartete zwanzig Sekunden
auf eine Frage, die nie kam. Er spielt jetzt **Europa**, die einzige Ebene,
die noch Nadeln hat, und **prüft seine eigene Voraussetzung**: steht eine
der Kennungen nicht auf der Karte, sagt er das, statt zu hängen.

Dazu zwei Tore, die nur das Layout betrafen: `passt` fand die zehnte Kachel
drei Punkte unter dem Rand eines 700 × 850-Fensters. Der naheliegende Griff
— das Spaltenmaß von 240 auf 200 — machte `passt` grün und `lesbarkeit`
rot: bei 200 Punkten Kachelbreite läuft der Name ins Wasserzeichen, und
fünf Kachelnamen fielen von 4,7 auf **2,33:1**. Genommen wurde stattdessen
der Reihenabstand: vier Lücken zu 16 statt 12 Punkten sind sechzehn Punkte,
gebraucht waren drei.

### Und eine Aufnahme, die einen Hover-Ring festhielt

`spiel-bundesland` meldete 7478 geänderte Bildpunkte am Knopf „Berlin".
Nicht der Knopf hatte sich geändert, sondern der Mauszeiger lag woanders:
er bleibt nach dem letzten Klick liegen, und wo, entscheiden die Kacheln,
die er zuletzt getroffen hat. Der Ring, den er malt, ist auf dem Zielgerät
nie zu sehen. Der Zeiger geht jetzt vor **jeder** Aufnahme in die Ecke —
einmal für alle, statt in jeder einzeln daran zu denken.

`npm run tor` grün in 107,0 s. 33 Aufnahmen, 207 Gegenproben.

## A7 — ein Symbol, das ein Kind anfasst

Das alte App-Symbol war ein Atlas-Globus: Nachthimmel, Gradnetz, Küste auf
0,9 Bildpunkte genau vereinfacht. Auf dem Schreibtisch schön — auf dem
Startbildschirm eines iPads steht es zwischen bunten Kachelsymbolen und ist
dunkel, fein und ernst. Fiona ist sechs.

**Drei Vorbilder, und was sie TUN** (nicht, wie sie aussehen):

| | |
|---|---|
| Duolingo | EINE Gestalt auf EINER satten Fläche. Keine Szene, dicke Formen. Bei 40 px sind noch drei Dinge zu unterscheiden. |
| ANTON, Khan Academy Kids | heller, warmer Grund; ein einziger freundlicher Gegenstand; runde, dicke Konturen; hohe Buntheit. |
| Swift Playgrounds | ein Emblem, großzügiger Rand, EINE Idee — nichts, was man bei 40 px erst suchen müsste. |

Das Soll daraus: ein Gegenstand, wenige Formen, hohe Buntheit, dicke
Konturen, warmer Grund, nichts, was unter 60 px zu Grieß wird.

**Der Abstand der alten Fassung, an ihrer eigenen Datei gemessen:** Grund
L 0,21–0,36 (dunkel), Buntheit C 0,038–0,05 (fast grau), Küste auf 0,9 px
verfeinert, dazu ein Gradnetz aus zwölf Linien. Bei 45 px sind das rund 900
Küstenpunkte auf 34 Bildpunkten Kugel — jeder Strich unter einem Zehntel
Bildpunkt.

**Was die neue Fassung anders macht:**

- **Grund** warm und hell statt Nachtblau. Der Globus ist kalt, der Grund
  warm — der Gegensatz trägt die Form, nicht ein Verlauf auf der Kugel.
- **Küste absichtlich grob:** Hausdorff 3,5 px statt 0,9. Was bei 512 px
  eine Bucht ist, ist bei 45 px ein Zittern. Gemessen sind es 3,19.
- **Gradnetz weg.** Zwölf Linien sind bei 45 px zwölf graue Punkte.
- **Aufkleber:** weißer Rand und ein gebackener Schatten — das Forscherbuch
  der App sammelt Aufkleber, und der Globus ist der erste.
- **Stern:** derselbe Zackenstern, den die App für eine geschaffte Ebene
  vergibt. Sein Pfad wird aus `prototyp/spiel.js` **gelesen**, nicht
  abgeschrieben (Regel 6).

Angesehen bei 152, 120, 90, 60, 45 und 32 Punkten. Bis 45 ist es ein Globus
mit einem Stern; bei 32 ein blaugrüner Punkt mit einem gelben Zipfel — das
ist die Größe, in der auf einem iPad kein App-Symbol steht.

### Der Stern lief zuerst aus dem Bild — und kein Tor sagte es

Im ersten Entwurf war der Stern 0,62 der Kugelhöhe groß. Damit reichte er
von 106 bis **−2** auf der senkrechten Achse: er stand oben aus dem Bild
heraus, und die runde iOS-Maske hätte den Rest genommen.

Das Tor `symbol` prüfte die vier Ecken **gegen die Kugelmitte** — und der
Stern ist gelb, also „nicht wie die Mitte". Vier Ecken grün. Gesehen hat es
das Auge.

Geprüft wird jetzt nicht die Farbe, sondern die **Glattheit**: der Grund ist
ein Verlauf und ändert sich von Bildpunkt zu Bildpunkt um Bruchteile. Alles,
was dort sonst noch steht — eine Kontur, ein weißer Aufkleberrand, eine
Sternzacke —, bringt eine Kante mit. Ein- und ausgeschaltet nachgemessen
(Regel 13):

```
Stern 0,30   glatt, größter Sprung ≤ 12    grün auf allen vier Größen
Stern 0,62   Sprung 23 · 51 · 175 · 191    rot auf allen vier Größen
```

Und die erste Fassung dieser Prüfung war noch zu eng: sie kannte nur die
**Ecken**. Der Sternentwurf lief oben aus dem Bild, aber mittig genug, um an
keiner Ecke aufzufallen — und die Gegenprobe meldete prompt „das Tor beweist
an dieser Stelle nichts". Geprüft wird jetzt auch der **Saum**, die
äußersten fünf Prozent an jeder Kante: was dort steht, schneidet der
Bildrand ab, ganz ohne Maske.

Die Gegenprobe dazu steht — und sie hat zwei Anläufe gebraucht. Der erste
griff am Werkzeug an und ließ `npm run symbol` laufen; das rechnet die Küste
aus `roh/` neu, und `roh/` liegt nicht in Git, also gibt es sie in der
Wegwerf-Kopie nicht, in der die Proben arbeiten. Gescheitert ist das
**stumm**: `execFileSync` warf beim Wiederaufbau, niemand fing es, der
Teillauf hinterließ kein Ergebnis, und gemeldet wurde „ein Teillauf hat kein
Ergebnis hinterlassen" — die Folge statt der Ursache. Ein gescheiterter
Wiederaufbau setzt jetzt einen Befund, statt den Arbeiter zu töten. Der
Eingriff sitzt in der SVG, gebaut wird mit dem neuen `npm run symbol:png`:
genau der Schritt, der zwischen Eingriff und Tor liegt.

### Und die README stand auf dem Stand von vier Ebenen

Sie sagte „Erdkunde für Fiona und Lea. Vier Ebenen, 64 Gebiete. Zwei
Profile." Wirklich sind es drei Fächer, elf Ebenen und vier Profile. Sie
nennt jetzt auch, wie man die App auf dem iPad ablegt — in **Safari**, denn
nur dort geht es — und dass der Fortschritt je Gerät getrennt liegt.

`npm run tor` grün in 108,5 s. 207 Gegenproben.

## M4r — die Rückmeldung vom iPhone, und was sie an der Schrifterkennung geändert hat

Der Punkt stand seit Runden als Rang 1 im Backlog: *„eine halbe Stunde mit
dem Gerät in der Hand entscheidet mehr als eine weitere Runde Code."* Jetzt
ist er gefahren.

**Die Spracheingabe hält.** Fiona wird erkannt, die Wörter werden richtig
zugeordnet. Der Nachbau in `vergleich` hat an dieser Stelle nicht gelogen.

**Die Schrifterkennung nicht.** Drei Fälle, alle drei aus echtem Schreiben:
die deutsche **Sieben mit Querstrich**, die **Vier** mit senkrechtem linken
Schenkel (die Vorlage zeigt die Tastaturform), und die **Sechs**, deren
Bogen nicht ganz oben ansetzt.

### Erst nachgestellt, dann geändert

```
                                   vorher                        nachher
7 mit Querstrich, 2 Züge      7   Abstand  7,3  (knapp)     7   Abstand 1,3
7 mit Querstrich, 3 Züge      —   Abstand 12,4  ABGELEHNT   7   Abstand 0,8
4 senkrechter Schenkel        4   Abstand  8,0  Vorspr. 0,1 4   Abstand 0,1
4 senkrecht, einzügig         —   Abstand 14,5  ABGELEHNT   4   Abstand 0,8
6, Bogen 10 % später          6   Abstand  7,0  Vorspr. 1,6 6   Abstand 4,1
6, Bogen 17 % später          0   Abstand 12,1  FALSCH      6   Abstand 7,8
```

Die dritte Zeile von unten ist die schlimmste: die Sechs wurde nicht
abgelehnt, sondern als **Null** gelesen. Ein Kind, das eine richtige Sechs
schreibt und „das ist eine Null" hört, lernt etwas Falsches.

### Drei Ursachen, und keine davon war „zu streng eingestellt"

**Ein Zug zuviel kostete die Hälfte des Budgets.** `STRAFE_ZUGZAHL` stand
auf 5 bei einer Grenze von 10 — zwei Züge Unterschied schlossen ein Zeichen
aus. Die deutsche Sieben war damit nicht zu schreiben, ganz gleich wie
sauber.

**Die Form stand gar nicht im Vorrat.** Jede Ziffer hatte genau eine
Gestalt. Das ist keine Toleranzfrage: **keine Schwelle der Welt macht aus
einer Sieben ohne Querstrich eine mit.** Fehlende Tinte lässt sich nicht
wegmessen, sie muss dastehen.

**Der Punktvergleich verglich stur den i-ten mit dem i-ten Punkt.** Wer
eine Linie richtig zieht, sie aber ein Stück später ansetzt, verschiebt
damit *jedes* Paar. Das war die Sechs.

### Was jetzt dasteht

- **Formenfamilien.** Eine Ziffer trägt eine `zuege`-Form (die wird
  vorgemacht) und beliebig viele `auch`-Formen (die werden nur erkannt).
  Eingetragen: Sieben mit Querstrich (zwei- und dreizügig), Vier mit
  senkrechtem Schenkel, Eins ohne Anstrich und mit Fuß, Neun mit geradem
  Abstrich. Vorgemacht wird immer dieselbe Form — sonst sähe ein Kind beim
  Nachfahren mal die eine, mal die andere.
- **Der Anfang eines Zuges darf rutschen**, bis zu einem Zehntel der
  Punkte, in beide Richtungen. Am Rand wird geklemmt statt weggelassen,
  sonst verglichen große Versätze weniger Punkte und sähen dadurch besser
  aus.
- **`STRAFE_ZUGZAHL` von 5 auf 3.** Die Zugzahl bleibt ein Merkmal — wer
  ein T in einem Zug malt, hat kein T geschrieben —, aber sie entscheidet
  nicht mehr allein.

### Die Zahlen kommen aus dem Raum, nicht aus dem Bauch

Drei Größen, jede durchprobiert, gegen 1040 krumme Buchstaben, 400 krumme
Ziffern, 800 Gekritzel und die sechs Fälle vom Gerät.

**Der erlaubte Versatz** ändert die Gekritzelquote **überhaupt nicht** —
2,8 % bei jedem Wert, auch bei null. Er kostet also nichts und rettet die
Sechs. Bei 10 % ist die Ziffernerkennung sogar besser als bei 16,7 %
(95,0 gegen 94,3 %).

**Der Zugaufschlag** ist der Hebel auf die Gekritzel:

```
Aufschlag   Buchstaben richtig / Gekritzel   Ziffern richtig / Gekritzel
    2            94,6 %  /  0,3 %                 95,0 %  /  2,8 %
    3            93,9 %  /  0,0 %                 95,0 %  /  0,0 %     <- hier
    4            91,7 %  /  0,0 %                 94,8 %  /  0,0 %
    5            83,7 %  /  0,0 %                 90,8 %  /  0,0 %
```

**Die Abstandsgrenze** hat eine Kante, und sie liegt genau zwischen 8 und 9:

```
Grenze   Buchstaben richtig / Gekritzel   Ziffern richtig / Gekritzel
   8          93,9 %  /  0,0 %                 95,0 %  /  0,0 %       <- hier
   9          94,6 %  /  0,3 %                 95,5 %  /  2,8 %
  10          94,7 %  /  4,5 %                 95,8 %  /  8,3 %
```

Ein Punkt mehr Nachsicht kostet 2,8 Prozentpunkte Gekritzel und bringt
einen halben Prozentpunkt Erkennung. Genommen wird die 8.

Das Ergebnis am Tor, gegen den Stand vor der Runde: Buchstaben 94,3 %
richtig (vorher 94,6), **Gekritzel 0,0 % statt bis zu 1 %**, Ziffern 94,5 %
richtig, Gekritzel 0,0 % — und die sechs Formen vom Gerät alle erkannt.

### Was recherchiert und NICHT genommen wurde

Der naheliegende Griff wäre der **$P-Punktwolken-Erkenner** (Vatavu,
Anthony & Wobbrock): eine Geste als *ungeordnete* Punktwolke, Zuordnung
über eine gierige Paarung. Zugzahl, Zugreihenfolge und Schreibrichtung
hören damit **von Bauart her** auf zu zählen — genau die Krankheit.

Er ist gebaut und gemessen worden. Er löst die Sieben glänzend (Abstand
1,2 bei einem Vorsprung von 4,1, zwei- wie dreizügig). Aber er wirft die
Zuginformation weg, und damit rücken **alle** Ziffern zusammen: eine
perfekt getroffene Sechs hat nur noch 2,4 Vorsprung vor der Null statt 9,9.
Gemessen:

```
                        Punktwolke        heutiger Vergleich
4 geschlossen           6 (falsch)        4, Abstand 0,1
6, Bogen 17 % später    6, Vorsprung 0,3  6, Abstand 7,8
Gekritzel               7,0               10,7  — abgelehnt
4 geschlossen           8,0               ^ das Gekritzel lag NÄHER
```

Ein Erkenner, bei dem ein Gekritzel näher liegt als eine echte Ziffer, ist
kein Auffangnetz, sondern ein Loch. Die Punktwolke bleibt deshalb, was das
Backlog unter W-A vorgesehen hat: eine **zweite Stufe** unter der ersten —
und sie kommt erst, wenn echte Züge von Fiona vorliegen, an denen sich ihre
eigene Schwelle messen lässt. N2b bleibt offen, jetzt mit Zahlen.

### Und die sechs Fälle stehen namentlich im Tor

Prozentzahlen können um einen halben Punkt fallen, ohne dass jemand
hinsieht. Ein Fall mit Namen kann das nicht: `schreiben` prüft die sechs
Formen einzeln und nennt sie beim Namen, wenn eine ausfällt. Dazu drei
stehende Gegenproben, eine je Hebel.

Nebenbei ist einer der vier offenen Punkte aus **Q1** gefallen: die
Gegenprobe „die Buchstabenerkennung nimmt alles an" erwartete die Meldung
*„Gekritzeln werden als Buchstabe angenommen"* — das Tor sagt aber
*„als Zeichen"*, weil dieselbe Zeile für Buchstaben und Ziffern gilt. Drei
Wörter, seit P6 offen.

`npm run tor` grün in 107,0 s. 210 Gegenproben.

## M4s/M4z — die Lupe, eine wirre Stimme und ein fehlendes Mikrofon

Drei Meldungen vom Gerät, drei sehr verschiedene Ursachen.

### Die Lupe auf allen Karten (M4z)

*„Teilweise haben wir Länder, die zu klein sind zum Antippen, und man hat
keine Chance, das richtige Land zu treffen oder überhaupt zu sehen, um
welches es sich handelt."*

Die Nadeln (P10) lösen das **Antippen** — sie holen eine Trefferfläche
neben die Karte. Das **Ansehen** lösen sie nicht: wer wissen will, wie El
Salvador aussieht, bekommt 31 Bildpunkte. Dafür gibt es keinen Trick,
sondern nur einen Maßstab.

Gebaut als **eine** Gruppe mit **einer** Transformation. Alles andere —
Treffertest, Nadeln, Haken, Zeiger — rechnet über `getScreenCTM()` und
zieht von allein mit; das ist der Grund, warum die Lupe im Bildbereich
sitzt und nicht in den Daten. Gemessen auf 844 × 390:

```
ganze Karte     Maßstab 1,0×   El Salvador  31 pt   3 von 9 unter 44 pt
dreimal auf +   Maßstab 4,1×   El Salvador 127 pt   0 von 9 unter 44 pt
ganze Karte     Maßstab 1,0×   El Salvador  31 pt   (Rückweg stellt her)
```

Drei Wege hinein, weil drei verschiedene Leute sie brauchen: **zwei
Finger** aufziehen, die **Knöpfe + und −** (für den Schreibtisch, für eine
Maus, und für Fiona, die von einer Geste nicht weiß, dass es sie gibt), und
ein Knopf **„ganze Karte"**, der immer denselben Zustand herstellt. Er
steht nur da, wenn es etwas zurückzunehmen gibt.

**Worauf + zielt**, ist die eigentliche Arbeit gewesen. Auf die Mitte des
Rahmens zu zoomen ist die bequeme Antwort und die falsche: gemessen liegt
die Mitte der Mittelamerikakarte im offenen Meer nördlich von Jamaika,
und dreimal auf + schob das gesuchte Land aus dem Bild. Es zielt jetzt auf
das **gesuchte Gebiet** — außer bei der umgekehrten Frage, wo eine Karte,
die von allein zum Ziel fährt, die Antwort wäre.

Die Lupe **überlebt keine Aufgabe**: der Spielbildschirm wird je Aufgabe
neu gebaut, also fängt jede Frage bei der ganzen Karte an. Eine Karte, die
noch von der letzten Frage auf Kuba steht, während nach Kanada gefragt
wird, sieht kaputt aus.

**Und der Doppeltipp ist wieder ausgebaut.** Er war fertig — zweimal
tippen hinein, noch einmal heraus. Bei der umgekehrten Frage ist ein Tipp
auf die Karte aber die *Antwort*: ein Kind, das zoomen will, hätte mit dem
ersten Tipp geantwortet. Gefunden hat das nicht das Nachdenken, sondern die
Bildabnahme — sie blieb an der Frage hängen, die nicht weiterging.

### Die wirre Stimme (M4s)

Auf einem iPhone XR sprach die App mit *„einer sehr wirren, komischen
Stimme"*. Die Ursache stand in meiner eigenen Liste, mit einer Begründung,
die geraten war:

> *„Die Reihenfolge hier ist keine Rangliste des Klangs, sondern der
> Wahrscheinlichkeit: oben stehen die Namen, unter denen Apple und Google
> ihre hellen, zugewandten Ansagestimmen führen."* — und oben standen
> **`sandy`** und **`shelley`**.

Das sind zwei von **Apples Spaß-Stimmen** aus iOS 17 — absichtlich
übertrieben, teils verzerrt. Auf einem Gerät, das sie hat, greift die App
zuerst danach. Auf dem Entwicklungsrechner gibt es sie nicht; dort fiel es
nie auf.

Jetzt zwei Listen statt einer: die Vorlesestimmen (Anna, Helena, Petra,
Markus, Martin, Viktor …) und eine **Sperrliste** der Spaß- und
Roboterstimmen, nach der die App nie von allein greift — anwählbar bleiben
sie, wer sie mag, darf sie haben. Und unter gleichem Namen gewinnt die
bessere Fassung: „Anna (Premium)" schlägt „Anna".

Geprüft wird das jetzt an einer **erfundenen** Stimmenliste, in der die
falsche Wahl die bequeme wäre: Sandy, Shelley, Grandpa und Jester stehen
vorn, Anna hinten. Wer die Sperre entfernt, bekommt sofort Sandy.

### Das fehlende Mikrofon (M4s)

*„Über Fionas Profil ist das blaue Icon für die Spracheingabe gar nicht
da."*

Kein Fehler im Code — der Sprachmodus stand auf **aus**, und die
Einstellungen liegen **je Gerät** in der Ablage. Auf dem iPhone war er
eingeschaltet, auf dem iPad nie. Und weil ein abgeschalteter Knopf mit
Absicht gar nicht erst erscheint, stand dort einfach nichts: kein Hinweis,
keine Erklärung.

Zwei Änderungen. Der Sprachmodus ist **ab Werk an** — auf Wunsch der
Eltern, die die Frage für ihre Kinder beantwortet haben; der Schalter und
der Hinweis auf die Erkennung außer Haus bleiben. Und die Sprechprobe im
Elternbereich sagt jetzt in drei Zeilen, woran es liegt, wenn kein
Mikrofon da ist: Sprachmodus an oder aus, kann dieser Browser
Spracherkennung, welche Profile dürfen sprechen.

### Was dabei aufgefallen ist, weil das Mikrofon nun überall steht

Der eingeschaltete Sprachmodus hat drei Dinge sichtbar gemacht, die vorher
**kein Tor je gesehen hat** — `passt` hat den Mikrofonknopf auf keiner
einzigen Größe geprüft, weil er ohne Sprachmodus nicht erschien:

- Der atmende Ring am Mikrofon lag **außerhalb** des Knopfes (`inset:-8px`)
  und ragte 5 bis 8 Punkte darüber hinaus. Die Regel steht **zweimal** —
  einmal allgemein, einmal im engen Querformat —, und die erste Reparatur
  half deshalb nicht (Regel 6).
- Auf dem iPad quer ragte der runde „nochmal hören"-Knopf 7 Punkte aus dem
  Fenster: vier Dinge in einer Reihe, die nicht umbrechen durfte.
- „tippen **oder sprechen**" auf der Profilkachel schob Violeta wieder
  7 Punkte in den Bereich des Telefons — dieselbe Stelle wie in A4. Da
  Sprechen jetzt überall gilt, unterscheidet es keine Kachel mehr und steht
  nicht mehr drauf.

Und eine echte Kollision, gefunden von `ziehen`: die Lupenknöpfe liegen
über der Karte, und wer sein Etikett dort ablegt, legt es auf einen Knopf
statt auf ein Land. Von oben traf man nur noch bis 30 statt 40 Punkte.
Solange ein Etikett am Finger hängt, sind die Knöpfe jetzt **taub**.

`npm run tor` grün in 107,9 s. 213 Gegenproben.

## Q1/Q2 — der erste volle Probenlauf seit P6: zweiundzwanzig kaputte Proben

Der Bericht kannte vier. Es waren **zweiundzwanzig** von 213 — und die
größte Einzelursache lag im Probenwerkzeug selbst.

### Der gesunde Vergleichslauf baute nicht

Eine Gegenprobe beweist nur dann etwas, wenn das Tor **ohne** den Eingriff
grün ist. Dieser Vergleichslauf lief in einer frischen Wegwerf-Kopie gegen
ein `dist/`, das es dort nicht gab: `dist/` ist gitignoriert, die Kopie
entsteht aus Git. Ergebnis: *„war schon vorher rot"*, und die Probe bewies
nichts.

**Acht Proben** sind so ausgefallen, alle im Rauchtest, alle mit langen
Laufzeiten. Und es hing an der **Reihenfolge**: sobald irgendeine Probe mit
`bauen:true` durch war, lag ein `dist/` da, und die nächsten
Vergleichsläufe gingen gut. Ein Probenlauf, dessen Ergebnis davon abhängt,
in welcher Reihenfolge die Proben zufällig auf sechs Arbeiter verteilt
wurden, ist kein Beweis — er ist eine Würfelei, die wie ein Beweis
aussieht.

Gebaut wird jetzt einmal je Kopie, vor dem ersten Vergleichslauf. **Nach
der einen Zeile schlugen alle acht an** — und mit ihnen vier weitere, die
aus derselben Wurzel „Eingriff nicht angekommen" gemeldet hatten.

### Der Anker, der ein Verschwinden verlangte, das zweimal dastand

„eine falsche Antwort bleibt stumm" verlangte, dass `klangZu('falsch')`
gefolgt von `if (versuch >= 3)` **verschwindet**. Den Text gibt es zweimal
— im Rechenweg und im Schreibweg —, der Eingriff entfernt eine Stelle, und
die Bedingung konnte nie zutreffen.

Das Tor zählte bisher nur die **Suchtexte** auf Doppelungen; der war hier
eindeutig. Die Doppelung stand allein im **Anker**. Es zählt jetzt beide —
kein weiterer ist doppelt.

### Zwei Zusagen, die die Nadeln (P10) unerreichbar gemacht haben

- **„die umgekehrte Frage kommt auch für Winzlinge"** prüfte die Notbremse
  aus P7: nach einem Gebiet, das der Finger nicht treffen kann, wird nicht
  gefragt. Seit den Nadeln gibt es diesen Fall nicht mehr — gemessen über
  sechs Kartenebenen und zwei Fenstergrößen: **null Fälle**. Die Zusage
  steht jetzt im Tor: `ziehen` meldet einen **Fehler**, wenn ein Gebiet zu
  klein ist und keine Nadel bekommt. Der Fall darf gar nicht entstehen —
  das ist prüfbar, die Notbremse war es nicht.
- **„der Boden verschluckt wieder den Nachbarn"** meldet das Tor seit P10
  unter einem anderen Namen: ohne die Kappung brauchen die engen Fälle
  keine Nadel mehr, fallen an ihren Ort zurück, und ihre **Haken** liegen
  übereinander. Derselbe Befund, andere Stelle. Nachgemessen: mit Eingriff
  „1 Haken liegen aufeinander (LUX/BEL 9,0 pt)", ohne ihn grün.

### Was offen bleibt

Zwei von 213. **„die Buchstabenkarten rutschen wieder zusammen"** — `passt`
bleibt grün, obwohl `--kleber-eng-min` von 56 auf 72 px steht; das ist ein
echtes Loch im Tor. Und **„eine Spalte fehlt in der Profiltabelle"** —
`smoke` wird rot, aber mit einer anderen Meldung; noch nicht untersucht,
welcher Abschnitt stattdessen anschlägt.

### Und die Lehre, die Geld kostet

Vier Runden Pause haben gereicht, damit sich zweiundzwanzig Löcher
ansammeln, von denen der Bericht vier kannte. Der volle Lauf kostet 26
Minuten und gehört **zwischen** zwei Runden — nicht in eine, und nicht
alle vier.

### Eine Ratsche, die wächst, wenn man etwas streicht

Das Tor `doppelt` wurde rot: die eingetragene Dopplung in
`tor/proben-liste.mjs` sei „von 464 auf 637 Token gewachsen". Gewachsen ist
aber nichts — die Liste hat **vorher 213 Zeilen und nachher 213**.

Sie stieg, weil eine Zeile **wegfiel**. „die umgekehrte Frage kommt auch
für Winzlinge" wurde zu einem Kommentar, Kommentare zählt das Tor
absichtlich nicht mit (sonst erzöge es dazu, keine zu schreiben), und die
beiden gleichförmigen Stränge beiderseits rückten im Tokenstrom zu **einem**
zusammen. Nachgemessen am Baum von `b2c65fb`: dieselbe Stelle, 423 Token.

Die Kennzahl misst also die **Länge des längsten gleichförmigen Laufs**,
nicht die **Menge** an Dopplung. An einer Tabelle kann sie deshalb auch
dann wachsen, wenn etwas gestrichen wird. Das steht jetzt in der
Begründung des Eintrags selbst, mit der Anweisung, vor jedem Hochsetzen
zuerst die Zeilenzahl der Liste zu vergleichen — sonst wird aus der Ratsche
ein Gummiband.

## Q3 — der weiche Kartenrand und Grönland

Zwei Schritte aus der Liste: der Ausschnitt Mittelamerika sollte einen
Bezugsrahmen bekommen, und Grönland sollte viertes Ziel Nordamerikas werden.

### Der Bezugsrahmen war schon da — das Problem war ein anderes

Ich hatte vorgeschlagen: „die neun Länder liegen ohne Bezugsrahmen im Bild,
ein angedeuteter Kontinentumriss würde zeigen, wo man ist." Die Aufnahme
sagt etwas anderes. Der Bezugsrahmen ist längst da — Mexiko, die Halbinsel
Yucatán, Florida, Kolumbien stehen grau um die neun Ziele herum.

Was wirklich falsch aussah, ist der **Rand** dieser Umgebung. Die grauen
Nachbarn kommen aus einem Ausschnitt der Weltkarte, und der ist ein Rechteck
in Länge und Breite. Wo dieses Rechteck mitten durch Land geht, endete die
graue Fläche an einer Kante, die keine Küste ist: unten rechts ein Block mit
zwei geraden Seiten, Kolumbien und Venezuela an der Maskenkante abgeschnitten.
Als Karte ist das richtig — dort **hört** der Ausschnitt auf. Als Bild sieht
es aus wie ein Fehler.

Gemessen am gebauten Spiel, Chromium, 844 × 390, nur die Umgebung sichtbar,
Abstand zum hellsten Bildpunkt im äußeren 2-%-Band (0 = Papier, 217 = volles
Grau):

| Karte | vorher | jetzt |
|---|---|---|
| Afrika | 22 | 4 |
| Asien | 4 | 4 |
| Europa | 9 | 4 |
| **Mittelamerika** | **22** | **5** |
| Nordamerika | 22 | 4 |
| Südamerika | 0 | 0 |

Die Umgebung blendet jetzt über die äußeren **zehn Prozent** aus. Zehn und
nicht sechs und nicht vierzehn: bei sechs bleibt die Kante unten rechts
stehen, bei vierzehn verliert Mexiko seine Gestalt — und Mexiko ist der
Anhaltspunkt, an dem ein Kind erkennt, wo es ist. Durchprobiert und
nebeneinandergelegt, nicht geraten.

Drei Sachen, die dabei zu beachten waren:

- **Nur das Graue blendet aus.** Was gefragt wird, behält seine Farbe bis an
  den Rand — sonst wäre ein Ziel am Rahmen blasser als eines in der Mitte,
  und die Karte verriete die Aufgabe.
- **Es liegt in der Lupe**, wandert also beim Zoomen mit. Absicht: die harte
  Kante gibt es nur bei Maßstab 1, wo der Ausschnitt im sichtbaren Feld
  endet. Wer hineinzoomt, schneidet ohnehin mitten durch Länder, und das ist
  ein gewöhnlicher Kartenrand.
- **Zwei Masken hintereinander statt einer mit `mix-blend-mode`.** Blendmodi
  in Masken sind auf iOS nicht verlässlich, und das Zielgerät ist ein iPhone.
  Geschachtelte Masken sind SVG 1.1 und tun es überall.

Ein Tor gab es dafür nicht, also gibt es jetzt eins: `ziehen --nur=rand`
blendet alles außer der Umgebung aus, fotografiert den Kartenkasten und misst
das äußere Band. **Alles außer der Umgebung ausblenden ist nicht Bequemlichkeit,
sondern nötig**: auf der Europakarte reicht Russland in voller Farbe bis an den
Rahmen, und das ist richtig so — die Kontinentgrenze. Ein Tor, das bloß den
dunkelsten Randpunkt misst, meldete dort einen Befund über ein Ziel und hätte
von der Umgebung nie etwas gesehen.

**Was das Tor auf zwei Karten nicht beweist:** Asien und Südamerika messen mit
und ohne Blende dasselbe — ihre Umgebung kommt dem Rahmen gar nicht nahe genug.
Dort ist die Zusage nicht bezeugt, sondern nur nicht verletzt. Die vier anderen
tragen den Beweis. Das steht so im Tor.

### Ein Maskenwert ist keine Farbe

`inhalt` wurde rot: `#fff` in `spiel.js`, „gehört nach marken.css". Es gehört
dort aber gerade **nicht** hin. Eine SVG-Maske rechnet mit Helligkeit: Weiß
heißt „ganz sichtbar", Schwarz „ganz weg". Das ist ein Wert der Technik, keine
Gestaltung — und im Abendmodus darf er sich auf keinen Fall mitändern, während
`marken.css` genau das für alle Farben tut.

Die Regel ist deshalb geschärft statt umgangen: was zwischen `<mask>` und
`</mask>` steht, zählt nicht als Farbe. Die Verläufe der Blende stehen
deswegen **in** der Maske und nicht daneben. Eine Farbe irgendwo sonst im
Markup schlägt weiter an — die stehende Gegenprobe „eine Farbe steht am
System vorbei" fährt genau das und bleibt scharf.

### Grönland

Vierte Zielform auf der Nordamerikakarte. `rang` heißt hier **Lerntiefe**,
nicht Einwohnerzahl — nach Einwohnern wäre Grönland mit 57 000 das letzte Land
der Welt; als Form ist es das einprägsamste auf dieser Karte: riesig, oben
rechts, mit nichts zu verwechseln. Dieselbe Überlegung, die in Europa
Österreich vor die Ukraine gestellt hat.

Auf der **Vier**, nicht auf der Drei: Fiona spielt mit ihrer Tiefe 3 weiter
USA, Mexiko und Kanada — dieselben drei wie gestern. Lea (13) und die Eltern
(17) bekommen Grönland dazu.

Es stand schon auf der Karte, grau, als Umgebung. Neu ist nur, dass danach
gefragt wird: Umriss, Anker und Fläche waren längst da, ein Neubacken der
400 MB Rohdaten war nicht nötig. Die App zählt jetzt 104 Gebiete statt 103.

Bezeugt wird es am **Bild**: die neue Aufnahme `quer-nordamerika` zeigt die
Karte für ein Profil mit Tiefe 17. Fällt der Eintrag weg, fällt Grönland in die
Umgebung zurück, die größte Fläche der Karte wechselt die Farbe, und der
Bildvergleich sieht es. Die Aufnahme läuft mit `kind:'stephan'` — in Fionas
Profil käme Grönland gar nicht vor, und sie bezeugte genau das Neue nicht.

`npm run tor` grün in 122,1 s. 215 Gegenproben, zwei davon neu.

## Q4 — die Töne aus, das Kachelbild frei, und die Wand ist voll

### Die Musik ist aus

Es gibt keine Musik in der App — es gibt **zwei kurze Töne**, einen nach einer
richtigen und einen nach einer falschen Antwort (A2). Die sind gemeint, und die
sind jetzt **ab Werk aus**.

Warum das nicht schon ging: sie hingen am **selben Schalter wie die Sprache**,
mit einer Begründung, die für den Schalter richtig und für die Voreinstellung
falsch war — „wer ,Ton aus' sagt, meint nicht ,nur die Stimme aus'". Fiona liest
noch nicht, sie *braucht* das Vorlesen. Wer die Töne loswerden wollte, musste
ihr also das Vorlesen mit abschalten. **Es gab keine Stellung, in der die App
vorliest und dabei still ist.**

Jetzt gibt es zwei Schalter:

- Der **Lautsprecher in der Kopfzeile** bleibt der große: aus heißt alles aus,
  Stimme wie Töne.
- **„Rückmeldeton"** im Elternbereich ist der kleine darunter und steht ab Werk
  auf aus. Er sitzt dort und nicht in der Kopfzeile: das ist keine Entscheidung,
  die ein Kind mitten in einer Aufgabe treffen soll. Wer ihn einschaltet, hört
  sofort einen Ton als Probe — beim Ausschalten bleibt es still, ein Ton als
  Quittung fürs Abschalten wäre eine Frechheit.

Gelöscht ist nichts: `src/kern/klang.js` steht unverändert da, und der Rauchtest
misst die Töne weiter — er schaltet sie dafür ein. Drei Zustände, alle drei
gemessen:

| | Schwingungen |
|---|---|
| Rückmeldeton an | falsch `330→247`, richtig `660 990` |
| „Ton aus" trotz Rückmeldeton an | 0 |
| **ab Werk, Lautsprecher an** | **0** |

Die dritte Zeile ist die Zusage, um die gebeten wurde, und sie steht und fällt
mit **einem Zeichen in einer Zeile**. Eine Voreinstellung kippt beim nächsten
Umbau lautlos — deshalb misst der Rauchtest sie jetzt mit einer Ablage, die von
Tönen nichts sagt, also genau so, wie ein frisches Gerät steht. Mit stehender
Gegenprobe.

### Das Kachelbild lag unter einem Knopf

Im Stylesheet steht seit R2 die Absicht: „ein Kind, das noch nicht liest,
erkennt Afrika am Bild und nicht am Wort" — und daneben die Lehre, die es einmal
gekostet hat: „ein Wasserzeichen, das man nicht erkennt, ist Dekoration und
keine Auskunft."

**Geprüft hat das niemand.** Gemessen wurde jetzt der Anteil der *Farbe* des
Bildes, der unter etwas liegt, das dort auch wirklich malt:

| | vorher | jetzt |
|---|---|---|
| Afrika | 52 % | 0 % |
| Südamerika | 50 % | 0 % |
| Bundesländer | 44 % | 0 % |
| Hauptstädte | 44 % | 0 % |
| Europa | 43 % | 0 % |
| Asien | 42 % | 0 % |
| Kontinente | 29 % | 0 % |
| Nordamerika | 17 % | 0 % |
| Mittelamerika | 7 % | 0 % |

Darauf lag der **Vorschau-Knopf** (das Auge), 44 Punkte groß, oben rechts in
einer Kachel, die auf dem Zielgerät rund 55 Punkte hoch ist. Am schlimmsten traf
es Afrika und Südamerika: deren Umrisse sind ungefähr quadratisch und haben damit
genau die Form des Knopfes. Das Bild rückt jetzt links an ihm vorbei — eine
Zeile, und die 44 sind die Trefferfläche des Knopfes, keine gewählte Zahl.

**Die Zahl war zweimal falsch, bevor sie stimmte.** Der erste Anlauf zählte jedes
Element im Stapel und meldete „70 bis 100 % verdeckt" — bei einem Bild, das man
auf dem Bildschirm deutlich sieht. Der Grund: Kachelname und Fortschrittsbalken
sind **Kästen über die volle Kachelbreite**, und unter ihrem durchsichtigen Teil
lag jeder Punkt „verdeckt". Der zweite Anlauf zählte jeden Kasten mit, der
*irgendwo* ein Zeichen enthält — damit zählte der Kachelfuß mit, weil der
Aufkleber in ihm sitzt. Erst der dritte fragt, ob dort wirklich etwas malt.
Dreimal dieselbe Falle: **eine Zahl, die Kästen zählt statt Farbe, sagt nichts.**

### Die Kachelwand ist voll

Und die Antwort auf die Frage, die seit A6 offen stand:

| Bildschirm | Kacheln | frei |
|---|---|---|
| Ebenenwahl, 700 × 850 (2 je Reihe) | 9 | **9 px = 0,1 Reihen** |
| Ebenenwahl, iPhone quer (4 je Reihe) | 9 | 50 px = 0,8 Reihen |
| Weltenwahl, iPhone quer | 3 | 55 px = 0,3 Reihen |

**Die zehnte Ebene passt im schmalen Fenster nicht mehr.** Sie bricht keine
Regel, die heute gilt — deshalb ist es ein HINWEIS und kein Fehler —, aber die
nächste Kachel, die eine neue Reihe aufmacht, läuft aus dem Bild. Das steht
jetzt in jedem Lauf, gerechnet in **Kachelreihen** statt in Bildpunkten: „es
sind noch 9 px frei" sagt niemandem etwas, „es passt keine Reihe mehr" schon.

Was dagegen zu tun wäre, ist eine Entscheidung und keine Reparatur: kleinere
Kacheln (das hat `lesbarkeit` schon einmal abgelehnt — bei 200 px Breite fielen
fünf Namen von 4,7 auf 2,33:1), zwei Gruppen statt einer Wand, oder ein
Bildschirm, der scrollt (was für ein Kind die schlechteste ist: es weiß nicht,
dass es weitergeht).

`npm run tor` grün in 126,1 s. 217 Gegenproben, zwei davon neu — die dritte
(„der Ton spielt auch bei abgeschaltetem Ton") gab es schon, sie musste nur
den neuen zweiten Schalter mitnehmen.

## Q5 — wie die Kachelwand wächst

Die Frage war, wie die Wand wachsen soll. Bevor ich etwas umgebaut habe, habe
ich sie **nachgezählt** — Kacheln dazugelegt, bis es aus dem Bild lief:

| | heute | passt | bricht bei |
|---|---|---|---|
| iPhone quer 844 × 390 | 10 | 16 | — |
| Fenster breit 1400 × 900 | 10 | 16 | — |
| **Fenster schmal 700 × 850** | **10** | **10** | **11** |

**Damit ist meine eigene Empfehlung hinfällig.** Ich hatte „zwei Gruppen statt
einer Wand" vorgeschlagen — auf dem **Zielgerät ist gar nichts eng**, dort
stehen vier Kacheln je Reihe und es passen sechs weitere. Eng ist allein das
schmale Schreibtischfenster, und zwar aus genau einem Grund: 700 Punkte reichen
nicht für drei 240er-Spalten, also werden es zwei, und aus zehn Kacheln werden
fünf Reihen. Gruppen hätten dort sogar geschadet — jede Gruppenüberschrift ist
eine Zeile mehr.

Drei schmale Spalten sind hier besser als zwei breite. Ein Fenster unter
780 Punkten bekommt jetzt 200er-Spalten, kleinere Namen und keine Überzeile —
genau wie das kurze Querformat, und aus demselben Grund: bei 200 Punkten
Kachelbreite und dem großen Namen läuft er ins Wasserzeichen, und das hat
`lesbarkeit` schon einmal zerlegt (fünf Namen von 4,7 auf 2,33:1). Mit dem
kleinen Namen bleibt es grün.

| | vorher | jetzt |
|---|---|---|
| Fenster schmal 700 × 850 | Platz für 10 | **Platz für 15** |
| Ebenenwahl, schlechteste Größe | 10 | **12** |

**Die Antwort auf die Frage lautet also: sie wächst noch um drei Ebenen, überall.**
Danach muss etwas anderes passieren — und dann ist es eine Entscheidung mit
Zahlen statt eine Ahnung.

### Die Zahl, die das Gegenteil der Wahrheit sagte

Der erste Anlauf hat den freien Platz durch die Reihenhöhe geteilt und für das
iPhone quer gemeldet: „0,8 Reihen frei — die nächste Kachel passt nicht mehr."
Nachgezählt passten dort noch **sechs**. Der Grund: die Wand sitzt in einem
Kasten, der sich beim Umbrechen zusammenschiebt, eine neue Reihe kostet also
weniger als eine Reihe hoch ist.

Gezählt wird deshalb, indem Kacheln **dazugelegt** werden, bis es herausläuft —
nicht gerechnet. Die Kopien verschwinden hinterher wieder.

### Und ein Hinweis, den niemand zu sehen bekam

`passt` sammelt Hinweise (zu kleine Trefferflächen, jetzt auch die volle Wand)
und hat sie **nur im roten Zweig** ausgegeben — also genau dann nicht, wenn das
Tor grün ist. Ein Hinweis, den man nur sieht, wenn ohnehin etwas kaputt ist, ist
keiner. Sie stehen jetzt in jedem Lauf.

Was sie gleich gemeldet haben: **die Weltenwahl trägt genau drei Kacheln.** Eine
vierte Welt passt auf dem iPhone nicht — womit auch die andere naheliegende Idee
(Erdkunde in zwei Welten teilen) gemessen erledigt ist, bevor sie jemand baut.

`npm run tor` grün in 128,1 s. 218 Gegenproben.

## Q6 — die beiden letzten Proben, die nichts bewiesen

Aus dem Probenlauf blieben zwei übrig, die seit vier Runden im Bericht standen.
Beide hatten dieselbe Form: **das Tor merkt etwas, aber nicht das, was die Probe
zusagt.**

### „die Buchstabenkarten rutschen wieder zusammen"

Der Eingriff setzt `--kleber-eng-min` von 56 auf 72 px zurück. Nachgemessen,
statt den alten Kommentar zu glauben:

| | gesund (56) | krank (72) |
|---|---|---|
| iPhone quer 844 × 390 | 9 Spalten, 88 × 64 | **unverändert** |
| iPhone SE quer 667 × 375 | 9 Spalten, 68 × **59** | 8 Spalten, 77 × **44** |

Zwei Gründe, warum sie nichts bewies, und beide waren nötig:

1. **Sie fuhr die falsche Größe.** Sie stand auf `--teil=0/5`, also iPhone quer
   und Fenster schmal — auf beiden tut der Eingriff *gar nichts*, dort ist genug
   Breite. Er wirkt auf dem **kleinsten** Gerät.
2. **Und selbst dort war er unsichtbar.** Die Karte fällt von 59 auf 44 Punkte.
   Die feste Grenze im Tor lautet „unter 44", und 44 ist nicht unter 44. Ein
   Absturz um fünfzehn Punkte, der genau auf dem letzten erlaubten Wert landet,
   ist für eine absolute Grenze unsichtbar — **Regel 2, wieder einmal.**

Die Ratsche aus Q5 hat deshalb eine zweite Sorte bekommen: neben „wieviele
Kacheln trägt diese Wand" steht jetzt „wie kurz ist die kürzeste Seite der
kleinsten Beispielkarte". Die Datei heißt entsprechend `tor/masse-stand.json`
statt `wand-stand.json` und hält 70 Einträge. Mit dem Eingriff meldet `passt`
jetzt: *„die 26 Beispielkarten sind auf 44 pt geschrumpft (waren 59) — das
Gitter ist zusammengerutscht."*

### „eine Spalte fehlt in der Profiltabelle"

Der Eingriff nimmt Violeta aus der Profiltabelle im Backlog. Der Rauchtest wurde
rot — aber mit `smoke: die Stücke für --teil decken die Abschnitte nicht:
unbekannt durchgang:violeta`, und zwar **bevor irgendetwas lief**.

Der Grund: die Lastverteilung für `--teil` führte vier Zeilen `durchgang:fiona`
bis `durchgang:violeta` — eine **handgepflegte Abschrift** der Profiltabelle.
Fällt Violeta aus der Tabelle, passt die Abschrift nicht mehr, und die
Nachzählung der Stücke bricht ab. Ein **Werkzeugcheck stand vor der Zusage, um
die es geht, und hat sie zugedeckt.**

Die Liste steht dort jetzt nicht mehr; nur noch die gemessenen Dauern je Profil,
und wer fehlt, bekommt den Mittelwert. Die Stücke leiten sich aus der Tabelle
ab — Regel 6, „was zweimal dasteht, veraltet einmal". Mit dem Eingriff meldet
der Rauchtest jetzt beides, was er soll:

- *die App kennt 4 Profile, die Tabelle im Backlog nennt 3 — eine fehlende
  Spalte nimmt jedem Tor ein Profil, ohne dass eines rot wird*
- *4 Löschknöpfe für 3 Profile*

Und nebenbei: wer künftig ein Profil **hinzufügt**, muss die Verteilung nicht
mehr mitpflegen. Sie wächst mit.

`npm run tor` grün in 131,2 s. 218 Gegenproben — und damit steht zum ersten Mal
keine mehr als „beweist nichts" im Bericht.

## Q7 — die Kachelbilder, nachgemessen

Offen war: „ihre Kachelbilder sind zwischen Name und Knopf eingeklemmt — messbar
als Bildbreite je Kachel, noch nicht gemessen." Jetzt gemessen, auf dem
Zielgerät (844 × 390), Anteil der **Farbe**, nicht des Kastens:

| Kachel | gezeichnet | Anteil der Kachel | **unter dem Namen** |
|---|---|---|---|
| **Nordamerika** | 63 × 42 pt | 32 % | **78 %** |
| **Mittelamerika** | 62 × 44 pt | 31 % | **66 %** |
| Bundesländer | 33 × 45 pt | 17 % | 59 % |
| Kontinente | 81 × 43 pt | 41 % | 45 % |
| Hauptstädte | 33 × 45 pt | 17 % | 34 % |
| Südamerika | 25 × 41 pt | 13 % | 10 % |
| Asien | 55 × 42 pt | 28 % | 0 % |
| Europa | 56 × 38 pt | 28 % | 0 % |
| Afrika | 33 × 42 pt | 17 % | 0 % |

Die Vermutung stimmt — **aber nicht so, wie ich sie aufgeschrieben hatte.**
Nordamerika und Mittelamerika sind nicht die *kleinsten* Bilder, sie sind mit
31 und 32 % sogar die zweit- und drittgrößten. Eingeklemmt ist nicht ihre
Breite, sondern ihre **Sicht**: bei Nordamerika liegen 78 % der Farbe unter den
Buchstaben des eigenen Namens.

Und die erste Zahl hätte das nicht gezeigt. Die Bildbreite, nach der ich gefragt
hatte, ist bei genau diesen beiden am größten. Die Frage war falsch gestellt;
gemessen werden musste, was **verdeckt** ist, nicht was breit ist.

Gemessen wird an den **Zeilenkästen der Schrift** (`Range.getClientRects`),
nicht am Kasten des Elements — der `.name`-Kasten läuft über die ganze Kachel,
die Buchstaben tun das nicht. Genau dieser Unterschied hat in Q4 den ersten
Anlauf („70 bis 100 % verdeckt") wertlos gemacht.

### Warum das nicht durch Verschieben zu beheben ist

Die Kachel ist auf dem Zielgerät **197 × 55 Punkte**. Rechts sitzen 44 Punkte
Vorschau-Knopf, links steht „Mittelamerika". Soll das Bild den Namen ganz
freilassen, bleiben ihm rund **15 Punkte Breite** — weniger als ein Daumennagel.
Für einen langen Namen *und* ein Bild ist auf dieser Kachel kein Platz; das ist
Geometrie, keine Einstellung.

Was es ändern würde, ist eine Entscheidung über das Aussehen und keine
Reparatur — deshalb steht es hier und ist nicht gebaut:

- **Das Bild links vor den Namen**, als Zeichen statt als Wasserzeichen. Es wäre
  mit rund 44 Punkten kleiner als heute, aber **ganz** sichtbar. Für ein Kind,
  das nicht liest, ist das vermutlich der bessere Tausch.
- **Höhere Kacheln** auf der Erdkundewahl. Kostet eine Reihe (die Wand trägt
  seit Q5 zwölf bis sechzehn, hat also Luft).
- **So lassen.** Lea und ihr lest den Namen; Fiona erkennt Afrika, Asien, Europa
  und Südamerika am Bild — die liegen bei 0 bis 10 %.

### Was jetzt bewacht ist

`tor/masse-stand.json` hält seit dieser Runde **266 Einträge** statt 70: je
Bildschirm und Kachel die gezeichnete Breite (darf nicht kleiner werden) und der
Anteil unter dem Namen (darf nicht größer werden). Eine feste Grenze wäre hier
falsch — die Zahlen sind, wie sie sind, weil die Kachel so groß ist, wie sie ist.
Verlangen kann man, dass es nicht schlimmer wird.

`npm run tor` grün in 136,9 s. 219 Gegenproben.
