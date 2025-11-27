import { marked } from 'marked';

export const copyMessage = async (markdown: string) => {
  const html = await marked(markdown);
  
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([markdown], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    }),
  ]);
}