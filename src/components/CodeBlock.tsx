import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 overflow-hidden my-4 text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-800 text-neutral-400">
        <div className="flex items-center gap-2">
          {filename && <span className="font-mono text-neutral-200">{filename}</span>}
          {language && (
            <span className="font-mono text-[11px] text-neutral-500 uppercase">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors whitespace-nowrap shrink-0"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto p-4 font-mono leading-relaxed text-neutral-200">
        <pre className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              <span className="table-cell pr-4 text-neutral-600 select-none text-right w-8 tabular-nums">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
