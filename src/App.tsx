/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { ManifestoView } from './components/ManifestoView';
import { Phase1Research } from './components/Phase1Research';
import { Phase2Architecture } from './components/Phase2Architecture';
import { Phase3Prototype } from './components/Phase3Prototype';
import { Phase4OperatorDocs } from './components/Phase4OperatorDocs';
import { Phase5Governance } from './components/Phase5Governance';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDeployClick={() => setActiveTab('phase3')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'overview' && <ManifestoView onNavigatePhase={(phase) => setActiveTab(phase)} />}
        {activeTab === 'phase1' && <Phase1Research />}
        {activeTab === 'phase2' && <Phase2Architecture />}
        {activeTab === 'phase3' && <Phase3Prototype />}
        {activeTab === 'phase4' && <Phase4OperatorDocs />}
        {activeTab === 'phase5' && <Phase5Governance />}
      </main>

      {/* Quiet, Clean Editorial Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 mt-16 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-[10px]">
              i
            </div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              inet.org
            </span>
            <span aria-hidden="true">·</span>
            <span>Community-Governed Public Hosting Infrastructure</span>
            <span aria-hidden="true">·</span>
            <span>MIT & Apache-2.0 Licensed</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('phase1')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Research
            </button>
            <button
              onClick={() => setActiveTab('phase2')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Specs
            </button>
            <button
              onClick={() => setActiveTab('phase3')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Live Prototype
            </button>
            <button
              onClick={() => setActiveTab('phase4')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Operator Runbook
            </button>
            <button
              onClick={() => setActiveTab('phase5')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Governance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
