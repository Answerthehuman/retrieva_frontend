import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renders assistant output as markdown.
 *
 * The backend streams tokens tagged `"format": "markdown"` and the model emits
 * real markdown (`#` headings, `**bold**`, bullet lists, tables). Previously the
 * bubble printed those characters literally.
 *
 * Element styles are declared explicitly rather than via @tailwindcss/typography
 * so the output inherits this app's type scale and border tokens instead of
 * prose defaults, and so no extra Tailwind plugin is needed.
 *
 * Security: react-markdown does not render raw HTML unless `rehype-raw` is added.
 * It is deliberately NOT added — model output is untrusted input, and this keeps
 * HTML/script injection off the table.
 */

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-[15px] font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[15px] font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-foreground mt-3.5 mb-1.5 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-foreground/90 mt-3 mb-1.5 first:mt-0">{children}</h4>
  ),

  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-foreground/90 mb-2.5 last:mb-0">{children}</p>
  ),

  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,

  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-2.5 space-y-1 marker:text-muted-foreground last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-2.5 space-y-1 marker:text-muted-foreground last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed text-foreground/90 [&>p]:mb-0">{children}</li>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      // Model-supplied links are untrusted: noreferrer also blocks the
      // reverse-tabnabbing window.opener handle, not just the Referer header.
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),

  code: ({ className, children, ...props }) => {
    // react-markdown v10 no longer passes an `inline` prop. Fenced blocks carry
    // a `language-*` class and are wrapped in <pre>; bare inline code has neither.
    const isBlock = /language-(\w+)/.test(className || '');
    if (isBlock) {
      return (
        <code className={cn('font-mono text-[13px] leading-relaxed', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground border border-border/60"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    // Long lines scroll inside the block instead of widening the chat bubble.
    <pre className="mb-2.5 overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 last:mb-0">
      {children}
    </pre>
  ),

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 my-2.5 text-foreground/75 italic">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-3.5 border-border" />,

  // Tables need their own scroll container so a wide table can't force the
  // whole page into horizontal scroll.
  table: ({ children }) => (
    <div className="mb-2.5 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-2.5 py-1.5 text-left text-[13px] font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2.5 py-1.5 text-[13px] text-foreground/90 align-top">
      {children}
    </td>
  ),
};

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown = ({ content, className }: MarkdownProps) => (
  <div className={cn('min-w-0', className)}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
);
