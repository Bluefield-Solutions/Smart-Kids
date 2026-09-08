# Audit A · Das Spiel

Durchgeführt am 08.09.2026 auf v508, am gelieferten Stand, iPhone quer
(844 × 390). Grundlage: die 64 Aufnahmen aus `npm run ansicht`, der
Sitzungsablauf in `prototyp/spiel.js`, und die Frage, die dieses Audit
stellt:

> **Warum sollte ein Kind, das gerade fertig ist, noch einmal anfangen?**

Auf diese Frage hat die App heute keine Antwort. Das ist der Befund, und
alles Weitere hängt daran.

---

## Was heute passiert

Ein Durchgang sieht so aus:

```
Profil wählen → Welt wählen → Ebene wählen → [Einweisung] →
4 bis 8 Fragen → „Geschafft!" + Sterne + Balken → Ende
```

Jede Frage ist gleich viel wert. Jede Runde ist gleich lang. Jede
Belohnung ist dieselbe. Nach der letzten Frage steht ein Bildschirm da,
der **berichtet**, was war — und nichts, was **kommt**.

Das ist ein sauber gebautes Übungsprogramm. Es ist kein Spiel.

---

## Die zwölf Befunde

### S1 · Nichts geht verloren, also ist nichts zu gewinnen

Es gibt keinen Einsatz. Eine falsche Antwort kostet einen Stern, aber der
Stern gehört der Sitzung und ist nach dem Endbildschirm weg. Man kann
nicht scheitern, also kann man auch nicht bestehen.

**Warum das zählt:** Fiona ist sechs. Für sie ist Spannung der ganze
Antrieb — nicht Wissen. Ein Spiel ohne Einsatz ist für sie eine Aufgabe.

### S2 · Die Sitzung hat keinen Bogen

Frage 1 und Frage 8 sind ununterscheidbar: gleiche Schwierigkeit, gleiches
Gewicht, gleiche Anzeige. Es gibt kein Aufwärmen, keine Steigerung, kein
Finale. Die letzte Frage fühlt sich an wie die dritte.

### S3 · Die Serie wird nicht gesehen

Drei richtige Antworten hintereinander sind für ein Kind ein *Erlebnis* —
die App bemerkt es nicht. Sie zählt `glatt` und rechnet daraus am Ende
Sterne. Zwischendurch sagt niemand: „du bist gerade richtig gut."

**Das ist der billigste große Hebel im ganzen Audit.**

### S4 · Das Sammeln hat keine Lücken

> **NACHTRAG (08.09.2026, beim Bauen von N4): dieser Befund war weitgehend
> falsch.** Ich habe die Zahl „2 von 4 gesammelt" in der Kopfzeile gelesen und
> daraus geschlossen, dass es dabei bleibt. Es bleibt nicht dabei: die
> Rechenseite zeigt ein Raster aus kräftigen, blassen und leeren Feldern, die
> Tierseite zeigt graue Plätze, und die Kartenseiten zeigen die ganze Karte
> mit den gesammelten Gebieten in Farbe und dem Rest blass darunter. Das ist
> Q28, und es ist ausdrücklich gegen den Kästen-mit-Fragezeichen-Entwurf
> entschieden worden, weil der „nach Arbeit aussah".
>
> **Was bleibt**, ist eine schmalere Sache: auf den Kartenseiten ist das
> Blasse so blass, dass die Lücke kaum zieht. Das gehört zum Grafikteil
> (G10), nicht hierher.
>
> Der Befund steht hier stehen geblieben, statt gelöscht zu werden: ein Audit,
> das seine Irrtümer wegräumt, sieht hinterher klüger aus, als es war.

### S5 · Es gibt kein Morgen

Kein Tagesziel, keine Serie über Tage, kein Grund, die App am nächsten Tag
zu öffnen. Wer gestern alles richtig hatte, hat heute dieselbe Ausgangslage
wie jemand, der nie gespielt hat.

### S6 · Die vier Welten wissen nichts voneinander

Erdkunde, Rechnen, Schreiben und Englisch stehen nebeneinander wie vier
Programme. Nichts verbindet sie, nichts belohnt es, in zweien zu spielen.

### S7 · Fortschritt ist eine Zahl, kein Ort

„17 ÜBUNGEN · 2/75". Für Lea (8) ist das lesbar, für Fiona (6) bedeutungslos.
Und selbst für Lea sagt es nur, *wieviel*, nie *wo* — es gibt keinen Weg,
auf dem man weiter vorne stünde als gestern.

### S8 · Elf Ebenen liegen gleichzeitig offen

Die Ebenenwahl zeigt alle elf Kacheln von Anfang an, gleich groß und gleich
gewichtet. Nichts sagt „fang hier an", nichts sagt „das kannst du schon",
nichts sagt „das ist neu". Für ein Kind ist das keine Auswahl, sondern eine
Wand.

### S9 · Es gibt keine Überraschung

Jede Runde hat dieselbe Form. Keine Bonusfrage, kein seltener Fund, kein
Ereignis. Was vorhersagbar ist, wird schnell langweilig — und Kinder
langweilen sich schneller als Erwachsene.

### S10 · Der Leitner-Kasten arbeitet unsichtbar

Es gibt eine Wiederholungslogik, und sie ist gut. Aber ein Kind sieht nie,
dass etwas *zurückkommt*, weil es beim letzten Mal daneben lag — und sieht
nie, dass etwas *sitzt*. Ein unsichtbares gutes System ist ein halbes.

### S11 · Zwei Kinder im selben Haus, zwei getrennte Welten

Lea und Fiona spielen dasselbe Spiel auf demselben Gerät und erfahren
nichts voneinander. Geschwister sind der stärkste Antrieb, den dieses
Projekt gratis herumliegen hat.

### S12 · „Weiß ich nicht" ist ein Ausweg ohne Preis — **erledigt (v552)**

Der Knopf ist richtig — ein Kind muss aussteigen dürfen. Aber er kostet
nichts und bringt nichts. Er könnte einen **Tipp** kosten und dafür einen
geben.

Seit v552 hat er zwei Stufen: der erste Druck nimmt falsche Antworten
weg, der zweite löst auf. Gemessen auf dem Rechenschirm: *vier Antworten
→ zwei nach dem Tipp, noch nicht gelöst → gelöst.*

Wieviele weggenommen werden, ist eine Rechnung und kein Entschluss je
Bildschirm: höchstens die Hälfte der falschen, aber nie so viele, dass
keine falsche übrig bleibt. Bei zwei Antworten fällt die erste Stufe
damit ganz aus — „eine wegnehmen" wäre dort die Lösung. Die Regel steht
in `src/kern/tipp.js` und wird ohne Browser an sechs Fällen
nachgerechnet.

Dabei ist der Knopf von neun Stellen auf eine geschrumpft — und ein
alter Befund fiel auf: auf dem **Schreibschirm** trug er als einziger
von neun kein Zeichen. Ausgerechnet dort, wo Fiona schreibt.

---

## Was gut ist und bleiben muss

Damit der Umbau nichts zerstört, was teuer erarbeitet ist:

- **Fiona kann alles ohne Lesen bedienen.** Jeder Knopf trägt ein Zeichen,
  jede Frage wird gesprochen. Das ist die härteste Zusage der App und steht
  unter mehreren Toren.
- **Der Leitner-Kasten** ist inhaltlich richtig und geeicht.
- **Die Berührungsflächen** sind auf dem Zielgerät gemessen.
- **Der Ablauf ist kurz.** Vier bis acht Fragen sind für ein sechsjähriges
  Kind richtig. Wer daraus zwanzig macht, hat das Spiel verschlechtert.
- **Es gibt keine Werbung, keine Käufe, keinen Zwang.** Das bleibt so.

---

## Die Rangfolge

Nach Wirkung je Aufwand, für **diese zwei Kinder** auf **diesem Gerät**:

| | Befund | Wirkung | Aufwand |
|---|---|---|---|
| 1 | S3 Serie sichtbar machen | sehr hoch | klein |
| 2 | ~~S4 Sammeln mit Lücken~~ — war schon da (Q28) | — | — |
| 3 | S5 Tagesziel | hoch | klein |
| 4 | S2 Bogen der Sitzung | hoch | mittel |
| 5 | S7/S8 Weg statt Wand | hoch | groß |
| 6 | ~~S1 Einsatz durch Herzen~~ — verworfen, S1 erledigt die Serie | — | — |
| 7 | S11 Geschwister | mittel | mittel |
| 8 | S9 Überraschung | mittel | klein |
| 9 | S10 Leitner zeigen | mittel | klein |
| 10 | S6 Welten verbinden | mittel | mittel |
| 11 | S12 Tipp gegen Preis | klein | klein |
