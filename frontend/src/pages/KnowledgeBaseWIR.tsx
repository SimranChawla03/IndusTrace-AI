// frontend/src/pages/KnowledgeBaseWIR.tsx
import React, { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { api, WIRRule, ResearchSource } from '../services/api';

export const KnowledgeBaseWIR: React.FC = () => {
  const [rules, setRules] = useState<WIRRule[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'sources'>('rules');

  useEffect(() => {
    loadWIR();
  }, [searchQuery]);

  const loadWIR = async () => {
    try {
      setLoading(true);
      const [rulesData, sourcesData] = await Promise.all([
        api.getWirRules(searchQuery),
        api.getResearchSources(),
      ]);
      setRules(rulesData);
      setSources(sourcesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Waste Intelligence Repository (WIR)"
        subtitle="Structured, research-derived investigation rules, literature benchmarks, and evidence citations."
      />

      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        <ScientificNotice>
          <p>
            <strong>Research Boundary Principle:</strong> WIR rules and reference sources reflect published academic experiments and industrial surveys. They prompt critical investigation areas and test pathways. They must never be presented as measured properties of a user's plant.
          </p>
        </ScientificNotice>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center bg-[#E5EEE3] p-1.5 rounded-xl border border-[#DCE5DA] text-[15px] font-medium">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-5 py-2.5 rounded-lg transition ${
                activeTab === 'rules'
                  ? 'bg-[#FFFFFF] text-[#202C25] font-semibold shadow-xs border border-[#DCE5DA]'
                  : 'text-[#56645A] hover:text-[#202C25]'
              }`}
            >
              WIR Investigation Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-5 py-2.5 rounded-lg transition ${
                activeTab === 'sources'
                  ? 'bg-[#FFFFFF] text-[#202C25] font-semibold shadow-xs border border-[#DCE5DA]'
                  : 'text-[#56645A] hover:text-[#202C25]'
              }`}
            >
              Research Source Library ({sources.length})
            </button>
          </div>

          <div className="relative w-full sm:w-88">
            <Search className="w-4.5 h-4.5 text-[#778279] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search waste, alloy, process..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[15px] text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] focus:border-[#278653] transition"
            />
          </div>
        </div>

        {/* Tab 1: Rules Table */}
        {activeTab === 'rules' && (
          <div className="bg-[#FFFFFF] rounded-xl border border-[#DCE5DA] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#DCE5DA] flex items-center justify-between bg-[#F0F5EC]">
              <h2 className="font-semibold text-[#202C25] text-[17px]">Active Repository Rules</h2>
              <span className="text-[13px] text-[#778279] font-mono">Seeded from WIR_Starter.csv</span>
            </div>

            {loading ? (
              <p className="text-[14px] text-[#778279] py-12 text-center">Loading intelligence rules...</p>
            ) : rules.length === 0 ? (
              <p className="text-[14px] text-[#778279] py-12 text-center">No rules match search query.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[13px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Rule ID</th>
                      <th className="py-3.5 px-4">Waste Stream Topic</th>
                      <th className="py-3.5 px-4">Investigation Area</th>
                      <th className="py-3.5 px-4">Trigger / Condition</th>
                      <th className="py-3.5 px-4">Prescribed Rule Action</th>
                      <th className="py-3.5 px-4">Evidence Source</th>
                      <th className="py-3.5 px-4">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DA]">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-[#F0F5EC]/60 transition">
                        <td className="py-4 px-4 font-mono font-semibold text-[#26734D] text-[13px]">{rule.id}</td>
                        <td className="py-4 px-4 font-semibold text-[#202C25]">{rule.waste_stream}</td>
                        <td className="py-4 px-4 text-[#56645A]">{rule.investigation_area}</td>
                        <td className="py-4 px-4 text-[#8A5A00] font-medium text-[13px]">{rule.missing_or_condition}</td>
                        <td className="py-4 px-4 text-[#56645A] max-w-sm leading-normal">{rule.rule_action}</td>
                        <td className="py-4 px-4">
                          {rule.source_url ? (
                            <a
                              href={rule.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#26734D] hover:underline inline-flex items-center gap-1.5 font-medium transition text-[13px]"
                            >
                              <span>{rule.evidence_source_id || 'Ref'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[#778279] text-[13px]">{rule.evidence_source_id || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded text-[13px] font-medium border bg-[#E5EEE3] text-[#26734D] border-[#C2D8C4]">
                            {rule.evidence_confidence || 'Moderate'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sources Table */}
        {activeTab === 'sources' && (
          <div className="bg-[#FFFFFF] rounded-xl border border-[#DCE5DA] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#DCE5DA] flex items-center justify-between bg-[#F0F5EC]">
              <h2 className="font-semibold text-[#202C25] text-[17px]">Peer-Reviewed & Public Datasets Library</h2>
              <span className="text-[13px] text-[#778279] font-mono">Seeded from Research_Source_Library.csv</span>
            </div>

            <div className="divide-y divide-[#DCE5DA]">
              {sources.map((src) => (
                <div key={src.source_id} className="p-6 hover:bg-[#F0F5EC]/60 transition text-[14px] space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#E5EEE3] text-[#26734D] border border-[#C2D8C4] font-mono font-medium text-[13px] mr-2.5">
                        {src.source_id}
                      </span>
                      <span className="font-semibold text-[#202C25] text-[16px]">{src.title}</span>
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#26734D] hover:underline flex items-center gap-1.5 font-medium flex-shrink-0 transition text-[14px]"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-[#778279] text-[13px]">
                    {src.authors} • {src.venue} ({src.publication_year || 'N/D'})
                  </p>
                  <p className="text-[#56645A] leading-relaxed text-[14px]">{src.relevant_summary}</p>
                  {src.caveat && (
                    <div className="p-3.5 bg-[#FFF5DD] rounded-lg border border-[#E8D8A7] text-[#8A5A00]/90 text-[13px] leading-relaxed">
                      <strong className="text-[#8A5A00] font-semibold">Caveat / Limitation:</strong> {src.caveat}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
