// frontend/src/pages/ResearchConsolePage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
import { KnowledgeBaseWIR } from './KnowledgeBaseWIR';
import { DataExplorer } from './DataExplorer';

export const ResearchConsolePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wir' | 'datasets'>('wir');

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#202C25] flex flex-col">
      {/* Console Header */}
      <header className="bg-[#FFFFFF] border-b border-[#DCE5DA] px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/app/dashboard"
            className="p-2 rounded-xl border border-[#DCE5DA] text-[#56645A] hover:bg-[#F0F5EC] hover:text-[#202C25] transition flex items-center gap-1.5 text-[13px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>

          <div className="h-6 w-[1px] bg-[#DCE5DA]"></div>

          <div>
            <h1 className="font-bold text-[18px] text-[#202C25] leading-tight">
              Platform Administration & Research Console
            </h1>
            <p className="text-[12px] text-[#56645A]">
              Waste Intelligence Repository (WIR) • Zenodo Public Datasets • Scientific Guardrails
            </p>
          </div>
        </div>

        <div className="flex items-center bg-[#E5EEE3] p-1 rounded-xl border border-[#DCE5DA] text-[13px]">
          <button
            onClick={() => setActiveTab('wir')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'wir'
                ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                : 'text-[#56645A] hover:text-[#202C25]'
            }`}
          >
            WIR Rules & Sources
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'datasets'
                ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                : 'text-[#56645A] hover:text-[#202C25]'
            }`}
          >
            Datasets & Provenance
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'wir' ? <KnowledgeBaseWIR /> : <DataExplorer />}
      </main>
    </div>
  );
};
