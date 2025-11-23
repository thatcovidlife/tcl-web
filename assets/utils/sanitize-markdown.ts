/**
 * Sanitizes markdown formatting from text
 * Removes: *, **, ***, #, ##, ###, ####, `, ```, [], (), _
 */
export function sanitizeMarkdown(text: string): string {
  if (!text) return ''

  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]*`/g, (match) => match.replace(/`/g, ''))
      // Remove bold/italic (**, *, _)
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove remaining brackets and parentheses
      .replace(/[\[\]()]/g, '')
      // Remove remaining asterisks and backticks
      .replace(/[*`]/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}
