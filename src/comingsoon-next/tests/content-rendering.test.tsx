/**
 * Blog Content Rendering Tests
 *
 * Validates that the ReactMarkdown + remarkGfm + rehypeRaw + rehypeSanitize pipeline
 * correctly renders all Markdown and HTML content patterns used by CMS users,
 * and blocks all XSS attack vectors.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { blogSanitizeSchema } from '../src/lib/sanitize-schema';

/** Helper: renders content through the exact same pipeline as the blog page */
function renderContent(content: string) {
  return render(
    <div data-testid="content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, blogSanitizeSchema]]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// =============================================================================
// MARKDOWN RENDERING TESTS
// =============================================================================

describe('Markdown Rendering', () => {
  // --- Headings ---
  describe('Headings', () => {
    it('renders h1 heading', () => {
      const { container } = renderContent('# Main Title');
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Main Title');
    });

    it('renders h2 heading', () => {
      const { container } = renderContent('## Section Title');
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Section Title');
    });

    it('renders h3 heading', () => {
      const { container } = renderContent('### Subsection');
      expect(container.querySelector('h3')).toHaveTextContent('Subsection');
    });

    it('renders h4, h5, h6 headings', () => {
      const { container } = renderContent('#### H4\n##### H5\n###### H6');
      expect(container.querySelector('h4')).toHaveTextContent('H4');
      expect(container.querySelector('h5')).toHaveTextContent('H5');
      expect(container.querySelector('h6')).toHaveTextContent('H6');
    });

    it('renders heading with inline formatting', () => {
      const { container } = renderContent('## **Bold** and *italic* heading');
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2?.querySelector('strong')).toHaveTextContent('Bold');
      expect(h2?.querySelector('em')).toHaveTextContent('italic');
    });
  });

  // --- Inline Formatting ---
  describe('Inline Formatting', () => {
    it('renders bold text', () => {
      const { container } = renderContent('This is **bold** text');
      expect(container.querySelector('strong')).toHaveTextContent('bold');
    });

    it('renders italic text', () => {
      const { container } = renderContent('This is *italic* text');
      expect(container.querySelector('em')).toHaveTextContent('italic');
    });

    it('renders bold italic text', () => {
      const { container } = renderContent('This is ***bold italic*** text');
      // ***text*** renders as <em><strong> or <strong><em> depending on parser
      const em = container.querySelector('em');
      const strong = container.querySelector('strong');
      expect(em || strong).toBeInTheDocument();
      expect(container.textContent).toContain('bold italic');
    });

    it('renders inline code', () => {
      const { container } = renderContent('Use `console.log()` for debugging');
      expect(container.querySelector('code')).toHaveTextContent('console.log()');
    });

    it('renders strikethrough (GFM)', () => {
      const { container } = renderContent('This is ~~deleted~~ text');
      expect(container.querySelector('del')).toHaveTextContent('deleted');
    });
  });

  // --- Links ---
  describe('Links', () => {
    it('renders markdown link', () => {
      const { container } = renderContent('[Visit QualiFlow](https://qualiflow.ai)');
      const link = container.querySelector('a');
      expect(link).toHaveTextContent('Visit QualiFlow');
      expect(link).toHaveAttribute('href', 'https://qualiflow.ai');
    });

    it('renders autolink URL (GFM)', () => {
      const { container } = renderContent('Check out https://qualiflow.ai for more');
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', 'https://qualiflow.ai');
    });
  });

  // --- Paragraphs ---
  describe('Paragraphs', () => {
    it('renders paragraph text', () => {
      const { container } = renderContent('This is a paragraph of text.');
      expect(container.querySelector('p')).toHaveTextContent('This is a paragraph of text.');
    });

    it('renders multiple paragraphs separated by blank lines', () => {
      const { container } = renderContent('First paragraph.\n\nSecond paragraph.');
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0]).toHaveTextContent('First paragraph.');
      expect(paragraphs[1]).toHaveTextContent('Second paragraph.');
    });
  });

  // --- Lists ---
  describe('Lists', () => {
    it('renders unordered list with bullet points', () => {
      const content = `- First item\n- Second item\n- Third item`;
      const { container } = renderContent(content);
      const ul = container.querySelector('ul');
      expect(ul).toBeInTheDocument();
      const items = ul?.querySelectorAll('li');
      expect(items).toHaveLength(3);
      expect(items?.[0]).toHaveTextContent('First item');
      expect(items?.[1]).toHaveTextContent('Second item');
      expect(items?.[2]).toHaveTextContent('Third item');
    });

    it('renders ordered list', () => {
      const content = `1. Step one\n2. Step two\n3. Step three`;
      const { container } = renderContent(content);
      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();
      expect(ol?.querySelectorAll('li')).toHaveLength(3);
    });

    it('renders nested unordered list', () => {
      const content = `- Parent item\n  - Child item\n  - Another child\n- Second parent`;
      const { container } = renderContent(content);
      const topUl = container.querySelector('ul');
      expect(topUl).toBeInTheDocument();
      const nestedUl = topUl?.querySelector('ul');
      expect(nestedUl).toBeInTheDocument();
      expect(nestedUl?.querySelectorAll('li')).toHaveLength(2);
    });

    it('renders task list (GFM)', () => {
      const content = `- [x] Completed task\n- [ ] Pending task`;
      const { container } = renderContent(content);
      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(2);
    });
  });

  // --- GFM Tables ---
  describe('Tables (GFM)', () => {
    it('renders a basic table with headers and rows', () => {
      const content = `| Feature | Status |\n| --- | --- |\n| Chat | Active |\n| SMS | Pending |`;
      const { container } = renderContent(content);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      const headers = table?.querySelectorAll('th');
      expect(headers).toHaveLength(2);
      expect(headers?.[0]).toHaveTextContent('Feature');
      expect(headers?.[1]).toHaveTextContent('Status');
      const cells = table?.querySelectorAll('td');
      expect(cells).toHaveLength(4); // 2 rows × 2 columns
      expect(cells?.[0]).toHaveTextContent('Chat');
      expect(cells?.[1]).toHaveTextContent('Active');
    });

    it('renders table with alignment', () => {
      const content = `| Left | Center | Right |\n| :--- | :---: | ---: |\n| A | B | C |`;
      const { container } = renderContent(content);
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelectorAll('th')).toHaveLength(3);
    });
  });

  // --- Blockquotes ---
  describe('Blockquotes', () => {
    it('renders blockquote', () => {
      const { container } = renderContent('> This is a quote');
      const bq = container.querySelector('blockquote');
      expect(bq).toBeInTheDocument();
      expect(bq).toHaveTextContent('This is a quote');
    });
  });

  // --- Code Blocks ---
  describe('Code Blocks', () => {
    it('renders fenced code block', () => {
      const content = '```javascript\nconst x = 42;\nconsole.log(x);\n```';
      const { container } = renderContent(content);
      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      const code = pre?.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent('const x = 42;');
    });
  });

  // --- Horizontal Rule ---
  describe('Horizontal Rule', () => {
    it('renders horizontal rule', () => {
      const { container } = renderContent('Above\n\n---\n\nBelow');
      expect(container.querySelector('hr')).toBeInTheDocument();
    });
  });

  // --- Images ---
  describe('Images', () => {
    it('renders markdown image', () => {
      const { container } = renderContent('![Alt text](https://example.com/img.png)');
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/img.png');
      expect(img).toHaveAttribute('alt', 'Alt text');
    });
  });
});

// =============================================================================
// HTML RENDERING TESTS
// =============================================================================

describe('HTML Rendering', () => {
  it('renders HTML headings', () => {
    const { container } = renderContent('<h2>HTML Heading</h2>');
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
    expect(h2).toHaveTextContent('HTML Heading');
  });

  it('renders HTML paragraphs', () => {
    const { container } = renderContent('<p>HTML paragraph with <strong>bold</strong> and <em>italic</em></p>');
    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p?.querySelector('strong')).toHaveTextContent('bold');
    expect(p?.querySelector('em')).toHaveTextContent('italic');
  });

  it('renders HTML unordered list', () => {
    const content = '<ul><li>Item A</li><li>Item B</li><li>Item C</li></ul>';
    const { container } = renderContent(content);
    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(ul?.querySelectorAll('li')).toHaveLength(3);
  });

  it('renders HTML ordered list', () => {
    const content = '<ol><li>First</li><li>Second</li></ol>';
    const { container } = renderContent(content);
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders HTML table', () => {
    const content = '<table><thead><tr><th>Name</th><th>Role</th></tr></thead><tbody><tr><td>Alice</td><td>Admin</td></tr></tbody></table>';
    const { container } = renderContent(content);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('th')).toHaveTextContent('Name');
    expect(container.querySelector('td')).toHaveTextContent('Alice');
  });

  it('renders HTML links', () => {
    const { container } = renderContent('<a href="https://qualiflow.ai">QualiFlow</a>');
    const link = container.querySelector('a');
    expect(link).toHaveTextContent('QualiFlow');
    expect(link).toHaveAttribute('href', 'https://qualiflow.ai');
  });

  it('renders HTML blockquote', () => {
    const { container } = renderContent('<blockquote>Important note</blockquote>');
    expect(container.querySelector('blockquote')).toHaveTextContent('Important note');
  });

  it('renders HTML code blocks', () => {
    const { container } = renderContent('<pre><code>const x = 1;</code></pre>');
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('code')).toHaveTextContent('const x = 1;');
  });

  it('renders HTML image', () => {
    const { container } = renderContent('<img src="https://example.com/photo.jpg" alt="Photo" />');
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Photo');
  });

  it('renders HTML hr', () => {
    const { container } = renderContent('<hr />');
    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});

// =============================================================================
// MIXED CONTENT TESTS
// =============================================================================

describe('Mixed Markdown + HTML Content', () => {
  it('renders markdown heading followed by HTML paragraph', () => {
    const content = '## My Section\n\n<p>This is an HTML paragraph under a markdown heading.</p>';
    const { container } = renderContent(content);
    expect(container.querySelector('h2')).toHaveTextContent('My Section');
    expect(container.querySelector('p')).toHaveTextContent('This is an HTML paragraph under a markdown heading.');
  });

  it('renders HTML heading followed by markdown list', () => {
    const content = '<h3>Features</h3>\n\n- Feature one\n- Feature two';
    const { container } = renderContent(content);
    expect(container.querySelector('h3')).toHaveTextContent('Features');
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders complex mixed content blog post', () => {
    const content = [
      '# Blog Post Title',
      '',
      '<p>Introduction paragraph with <strong>bold</strong> text.</p>',
      '',
      '## Section One',
      '',
      '- Point A',
      '- Point B',
      '',
      '| Col1 | Col2 |',
      '| --- | --- |',
      '| Data1 | Data2 |',
      '',
      '<blockquote>A notable quote</blockquote>',
      '',
      '### Code Example',
      '',
      '```python',
      'print("hello")',
      '```',
    ].join('\n');
    const { container } = renderContent(content);
    expect(container.querySelector('h1')).toHaveTextContent('Blog Post Title');
    expect(container.querySelector('h2')).toHaveTextContent('Section One');
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('blockquote')).toHaveTextContent('A notable quote');
    expect(container.querySelector('pre')).toBeInTheDocument();
  });
});

// ============================================================================
// XSS / Security Tests — Defense-in-depth against malicious content injection
// ============================================================================
describe('XSS Security (rehype-sanitize)', () => {

  describe('Script Injection', () => {
    it('strips <script> tags completely', () => {
      const { container } = renderContent('<script>alert("xss")</script><p>Safe</p>');
      expect(container.querySelector('script')).toBeNull();
      expect(container.textContent).not.toContain('alert');
      expect(container.querySelector('p')).toHaveTextContent('Safe');
    });

    it('strips <script src="..."> tags', () => {
      const { container } = renderContent('<script src="https://evil.com/xss.js"></script><p>Safe</p>');
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('p')).toHaveTextContent('Safe');
    });
  });

  describe('Event Handler Injection', () => {
    it('strips onclick handlers from elements', () => {
      const { container } = renderContent('<p onclick="alert(1)">Click me</p>');
      const p = container.querySelector('p');
      expect(p).toHaveTextContent('Click me');
      expect(p?.getAttribute('onclick')).toBeNull();
    });

    it('strips onerror handlers from images', () => {
      const { container } = renderContent('<img src="x" onerror="alert(1)" alt="test">');
      const img = container.querySelector('img');
      expect(img?.getAttribute('onerror')).toBeNull();
      expect(img?.getAttribute('alt')).toBe('test');
    });

    it('strips onmouseover handlers from links', () => {
      const { container } = renderContent('<a href="https://safe.com" onmouseover="alert(1)">Link</a>');
      const a = container.querySelector('a');
      expect(a).toHaveTextContent('Link');
      expect(a?.getAttribute('onmouseover')).toBeNull();
    });
  });

  describe('Dangerous URL Protocols', () => {
    it('strips javascript: protocol from links', () => {
      const { container } = renderContent('<a href="javascript:alert(1)">Click</a>');
      const a = container.querySelector('a');
      // Sanitizer removes the dangerous href entirely
      const href = a?.getAttribute('href');
      expect(href == null || !href.includes('javascript')).toBe(true);
    });

    it('strips javascript: protocol from markdown links', () => {
      const { container } = renderContent('[Click](javascript:alert(1))');
      const a = container.querySelector('a');
      const href = a?.getAttribute('href');
      expect(href == null || !href.includes('javascript')).toBe(true);
    });

    it('strips vbscript: protocol from links', () => {
      const { container } = renderContent('<a href="vbscript:MsgBox(1)">Click</a>');
      const a = container.querySelector('a');
      const href = a?.getAttribute('href');
      expect(href == null || !href.includes('vbscript')).toBe(true);
    });
  });

  describe('Dangerous Elements', () => {
    it('strips <iframe> tags', () => {
      const { container } = renderContent('<iframe src="https://evil.com"></iframe><p>Safe</p>');
      expect(container.querySelector('iframe')).toBeNull();
      expect(container.querySelector('p')).toHaveTextContent('Safe');
    });

    it('strips <object> and <embed> tags', () => {
      const { container } = renderContent('<p>Before</p><object data="evil.swf"></object><embed src="evil.swf"><p>After</p>');
      expect(container.querySelector('object')).toBeNull();
      expect(container.querySelector('embed')).toBeNull();
      // Verify dangerous elements are gone; safe content preserved
      expect(container.textContent).toContain('Before');
    });

    it('strips <form> tags', () => {
      const { container } = renderContent('<form action="https://evil.com"><input type="text"><button>Submit</button></form><p>Safe</p>');
      expect(container.querySelector('form')).toBeNull();
      expect(container.querySelector('button')).toBeNull();
      expect(container.querySelector('p')).toHaveTextContent('Safe');
    });

    it('strips <style> tags (CSS injection)', () => {
      const { container } = renderContent('<style>body{display:none}</style><p>Visible</p>');
      expect(container.querySelector('style')).toBeNull();
      expect(container.querySelector('p')).toHaveTextContent('Visible');
    });

    it('strips <meta> and <link> tags', () => {
      const { container } = renderContent('<p>Before</p><meta http-equiv="refresh" content="0;url=evil.com"><link rel="stylesheet" href="evil.css"><p>After</p>');
      expect(container.querySelector('meta')).toBeNull();
      expect(container.querySelector('link')).toBeNull();
      expect(container.textContent).toContain('Before');
    });

    it('strips <base> tag (URL hijacking)', () => {
      const { container } = renderContent('<base href="https://evil.com"><a href="/page">Link</a>');
      expect(container.querySelector('base')).toBeNull();
    });

    it('strips <svg> with embedded scripts', () => {
      const { container } = renderContent('<p>Before</p><svg onload="alert(1)"><circle r="10"/></svg><p>After</p>');
      expect(container.querySelector('svg')).toBeNull();
      expect(container.textContent).toContain('Before');
    });
  });

  describe('Safe Content Preserved After Sanitization', () => {
    it('preserves safe HTML after stripping dangerous content', () => {
      const content = '<h2>Title</h2><script>alert(1)</script><p>This is <strong>safe</strong> content.</p>';
      const { container } = renderContent(content);
      expect(container.querySelector('h2')).toHaveTextContent('Title');
      expect(container.querySelector('strong')).toHaveTextContent('safe');
      expect(container.querySelector('script')).toBeNull();
    });

    it('preserves safe links while stripping javascript links', () => {
      const content = '<a href="https://qualiflow.ai">Safe</a> and <a href="javascript:alert(1)">Dangerous</a>';
      const { container } = renderContent(content);
      const links = container.querySelectorAll('a');
      expect(links[0]?.getAttribute('href')).toBe('https://qualiflow.ai');
    });

    it('preserves images with safe attributes only', () => {
      const { container } = renderContent('<img src="https://img.com/photo.jpg" alt="Photo" onerror="alert(1)" data-evil="yes">');
      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBe('https://img.com/photo.jpg');
      expect(img?.getAttribute('alt')).toBe('Photo');
      expect(img?.getAttribute('onerror')).toBeNull();
      expect(img?.getAttribute('data-evil')).toBeNull();
    });

    it('preserves GFM tables after sanitization', () => {
      const content = '| Name | Score |\n|---|---|\n| Alice | 95 |';
      const { container } = renderContent(content);
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('th')).toHaveTextContent('Name');
    });
  });
});
