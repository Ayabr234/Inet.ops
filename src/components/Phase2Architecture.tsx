import React from 'react';
import { phase2Architecture } from '../data/phase2Data';
import { MermaidDiagram } from './MermaidDiagram';
import { OpenApiViewer } from './OpenApiViewer';
import { ArrowRight, Shield, Cpu, Lock } from 'lucide-react';

export const Phase2Architecture: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>Phase 2</span>
          <span aria-hidden="true">·</span>
          <span>System Architecture & Specifications</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Overhead Single-Operator Node</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance">
          Architecture, Tenant Boundaries & Control Plane Protocols
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          {phase2Architecture.overview} Below are the formal component topologies, cryptographic
          threat models, data flow sequences, and standardized OpenAPI 3.1 specifications.
        </p>
      </div>

      {/* Component Diagram */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            1. Node Component Topology
          </h2>
          <span className="text-xs text-neutral-500 font-mono">Linux Host · Ingress · Sandboxes · Control Plane</span>
        </div>
        <MermaidDiagram
          id="component-topology"
          title="inet.org Standalone Node Topology"
          mermaidCode={phase2Architecture.componentDiagramMermaid}
        />
      </div>

      {/* Data Flow Sequences */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          2. Core Data Flows & Sequences
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {phase2Architecture.dataFlows.map((flow) => (
            <div
              key={flow.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-2xs"
            >
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                {flow.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {flow.description}
              </p>
              <MermaidDiagram id={flow.id} title={flow.title} mermaidCode={flow.mermaid} />
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Isolation & Hard Limits Specification */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            3. Tenant Isolation & Resource Enforcement
          </h2>
          <span className="text-xs text-neutral-500 font-mono">Kernel 6.x · Namespaces · cgroups v2 · Seccomp</span>
        </div>

        {/* Namespaces Grid */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Linux Namespaces Isolation Matrix (6 Independent Boundaries)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {phase2Architecture.tenantIsolationSpec.namespaces.map((ns) => (
              <div
                key={ns.name}
                className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs space-y-1"
              >
                <span className="font-mono font-bold text-neutral-900 dark:text-white text-[12px] block">
                  {ns.name}
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                  {ns.purpose}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* cgroups v2 Table */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              cgroups v2 Hard Limits & Accounting Parameters (/sys/fs/cgroup/inet.slice/)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono text-[11px]">
                  <th className="pb-2 font-semibold">cgroup Controller File</th>
                  <th className="pb-2 font-semibold">Production Default Value</th>
                  <th className="pb-2 font-semibold">Kernel Enforcement Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {phase2Architecture.tenantIsolationSpec.cgroupsV2.map((cg) => (
                  <tr key={cg.file} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40">
                    <td className="py-2.5 font-mono font-semibold text-neutral-900 dark:text-neutral-200">
                      {cg.file}
                    </td>
                    <td className="py-2.5 font-mono text-neutral-600 dark:text-neutral-400">
                      {cg.example}
                    </td>
                    <td className="py-2.5 text-neutral-600 dark:text-neutral-300">
                      {cg.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* OpenAPI Explorer */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          4. Control Plane & Node Agent OpenAPI 3.1 Spec
        </h2>
        <OpenApiViewer />
      </div>

      {/* STRIDE Threat Model */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-neutral-900 dark:text-white" />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            5. STRIDE Threat Model & Defense-in-Depth Mitigations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase2Architecture.threatModelStride.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="font-bold text-xs text-neutral-900 dark:text-white font-mono">
                  {item.category}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Evaluated
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-0.5">
                  Attack Vector:
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {item.threat}
                </p>
              </div>
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                  Engineered Mitigation:
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 2 Summary: Open Questions & Next Steps */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 max-w-5xl space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Phase 2 Evaluation: Open Questions & Prototype Transition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Architecture Open Questions:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase2Architecture.openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-neutral-400 shrink-0">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Phase 3 Prototype Deliverables:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase2Architecture.nextSteps.map((s, i) => (
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
