import { ELang } from '~/types/ELang';

import { deepMergeTranslations } from './mergeTranslation';

import bgJson from './bg.json';
import csJson from './cs.json';
import daJson from './da.json';
import deJson from './de.json';
import elJson from './el.json';
import enJson from './en.json';
import esJson from './es.json';
import etJson from './et.json';
import fiJson from './fi.json';
import frJson from './fr.json';
import hrJson from './hr.json';
import huJson from './hu.json';
import itJson from './it.json';
import ltJson from './lt.json';
import lvJson from './lv.json';
import nlJson from './nl.json';
import plJson from './pl.json';
import ptJson from './pt.json';
import roJson from './ro.json';
import skJson from './sk.json';
import slJson from './sl.json';
import svJson from './sv.json';
import ukJson from './uk.json';

export type TranslationJson = typeof enJson;

type JsonObject = Record<string, unknown>;

const withFallback = (locale: JsonObject): TranslationJson =>
  deepMergeTranslations(enJson, locale);

export const translations: Record<ELang, TranslationJson> = {
  en: enJson,
  es: esJson,
  bg: withFallback(bgJson),
  cs: withFallback(csJson),
  da: withFallback(daJson), 
  de: withFallback(deJson),
  el: withFallback(elJson),
  et: withFallback(etJson),
  fi: withFallback(fiJson),
  fr: withFallback(frJson),
  hr: withFallback(hrJson),
  hu: withFallback(huJson),
  it: withFallback(itJson),
  lt: withFallback(ltJson),
  lv: withFallback(lvJson),
  nl: withFallback(nlJson),
  pt: withFallback(ptJson),
  ro: withFallback(roJson),
  sk: withFallback(skJson),
  sl: withFallback(slJson),
  sv: withFallback(svJson),
  uk: withFallback(ukJson),
  pl: withFallback(plJson),
};

export { esJson };
