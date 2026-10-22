// frontend/src/pages/WasteStreamRegistration.tsx
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { api, WasteStream, Company } from '../services/api';

export const WasteStreamRegistration: React.FC = () => {
  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_id: '',
    stream_name: '',
    waste_category: 'Machining Chips',
    generating_process: '',
    quantity: '',
    quantity_unit: 'kg/week',
    frequency: 'Daily',
    current_handling: 'Stored for pickup',
    known_characteristics: '',
    estimated_handling_cost: '',
    recovery_info: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [streamsData, companiesData] = await Promise.all([
        api.getWasteStreams(),
        api.getCompanies(),
      ]);
      setStreams(streamsData);
      setCompanies(companiesData);
      if (companiesData.length > 0 && !form.company_id) {
        setForm((prev) => ({ ...prev, company_id: String(companiesData[0].id) }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load waste streams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.company_id || !form.stream_name.trim() || !form.generating_process.trim()) {
      setErrorMsg('Facility, Stream Name, and Generating Process are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        company_id: parseInt(form.company_id),
        stream_name: form.stream_name,
        waste_category: form.waste_category,
        generating_process: form.generating_process,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        quantity_unit: form.quantity_unit || null,
        frequency: form.frequency || null,
        current_handling: form.current_handling || null,
        known_characteristics: form.known_characteristics || null,
        estimated_handling_cost: form.estimated_handling_cost ? parseFloat(form.estimated_handling_cost) : null,
        recovery_info: form.recovery_info || null,
      };

      await api.createWasteStream(payload);
      setSuccessMsg(`Waste stream "${form.stream_name}" successfully recorded.`);
      setForm({
        ...form,
        stream_name: '',
        generating_process: '',
        quantity: '',
        known_characteristics: '',
        estimated_handling_cost: '',
        recovery_info: '',
      });
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording waste stream');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3]">
      <Header
        title="Waste Stream Registration"
        subtitle="Record individual manufacturing waste streams, logistics, and observed characteristics."
      />

      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        <ScientificNotice>
          <p>
            <strong>Transparent Field Tracking:</strong> Do not guess values for unknown fields. IndusTrace AI explicitly records missing inputs so the Test Worthiness Engine can highlight compositional risks and recommend targeted tests.
          </p>
        </ScientificNotice>

        {successMsg && (
          <div className="p-4 bg-[#EAF7EE] border border-[#B8E2C1] rounded-xl text-[#26734D] text-[14px] flex items-center gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 text-[#26734D] flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-[#FDECEC] border border-[#F5C2C2] rounded-xl text-[#A42D2D] text-[14px] flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-[#A42D2D] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Stream Form */}
          <div className="lg:col-span-1 bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#DCE5DA]">
              <div className="w-9 h-9 rounded-lg bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center text-[#26734D]">
                <Trash2 className="w-4.5 h-4.5" />
              </div>
              <h2 className="font-semibold text-[#202C25] text-[17px]">Register Waste Stream</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-[15px]">
              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Company / Facility *</label>
                <select
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.manufacturing_process})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Waste Stream Name *</label>
                <input
                  type="text"
                  value={form.stream_name}
                  onChange={(e) => setForm({ ...form, stream_name: e.target.value })}
                  placeholder="e.g., Aluminium 6061 Machining Swarf"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#56645A] mb-1.5">Category *</label>
                  <select
                    value={form.waste_category}
                    onChange={(e) => setForm({ ...form, waste_category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  >
                    <option value="Machining Chips">Machining Chips</option>
                    <option value="Metal Scrap">Metal Scrap</option>
                    <option value="Sludge">Industrial Sludge</option>
                    <option value="Process Effluent / Wastewater">Process Wastewater</option>
                    <option value="Filter Dust">Filter Dust</option>
                    <option value="Spent Catalyst">Spent Catalyst</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#56645A] mb-1.5">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Batch / Episodic">Batch / Episodic</option>
                    <option value="Sporadic">Sporadic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Generating Process *</label>
                <input
                  type="text"
                  value={form.generating_process}
                  onChange={(e) => setForm({ ...form, generating_process: e.target.value })}
                  placeholder="e.g., CNC High-Speed Turning, Acid Pickling"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#56645A] mb-1.5">Quantity (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="Leave blank if unknown"
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#56645A] mb-1.5">Unit</label>
                  <select
                    value={form.quantity_unit}
                    onChange={(e) => setForm({ ...form, quantity_unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  >
                    <option value="kg/week">kg/week</option>
                    <option value="kg/day">kg/day</option>
                    <option value="tonnes/month">tonnes/month</option>
                    <option value="tonnes/year">tonnes/year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Current Handling / Disposal</label>
                <input
                  type="text"
                  value={form.current_handling}
                  onChange={(e) => setForm({ ...form, current_handling: e.target.value })}
                  placeholder="e.g., Stored for pickup, Sold as mixed scrap, Sent to ETP"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                />
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Known Characteristics / Contaminants</label>
                <textarea
                  rows={2}
                  value={form.known_characteristics}
                  onChange={(e) => setForm({ ...form, known_characteristics: e.target.value })}
                  placeholder="e.g., Oily residue from synthetic coolant; exact alloy grade unverified..."
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] resize-none transition"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Estimated Disposal / Handling Cost (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={form.estimated_handling_cost}
                  onChange={(e) => setForm({ ...form, estimated_handling_cost: e.target.value })}
                  placeholder="e.g., 25000 (leave blank if unknown)"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#278653] hover:bg-[#227549] text-white rounded-lg font-semibold text-[15px] transition shadow-xs"
              >
                <Plus className="w-4.5 h-4.5 text-white" />
                <span>{submitting ? 'Recording Stream...' : 'Register Waste Stream'}</span>
              </button>
            </form>
          </div>

          {/* Registered Streams Table */}
          <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs">
            <h2 className="font-semibold text-[#202C25] text-[17px] mb-4">
              Registered Waste Streams ({streams.length})
            </h2>

            {loading ? (
              <p className="text-[14px] text-[#778279] py-8 text-center">Loading registered streams...</p>
            ) : streams.length === 0 ? (
              <p className="text-[14px] text-[#778279] py-8 text-center">No waste streams registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[13px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Stream Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Quantity</th>
                      <th className="py-3.5 px-4">Current Handling</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DA]">
                    {streams.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F0F5EC]/60 transition">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-[#202C25]">{s.stream_name}</p>
                          <p className="text-[13px] text-[#778279] mt-0.5">Process: {s.generating_process}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-[#202C25] bg-[#F0F5EC] border border-[#DCE5DA] px-3 py-1 rounded text-[13px]">
                            {s.waste_category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {s.quantity !== null && s.quantity !== undefined ? (
                            <span className="font-medium text-[#202C25]">{s.quantity} {s.quantity_unit}</span>
                          ) : (
                            <span className="text-[#8A5A00] italic text-[13px]">Unrecorded</span>
                          )}
                          <p className="text-[13px] text-[#778279] mt-0.5">{s.frequency || 'Freq. unknown'}</p>
                        </td>
                        <td className="py-4 px-4 text-[#56645A]">
                          {s.current_handling || 'Not documented'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            to={`/test-worthiness?streamId=${s.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F5EC] hover:bg-[#E5EEE3] text-[#26734D] border border-[#DCE5DA] rounded-lg text-[13px] font-medium transition"
                          >
                            <span>Assess</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#26734D]" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
