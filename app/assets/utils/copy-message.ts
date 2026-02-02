import { marked } from 'marked'
import { citationExtension } from './marked-citations'

marked.use({ extensions: [citationExtension] })

export const copyMessage = async (markdown: string) => {
  const fullMd = `${markdown}\n\n*Copied from That Covid Life Chatbot*`
  const html = await marked(fullMd)

  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([fullMd], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    }),
  ])
}
