import { marked } from 'marked'

const citationRegex =
  /^[\[【]([0-9a-fA-F]{8}[-‑][0-9a-fA-F]{4}[-‑][0-9a-fA-F]{4}[-‑][0-9a-fA-F]{4}[-‑][0-9a-fA-F]{12}|[0-9a-fA-F]{6,})[\]】]/

export const citationExtension = {
  name: 'citation',
  level: 'inline',
  start(src: string) {
    const regular = src.indexOf('[')
    const fullwidth = src.indexOf('【')
    if (regular === -1) return fullwidth
    if (fullwidth === -1) return regular
    return Math.min(regular, fullwidth)
  },
  tokenizer(src: string) {
    const match = citationRegex.exec(src)
    console.log('match', match)
    if (match) {
      return {
        type: 'citation',
        raw: match[0],
        id: match[1],
      }
    }
  },
  renderer(token: any) {
    // TODO: replace with real citation rendering
    return `<cite-ref data-id="${token.id}"></cite-ref>`
  },
}
