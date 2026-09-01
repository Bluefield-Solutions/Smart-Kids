// ERZEUGT von tools/backen-laender.mjs - nicht von Hand aendern.
import { LAENDER_ASIEN_GROB } from './laender-asien.grob.js';
import { LAENDER_AFRIKA_GROB } from './laender-afrika.grob.js';
import { LAENDER_EUROPA_GROB } from './laender-europa.grob.js';
import { LAENDER_NORDAMERIKA_GROB } from './laender-nordamerika.grob.js';
import { LAENDER_MITTELAMERIKA_GROB } from './laender-mittelamerika.grob.js';
import { LAENDER_SUEDAMERIKA_GROB } from './laender-suedamerika.grob.js';

/** Jede Laenderkarte unter ihrem Schluessel - der Schluessel ist der,
 *  unter dem sie in `src/inhalt/erdkunde.js` ihre Ziele hat. */
export const KARTEN_GROB = {
  asien: LAENDER_ASIEN_GROB,
  afrika: LAENDER_AFRIKA_GROB,
  europa: LAENDER_EUROPA_GROB,
  nordamerika: LAENDER_NORDAMERIKA_GROB,
  mittelamerika: LAENDER_MITTELAMERIKA_GROB,
  suedamerika: LAENDER_SUEDAMERIKA_GROB,
};
