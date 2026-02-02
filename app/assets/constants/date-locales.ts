import { enUS, fr, es, ptBR } from 'date-fns/locale'
import { BASE_LANGUAGE } from './base-language'
import type { Locale } from 'date-fns/locale'

export type Locales = {
  [key: string]: Locale
}

export const locales: Locales = {
  en: enUS,
  es: es,
  fr: fr,
  pt: ptBR,
}

export const getDateLocale = (locale: string) =>
  locales[locale] || locales[BASE_LANGUAGE]
