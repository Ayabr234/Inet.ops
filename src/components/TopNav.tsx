import React from 'react';
import { Server, ArrowUpRight } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDeployClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, onDeployClick }) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'phase1', label: '01. Research' },
    { id: 'phase2', label: '02. Architecture' },
    { id: 'phase3', label: '03. Prototype' },
    { id: 'phase4', label: '04. Runbook' },
    { id: 'phase5', label: '05. Governance' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('phase1')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
            <Server className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0">
              inet.org
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  isActive
                    ? 'text-neutral-900 dark:text-white font-semibold'
                    : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDeployClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            <span>Live Node Simulator</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Sub-Bar */}
      <div className="lg:hidden flex items-center gap-2 px-6 py-2 overflow-x-auto border-t border-neutral-100 dark:border-neutral-800/80 scrollbar-none text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 text-xs transition-colors ${
              activeTab === item.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
