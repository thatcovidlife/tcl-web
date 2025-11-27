import { marked } from 'marked'
import type { Tokens } from 'marked'

export function createRenderer() {
  const renderer = new marked.Renderer()
  const originalLinkRenderer = renderer.link.bind(renderer)

  /**
   * Custom renderer for marked to open all links in a new tab
   * with security attributes (noopener noreferrer)
   */
  renderer.link = (token: Tokens.Link) => {
    const html = originalLinkRenderer(token)
    return html.replace(
      '<a',
      '<a target="_blank" class="text-primary" rel="noopener noreferrer"',
    )
  }

  return renderer
}
