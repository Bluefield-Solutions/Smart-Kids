// Die Fakten. Kein Code, nur Daten - bewacht vom Tor `inhalt`.
//
// aussprache[] ist der Korpus fuer den Sprachabgleich: wie Kinder es sagen
// und wie eine Erkennung es hoert. Er waechst mit echten Aufnahmen (M4);
// was hier steht, ist die ERFUNDENE Haelfte - sie dient dem Einstellen,
// nicht dem Beweis (Befund L10).
//
// ablenker[] ist bei Ebene 4 das Eigentliche: fuenf Bundeslaender haben eine
// Hauptstadt, die NICHT ihre groesste Stadt ist. Dort sitzt der Irrtum, den
// fast jeder Erwachsene teilt.

export const STAND = { jahr: 2025, quelle: 'Natural Earth 1:10m / 1:50m, Einwohnerzahlen 2025' };

// Antarktika ist KEIN Kontinent in diesem Spiel - nachgefragt und
// entschieden, nicht vergessen.
//
// Auf der Weltkarte (Natural-Earth-Projektion) wird die Antarktis zu einem
// breiten Band am unteren Rand, das ueber die ganze Kartenbreite laeuft: als
// Umriss unkenntlich, und beim Ziehen kaum vom Kartenrand zu unterscheiden.
// Sie bekam deshalb eine eigene polare Aufsicht - eine zweite Kartenart fuer
// ein einziges Gebiet, und ein Kind, das gerade sechs Umrisse nebeneinander
// gelernt hat, sah bei der siebten ploetzlich die Welt von oben.
//
// Sechs Kontinente, eine Karte. Die polare Aufsicht liegt weiter in
// `tools/backen-antarktika.mjs`, falls sie einmal gebraucht wird.
export const KONTINENTE = [
  { id:'europa', name:'Europa', aliasse:['Europäa'],
    aussprache:['euopa','oiropa','europa','eropa'], runde:1 },
  { id:'afrika', name:'Afrika', aliasse:[],
    aussprache:['afrikaa','afika','affrika'], runde:1 },
  /* „Australien" statt „Australien und Ozeanien" (A5, auf Wunsch).
     Der lange Name war der laengste im ganzen Vorrat: drei Woerter, die
     im Etikett auf zwei Zeilen umbrachen, im Ton zu Ende gehoert werden
     mussten und in der Fahne 240 Punkte breit waren. `Ozeanien` bleibt
     als Alias stehen - wer es sagt oder schreibt, hat weiter recht. */
  { id:'australien', name:'Australien', aliasse:['Australien und Ozeanien','Ozeanien'],
    aussprache:['australjen','austraalien','australiä','aus straßen','australien'], runde:1 },
  { id:'suedamerika', name:'Südamerika', aliasse:['Sued Amerika'],
    aussprache:['süd amerika','suedamerika','südamerka'], runde:1 },
  { id:'nordamerika', name:'Nordamerika', aliasse:['Amerika','Nord Amerika'],
    aussprache:['nord amerika','amerika','nordamerka'], runde:2 },
  { id:'asien', name:'Asien', aliasse:[],
    aussprache:['asjen','aasien','asien'], runde:2 },
];

/* Karten, die kein Kontinent sind.
 *
 * `LAENDER` ist nach KARTEN geordnet, nicht nach Erdteilen - fuenf davon
 * sind Kontinente, einer ist ein Ausschnitt. Der Eintrag hier sagt, aus
 * welchem Kontinent ein Ausschnitt geschnitten ist, und ist der Grund,
 * warum das Tor `inhalt` einen Schluessel wie `mittelamerika` nicht als
 * Tippfehler meldet: es prueft weiter, dass JEDER Schluessel entweder ein
 * Kontinent oder ein hier genannter Ausschnitt ist.
 *
 * Warum es den Ausschnitt gibt: gemessen. Auf dem Zielgeraet sind neun
 * der zwoelf Laender Nordamerikas zwischen 4 und 17 Punkte gross - die
 * Tafel steht in `tools/backen-laender.mjs`. Eine Nebenkarte in der Ecke
 * bringt keines davon ueber die Fingergrenze; nur ein eigener Massstab
 * tut es, und ein eigener Massstab ist eine eigene Karte. */
export const AUSSCHNITTE = { mittelamerika: 'nordamerika',
                             suedosteuropa: 'europa' };

/** Ebene 2. rang 1..5; Fiona sieht 1..3, Lea 1..5. */
export const LAENDER = {
  asien:[
    { a3:'IND', name:'Indien', rang:1, aussprache:['indien','indjen'] },
    { a3:'CHN', name:'China', rang:2, aussprache:['china','kina','schina'] },
    { a3:'IDN', name:'Indonesien', rang:3, aussprache:['indonesien','indonesjen'] },
    { a3:'PAK', name:'Pakistan', rang:4, aussprache:['pakistan','packistan'] },
    { a3:'BGD', name:'Bangladesch', rang:5, aliasse:['Bangladesh'], aussprache:['bangladesch','bangladesh'] },
    { a3:'JPN', name:'Japan', rang:6, aussprache:['japan','jappan'] },
    { a3:'PHL', name:'Philippinen', rang:7, aliasse:['Philippinen'], aussprache:['philippinen','filippinen'] },
    { a3:'VNM', name:'Vietnam', rang:8, aussprache:['vietnam','wietnam'] },
    { a3:'TUR', name:'Türkei', rang:9, aliasse:['Tuerkei'], aussprache:['türkei','tuerkei'] },
    { a3:'IRN', name:'Iran', rang:10, aussprache:['iran','iiran'] },
    { a3:'THA', name:'Thailand', rang:11, aussprache:['thailand','tailand'] },
    { a3:'MMR', name:'Myanmar', rang:12, aliasse:['Birma'], aussprache:['myanmar','birma'] },
    /* --- I3: die Welt wird groesser (Inhalt-Audit) -------------------
     *
     * Die Umrisse dieser Laender liegen seit je gebacken in `src/geo/` -
     * gezeichnet wird der ganze Kontinent, gefragt wurde nur, was hier
     * einen Namen hat. Gemessen: 200 Umrisse ohne Namen, davon rund
     * hundert echte Staaten.
     *
     * Ein neues Land kostet damit einen Namen, einen Rang und eine
     * Aussprache - keine Rohdaten (die 79 MB Natural Earth liegen nicht
     * im Verzeichnis) und keine Kartenarbeit. `prototyp/bauen.mjs` sagt
     * es selbst: „Was gespielt wird, entscheidet `erdkunde.js` - hier und
     * nirgends sonst."
     *
     * Der RANG ist die Reihenfolge der Leiter (I2), und er folgt der
     * Einwohnerzahl wie bei den ersten. Wer anfaengt, bekommt die
     * Laender, die ein Kind ohnehin schon einmal gehoert hat.
     *
     * KEINE FLAGGE, KEINE HAUPTSTADT. Beides haengt nicht am Namen: die
     * Flaggen werden in `flaggen.js` gezeichnet (`hatFlagge` siebt), die
     * Hauptstaedte kommen fuer Europa gebacken aus Natural Earth und
     * fehlen den Neuen. Beide Ebenen ueberspringen sie deshalb still -
     * und das ist richtig so, bis jemand sie zeichnet. */
    { a3:'KOR', name:'Südkorea', rang:13, aliasse:['Korea','Republik Korea','Suedkorea'],
      aussprache:['südkorea','suedkorea','korea'] },
    { a3:'IRQ', name:'Irak', rang:14, aussprache:['irak','irack'] },
    { a3:'AFG', name:'Afghanistan', rang:15, aussprache:['afghanistan','afganistan'] },
    { a3:'SAU', name:'Saudi-Arabien', rang:16, aliasse:['Saudi Arabien','Saudiarabien'],
      aussprache:['saudi-arabien','saudi arabien'] },
    { a3:'UZB', name:'Usbekistan', rang:17, aliasse:['Uzbekistan'],
      aussprache:['usbekistan','uzbekistan'] },
    { a3:'YEM', name:'Jemen', rang:18, aliasse:['Yemen'], aussprache:['jemen','yemen'] },
    { a3:'MYS', name:'Malaysia', rang:19, aussprache:['malaysia','malaisia'] },
    { a3:'NPL', name:'Nepal', rang:20, aussprache:['nepal','neppal'] },
    { a3:'PRK', name:'Nordkorea', rang:21, aussprache:['nordkorea','nord korea'] },
    { a3:'SYR', name:'Syrien', rang:22, aussprache:['syrien','sürien'] },
    { a3:'LKA', name:'Sri Lanka', rang:23, aliasse:['Srilanka'],
      aussprache:['sri lanka','srilanka'] },
    { a3:'KAZ', name:'Kasachstan', rang:24, aliasse:['Kazachstan'],
      aussprache:['kasachstan','kazachstan'] },
    { a3:'KHM', name:'Kambodscha', rang:25, aussprache:['kambodscha','kambodja'] },
    { a3:'JOR', name:'Jordanien', rang:26, aussprache:['jordanien','jordanjen'] },
    { a3:'AZE', name:'Aserbaidschan', rang:27, aliasse:['Aserbaidschaan'],
      aussprache:['aserbaidschan','aserbeidschan'] },
    { a3:'TJK', name:'Tadschikistan', rang:28, aliasse:['Tadschikistaan'],
      aussprache:['tadschikistan','tadjikistan'] },
    { a3:'ISR', name:'Israel', rang:29, aussprache:['israel','israell'] },
    { a3:'ARE', name:'Vereinigte Arabische Emirate', rang:30,
      aliasse:['Emirate','VAE'],
      aussprache:['vereinigte arabische emirate','emirate'] },
  ],
  afrika:[
    { a3:'NGA', name:'Nigeria', rang:1, aussprache:['nigeria','nigeeria'] },
    { a3:'ETH', name:'Äthiopien', rang:2, aliasse:['Aethiopien'], aussprache:['ätiopien','etiopien'] },
    { a3:'EGY', name:'Ägypten', rang:3, aliasse:['Aegypten'], aussprache:['ägüpten','egypten','ägypten'] },
    { a3:'COD', name:'DR Kongo', rang:4, aliasse:['Kongo','Demokratische Republik Kongo'], aussprache:['kongo','de er kongo'] },
    { a3:'TZA', name:'Tansania', rang:5, aliasse:['Tanzania'], aussprache:['tansania','tanzania'] },
    { a3:'ZAF', name:'Südafrika', rang:6, aliasse:['Suedafrika'], aussprache:['südafrika','suedafrika'] },
    { a3:'KEN', name:'Kenia', rang:7, aliasse:['Kenya'], aussprache:['kenia','kenya'] },
    { a3:'UGA', name:'Uganda', rang:8, aussprache:['uganda','ugandaa'] },
    { a3:'DZA', name:'Algerien', rang:9, aussprache:['algerien','algerjen'] },
    { a3:'SDN', name:'Sudan', rang:10, aussprache:['sudan','suudan'] },
    { a3:'MAR', name:'Marokko', rang:11, aliasse:['Marocco'], aussprache:['marokko','marocco'] },
    { a3:'AGO', name:'Angola', rang:12, aussprache:['angola','anggola'] },
    /* --- I3: die Welt wird groesser (Inhalt-Audit) -------------------
     *
     * Die Umrisse dieser Laender liegen seit je gebacken in `src/geo/` -
     * gezeichnet wird der ganze Kontinent, gefragt wurde nur, was hier
     * einen Namen hat. Gemessen: 200 Umrisse ohne Namen, davon rund
     * hundert echte Staaten.
     *
     * Ein neues Land kostet damit einen Namen, einen Rang und eine
     * Aussprache - keine Rohdaten (die 79 MB Natural Earth liegen nicht
     * im Verzeichnis) und keine Kartenarbeit. `prototyp/bauen.mjs` sagt
     * es selbst: „Was gespielt wird, entscheidet `erdkunde.js` - hier und
     * nirgends sonst."
     *
     * Der RANG ist die Reihenfolge der Leiter (I2), und er folgt der
     * Einwohnerzahl wie bei den ersten. Wer anfaengt, bekommt die
     * Laender, die ein Kind ohnehin schon einmal gehoert hat.
     *
     * KEINE FLAGGE, KEINE HAUPTSTADT. Beides haengt nicht am Namen: die
     * Flaggen werden in `flaggen.js` gezeichnet (`hatFlagge` siebt), die
     * Hauptstaedte kommen fuer Europa gebacken aus Natural Earth und
     * fehlen den Neuen. Beide Ebenen ueberspringen sie deshalb still -
     * und das ist richtig so, bis jemand sie zeichnet. */
    { a3:'GHA', name:'Ghana', rang:13, aussprache:['ghana','gana'] },
    { a3:'MOZ', name:'Mosambik', rang:14, aliasse:['Mozambik'],
      aussprache:['mosambik','mozambik'] },
    { a3:'MDG', name:'Madagaskar', rang:15, aliasse:['Madagascar'],
      aussprache:['madagaskar','madagascar'] },
    { a3:'CIV', name:'Elfenbeinküste', rang:16, aliasse:['Elfenbeinkueste'],
      aussprache:['elfenbeinküste','elfenbeinkueste'] },
    { a3:'CMR', name:'Kamerun', rang:17, aussprache:['kamerun','kammerun'] },
    { a3:'NER', name:'Niger', rang:18, aussprache:['niger','nieger'] },
    { a3:'MLI', name:'Mali', rang:19, aussprache:['mali','malli'] },
    { a3:'BFA', name:'Burkina Faso', rang:20, aliasse:['Burkinafaso'],
      aussprache:['burkina faso','burkinafaso'] },
    { a3:'MWI', name:'Malawi', rang:21, aussprache:['malawi','malawii'] },
    { a3:'ZMB', name:'Sambia', rang:22, aliasse:['Zambia'],
      aussprache:['sambia','zambia'] },
    { a3:'TCD', name:'Tschad', rang:23, aliasse:['Chad'],
      aussprache:['tschad','tschadd'] },
    { a3:'SOM', name:'Somalia', rang:24, aussprache:['somalia','somalja'] },
    { a3:'SEN', name:'Senegal', rang:25, aussprache:['senegal','senegall'] },
    { a3:'ZWE', name:'Simbabwe', rang:26, aliasse:['Zimbabwe'],
      aussprache:['simbabwe','zimbabwe'] },
    { a3:'GIN', name:'Guinea', rang:27, aussprache:['guinea','ginea'] },
    { a3:'RWA', name:'Ruanda', rang:28, aliasse:['Rwanda'],
      aussprache:['ruanda','rwanda'] },
    { a3:'BEN', name:'Benin', rang:29, aussprache:['benin','bennin'] },
    { a3:'TUN', name:'Tunesien', rang:30, aussprache:['tunesien','tunesjen'] },
  ],
  /* Europa: Deutschland und dann SEINE NACHBARN.
   *
   * `rang` ist keine Rangliste, sondern eine Lerntiefe: ein Profil spielt
   * `rang <= laenderTiefe`. Bis D2c war die Reihenfolge die
   * Einwohnerzahl, und fuenf der neun Nachbarn Deutschlands kamen ueber-
   * haupt nicht vor - Daenemark, Luxemburg, die Schweiz, Oesterreich und
   * Tschechien. Fuer ein Kind in Deutschland ist das die falsche
   * Reihenfolge: die Ukraine ist groesser als Oesterreich, aber
   * Oesterreich ist nebenan.
   *
   * Deshalb stehen auf 4 bis 12 GENAU die neun Nachbarn, nach
   * Einwohnerzahl geordnet. Davor die drei, die schon vorher zuerst kamen
   * (Russland, Deutschland, Vereinigtes Koenigreich) - sie bleiben, wo
   * sie waren, damit Fiona mit ihrer Tiefe 3 dieselben drei behaelt wie
   * gestern. Dahinter der Rest, ebenfalls nach Einwohnerzahl.
   *
   * Niemand verliert etwas: Lea steht jetzt auf 13 statt 5 und hat damit
   * alles, was sie hatte (Italien ist die 13), plus die neun Nachbarn.
   *
   * HAUPTSTAEDTE: die fuenf Neuen haben keine. Sie werden in
   * `tools/backen-laender.mjs` nur fuer Laender mit `rang` gebacken, und
   * ihre Lage kommt aus den Natural-Earth-Rohdaten - 400 MB, die zum
   * Bauen und Spielen niemand braucht. Ein `npm run backen` mit den
   * Rohdaten traegt sie nach; bis dahin fehlen die fuenf auf der Ebene
   * „Hauptstaedte in Europa" und stehen nur auf der Laenderebene. Das ist
   * kein Zufall, sondern haengt an einer Zeile: `if (!stueck.rang)
   * continue;`. */
  europa:[
    { a3:'RUS', name:'Russland', rang:1, aussprache:['russland','ruslant'],
      satz:'So groß, dass es auf zwei Kontinente passt.' },
    { a3:'DEU', name:'Deutschland', rang:2, aussprache:['deutschland','doitschland'] },
    { a3:'GBR', name:'Vereinigtes Königreich', rang:3, aliasse:['England','Großbritannien','Britannien'],
      aussprache:['england','großbritannien','vereinigtes königreich'],
      /* `wovon` ist die Praepositionalform fuer die Hauptstadtfrage.
       *
       * Die meisten Laendernamen sind im Deutschen artikellos - „die
       * Hauptstadt von Polen" stimmt einfach. Vier nicht, und der erste
       * Anlauf fragte prompt nach der „Hauptstadt von Vereinigtes
       * Koenigreich". Deshalb steht die Form dort, wo sie eine
       * Eigenschaft des Landes ist, und nur bei den vieren; ueberall
       * sonst wird sie aus dem Namen abgeleitet. */
      wovon:'vom Vereinigten Königreich' },
    /* --- Die neun Nachbarn, nach Einwohnerzahl (D2c) ----------------- *
     *
     * `nachbarDE` steht an den Laendern selbst, nicht als Liste von
     * Kennungen im Abzeichenmodul: dieselbe Regel wie `stadtstaat` bei
     * den Bundeslaendern. Wer ein zehntes Nachbarland eintraegt, setzt
     * die Fahne - und das Abzeichen zaehlt von allein weiter. */
    { a3:'FRA', name:'Frankreich', rang:4, nachbarDE:true, aussprache:['frankreich','frangreich'] },
    { a3:'POL', name:'Polen', rang:5, nachbarDE:true, aussprache:['polen','pohlen'] },
    { a3:'NLD', name:'Niederlande', rang:6, nachbarDE:true, aliasse:['Holland'], aussprache:['niederlande','holland'],
      wovon:'von den Niederlanden' },
    { a3:'BEL', name:'Belgien', rang:7, nachbarDE:true, aussprache:['belgien','belgjen'] },
    { a3:'CZE', name:'Tschechien', rang:8, nachbarDE:true, aliasse:['Tschechische Republik','Tschechei'],
      aussprache:['tschechien','tschechjen','tschechei'] },
    { a3:'AUT', name:'Österreich', rang:9, nachbarDE:true, aliasse:['Oesterreich'],
      aussprache:['österreich','oesterreich','östereich'] },
    { a3:'CHE', name:'Schweiz', rang:10, nachbarDE:true, aliasse:['Die Schweiz'],
      aussprache:['schweiz','die schweiz','schwaiz'],
      wovon:'von der Schweiz' },
    { a3:'DNK', name:'Dänemark', rang:11, nachbarDE:true, aliasse:['Daenemark'],
      aussprache:['dänemark','daenemark','dehnemark'] },
    { a3:'LUX', name:'Luxemburg', rang:12, nachbarDE:true, aliasse:[],
      aussprache:['luxemburg','luxemburch','luxenburg'] },
    /* --- Und der Rest, ebenfalls nach Einwohnerzahl ------------------ */
    { a3:'ITA', name:'Italien', rang:13, aussprache:['italien','italjen'] },
    { a3:'ESP', name:'Spanien', rang:14, aussprache:['spanien','spanjen'] },
    { a3:'UKR', name:'Ukraine', rang:15, aussprache:['ukraine','ukrajine'],
      wovon:'von der Ukraine' },
    { a3:'ROU', name:'Rumänien', rang:16, aliasse:['Rumaenien'], aussprache:['rumänien','rumaenien'] },
    { a3:'GRC', name:'Griechenland', rang:17, aussprache:['griechenland','griechnland'] },
    /* --- I3: die Welt wird groesser (Inhalt-Audit) -------------------
     *
     * Die Umrisse dieser Laender liegen seit je gebacken in `src/geo/` -
     * gezeichnet wird der ganze Kontinent, gefragt wurde nur, was hier
     * einen Namen hat. Gemessen: 200 Umrisse ohne Namen, davon rund
     * hundert echte Staaten.
     *
     * Ein neues Land kostet damit einen Namen, einen Rang und eine
     * Aussprache - keine Rohdaten (die 79 MB Natural Earth liegen nicht
     * im Verzeichnis) und keine Kartenarbeit. `prototyp/bauen.mjs` sagt
     * es selbst: „Was gespielt wird, entscheidet `erdkunde.js` - hier und
     * nirgends sonst."
     *
     * Der RANG ist die Reihenfolge der Leiter (I2), und er folgt der
     * Einwohnerzahl wie bei den ersten. Wer anfaengt, bekommt die
     * Laender, die ein Kind ohnehin schon einmal gehoert hat.
     *
     * KEINE FLAGGE, KEINE HAUPTSTADT. Beides haengt nicht am Namen: die
     * Flaggen werden in `flaggen.js` gezeichnet (`hatFlagge` siebt), die
     * Hauptstaedte kommen fuer Europa gebacken aus Natural Earth und
     * fehlen den Neuen. Beide Ebenen ueberspringen sie deshalb still -
     * und das ist richtig so, bis jemand sie zeichnet. */
    { a3:'PRT', name:'Portugal', rang:18, aussprache:['portugal','portugall'] },
    { a3:'SWE', name:'Schweden', rang:19, aussprache:['schweden','sweden'] },
    { a3:'HUN', name:'Ungarn', rang:20, aussprache:['ungarn','ungaren'] },
    { a3:'BLR', name:'Belarus', rang:21, aliasse:['Weißrussland','Weissrussland'],
      aussprache:['belarus','weißrussland','weissrussland'] },
    { a3:'BGR', name:'Bulgarien', rang:22, aussprache:['bulgarien','bulgarjen'] },
    { a3:'FIN', name:'Finnland', rang:23, aussprache:['finnland','finland'] },
    { a3:'NOR', name:'Norwegen', rang:24, aussprache:['norwegen','norweegen'] },
    { a3:'IRL', name:'Irland', rang:25, aussprache:['irland','irrland'] },
    { a3:'ISL', name:'Island', rang:26, aussprache:['island','iesland'] },
    /* Die drei baltischen (I11).
     *
     * Sie standen bei I3 mit auf der Streichliste der zehn kleinsten und
     * sind es NICHT: gemessen an ihrer Ausdehnung auf der Europakarte
     * liegen sie zwischen Kroatien und Bulgarien, nicht bei Slowenien.
     * Zurueckgestellt wurden sie damals im Paket - `ziehen` meldete
     * Griechenland und das Paar Ungarn/Slowakei, und die zehn fielen
     * gemeinsam, ohne dass jemand nachgesehen haette, welche davon
     * schuld waren.
     *
     * Ihre Sätze standen seither geschrieben und wurden nicht gespielt.
     * Was `ziehen` jetzt dazu sagt, steht im Kommentar bei
     * `suedosteuropa`. */
    { a3:'LTU', name:'Litauen', rang:27, aussprache:['litauen','littauen'] },
    { a3:'LVA', name:'Lettland', rang:28, aussprache:['lettland','letland'] },
    { a3:'EST', name:'Estland', rang:29, aussprache:['estland','esstland'] },
  ],
  /* --- Nordamerika: die drei grossen ------------------------------ *
   *
   * Bis A6 standen hier zwoelf Laender, und neun davon waren auf dem
   * Zielgeraet nicht zu treffen: auf 362 x 288 Punkten ist El Salvador
   * 4,1 Punkte gross, Haiti 4,6, Kuba 16,9. Sieben von ihnen hingen an
   * einer Nadel neben der Karte, mit Faeden bis zu 134 Punkten Laenge -
   * ein Faecher unter Mittelamerika, in dem nicht mehr zu sehen war,
   * welcher Faden zu welchem Land gehoert.
   *
   * Sie stehen jetzt auf einer eigenen Karte (`mittelamerika`), und zwar
   * nicht, weil das huebscher waere, sondern weil es gemessen die einzige
   * Form ist, die reicht: die Tafel in `tools/backen-laender.mjs` zeigt,
   * dass eine Nebenkarte in der Ecke KEIN einziges der neun ueber die
   * Schwelle bringt. Wer eine eigene Karte braucht, braucht eine eigene
   * Ebene.
   *
   * Gezeichnet werden sie hier weiter - als Umgebung, grau, wie jedes
   * Land ohne Rang. Die Nordamerikakarte bleibt vollstaendig (G8), nur
   * gefragt wird nach ihnen woanders. */
  nordamerika:[
    { a3:'USA', name:'USA', rang:1, aliasse:['Vereinigte Staaten','Amerika'], aussprache:['u es a','usa','amerika'] },
    { a3:'MEX', name:'Mexiko', rang:2, aliasse:['Mexico'], aussprache:['mexiko','mexico'] },
    { a3:'CAN', name:'Kanada', rang:3, aliasse:['Canada'], aussprache:['kanada','canada'] },
    /* Groenland als viertes - und `rang` heisst hier Lerntiefe, nicht
     * Einwohnerzahl (siehe oben bei Europa). Nach Einwohnern waere
     * Groenland mit 57 000 das letzte Land der Welt; als FORM ist es das
     * einprägsamste auf dieser Karte: riesig, weiss, oben rechts, mit
     * nichts zu verwechseln. Genau dieselbe Ueberlegung, die in Europa
     * Oesterreich vor die Ukraine gestellt hat.
     *
     * Auf der Vier, nicht auf der Drei: Fiona spielt mit ihrer Tiefe 3
     * weiter USA, Mexiko und Kanada - dieselben drei wie gestern. Lea
     * (13) und die Eltern (17) bekommen Groenland dazu.
     *
     * Es stand schon auf der Karte, grau, als Umgebung. Neu ist nur, dass
     * danach gefragt wird - Umriss, Anker und Flaeche waren laengst da. */
    { a3:'GRL', name:'Grönland', rang:4, aliasse:['Groenland','Greenland'],
      aussprache:['grönland','groenland','grünland'] },
  ],
  /* --- Mittelamerika und die Karibik ------------------------------ *
   *
   * Dieselben neun Laender, dieselbe Reihenfolge nach Einwohnerzahl -
   * nur der Rang faengt wieder bei eins an, weil `laenderTiefe` je Profil
   * von oben zaehlt. Fiona (Tiefe 3) uebt Guatemala, Haiti und Kuba, Lea
   * und die Eltern alle neun.
   *
   * Der Name der Ebene sagt „Mittelamerika" und meint es im Schulsinn:
   * die Landbruecke UND die grossen Antillen. So haelt es der Diercke,
   * und so passt es in eine Kachelzeile. */
  mittelamerika:[
    { a3:'GTM', name:'Guatemala', rang:1, aussprache:['guatemala','gwatemala'] },
    { a3:'HTI', name:'Haiti', rang:2, aussprache:['haiti','haitii'] },
    { a3:'CUB', name:'Kuba', rang:3, aliasse:['Cuba'], aussprache:['kuba','cuba'] },
    { a3:'DOM', name:'Dominikanische Republik', rang:4, aliasse:['Dominikanische Rep.'], aussprache:['dominikanische republik','dominikanische rep'] },
    { a3:'HND', name:'Honduras', rang:5, aussprache:['honduras','hondurass'] },
    { a3:'NIC', name:'Nicaragua', rang:6, aliasse:['Nikaragua'], aussprache:['nicaragua','nikaragua'] },
    { a3:'SLV', name:'El Salvador', rang:7, aliasse:['Salvador'], aussprache:['el salvador','salvador'] },
    { a3:'CRI', name:'Costa Rica', rang:8, aliasse:['Kostarika'], aussprache:['costa rica','kostarika'] },
    { a3:'PAN', name:'Panama', rang:9, aussprache:['panama','pannama'] },
  ],
  /* --- Suedosteuropa: der zweite Ausschnitt ------------------------ *
   *
   * Derselbe Ausweg wie bei Mittelamerika, aus demselben gemessenen
   * Grund. Bei I3 sollten neunzehn europaeische Laender dazukommen;
   * `ziehen` hat es abgewiesen: Griechenland fiel mit 18,1 Punkten unter
   * die Fingergrenze, und die Nadelkoepfe von Ungarn und der Slowakei
   * lagen 12,3 Punkte auseinander. Europas Karte traegt auf 844 x 390
   * keine sechsunddreissig antippbaren Laender - das ist kein Fehler der
   * Daten, sondern die Groesse des Bildschirms.
   *
   * Sieben davon liegen dicht beieinander (13 bis 23 Grad Ost, 39 bis 50
   * Grad Nord) und ergeben eine fast quadratische Karte. Auf ihr hat
   * jedes von ihnen den Massstab, den es auf der Europakarte nicht
   * bekommen kann.
   *
   * Warum der Name „Suedosteuropa" und nicht „Balkan": die Slowakei und
   * Slowenien liegen nicht auf der Balkanhalbinsel. Ein Kartenname, der
   * zwei seiner sieben Laender ausschliesst, ist falsch, auch wenn er
   * kuerzer ist.
   *
   * Der Rang faengt wieder bei eins an - wie bei Mittelamerika, weil
   * `laenderTiefe` je Profil von oben zaehlt. */
  suedosteuropa:[
    { a3:'SRB', name:'Serbien', rang:1, aussprache:['serbien','serbjen'] },
    { a3:'SVK', name:'Slowakei', rang:2, aliasse:['Die Slowakei'],
      aussprache:['slowakei','slovakei'] },
    { a3:'HRV', name:'Kroatien', rang:3, aussprache:['kroatien','kroazien'] },
    { a3:'BIH', name:'Bosnien und Herzegowina', rang:4,
      aliasse:['Bosnien','Bosnien-Herzegowina'],
      aussprache:['bosnien und herzegowina','bosnien','bosnien herzegowina'] },
    { a3:'ALB', name:'Albanien', rang:5, aussprache:['albanien','albanjen'] },
    { a3:'SVN', name:'Slowenien', rang:6, aussprache:['slowenien','slovenien'] },
    { a3:'MKD', name:'Nordmazedonien', rang:7, aliasse:['Mazedonien'],
      aussprache:['nordmazedonien','mazedonien'] },
  ],
  /* --- Ozeanien: drei, und mehr geht nicht ------------------------ *
   *
   * Gemessen an den Rohdaten (Natural Earth 1:10m, Flaeche in
   * Quadratgrad) - und zwar ZWEIMAL, denn die Gesamtflaeche eines
   * Inselstaats sagt nichts darueber, was ein Kind auf der Karte sieht:
   *
   *                     ganzes Land   groesste Insel   Teile
   *   Australien              695,9           686,4       94
   *   Papua-Neuguinea          38,0            32,7       58
   *   Neuseeland               29,1            16,9       26
   *   -------------------------------------------------------- Abbruch
   *   Salomonen                 2,2             0,44      48
   *   Neukaledonien             1,6             1,44      11
   *   Fidschi                   1,6             0,93      44
   *   Vanuatu                   1,0             0,34      27
   *
   * Der Massstab dafuer steht in der App selbst: das kleinste Ziel, das
   * es heute gibt, ist El Salvador mit 1,71 - AN EINEM STUECK. Jamaika
   * mit 0,94 ist schon keines. Von den vier Kandidaten kaeme allein
   * Neukaledonien in die Naehe (Grande Terre, 1,44), und das ist ein
   * franzoesisches Ueberseegebiet, kein Land, nach dem eine Achtjaehrige
   * gefragt wird. Die anderen drei sind keine Insel, sondern ein Schwarm:
   * die Salomonen liegen in 48 Stuecken, deren groesstes ein Viertel von
   * El Salvador misst.
   *
   * Eine EIGENE Karte fuer die vier waere geometrisch moeglich - sie
   * liegen dicht beieinander (156 bis 180 Grad Ost, 7 bis 23 Grad Sued),
   * derselbe Ausweg, den Mittelamerika genommen hat. Das ist der Grund
   * NICHT: gegen sie spricht, was auf ihr zu sehen waere, und dass es
   * vier Namen sind, die in keinem Erdkundeheft dieser Kinder stehen.
   *
   * Also drei. Das ist die kuerzeste Sitzung der App, und `spielprobe`
   * misst seit Q12, dass daraus genau drei Aufgaben werden - gedeckelt,
   * nicht mit Wiederholungen aufgefuellt. Drei treffbare sind besser als
   * sieben, von denen vier ein Punkt sind. */
  australien:[
    { a3:'AUS', name:'Australien', rang:1, aussprache:['australien','austraalien'] },
    { a3:'PNG', name:'Papua-Neuguinea', rang:2, aliasse:['Papua Neuguinea','Neuguinea'],
      aussprache:['papua-neuguinea','papua neuguinea','neuguinea'] },
    { a3:'NZL', name:'Neuseeland', rang:3, aliasse:['New Zealand'],
      aussprache:['neuseeland','neuseland'] },
  ],
  suedamerika:[
    { a3:'BRA', name:'Brasilien', rang:1, aussprache:['brasilien','brasiljen'] },
    { a3:'COL', name:'Kolumbien', rang:2, aliasse:['Colombia'], aussprache:['kolumbien','kolumbjen'] },
    { a3:'ARG', name:'Argentinien', rang:3, aussprache:['argentinien','argentinjen'] },
    { a3:'PER', name:'Peru', rang:4, aussprache:['peru','perru'] },
    { a3:'VEN', name:'Venezuela', rang:5, aussprache:['venezuela','wenezuela'] },
    { a3:'CHL', name:'Chile', rang:6, aussprache:['chile','schile'] },
    { a3:'ECU', name:'Ecuador', rang:7, aliasse:['Equador'], aussprache:['ecuador','equador'] },
    { a3:'BOL', name:'Bolivien', rang:8, aussprache:['bolivien','bolivjen'] },
    { a3:'PRY', name:'Paraguay', rang:9, aussprache:['paraguay','paragwai'] },
    { a3:'URY', name:'Uruguay', rang:10, aussprache:['uruguay','urugwai'] },
    { a3:'GUY', name:'Guyana', rang:11, aussprache:['guyana','gujana'] },
    { a3:'SUR', name:'Suriname', rang:12, aliasse:['Surinam'], aussprache:['suriname','surinam'] },
  ],
};

/**
 * Ebene 4. Die fuenf Faellen, bei denen die Hauptstadt NICHT die groesste
 * Stadt ist - dort sitzt der Lernwert. Ein Ablenker, auf den niemand
 * hereinfaellt, ist keiner.
 */
export const HAUPTSTADT_ABLENKER = {
  'DE-HE':['Frankfurt am Main','Kassel'],
  'DE-NW':['Köln','Dortmund'],
  'DE-SN':['Leipzig','Chemnitz'],
  'DE-ST':['Halle (Saale)','Dessau'],
  'DE-MV':['Rostock','Stralsund'],
  'DE-BW':['Karlsruhe','Mannheim'],
  'DE-BY':['Nürnberg','Augsburg'],
  'DE-NI':['Braunschweig','Osnabrück'],
  'DE-RP':['Koblenz','Ludwigshafen'],
  'DE-SH':['Lübeck','Flensburg'],
  'DE-TH':['Jena','Weimar'],
  'DE-BB':['Cottbus','Brandenburg an der Havel'],
  'DE-SL':['Neunkirchen','Homburg'],
};
/** Die fuenf, bei denen der Ablenker die GROESSTE Stadt ist. */
export const ECHTE_FALLEN = ['DE-HE','DE-NW','DE-SN','DE-ST','DE-MV'];

/**
 * Ebene „Hauptstädte in Europa" (R6). Zwei falsche Staedte je Land.
 *
 * Die HAUPTSTADT steht hier nicht: sie kommt aus Natural Earth
 * (`Admin-0 capital`, deutscher Name aus `NAME_DE`) und wird in
 * `tools/backen-laender.mjs` an das Land gebacken - dieselbe Quelle wie
 * bei den sechzehn Landeshauptstaedten.
 *
 * Die ABLENKER stehen hier, von Hand, und das ist eine Entscheidung
 * gegen eine naheliegende Ableitung. „Die zwei groessten Staedte ausser
 * der Hauptstadt" waere aus denselben Daten zu rechnen - gemessen liefert
 * das aber Unsinn:
 *
 *   - `POP_MAX` ist die BALLUNGSRAUM-Zahl. In Polen steht damit Katowice
 *     (2,7 Mio) vor Warschau (1,7 Mio); in Deutschland Stuttgart und
 *     Frankfurt vor Hamburg.
 *   - `NAME_DE` traegt historische Exonyme, die heute niemand mehr sagt:
 *     „Klausenburg" fuer Cluj-Napoca, „Galatz" fuer Galați, „Luettich"
 *     fuer Liege. Als Ablenker waeren sie nicht schwer, sondern raetselhaft.
 *
 * Ein Ablenker, auf den niemand hereinfaellt, ist keiner - und einer, den
 * niemand kennt, erst recht nicht.
 *
 * Wo ein REGIERUNGSSITZ von der Hauptstadt abweicht, steht er VORN. Das
 * ist die eine echte Falle dieser Ebene, und sie kommt aus den Daten:
 * Natural Earth fuehrt Den Haag als `Admin-0 capital alt`. Das Tor
 * `inhalt` prueft, dass die Liste hier und die Daten dort uebereinstimmen.
 */
/* Und wo es KEINEN gibt, steht das hier - mit Grund.
 *
 * Luxemburg hat keine zweite Stadt, die ein deutschsprachiges Kind je
 * gehoert hat: die groesste nach der Hauptstadt ist Esch an der Alzette
 * mit 36 000 Einwohnern. Ein Ablenker, den niemand kennt, ist keiner (der
 * Absatz darueber sagt es fuer die Exonyme, hier gilt dasselbe) - und die
 * Falle, um die es auf dieser Ebene geht, gibt es in Luxemburg gar nicht:
 * die Hauptstadt heisst wie das Land und IST die groesste Stadt.
 *
 * Die Aufgabe steht trotzdem: die drei uebrigen Moeglichkeiten sind dann
 * Hauptstaedte anderer Laender. Sie ist damit leichter als die anderen
 * sechzehn, und das ist die Wahrheit ueber Luxemburg, keine Luecke. */
export const HAUPTSTADT_OHNE_ABLENKER = {
  LUX: 'keine zweite Stadt, die bekannt genug waere — Esch an der Alzette hat 36 000 Einwohner',
  /* Island ist derselbe Fall, nur noch deutlicher: nach Reykjavik kommt
     Kopavogur, und das ist ein Vorort davon. Die groesste Stadt ausserhalb
     des Hauptstadtgebiets ist Akureyri mit 19 000 Einwohnern - im
     deutschsprachigen Raum kennt sie niemand. */
  ISL: 'keine zweite Stadt, die bekannt genug waere — Akureyri hat 19 000 Einwohner',
};

/* ---------- DIE HAUPTSTADT IST INHALT, NICHT GEODATUM (I16) ---------- *
 *
 * Bis I15 kam die Hauptstadt aus Natural Earth: `Admin-0 capital`, mit
 * dem deutschen Namen aus `NAME_DE`. In Europa geht das auf. Ausserhalb
 * Europas nicht, und zwar nicht ein bisschen, sondern in SIEBEN von
 * achtundachtzig Faellen:
 *
 *   Myanmar          Rangun          statt Naypyidaw
 *   Kasachstan       Nur-Sultan      (heisst seit 2022 wieder Astana)
 *   Tansania         Daressalam      statt Dodoma
 *   Elfenbeinkueste  Abidjan         statt Yamoussoukro
 *   Benin            Cotonou         statt Porto-Novo
 *   Suedafrika       Kapstadt        statt Pretoria
 *   Bolivien         La Paz          statt Sucre
 *
 * Und die Gegenrichtung ist genauso schief: `Admin-0 capital alt` heisst
 * NICHT „Regierungssitz". Bei Japan steht dort Kyoto, bei Marokko El
 * Aaiun, bei Nigeria Lagos, bei den Philippinen Baguio City - eine
 * ehemalige Hauptstadt, ein besetztes Gebiet, eine ehemalige Hauptstadt
 * und eine Sommerresidenz. Die Ableitung `falle: !!regierungssitz` haette
 * also bei vier Laendern behauptet, die Regierung sitze woanders.
 *
 * DAS SOLL KOMMT AUS DER REFERENZ (Regel 3) - aber die Referenz fuer
 * „was ist die Hauptstadt" ist der Schulatlas und nicht ein
 * Kartendatensatz, der nach Bevoelkerungsschwerpunkten gebaut ist. Die
 * ANTWORT steht deshalb hier, im Inhalt; aus den Geodaten kommt nur noch
 * die LAGE. Alle sieben richtigen Staedte liegen dort - nur unter einem
 * anderen Kennzeichen (`capital alt`, `region capital`).
 *
 * Der Wert ist entweder der Name oder ein Satz:
 *   `ort`   der Name, unter dem die Stadt in den Geodaten steht, wenn er
 *           vom gelehrten abweicht (Astana liegt dort als Nur-Sultan)
 *   `sitz`  die andere Stadt, in der die Regierung sitzt - HIER
 *           aufgeschrieben und nicht geraten. Das ist die Falle dieser
 *           Ebene, und sie gilt fuer sechs Laender.
 *
 * Wer nicht darinsteht, hat keine Hauptstadtfrage. Das ist genau ein
 * Ziel: Groenland. Nuuk ist die Hauptstadt einer autonomen Region, nicht
 * eines Staates, und Natural Earth fuehrt sie deshalb zu Recht als
 * `Admin-0 region capital`. Eine Frage „Wie heisst die Hauptstadt von
 * Groenland?" waere nicht falsch, aber sie stellt sich in einer Reihe
 * mit Washington, Ottawa und Mexiko-Stadt falsch. */
export const HAUPTSTADT_LAND = {
  /* Europa (R6, I3, I11) - hier stimmte Natural Earth ueberall; die Namen
     stehen jetzt trotzdem an derselben Stelle wie alle anderen, sonst
     waere die Tafel eine Ausnahmeliste und keine Antwortliste. */
  RUS:'Moskau', DEU:'Berlin', GBR:'London', FRA:'Paris', POL:'Warschau',
  NLD:{ name:'Amsterdam', sitz:'Den Haag' },
  BEL:'Brüssel', CZE:'Prag', AUT:'Wien', CHE:'Bern', DNK:'Kopenhagen',
  LUX:'Luxemburg', ITA:'Rom', ESP:'Madrid', UKR:'Kiew', ROU:'Bukarest',
  GRC:'Athen', PRT:'Lissabon', SWE:'Stockholm', HUN:'Budapest',
  BLR:'Minsk', BGR:'Sofia', FIN:'Helsinki', NOR:'Oslo', IRL:'Dublin',
  ISL:'Reykjavík', LTU:'Vilnius', LVA:'Riga', EST:'Tallinn',

  /* Suedosteuropa (I14) */
  SRB:'Belgrad', SVK:'Bratislava', HRV:'Zagreb', BIH:'Sarajevo',
  ALB:'Tirana', SVN:'Ljubljana', MKD:'Skopje',

  /* Asien (I16) */
  IND:'Neu-Delhi', CHN:'Peking', IDN:'Jakarta', PAK:'Islamabad',
  BGD:'Dhaka', JPN:'Tokio', PHL:'Manila', VNM:'Hanoi', TUR:'Ankara',
  IRN:'Teheran', THA:'Bangkok',
  /* Naypyidaw ist seit 2005 Hauptstadt. Rangun steht in den Geodaten und
     ist der Ablenker, den fast jeder waehlt. */
  MMR:'Naypyidaw',
  KOR:'Seoul', IRQ:'Bagdad', AFG:'Kabul', SAU:'Riad', UZB:'Taschkent',
  YEM:'Sanaa',
  /* Putrajaya ist wirklich der Regierungssitz - der einzige Fall in
     Asien, in dem `capital alt` von Natural Earth die Sache trifft. */
  MYS:{ name:'Kuala Lumpur', sitz:'Putrajaya' },
  NPL:'Kathmandu', PRK:'Pjöngjang', SYR:'Damaskus',
  /* Sri Lanka hat zwei, und der Atlas schreibt beide: Colombo ist die
     groesste Stadt und Sitz der Regierung, das Parlament sitzt in
     Sri Jayewardenepura Kotte, einem Vorort. */
  LKA:{ name:'Colombo', sitz:'Sri Jayewardenepura Kotte' },
  /* Astana - so heisst sie seit 2022 wieder. In den Geodaten steht sie
     unter dem Namen, den sie von 2019 bis 2022 trug. */
  KAZ:{ name:'Astana', ort:'Nur-Sultan' },
  KHM:'Phnom Penh', JOR:'Amman', AZE:'Baku', TJK:'Duschanbe',
  ISR:'Jerusalem', ARE:'Abu Dhabi',

  /* Afrika (I16) */
  NGA:'Abuja', ETH:'Addis Abeba', EGY:'Kairo', COD:'Kinshasa',
  /* Dodoma ist seit 1996 Hauptstadt; Daressalam ist die groesste Stadt
     und steht in den Geodaten an ihrer Stelle. */
  TZA:'Dodoma',
  /* Suedafrika hat drei Hauptstaedte, und die Regierung sitzt in
     Pretoria. Kapstadt (Parlament) und Bloemfontein (oberstes Gericht)
     sind deshalb Ablenker und keine falschen Antworten - das steht im
     Satz zum Mitnehmen. */
  ZAF:'Pretoria',
  KEN:'Nairobi', UGA:'Kampala', DZA:'Algier', SDN:'Khartum',
  MAR:'Rabat', AGO:'Luanda', GHA:'Accra', MOZ:'Maputo',
  MDG:'Antananarivo',
  /* Yamoussoukro ist seit 1983 Hauptstadt, Abidjan der Regierungssitz -
     und die Stadt, die jeder nennt. */
  CIV:{ name:'Yamoussoukro', sitz:'Abidjan' },
  CMR:'Yaoundé', NER:'Niamey', MLI:'Bamako', BFA:'Ouagadougou',
  MWI:'Lilongwe', ZMB:'Lusaka', TCD:'N’Djamena', SOM:'Mogadischu',
  SEN:'Dakar', ZWE:'Harare', GIN:'Conakry', RWA:'Kigali',
  /* Porto-Novo ist Hauptstadt, Cotonou Regierungssitz und die groessere
     Stadt - derselbe Fall wie die Elfenbeinkueste. */
  BEN:{ name:'Porto-Novo', sitz:'Cotonou' },
  TUN:'Tunis',

  /* Nordamerika (I16) - Groenland steht mit Absicht nicht dabei. */
  USA:'Washington', MEX:'Mexiko-Stadt', CAN:'Ottawa',

  /* Mittelamerika (I16) */
  GTM:'Guatemala-Stadt', HTI:'Port-au-Prince', CUB:'Havanna',
  DOM:'Santo Domingo', HND:'Tegucigalpa', NIC:'Managua',
  SLV:'San Salvador', CRI:'San José', PAN:'Panama-Stadt',

  /* Suedamerika (I16) */
  BRA:'Brasília', COL:'Bogotá', ARG:'Buenos Aires', PER:'Lima',
  VEN:'Caracas',
  /* Chile: Regierung und Praesident in Santiago, das Parlament in
     Valparaíso. */
  CHL:{ name:'Santiago de Chile', sitz:'Valparaíso' },
  ECU:'Quito',
  /* Sucre ist die Hauptstadt nach der Verfassung, La Paz der Sitz von
     Regierung und Parlament - und die Stadt, die jeder nennt. */
  BOL:{ name:'Sucre', sitz:'La Paz' },
  PRY:'Asunción', URY:'Montevideo', GUY:'Georgetown', SUR:'Paramaribo',

  /* Ozeanien (I16) */
  AUS:'Canberra', PNG:'Port Moresby', NZL:'Wellington',
};

/* Ziele OHNE Hauptstadtfrage - mit Grund, wie bei den Ablenkern. */
export const HAUPTSTADT_OHNE_FRAGE = {
  GRL: 'Nuuk ist die Hauptstadt einer autonomen Region, nicht eines Staates',
};

/* DIE TAFEL HIESS BIS I14 `..._EUROPA`, und der Name war falsch geworden.
 *
 * Sie ist nach dem Landeskuerzel indiziert, also nach etwas, das weltweit
 * eindeutig ist - und mit der Suedosteuropakarte stehen sieben Laender
 * darin, die auf der Europaebene nicht gefragt werden. Zwei Tafeln waeren
 * dieselbe Auskunft an zwei Orten (Regel 6: was zweimal dasteht, veraltet
 * einmal); eine Tafel mit einem Namen, der die Haelfte ihres Inhalts
 * ausschliesst, ist der leisere Fehler von beiden. */
export const HAUPTSTADT_ABLENKER_LAND = {
  RUS:['Sankt Petersburg','Nowosibirsk'],
  DEU:['Hamburg','München'],
  GBR:['Manchester','Birmingham'],
  FRA:['Marseille','Lyon'],
  ITA:['Mailand','Neapel'],
  ESP:['Barcelona','Sevilla'],
  UKR:['Charkiw','Odessa'],
  POL:['Krakau','Danzig'],
  ROU:['Cluj-Napoca','Konstanza'],
  NLD:['Den Haag','Rotterdam'],
  BEL:['Antwerpen','Gent'],
  GRC:['Thessaloniki','Patras'],
  // Die fuenf aus P11. Gewaehlt wurde nach derselben Regel wie oben: die
  // Stadt, die ein Kind fuer die Hauptstadt HALTEN koennte, weil sie
  // groesser oder bekannter ist.
  CZE:['Brünn','Ostrava'],
  AUT:['Graz','Salzburg'],
  // Zuerich ist die eigentliche Falle dieses Landes - groesser als Bern,
  // bekannter, und viele Erwachsene halten es fuer die Hauptstadt. Anders
  // als bei den Niederlanden steht das aber in keinen Daten: Bern IST die
  // Hauptstadt, Zuerich ist nur die groessere Stadt. Deshalb kein `falle`,
  // sondern ein Ablenker wie jeder andere.
  CHE:['Zürich','Genf'],
  DNK:['Aarhus','Odense'],
  /* Die neun aus I3 (Raenge 18 bis 26). Dieselbe Regel wie oben: die
   * Stadt, die jemand fuer die Hauptstadt HALTEN koennte, weil sie
   * groesser oder bekannter ist. Goeteborg gegen Stockholm, Porto gegen
   * Lissabon, Cork gegen Dublin - das sind die Verwechslungen, die es
   * wirklich gibt. Island steht nicht dabei, sondern unten bei den
   * Laendern ohne Ablenker. */
  PRT:['Porto','Braga'],
  SWE:['Göteborg','Malmö'],
  HUN:['Debrecen','Szeged'],
  BLR:['Gomel','Brest'],
  BGR:['Plowdiw','Warna'],
  FIN:['Tampere','Turku'],
  NOR:['Bergen','Trondheim'],
  IRL:['Cork','Galway'],
  /* Die drei baltischen (I11). Hier ist die Regel schwerer zu erfuellen
     als sonst: die zweitgroesste Stadt Estlands (Tartu, 92 000) kennt im
     deutschsprachigen Raum kaum jemand. Genommen ist sie trotzdem, und
     zwar zusammen mit einer Stadt, die man KENNT, aber falsch verortet -
     Narva liegt an der russischen Grenze, Klaipeda heisst auf deutsch
     Memel, Daugavpils war Duenaburg. Der Ablenker soll nicht raetselhaft
     sein, aber auch nicht die richtige Antwort verschenken. */
  LTU:['Kaunas','Klaipėda'],
  LVA:['Daugavpils','Liepāja'],
  EST:['Tartu','Narva'],

  /* --- Suedosteuropa: die sieben (I14) -------------------------------- *
   *
   * Dieselbe Regel wie bei allen anderen: die Stadt, die jemand fuer die
   * Hauptstadt HALTEN koennte. Auf dem Balkan ist das oft die
   * zweitgroesste Stadt einer anderen Landesteilhaelfte - Split gegen
   * Zagreb, Nis gegen Belgrad, Bitola gegen Skopje.
   *
   * Bosnien ist der Sonderfall, und er ist kein Ablenkerproblem, sondern
   * Landeskunde: Banja Luka ist die Hauptstadt der Republika Srpska und
   * damit fuer viele die „andere Hauptstadt". Genau deshalb steht sie
   * vorn - wer sie waehlt, hat nicht geraten, sondern etwas Halbrichtiges
   * gewusst. */
  SRB:['Novi Sad','Niš'],
  SVK:['Košice','Nitra'],
  HRV:['Split','Rijeka'],
  BIH:['Banja Luka','Mostar'],
  ALB:['Durrës','Vlora'],
  SVN:['Maribor','Celje'],
  MKD:['Bitola','Kumanovo'],
  /* --- Asien: die dreissig (I16) --------------------------------------- *
   *
   * Dieselbe Regel wie ueberall: die Stadt, die jemand fuer die Hauptstadt
   * HALTEN koennte, weil sie groesser oder bekannter ist. In Asien ist das
   * der Regelfall und nicht die Ausnahme - Istanbul gegen Ankara, Mumbai
   * gegen Neu-Delhi, Schanghai gegen Peking, Ho-Chi-Minh-Stadt gegen
   * Hanoi. Vier Laender, deren groesste Stadt NICHT die Hauptstadt ist,
   * stehen allein in Europa; hier sind es zwoelf.
   *
   * Deutsche Namen, wo es sie gibt und wo sie gelaeufig sind: Schanghai,
   * Karatschi, Mossul, Dschidda, Maschhad. Nicht erfunden dort, wo der
   * fremde Name der gelaeufige ist (Osaka, Cebu, Kandahar). */
  IND:['Mumbai','Kolkata'],
  CHN:['Schanghai','Hongkong'],
  IDN:['Surabaya','Bandung'],
  PAK:['Karatschi','Lahore'],
  BGD:['Chittagong','Khulna'],
  JPN:['Osaka','Kyoto'],
  PHL:['Cebu','Davao'],
  VNM:['Ho-Chi-Minh-Stadt','Da Nang'],
  TUR:['Istanbul','Izmir'],
  IRN:['Maschhad','Isfahan'],
  THA:['Chiang Mai','Pattaya'],
  /* Rangun war bis 2005 Hauptstadt und ist die groesste Stadt - der
     staerkste Ablenker der ganzen Ebene. */
  MMR:['Rangun','Mandalay'],
  KOR:['Busan','Incheon'],
  IRQ:['Mossul','Basra'],
  AFG:['Kandahar','Herat'],
  SAU:['Dschidda','Mekka'],
  UZB:['Samarkand','Buchara'],
  YEM:['Aden','Taizz'],
  /* Putrajaya steht vorn, weil dort die Regierung sitzt - das ist die
     Falle dieses Landes und nicht Penang. Dieselbe Ordnung wie bei den
     Niederlanden. */
  MYS:['Putrajaya','Penang'],
  NPL:['Pokhara','Lalitpur'],
  PRK:['Hamhung','Kaesong'],
  SYR:['Aleppo','Homs'],
  LKA:['Sri Jayewardenepura Kotte','Kandy'],
  /* Almaty war bis 1997 Hauptstadt und ist doppelt so gross wie Astana. */
  KAZ:['Almaty','Schymkent'],
  KHM:['Siem Reap','Battambang'],
  JOR:['Aqaba','Irbid'],
  AZE:['Gandscha','Sumqayit'],
  TJK:['Chudschand','Kulob'],
  ISR:['Tel Aviv','Haifa'],
  ARE:['Dubai','Schardscha'],

  /* --- Afrika: die dreissig (I16) -------------------------------------- *
   *
   * Hier steht die Falle besonders oft in den Daten selbst: sieben der
   * dreissig Hauptstaedte sind NICHT die groesste Stadt ihres Landes, und
   * bei vier davon fuehrt Natural Earth die groessere als Hauptstadt.
   * Genau diese Staedte stehen hier als Ablenker - Lagos, Daressalam,
   * Kapstadt, Abidjan, Cotonou. Wer sie waehlt, hat nicht geraten,
   * sondern die groesste Stadt genannt. */
  NGA:['Lagos','Kano'],
  ETH:['Dire Dawa','Mekele'],
  EGY:['Alexandria','Gizeh'],
  COD:['Lubumbashi','Goma'],
  TZA:['Daressalam','Arusha'],
  /* Kapstadt und Bloemfontein sind die beiden anderen Hauptstaedte
     Suedafrikas - Parlament und oberstes Gericht. Sie sind damit die
     einzigen Ablenker dieser Tafel, die halb richtig sind, und der Satz
     zum Mitnehmen sagt es an. */
  ZAF:['Kapstadt','Johannesburg'],
  KEN:['Mombasa','Kisumu'],
  UGA:['Gulu','Jinja'],
  DZA:['Oran','Constantine'],
  SDN:['Omdurman','Port Sudan'],
  MAR:['Casablanca','Marrakesch'],
  AGO:['Huambo','Lobito'],
  GHA:['Kumasi','Tamale'],
  MOZ:['Beira','Nampula'],
  MDG:['Toamasina','Antsirabe'],
  CIV:['Abidjan','Bouaké'],
  CMR:['Douala','Bafoussam'],
  NER:['Zinder','Maradi'],
  MLI:['Timbuktu','Sikasso'],
  BFA:['Bobo-Dioulasso','Koudougou'],
  MWI:['Blantyre','Mzuzu'],
  ZMB:['Kitwe','Ndola'],
  TCD:['Moundou','Abéché'],
  SOM:['Hargeysa','Kismaayo'],
  SEN:['Thiès','Saint-Louis'],
  ZWE:['Bulawayo','Mutare'],
  GIN:['Kankan','Nzérékoré'],
  RWA:['Butare','Gisenyi'],
  BEN:['Cotonou','Parakou'],
  TUN:['Sfax','Sousse'],

  /* --- Nordamerika: die drei (I16) ------------------------------------- *
   *
   * Alle drei sind der klassische Fall: die Hauptstadt ist NICHT die
   * groesste Stadt. New York gegen Washington, Toronto gegen Ottawa - und
   * Mexiko ist der eine, bei dem beides zusammenfaellt.
   *
   * Groenland fehlt, und das ist keine Luecke: Nuuk ist die Hauptstadt
   * einer autonomen Region (siehe `HAUPTSTADT_OHNE_FRAGE`). */
  USA:['New York','Los Angeles'],
  MEX:['Guadalajara','Monterrey'],
  CAN:['Toronto','Vancouver'],

  /* --- Mittelamerika und die Karibik: die neun (I16) ------------------- *
   *
   * Hier ist die Hauptstadt fast immer auch die groesste Stadt - die
   * Ablenker sind deshalb die zweite und dritte Stadt, und die kennt im
   * deutschsprachigen Raum kaum jemand. Genommen ist trotzdem, was
   * WIRKLICH die zweite ist; ein erfundener Name waere schlimmer als ein
   * unbekannter (dieselbe Ueberlegung wie beim Baltikum, I11). */
  GTM:['Quetzaltenango','Escuintla'],
  HTI:['Cap-Haïtien','Les Cayes'],
  CUB:['Santiago de Cuba','Camagüey'],
  DOM:['Santiago de los Caballeros','La Romana'],
  HND:['San Pedro Sula','La Ceiba'],
  NIC:['León','Granada'],
  SLV:['Santa Ana','San Miguel'],
  CRI:['Alajuela','Limón'],
  PAN:['Colón','David'],

  /* --- Suedamerika: die zwoelf (I16) ----------------------------------- *
   *
   * Brasilien ist der beruehmteste Fall der Welt: die Hauptstadt wurde
   * 1960 in die Mitte des Landes GEBAUT, und die zwei groessten Staedte
   * liegen an der Kueste. Sao Paulo und Rio de Janeiro stehen deshalb
   * beide da. */
  BRA:['São Paulo','Rio de Janeiro'],
  COL:['Medellín','Cali'],
  ARG:['Córdoba','Rosario'],
  PER:['Arequipa','Cusco'],
  VEN:['Maracaibo','Valencia'],
  CHL:['Valparaíso','Concepción'],
  ECU:['Guayaquil','Cuenca'],
  /* La Paz ist Regierungssitz und die Stadt, die jeder nennt - der
     staerkste Ablenker Suedamerikas. */
  BOL:['La Paz','Santa Cruz'],
  PRY:['Ciudad del Este','Encarnación'],
  URY:['Salto','Paysandú'],
  GUY:['Linden','New Amsterdam'],
  SUR:['Lelydorp','Nieuw Nickerie'],

  /* --- Ozeanien: die drei (I16) ---------------------------------------- *
   *
   * Australien und Neuseeland sind wieder der Fall aus Nordamerika:
   * Sydney gegen Canberra, Auckland gegen Wellington. Canberra wurde
   * 1913 als Hauptstadt gebaut, weil sich Sydney und Melbourne nicht
   * einigen konnten - beide stehen deshalb als Ablenker da. */
  AUS:['Sydney','Melbourne'],
  PNG:['Lae','Mount Hagen'],
  NZL:['Auckland','Christchurch'],
};
