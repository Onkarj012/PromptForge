"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-100 mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-gray-100 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-gray-200 mt-3 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-gray-200 mt-2 mb-1">
              {children}
            </h4>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-300 my-2 leading-relaxed">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-300 my-2 space-y-1 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-300 my-2 space-y-1 pl-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300">{children}</li>
          ),
          // Code
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-slate-700/80 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block bg-slate-900/80 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono my-2 border border-slate-700 ${className}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-slate-900/80 rounded-lg overflow-x-auto my-2 border border-slate-700">
              {children}
            </pre>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-gray-400 bg-slate-900/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-gray-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-300">{children}</em>
          ),
          // Horizontal rule
          hr: () => <hr className="border-slate-600 my-4" />,
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-slate-600 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-700/50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-600">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-600 last:border-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-300">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
