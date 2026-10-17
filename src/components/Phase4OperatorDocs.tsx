import React, { useState } from 'react';
import { phase4OperatorDocs } from '../data/phase4Data';
import { CodeBlock } from './CodeBlock';
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, BookOpen, Terminal, Shield } from 'lucide-react';

export const Phase4OperatorDocs: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const progressPercentage = Math.round((completedSteps.length / phase4OperatorDocs.steps.length) * 100);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>Phase 4</span>
          <span aria-hidden="true">·</span>
          <span>Operator Handbook & Runbooks</span>
          <span aria-hidden="true">·</span>
          <span>Third-Party Autonomous Deployment</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance">
          Complete Operator Deployment Runbook: From Bare Metal to Running Node
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          A third-party operator or community cooperative should be able to deploy a production-grade
          <span className="font-semibold text-neutral-900 dark:text-neutral-100"> inet.org</span> node
          using only these verified instructions. All steps have been verified literally on Ubuntu 24.04 LTS and Debian 12 Bookworm.
        </p>

        {/* Prerequisites Sizing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs">
            <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
              Hardware Baseline
            </span>
            <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">Minimum: </span>
                {phase4OperatorDocs.prerequisites.minimumSpecs}
              </div>
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">Recommended: </span>
                {phase4OperatorDocs.prerequisites.recommendedSpecs}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs">
            <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
              Operating System & Network
            </span>
            <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">OS: </span>
                {phase4OperatorDocs.prerequisites.supportedOS}
              </div>
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">Network: </span>
                {phase4OperatorDocs.prerequisites.networkRequirements}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Progress Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white block">
              Operator Runbook Checklist
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              {completedSteps.length} of {phase4OperatorDocs.steps.length} steps completed ({progressPercentage}%)
            </span>
          </div>
        </div>

        <div className="w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-neutral-900 dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step-by-Step Runbook */}
      <div className="space-y-6 max-w-5xl">
        {phase4OperatorDocs.steps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              className={`p-5 rounded-xl border transition-colors shadow-2xs ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      STEP 0{step.stepNumber}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3">
                <CodeBlock
                  code={step.terminalCommands}
                  language="bash"
                  filename={`step-${step.stepNumber}.sh`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Troubleshooting Matrix */}
      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Operator Troubleshooting & Edge Cases
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase4OperatorDocs.troubleshooting.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs"
            >
              <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">
                {item.issue}
              </h4>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                  Root Cause:
                </span>
                {item.cause}
              </div>
              <div className="pt-1 text-xs text-neutral-700 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  Actionable Remedy:
                </span>
                {item.solution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 4 Summary: Open Questions & Next Steps */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 max-w-5xl space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Phase 4 Evaluation: Open Questions & Governance Transition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Operations Open Questions:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase4OperatorDocs.openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-neutral-400 shrink-0">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Phase 5 Transition Goals:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase4OperatorDocs.nextSteps.map((s, i) => (
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
