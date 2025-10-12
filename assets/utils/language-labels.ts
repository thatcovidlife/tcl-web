export const languageLabels: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
}

export const codeToLabel = (code: 'en' | 'es' | 'fr' | 'pt'): string =>
  languageLabels[code]
