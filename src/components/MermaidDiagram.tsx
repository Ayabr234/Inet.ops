import React, { useState } from 'react';
import { Copy, Check, Terminal, Eye } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MermaidDiagramProps {
  id: string;
  title?: string;
  mermaidCode: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ title, mermaidCode }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine the diagram type
  const isSequence = mermaidCode.trim().startsWith('sequenceDiagram');

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden my-6 shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {isSequence ? 'Sequence Flow Diagram' : 'Architecture Topology'}
          </span>
          {title && (
            <>
              <span className="text-neutral-400">·</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                {title}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'visual'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Visual</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'code'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Mermaid Source</span>
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="Copy Mermaid syntax"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-5">
        {viewMode === 'code' ? (
          <CodeBlock code={mermaidCode} language="mermaid" filename="topology.mmd" />
        ) : (
          <div className="w-full overflow-x-auto py-2">
            {isSequence ? (
              <RenderSequenceVisual code={mermaidCode} />
            ) : (
              <RenderGraphVisual code={mermaidCode} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Clean visual representation of graph diagrams
function RenderGraphVisual({ code }: { code: string }) {
  const lines = code
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('graph') && !l.startsWith('subgraph') && !l.startsWith('end'));

  const relationships = lines
    .filter(l => l.includes('-->') || l.includes('-.->'))
    .map(l => {
      const isDashed = l.includes('-.->');
      const delimiter = isDashed ? '-.->' : '-->';
      const parts = l.split(delimiter);
      const from = parts[0]?.trim() || '';
      let rest = parts[1]?.trim() || '';
      let label = '';
      if (rest.startsWith('|')) {
        const labelEnd = rest.indexOf('|', 1);
        if (labelEnd !== -1) {
          label = rest.substring(1, labelEnd);
          rest = rest.substring(labelEnd + 1).trim();
        }
      }
      return {
        from: cleanNodeName(from),
        to: cleanNodeName(rest),
        label,
        isDashed
      };
    })
    .filter(r => r.from && r.to);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {relationships.map((rel, i) => (
          <div
            key={i}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/40 text-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono text-[11px] bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {rel.from}
              </span>
              <span className="text-neutral-400 text-[11px]">→</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono text-[11px] bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {rel.to}
              </span>
            </div>
            {rel.label && (
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed border-t border-neutral-200 dark:border-neutral-800/80 pt-1.5 mt-1">
                {rel.label}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-neutral-500 italic text-right">
        Tip: Switch to "Mermaid Source" to copy or embed directly in markdown / GitHub.
      </p>
    </div>
  );
}

// Clean visual representation of sequence diagrams
function RenderSequenceVisual({ code }: { code: string }) {
  const lines = code
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('->>') || l.includes('-->>'));

  const steps = lines.map((line, idx) => {
    const isArrow = line.includes('->>');
    const isDashed = line.includes('-->>');
    const separator = isDashed ? '-->>' : '->>';
    const [fromPart, restPart] = line.split(separator);
    const from = (fromPart || '').trim();
    const [toPart, ...descParts] = (restPart || '').split(':');
    const to = (toPart || '').trim();
    const desc = descParts.join(':').trim();

    return {
      num: idx + 1,
      from,
      to,
      desc,
      isDashed
    };
  });

  return (
    <div className="space-y-2">
      {steps.map(step => (
        <div
          key={step.num}
          className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-950/30 text-xs"
        >
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono font-medium flex items-center justify-center shrink-0 text-[11px]">
            {step.num}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-neutral-900 dark:text-neutral-200 font-mono text-[11px]">
                {step.from}
              </span>
              <span className="text-neutral-400 text-[11px]">
                {step.isDashed ? '⤏ (response)' : '⟶'}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200 font-mono text-[11px]">
                {step.to}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[12px]">
              {step.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function cleanNodeName(str: string): string {
  // Strip node ID labels like Client([Web Visitor]) -> Web Visitor
  const match = str.match(/\[(.*?)\]|\((.*?)\)|\{(.*?)\}/);
  if (match) {
    return match[1] || match[2] || match[3] || str;
  }
  return str.replace(/<[^>]*>?/gm, '').trim();
}
