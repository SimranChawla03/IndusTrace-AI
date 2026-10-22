// frontend/src/pages/TestWorthinessAssessment.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Target, 
  AlertTriangle, 
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { useAuth } from '../context/AuthContext';
import { api, WasteStream, Assessment } from '../services/api';

export const TestWorthinessAssessment: React.FC = () => {
  const { company } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedStreamId = searchParams.get('streamId');

  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(preselectedStreamId || '');
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [ranking, setRanking] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadStreamsAndRanking();
  }, [company?.id]);

  useEffect(() => {
    if (selectedStreamId) {
      loadStreamAssessment(parseInt(selectedStreamId));
    }
  }, [selectedStreamId]);

  const loadStreamsAndRanking = async () => {
    try {
      setLoading(true);
      const [streamsData, rankingData] = await Promise.all([
        api.getWasteStreams(company?.id),
        api.getAssessmentRanking(company?.id),
      ]);
      setStreams(streamsData);
      setRanking(rankingData);

      if (!selectedStreamId && streamsData.length > 0) {
        setSelectedStreamId(String(streamsData[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStreamAssessment = async (id: number) => {
    try {
      setEvaluating(true);
      const data = await api.getAssessment(id);
      setCurrentAssessment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleRecompute = async () => {
    if (!selectedStreamId) return;
    try {
      setEvaluating(true);
      const data = await api.runAssessment(parseInt(selectedStreamId));
      setCurrentAssessment(data);
      const newRanking = await api.getAssessmentRanking(company?.id);
      setRanking(newRanking);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Test Worthiness Assessment"
        subtitle="Transparent 6-factor prioritization ranking waste streams for laboratory characterization."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        <ScientificNotice title="Prototype TWS Methodology & Weights">
          <p>
            <strong>Scoring Weights (Sum 100%):</strong> Quantity (20%) + Frequency (15%) + Information Gap (25%) + Recovery Potential (20%) + Evidence Confidence (10%) + Economic Relevance (10%).
          </p>
          <p className="mt-1">
            <strong>Transparent Uncertainty Handling:</strong> High Information Gap increases testing priority rather than penalizing the score. Unknown parameters are marked with explicit warnings and never fabricated.
          </p>
        </ScientificNotice>

        {/* Stream Selector & Recompute Action matching Panel 7 */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center flex-shrink-0 text-[#26734D]">
              <Target className="w-5 h-5" />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-[13px] font-semibold text-[#56645A]">Select Waste Stream</label>
              <select
                value={selectedStreamId}
                onChange={(e) => setSelectedStreamId(e.target.value)}
                className="mt-1 px-4 py-2 border border-[#DCE5DA] rounded-xl text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#278653] bg-[#FFFFFF] text-[#202C25] min-w-[320px] transition"
              >
                {streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stream_name} ({s.waste_category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRecompute}
            disabled={evaluating || !selectedStreamId}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#278653] hover:bg-[#227549] disabled:opacity-50 text-white rounded-xl text-[14px] font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Computing TWS...' : 'Re-evaluate'}</span>
          </button>
        </div>

        {/* Detailed Assessment Card matching Reference Panel 7 Layout */}
        {currentAssessment && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Big Circular Gauge / Hero Score matching Panel 7 */}
            <div className="lg:col-span-5 bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <span className="text-[13px] font-bold text-[#56645A] uppercase tracking-wider block">
                  Test Worthiness Score (TWS)
                </span>

                {/* Circular Score Hero Display */}
                <div className="my-6 relative w-48 h-48 mx-auto flex items-center justify-center">
                  {/* Outer circle border with green accent */}
                  <div className="w-48 h-48 rounded-full border-8 border-[#26734D] border-t-[#B8E2C1] flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[48px] font-extrabold text-[#202C25] tracking-tight leading-none">
                      {currentAssessment.tws_score !== null ? currentAssessment.tws_score : 'N/A'}
                    </span>
                    <span className="text-[13px] font-semibold text-[#778279] mt-1">/ 100</span>
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="flex justify-center">
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border ${
                    currentAssessment.priority_level === 'High'
                      ? 'bg-[#FDECEC] text-[#A42D2D] border-[#F5C2C2]'
                      : currentAssessment.priority_level === 'Medium'
                      ? 'bg-[#FFF5DD] text-[#8A5A00] border-[#E8D8A7]'
                      : 'bg-[#E5EEE3] text-[#26734D] border-[#C2D8C4]'
                  }`}>
                    Priority: {currentAssessment.priority_level}
                  </span>
                </div>

                {/* Recommended Next Action */}
                <div className="mt-6 pt-6 border-t border-[#DCE5DA] text-left space-y-1.5">
                  <span className="text-[12px] font-semibold text-[#8A5A00] uppercase tracking-wider block">
                    Recommended Next Action
                  </span>
                  <p className="text-[17px] font-bold text-[#202C25]">
                    {currentAssessment.recommendation}
                  </p>
                  <p className="text-[13px] text-[#56645A] leading-relaxed">
                    {currentAssessment.recommendation_details.reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE5DA] w-full text-left">
                <p className="text-[12px] text-[#778279]">
                  Evaluated Target: <strong className="text-[#202C25]">{currentAssessment.stream_name}</strong>
                </p>
              </div>
            </div>

            {/* Right Column: 6 Factor Breakdown with Horizontal Bars matching Panel 7 */}
            <div className="lg:col-span-7 bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-5">
              <h3 className="font-bold text-[#202C25] text-[18px]">
                Factor Breakdown
              </h3>

              <div className="space-y-4">
                {currentAssessment.factor_breakdown.map((factor) => {
                  const pct = Math.min(100, Math.max(0, factor.normalized_score));
                  return (
                    <div key={factor.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#202C25]">{factor.name}</span>
                          <span className="text-[12px] text-[#778279]">({factor.weight_percent}%)</span>
                        </div>
                        <span className="font-mono font-bold text-[13px] text-[#202C25]">
                          {factor.normalized_score}/100
                        </span>
                      </div>

                      {/* Progress bar matching reference Panel 7 */}
                      <div className="w-full h-2.5 rounded-full bg-[#E5EEE3] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#278653] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <p className="text-[12px] text-[#56645A]">{factor.explanation}</p>
                    </div>
                  );
                })}
              </div>

              {/* Missing Information Identified */}
              {currentAssessment.missing_critical_info.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#DCE5DA] bg-[#FFF5DD]/50 p-4 rounded-xl border border-[#E8D8A7]">
                  <h4 className="text-[13px] font-semibold text-[#8A5A00] flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#8A5A00]" />
                    <span>Missing Critical Information Identified ({currentAssessment.missing_critical_info.length})</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[13px] text-[#8A5A00]/90 pl-1">
                    {currentAssessment.missing_critical_info.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Multi-Stream Priority Ranking Comparison Table */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-4">
          <h3 className="font-bold text-[#202C25] text-[18px]">
            Multi-Stream Priority Ranking
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[12px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Waste Stream</th>
                  <th className="py-3 px-4">TWS Score</th>
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">Recommended Next Step</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5DA]">
                {ranking.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#F0F5EC]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#778279] text-[13px]">#{idx + 1}</td>
                    <td className="py-4 px-4 font-semibold text-[#202C25]">{item.stream_name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#26734D] text-[15px]">
                      {item.tws_score}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold border ${
                        item.priority_level === 'High'
                          ? 'bg-[#FDECEC] text-[#A42D2D] border-[#F5C2C2]'
                          : item.priority_level === 'Medium'
                          ? 'bg-[#FFF5DD] text-[#8A5A00] border-[#E8D8A7]'
                          : 'bg-[#E5EEE3] text-[#26734D] border-[#C2D8C4]'
                      }`}>
                        {item.priority_level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#56645A] max-w-sm text-[13px]">{item.recommendation}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedStreamId(String(item.waste_stream_id))}
                        className="px-3 py-1.5 bg-[#E5EEE3] hover:bg-[#D0E3D1] text-[#26734D] rounded-lg font-semibold text-[13px] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
