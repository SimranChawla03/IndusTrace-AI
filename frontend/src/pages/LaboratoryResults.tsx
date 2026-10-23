// frontend/src/pages/LaboratoryResults.tsx
import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, CheckCircle, AlertCircle, Filter, Search, X } from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { useAuth } from '../context/AuthContext';
import { api, LabResult, WasteStream } from '../services/api';

export const LaboratoryResults: React.FC = () => {
  const { company } = useAuth();
  const [results, setResults] = useState<LabResult[]>([]);
  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterStreamId, setFilterStreamId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPANY' | 'REFERENCE'>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const renderProvenanceBadge = (origin: string) => {
    switch (origin) {
      case 'VERIFIED_LAB_EVIDENCE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E5EEE3] text-[#26734D] border border-[#C2D8C4]">
            Verified Evidence
          </span>
        );
      case 'CAESAR_EXPERIMENTAL_REFERENCE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF3FF] text-[#245D9C] border border-[#BFD9F8]">
            CAESAR Public Ref
          </span>
        );
      case 'SYNTHETIC_DEMO':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F3EEFF] text-[#5E35B1] border border-[#D1C4E9]">
            Synthetic Demo
          </span>
        );
      case 'HYPOTHETICAL_SCENARIO':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF9E6] text-[#8C6D1F] border border-[#F0DC9E]">
            Hypothetical
          </span>
        );
      case 'USER_ENTERED':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F0F5EC] text-[#3B4D3F] border border-[#DCE5DA]">
            Company Reported
          </span>
        );
    }
  };

  const [form, setForm] = useState({
    waste_stream_id: '',
    sample_id: '',
    sample_date: new Date().toISOString().split('T')[0],
    laboratory: 'Certified Environmental Testing Lab',
    test_name: 'ICP-OES Metal Assay',
    measured_parameter: 'Copper (Cu)',
    result_value_str: '',
    unit: '%',
    detection_limit: '< 0.01 %',
    test_method: 'EPA 6010D / ASTM E1479',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [filterStreamId, company?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [labData, streamsData] = await Promise.all([
        api.getLabResults(filterStreamId ? parseInt(filterStreamId) : undefined, company?.id),
        api.getWasteStreams(company?.id),
      ]);
      setResults(labData);
      setStreams(streamsData);
      if (streamsData.length > 0 && !form.waste_stream_id) {
        setForm(prev => ({ ...prev, waste_stream_id: String(streamsData[0].id) }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load laboratory records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.sample_id.trim() || !form.measured_parameter.trim() || !form.result_value_str.trim()) {
      setErrorMsg('Sample ID, Analyte, and Reported Value are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createLabResult({
        waste_stream_id: form.waste_stream_id ? parseInt(form.waste_stream_id) : undefined,
        sample_id: form.sample_id,
        sample_date: form.sample_date,
        laboratory: form.laboratory,
        test_name: form.test_name,
        measured_parameter: form.measured_parameter,
        result_value_str: form.result_value_str,
        unit: form.unit,
        detection_limit: form.detection_limit,
        test_method: form.test_method,
        notes: form.notes,
      });

      setSuccessMsg(`Laboratory measurement recorded for Sample ID "${form.sample_id}".`);
      setForm(prev => ({
        ...prev,
        sample_id: '',
        result_value_str: '',
        notes: '',
      }));
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving laboratory measurement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Laboratory Results & Assay Register"
        subtitle="Record verified chemical assay results with strict qualifier preservation (<0.03, ND, bal.)."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        <ScientificNotice>
          <p>
            <strong>Preservation of Qualifiers:</strong> Industrial analytical measurements include detection limits and qualifiers (e.g., <code className="bg-[#E5EEE3] px-2 py-0.5 rounded text-[#202C25] font-mono text-[13px] border border-[#C2D8C4]">&lt;0.030</code>, <code className="bg-[#E5EEE3] px-2 py-0.5 rounded text-[#202C25] font-mono text-[13px] border border-[#C2D8C4]">ND</code>, <code className="bg-[#E5EEE3] px-2 py-0.5 rounded text-[#202C25] font-mono text-[13px] border border-[#C2D8C4]">bal.</code>). IndusTrace AI preserves these reported strings faithfully and separates user assays from CAESAR public reference benchmarks.
          </p>
        </ScientificNotice>

        {successMsg && (
          <div className="p-4 bg-[#EAF7EE] border border-[#B8E2C1] rounded-xl text-[#26734D] text-[14px] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#26734D] flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-[#FDECEC] border border-[#F5C2C2] rounded-xl text-[#A42D2D] text-[14px] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#A42D2D] flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Panel Split Layout matching Reference Panel 8 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Record Laboratory Result Form */}
          <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DCE5DA]">
              <div className="w-9 h-9 rounded-xl bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center text-[#26734D]">
                <FlaskConical className="w-4.5 h-4.5" />
              </div>
              <h2 className="font-bold text-[#202C25] text-[18px]">Record Laboratory Result</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-[14px]">
              <div>
                <label className="block font-medium text-[#202C25] mb-1">Target Waste Stream *</label>
                <select
                  value={form.waste_stream_id}
                  onChange={(e) => setForm({ ...form, waste_stream_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  required
                >
                  <option value="">Select waste stream</option>
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stream_name} ({s.waste_category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Sample Identifier *</label>
                  <input
                    type="text"
                    value={form.sample_id}
                    onChange={(e) => setForm({ ...form, sample_id: e.target.value })}
                    placeholder="e.g., LAB-2026-089"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Sample Date</label>
                  <input
                    type="date"
                    value={form.sample_date}
                    onChange={(e) => setForm({ ...form, sample_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#202C25] mb-1">Analytical Laboratory</label>
                <input
                  type="text"
                  value={form.laboratory}
                  onChange={(e) => setForm({ ...form, laboratory: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Test Name *</label>
                  <input
                    type="text"
                    value={form.test_name}
                    onChange={(e) => setForm({ ...form, test_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Analyte / Element *</label>
                  <input
                    type="text"
                    value={form.measured_parameter}
                    onChange={(e) => setForm({ ...form, measured_parameter: e.target.value })}
                    placeholder="e.g., Copper (Cu)"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Reported Value *</label>
                  <input
                    type="text"
                    value={form.result_value_str}
                    onChange={(e) => setForm({ ...form, result_value_str: e.target.value })}
                    placeholder="e.g., 28.4 or <0.030"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="%, ppm, mg/kg"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Detection Limit</label>
                  <input
                    type="text"
                    value={form.detection_limit}
                    onChange={(e) => setForm({ ...form, detection_limit: e.target.value })}
                    placeholder="< 0.01 %"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Test Method</label>
                  <input
                    type="text"
                    value={form.test_method}
                    onChange={(e) => setForm({ ...form, test_method: e.target.value })}
                    placeholder="EPA 6010D"
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-[#278653] hover:bg-[#227549] text-white rounded-xl font-semibold text-[14px] transition shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Recording Assay...' : 'Save Laboratory Result'}</span>
              </button>
            </form>
          </div>

          {/* Right Panel: Recorded Results Table matching Panel 8 */}
          <div className="lg:col-span-7 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5DA]">
              <div>
                <h2 className="font-bold text-[#202C25] text-[18px]">
                  Analytical Records
                </h2>
                <p className="text-[12px] text-[#778279]">
                  Strict qualifier preservation with clear provenance boundaries
                </p>
              </div>

              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#778279]">Stream:</span>
                <select
                  value={filterStreamId}
                  onChange={(e) => {
                    setFilterStreamId(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="px-3 py-1.5 border border-[#DCE5DA] rounded-lg bg-[#F7F8F3] text-[#202C25] text-[13px]"
                >
                  <option value="">All Assays & References</option>
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>{s.stream_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Provenance Separation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA] text-[13px]">
              <button
                type="button"
                onClick={() => { setActiveTab('ALL'); setVisibleCount(10); }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === 'ALL'
                    ? 'bg-white text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                    : 'text-[#56645A] hover:text-[#202C25]'
                }`}
              >
                All ({results.length})
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('COMPANY'); setVisibleCount(10); }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === 'COMPANY'
                    ? 'bg-white text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                    : 'text-[#56645A] hover:text-[#202C25]'
                }`}
              >
                Company Assays ({results.filter(r => r.data_origin !== 'CAESAR_EXPERIMENTAL_REFERENCE').length})
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('REFERENCE'); setVisibleCount(10); }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === 'REFERENCE'
                    ? 'bg-white text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                    : 'text-[#56645A] hover:text-[#202C25]'
                }`}
              >
                CAESAR Public Ref ({results.filter(r => r.data_origin === 'CAESAR_EXPERIMENTAL_REFERENCE').length})
              </button>
            </div>

            {/* Results Table */}
            {(() => {
              const filteredResults = results.filter((r) => {
                if (activeTab === 'COMPANY') return r.data_origin !== 'CAESAR_EXPERIMENTAL_REFERENCE';
                if (activeTab === 'REFERENCE') return r.data_origin === 'CAESAR_EXPERIMENTAL_REFERENCE';
                return true;
              });
              const displayed = filteredResults.slice(0, visibleCount);

              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[12px] uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-3">SAMPLE ID</th>
                          <th className="py-3 px-3">ANALYTE</th>
                          <th className="py-3 px-3">VALUE</th>
                          <th className="py-3 px-3">METHOD</th>
                          <th className="py-3 px-3 text-right">PROVENANCE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE5DA]">
                        {displayed.map((res) => (
                          <tr key={res.id} className="hover:bg-[#F0F5EC]/50 transition">
                            <td className="py-3.5 px-3">
                              <p className="font-mono font-bold text-[#202C25] text-[13px]">{res.sample_id}</p>
                              <p className="text-[11px] text-[#778279]">{res.stream_name || res.sample_date || 'Date N/D'}</p>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-[#202C25]">
                              {res.measured_parameter}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-mono font-bold text-[14px] text-[#26734D]">
                                {res.result_value_str}
                              </span>
                              <span className="text-[#778279] ml-1 text-[12px]">{res.unit}</span>
                            </td>
                            <td className="py-3.5 px-3 text-[#56645A] text-[13px]">
                              {res.test_name}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {renderProvenanceBadge(res.data_origin)}
                            </td>
                          </tr>
                        ))}
                        {displayed.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-[#778279]">
                              No laboratory results found for the selected category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Show More / Show Less Controls (Initially 10 records) */}
                  {filteredResults.length > 10 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DCE5DA] text-xs text-[#56645A]">
                      <span>
                        Showing <strong>{Math.min(visibleCount, filteredResults.length)}</strong> of <strong>{filteredResults.length}</strong> records
                      </span>
                      <div className="flex items-center gap-2">
                        {visibleCount < filteredResults.length ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setVisibleCount((prev) => prev + 10)}
                              className="px-3 py-1.5 bg-[#E5EEE3] hover:bg-[#D0E3D1] text-[#26734D] font-medium rounded-lg transition border border-[#C2D8C4]"
                            >
                              Show More (+10)
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisibleCount(filteredResults.length)}
                              className="px-3 py-1.5 bg-white hover:bg-[#F0F5EC] text-[#56645A] font-medium rounded-lg transition border border-[#DCE5DA]"
                            >
                              Show All ({filteredResults.length})
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVisibleCount(10)}
                            className="px-3 py-1.5 bg-white hover:bg-[#F0F5EC] text-[#56645A] font-medium rounded-lg transition border border-[#DCE5DA]"
                          >
                            Show Less (Top 10)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

        </div>

      </div>
    </div>
  );
};
