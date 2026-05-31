/**
 * Sanitization schema for blog content rendering.
 *
 * Defense-in-depth: even though only authenticated admins can create blog posts,
 * we sanitize all rendered HTML to protect against:
 * - Rogue/compromised admin accounts injecting XSS
 * - Stored XSS from database compromise
 * - Supply-chain attacks that modify stored content
 *
 * Based on rehype-sanitize's defaultSchema (GitHub-flavored) with blog-safe extensions.
 */
import { defaultSchema } from 'rehype-sanitize';
import type { Options } from 'rehype-sanitize';

export const blogSanitizeSchema: Options = {
  ...defaultSchema,
  tagNames: [
    // Structure
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'section', 'article',
    'br', 'hr',
    // Inline formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
    'sub', 'sup', 'mark', 'small',
    // Links & media
    'a', 'img',
    // Lists
    'ul', 'ol', 'li',
    // Tables (GFM)
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'caption', 'colgroup', 'col',
    // Code
    'pre', 'code', 'kbd', 'samp', 'var',
    // Quotes & details
    'blockquote', 'cite', 'q',
    'details', 'summary',
    // Definition lists
    'dl', 'dt', 'dd',
    // Figures
    'figure', 'figcaption',
    // Forms-related (read-only display)
    'input', // for GFM task list checkboxes
    // Misc
    'abbr', 'time', 'wbr',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['align', 'valign', 'scope'],
    td: ['align', 'valign'],
    col: ['span'],
    colgroup: ['span'],
    input: ['type', 'checked', 'disabled'], // GFM task list checkboxes
    code: ['className'], // for syntax highlighting class names
    pre: ['className'],
    span: ['className'],
    div: ['className'],
    time: ['dateTime'],
    abbr: ['title'],
    details: ['open'],
    ol: ['start', 'type'],
    li: ['value'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data'],
    cite: ['http', 'https'],
  },
  // Strip dangerous elements entirely (not just their tags)
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'textarea',
          'select', 'button', 'link', 'meta', 'base', 'applet', 'noscript',
          'math', 'svg'],
};

