/**
 * Input sanitization utilities to prevent SQL injection, prompt injection,
 * XSS, and other security vulnerabilities
 */

/**
 * Maximum allowed length for user input text
 */
const MAX_INPUT_LENGTH = 10000

/**
 * Patterns that might indicate injection attempts
 */
const SUSPICIOUS_PATTERNS = [
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  // Script tags and event handlers
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  // Dangerous characters in excess
  /[<>]{3,}/g,
  // SQL comment patterns
  /(--|\/\*|\*\/|;--)/g,
]

/**
 * Prompt injection patterns commonly used to manipulate AI behavior
 * Supports English, French, Spanish, and Brazilian Portuguese
 */
const PROMPT_INJECTION_PATTERNS = [
  // English patterns
  /ignore\s+(previous|all|prior)\s+(instructions?|prompts?|commands?)/gi,
  /forget\s+(previous|all|everything|prior)\s+(instructions?|context|prompts?)/gi,
  /forget\s+(all|everything)\s+(previous|prior)\s+(instructions?|context|prompts?)/gi,
  /you\s+are\s+(now|actually)/gi,
  /system\s*:\s*(new|override|updated?)\s+(instructions?|prompts?|commands?)/gi,
  /\[(system|admin|root|user)\]/gi,
  /disregard\s+(previous|all|prior|everything)/gi,
  /override\s+(instructions?|system|prompts?|commands?)/gi,
  /(new|updated?)\s+instructions?\s*:/gi,

  // French patterns (using character classes for accented characters)
  /ignorer\s+(les\s+)?(pr[eé]c[eé]dentes?|ant[eé]rieures?)\s+(instructions?|consignes?)/giu,
  /oublier\s+(les\s+)?(pr[eé]c[eé]dentes?|ant[eé]rieures?|toutes?)\s+(instructions?|consignes?)/giu,
  /(tu\s+es|vous\s+[eê]tes)\s+maintenant/giu,
  /syst[eè]me\s*:\s*nouvelles?\s+instructions?/giu,
  /ne\s+pas\s+tenir\s+compte/giu,
  /remplacer\s+(les\s+)?instructions?/giu,

  // Spanish patterns (using character classes for accented characters)
  /ignorar\s+(las\s+)?(anteriores?|previas?)\s+instrucciones?/giu,
  /olvidar\s+(las\s+)?(anteriores?|previas?|todas?)\s+([oó]rdenes?|instrucciones?)/giu,
  /(t[uú]\s+eres|usted\s+es)\s+ahora/giu,
  /sistema\s*:\s*nuevas?\s+instrucciones?/giu,
  /no\s+tener\s+en\s+cuenta/giu,
  /anular\s+(las\s+)?instrucciones?/giu,

  // Brazilian Portuguese patterns (using character classes for accented characters)
  /ignorar\s+(as\s+)?(anteriores?|pr[eé]vias?)\s+instru[cç][oõ]es?/giu,
  /esquecer\s+(as\s+)?(anteriores?|todas?|pr[eé]vias?)\s+(ordens?|instru[cç][oõ]es?)/giu,
  /(voc[eê]\s+[eé]|tu\s+[eé]s)\s+agora/giu,
  /sistema\s*:\s*novas?\s+instru[cç][oõ]es?/giu,
  /desconsiderar\s+(as\s+)?instru[cç][oõ]es?/giu,
  /substituir\s+(as\s+)?instru[cç][oõ]es?/giu,
]

export type SanitizationResult = {
  sanitized: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Sanitize user input text to prevent various injection attacks
 * @param input - The raw user input
 * @param options - Optional configuration
 * @returns Sanitization result with cleaned text and validation status
 */
export function sanitizeUserInput(
  input: string | null | undefined,
  options: {
    maxLength?: number
    allowHtml?: boolean
    strictMode?: boolean
    /**
     * Skip HTML entity encoding. Use this when the output will be processed
     * by a markdown renderer or other system that handles its own escaping.
     * Default: false (will encode HTML entities)
     */
    skipHtmlEncoding?: boolean
  } = {},
): SanitizationResult {
  const {
    maxLength = MAX_INPUT_LENGTH,
    allowHtml = false,
    strictMode = true,
    skipHtmlEncoding = false,
  } = options

  const errors: string[] = []
  const warnings: string[] = []

  // Handle null/undefined input
  if (input == null || input === '') {
    return {
      sanitized: '',
      isValid: true,
      errors,
      warnings,
    }
  }

  // Ensure input is a string
  let sanitized = String(input)

  // Trim whitespace
  sanitized = sanitized.trim()

  // Check length
  if (sanitized.length === 0) {
    return {
      sanitized: '',
      isValid: true,
      errors,
      warnings,
    }
  }

  if (sanitized.length > maxLength) {
    errors.push(`Input exceeds maximum length of ${maxLength} characters`)
    sanitized = sanitized.substring(0, maxLength)
  }

  // Check for suspicious SQL/XSS patterns BEFORE escaping
  let foundSuspiciousPattern = false
  for (const pattern of SUSPICIOUS_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0
    if (pattern.test(sanitized)) {
      foundSuspiciousPattern = true
      break
    }
  }

  if (foundSuspiciousPattern) {
    if (strictMode) {
      errors.push(
        'Input contains potentially dangerous patterns that are not allowed',
      )
    } else {
      warnings.push('Input contains patterns that may be flagged as suspicious')
    }
  }

  // Check for prompt injection attempts
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0
    if (pattern.test(sanitized)) {
      warnings.push(
        'Input contains patterns that may be attempting prompt manipulation',
      )
      break
    }
  }

  // Remove null bytes and replace with space
  sanitized = sanitized.replace(/\0/g, ' ')

  // Remove control characters except newlines and tabs, replace with space
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')

  // Remove or escape HTML if not allowed
  if (!allowHtml && !skipHtmlEncoding) {
    // Escape HTML special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Normalize whitespace (collapse multiple spaces)
  sanitized = sanitized.replace(/\s+/g, ' ')

  // Remove leading/trailing whitespace again after processing
  sanitized = sanitized.trim()

  const isValid = errors.length === 0

  return {
    sanitized,
    isValid,
    errors,
    warnings,
  }
}

/**
 * Validate and sanitize chat title
 * @param title - The chat title
 * @returns Sanitized title or default
 */
export function sanitizeChatTitle(title: string | null | undefined): string {
  const result = sanitizeUserInput(title, {
    maxLength: 200,
    allowHtml: false,
    strictMode: false,
  })

  return result.sanitized || 'New chat'
}

/**
 * Validate and sanitize chat message
 * @param message - The chat message
 * @returns Sanitization result
 */
export function sanitizeChatMessage(
  message: string | null | undefined,
): SanitizationResult {
  return sanitizeUserInput(message, {
    maxLength: MAX_INPUT_LENGTH,
    allowHtml: false,
    strictMode: true,
  })
}

/**
 * Safe string for database queries (used with parameterized queries)
 * This does NOT replace parameterized queries but provides an additional layer
 * @param input - Raw input
 * @returns Sanitized string safe for use in parameterized queries
 */
export function sanitizeForDatabase(input: string | null | undefined): string {
  if (!input) return ''

  // Remove any SQL control characters
  let sanitized = String(input).replace(
    /[\0\x08\x09\x1a\n\r"'\\%]/g,
    (char) => {
      switch (char) {
        case '\0':
          return ''
        case '\x08':
          return ''
        case '\x09':
          return '\\t'
        case '\x1a':
          return ''
        case '\n':
          return '\\n'
        case '\r':
          return '\\r'
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char
        default:
          return char
      }
    },
  )

  return sanitized.trim()
}

/**
 * Decode HTML entities back to their original characters.
 * Use this to display text that was previously HTML-encoded (legacy data).
 * Handles double-encoded entities by running multiple passes.
 * @param input - Text with HTML entities
 * @returns Decoded text with original characters
 */
export function decodeHtmlEntities(input: string | null | undefined): string {
  if (!input) return ''

  let result = String(input)
  let previousResult = ''

  // Run multiple passes to handle double-encoded entities (e.g., &amp;#x27; -> &#x27; -> ')
  // Maximum 3 passes to prevent infinite loops
  for (let i = 0; i < 3 && result !== previousResult; i++) {
    previousResult = result
    result = result
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#39;/g, "'")
      .replace(/&#47;/g, '/')
  }

  return result
}
