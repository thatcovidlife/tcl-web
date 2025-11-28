import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import type { LaunchOptions } from 'puppeteer-core'
import { marked } from 'marked'

import { TclLogo } from '@/assets/utils/logo-base64'

/**
 * Get the browser launch options based on environment
 * - Local dev: Use system Chrome/Chromium
 * - Production (Vercel): Use @sparticuz/chromium
 */
async function getBrowserOptions(): Promise<LaunchOptions> {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // Local development - use system Chrome
    // Common Chrome paths on different OS
    const possiblePaths = [
      // macOS
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      // Linux
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      // Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]

    // Find the first available browser
    let executablePath: string | undefined
    for (const path of possiblePaths) {
      try {
        const fs = await import('fs')
        if (fs.existsSync(path)) {
          executablePath = path
          break
        }
      } catch {
        // Continue to next path
      }
    }

    if (!executablePath) {
      throw new Error(
        'No Chrome/Chromium installation found. Please install Google Chrome.',
      )
    }

    return {
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  }

  // Production - use @sparticuz/chromium for serverless
  return {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: 1200, height: 800 },
  }
}

/**
 * Generate HTML document for PDF export
 */
function generateHtmlDocument(title: string, content: string): string {
  // Configure marked for clean output
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  const htmlContent = marked.parse(content) as string

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
    }
    
    h1.title {
      font-size: 22pt;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .content {
      margin-bottom: 40px;
    }
    
    .content h1, .content h2, .content h3, 
    .content h4, .content h5, .content h6 {
      color: #1a1a1a;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    .content h1 { font-size: 18pt; }
    .content h2 { font-size: 16pt; }
    .content h3 { font-size: 14pt; }
    .content h4 { font-size: 12pt; }
    
    .content p {
      margin-bottom: 1em;
    }
    
    .content ul, .content ol {
      margin-left: 20px;
      margin-bottom: 1em;
    }
    
    .content li {
      margin-bottom: 0.3em;
    }
    
    .content blockquote {
      border-left: 3px solid #ccc;
      padding-left: 15px;
      margin: 1em 0;
      color: #666;
      font-style: italic;
    }
    
    .content code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 10pt;
    }
    
    .content pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 1em 0;
    }
    
    .content pre code {
      background: none;
      padding: 0;
    }
    
    .content table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      table-layout: fixed;
      word-wrap: break-word;
    }
    
    .content th, .content td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      text-align: left;
      font-size: 10pt;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    
    .content th {
      background: #f5f5f5;
      font-weight: 600;
    }
    
    .content a {
      color: rgb(220, 38, 38);
      text-decoration: none;
    }
    
    .content strong {
      font-weight: 600;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .footer img.logo {
      height: 12mm;
      width: auto;
    }
    
    .footer img.qrcode {
      height: 15mm;
      width: 15mm;
    }
  </style>
</head>
<body>
  <h1 class="title">${title}</h1>
  <div class="content">
    ${htmlContent}
  </div>
  <div class="footer">
    <img class="logo" src="${TclLogo}" alt="That Covid Life" />
    <img class="qrcode" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://thatcovid.life/" alt="QR Code" />
  </div>
</body>
</html>
`
}

export default defineEventHandler(async (event) => {
  const { content, title } = await readBody<{ content: string; title: string }>(
    event,
  )

  const pageTitle = title || 'Chat Export'
  const html = generateHtmlDocument(pageTitle, content)

  // Launch browser with appropriate options for environment
  const browserOptions = await getBrowserOptions()
  const browser = await puppeteer.launch(browserOptions)

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    })

    // Generate filename from title
    const safeTitle = pageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${safeTitle}.pdf"`,
    )

    // Return as Blob for proper binary handling
    return new Blob([Buffer.from(pdfBuffer)], { type: 'application/pdf' })
  } finally {
    await browser.close()
  }
})
