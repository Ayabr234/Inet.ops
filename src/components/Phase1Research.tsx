import React, { useState } from 'react';
import { phase1Layers, phase1Summary } from '../data/phase1Data';
import { MermaidDiagram } from './MermaidDiagram';
import { CheckCircle2, AlertTriangle, ArrowRight, Layers, ShieldCheck, Globe } from 'lucide-react';

export const Phase1Research: React.FC = () => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(phase1Layers[0].id);

  const currentLayer = phase1Layers.find((l) => l.id === selectedLayerId) || phase1Layers[0];

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>Phase 1</span>
          <span aria-hidden="true">·</span>
          <span>Technical Research & Architectural Layer Mapping</span>
          <span aria-hidden="true">·</span>
          <span>Open Source Stack (MIT / Apache-2.0)</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance">
          Deconstructing the Web Hosting Stack into Sovereign Public Infrastructure
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          Web hosting today is concentrated inside a handful of hyperscale corporate silos. To make
          hosting a durable public utility, <span className="font-semibold text-neutral-900 dark:text-neutral-100">inet.org</span> reuses
          proven, permissive open-source components across all nine infrastructure layers—optimizing for single-operator autonomy today and seamless inter-node federation tomorrow.
        </p>

        {/* Core Principles Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>MIT / Apache-2.0 Only</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Strict licensing guarantees freedom from proprietary vendor traps or commercial relicensing.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Reuse Proven OSS</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              No custom wheel reinvention. Battle-tested Caddy, CoreDNS, and Linux cgroups form the spine.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Honesty About Limits</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Clear boundary between single-node capacity, hardware costs, and volunteer maintenance realities.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Federation-Ready</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Standardized APIs and cryptographic identities so independent nodes can interconnect seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {phase1Layers.map((layer, index) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="font-mono opacity-60">0{index + 1}.</span>
                <span>{layer.name.split('. ')[1] || layer.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Layer In-Depth Report */}
      <div className="space-y-8 max-w-5xl">
        {/* Layer Header & Plain Language Explanation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>Layer Evaluation</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{currentLayer.id}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {currentLayer.name}
          </h2>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 italic">
            {currentLayer.tagline}
          </p>
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
              Plain-Language Explanation:
            </span>
            {currentLayer.plainLanguage}
          </div>
        </div>

        {/* Mermaid Diagram */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 mb-2">
            Layer Architecture & Control Flow
          </h3>
          <MermaidDiagram
            id={currentLayer.id}
            title={`${currentLayer.name} Flow`}
            mermaidCode={currentLayer.mermaidDiagram}
          />
        </div>

        {/* Three Open Source Options Matrix */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-200">
            Open-Source Options Analysis (3 Real Implementations)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentLayer.options.map((option) => (
              <div
                key={option.name}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {option.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-mono">
                      <span>{option.license}</span>
                      <span>·</span>
                      <span className="truncate max-w-[140px]">{option.repoOrWebsite}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1">
                      Strengths:
                    </span>
                    <ul className="space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1">
                      Trade-offs:
                    </span>
                    <ul className="space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed bg-neutral-50/60 dark:bg-neutral-950/40 p-2.5 rounded-lg">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-0.5">
                    Community Operator Assessment:
                  </span>
                  {option.communityFit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Recommendation */}
        <div className="p-5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-neutral-950 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500 text-neutral-950 uppercase tracking-wider">
              Formal Recommendation
            </span>
            <span className="font-bold text-sm text-neutral-100 font-mono">
              {currentLayer.recommendation.chosen}
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {currentLayer.recommendation.reasoning}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-400 font-medium block mb-1">Honest Limits & Trade-offs:</span>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {currentLayer.recommendation.limitsAndTradeoffs}
              </p>
            </div>
            <div>
              <span className="text-neutral-400 font-medium block mb-1">Federation Readiness:</span>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {currentLayer.recommendation.federationReadiness}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1 Summary: Open Questions & Next Steps */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 max-w-5xl space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Phase 1 Evaluation: Open Questions & Immediate Next Steps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Open Questions Flagged During Research:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase1Summary.openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-neutral-400 shrink-0">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Phase 2 Transition Goals:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase1Summary.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
