import { marked } from 'marked'
import { citationExtension } from '@/assets/utils/marked-citations'
import { createRenderer } from '@/assets/utils/marked-renderer'

// Use citation extension
marked.use({ extensions: [citationExtension] })
// import DOMPurify from 'isomorphic-dompurify'

// Optional: Configure Marked
marked.setOptions({
  breaks: true, // Treat single line breaks as <br>
  gfm: true, // Enable GitHub-Flavored Markdown
  renderer: createRenderer(),
  // headerIds: true,
  // mangle: false, // Avoid mangling emails
})

// Convert markdown → sanitized HTML
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown)
  // return DOMPurify.sanitize(html)
  return html
}
