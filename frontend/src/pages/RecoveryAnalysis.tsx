// frontend/src/pages/RecoveryAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Recycle, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { useAuth } from '../context/AuthContext';
import { api, WasteStream, RecoveryScenario } from '../services/api';

export const RecoveryAnalysis: React.FC = () => {
  const { company } = useAuth();
  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [scenarios, setScenarios] = useState<RecoveryScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [linkedLabs, setLinkedLabs] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [scenarioType, setScenarioType] = useState<'CONFIRMED_LAB_ASSAY' | 'HYPOTHETICAL_SCENARIO'>('CONFIRMED_LAB_ASSAY');

  const [form, setForm] = useState({
    target_material: '',
    confirmed_material_fraction: 0.0,
    recovery_rate_assumption: 0.70, // 70% default hypothetical yield
    market_price_per_kg: 0.0,
    processing_cost_per_kg: 0.0,
    testing_cost_fixed: 0.0,
    transport_handling_cost: 0.0,
    other_cost: 0.0,
    notes: '',
  });

  useEffect(() => {
    loadStreams();
  }, [company?.id]);

  useEffect(() => {
    if (selectedStreamId) {
      const streamId = parseInt(selectedStreamId);
      loadScenarios(streamId);
      loadLinkedLabs(streamId);
    }
  }, [selectedStreamId]);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const data = await api.getWasteStreams(company?.id);
      setStreams(data);
      if (data.length > 0 && !selectedStreamId) {
        setSelectedStreamId(String(data[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedLabs = async (streamId: number) => {
    try {
      const results = await api.getLabResults(streamId, company?.id);
      const validAssays = results.filter(r => r.waste_stream_id === streamId && r.data_origin === 'USER_ENTERED');
      setLinkedLabs(validAssays);

      if (validAssays.length > 0) {
        setScenarioType('CONFIRMED_LAB_ASSAY');
        const first = validAssays[0];
        setSelectedLabId(String(first.id));
        applyLabAssay(first);
      } else {
        setSelectedLabId('');
        setScenarioType('HYPOTHETICAL_SCENARIO');
        setForm(prev => ({
          ...prev,
          target_material: 'Aluminium (Al)',
          confirmed_material_fraction: 0.85,
          market_price_per_kg: 210.0,
          processing_cost_per_kg: 35.0,
          notes: 'Hypothetical scenario: Exploratory model pending certified assay confirmation.'
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyLabAssay = (assay: any) => {
    let fraction = 0.0;
    if (assay.result_value_numeric !== null && assay.result_value_numeric !== undefined) {
      const u = (assay.unit || '').toLowerCase();
      if (u.includes('%') || u.includes('wt')) {
        fraction = assay.result_value_numeric / 100.0;
      } else if (u.includes('ppm') || u.includes('mg/kg')) {
        fraction = assay.result_value_numeric / 1000000.0;
      } else {
        fraction = assay.result_value_numeric <= 1.0 ? assay.result_value_numeric : assay.result_value_numeric / 100.0;
      }
    }
    fraction = Math.min(1.0, Math.max(0.0, fraction));

    setForm(prev => ({
      ...prev,
      target_material: assay.measured_parameter,
      confirmed_material_fraction: Number(fraction.toFixed(4)),
      notes: `Verified assay from Sample ${assay.sample_id} (${assay.test_name}). Reported: ${assay.result_value_str} ${assay.unit || ''}`
    }));
  };

  const handleLabSelectChange = (labIdStr: string) => {
    setSelectedLabId(labIdStr);
    const chosen = linkedLabs.find(l => String(l.id) === labIdStr);
    if (chosen) {
      applyLabAssay(chosen);
    }
  };

  const loadScenarios = async (streamId: number) => {
    try {
      const data = await api.getRecoveryScenarios(streamId);
      setScenarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculating) return;
    if (!selectedStreamId) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.target_material.trim()) {
      setErrorMsg('Target material name is required.');
      return;
    }

    if (form.confirmed_material_fraction <= 0) {
      setErrorMsg('Material fraction must be greater than 0.');
      return;
    }

    try {
      setCalculating(true);
      const payload = {
        waste_stream_id: parseInt(selectedStreamId),
        target_material: form.target_material,
        scenario_type: scenarioType,
        linked_lab_result_id: scenarioType === 'CONFIRMED_LAB_ASSAY' && selectedLabId ? parseInt(selectedLabId) : null,
        confirmed_material_fraction: Number(form.confirmed_material_fraction),
        recovery_rate_assumption: Number(form.recovery_rate_assumption),
        market_price_per_kg: form.market_price_per_kg ? Number(form.market_price_per_kg) : null,
        processing_cost_per_kg: form.processing_cost_per_kg ? Number(form.processing_cost_per_kg) : null,
        testing_cost_fixed: form.testing_cost_fixed ? Number(form.testing_cost_fixed) : null,
        transport_handling_cost: form.transport_handling_cost ? Number(form.transport_handling_cost) : null,
        other_cost: form.other_cost ? Number(form.other_cost) : null,
        notes: form.notes,
      };

      const res = await api.analyzeRecovery(parseInt(selectedStreamId), payload);
      setSuccessMsg(`Recovery scenario evaluated successfully for ${res.target_material}.`);
      loadScenarios(parseInt(selectedStreamId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing recovery calculation');
    } finally {
      setCalculating(false);
    }
  };

  const selectedStreamObj = streams.find(s => String(s.id) === selectedStreamId);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Recovery Opportunities"
        subtitle="Explore potential recovery, reuse or recycling options based on available data."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        <ScientificNotice title="Thermodynamic & Mass Balance Limitations">
          <p>
            <strong>Engineering Guardrail:</strong> A high TWS score does not prove profitability. Theoretical recovery is bounded by verified chemical assay fractions. Hypothetical scenarios must never be presented as verified factory observations.
          </p>
        </ScientificNotice>

        {successMsg && (
          <div className="p-4 bg-[#EAF7EE] border border-[#B8E2C1] rounded-xl text-[#26734D] text-[14px] flex items-center gap-3 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-[#26734D] flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-[#FDECEC] border border-[#F5C2C2] rounded-xl text-[#A42D2D] text-[14px] flex items-center gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-[#A42D2D] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selected Waste Stream Banner & Key Considerations matching Panel 9 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Selected Waste Stream Card */}
          <div className="lg:col-span-8 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col sm:flex-row items-center gap-6">
            <img 
              src="/images/stream-swarf.jpg" 
              alt="Stream thumbnail" 
              className="w-28 h-28 rounded-2xl object-cover border border-[#DCE5DA] flex-shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[12px] font-bold text-[#778279] uppercase tracking-wider">
                Selected Waste Stream
              </span>
              <h3 className="text-[20px] font-bold text-[#202C25] truncate">
                {selectedStreamObj?.stream_name || 'Select a Waste Stream'}
              </h3>
              <p className="text-[13px] text-[#56645A]">
                Process: <strong>{selectedStreamObj?.generating_process || 'Machining'}</strong> • Frequency: <strong>{selectedStreamObj?.frequency || 'Daily'}</strong>
              </p>
              <p className="text-[12px] text-[#778279]">
                Quantity: {selectedStreamObj?.quantity ? `${selectedStreamObj.quantity} ${selectedStreamObj.quantity_unit}` : 'Unrecorded'}
              </p>
            </div>

            <select
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              className="px-4 py-2 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[14px] font-semibold text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
            >
              {streams.map(s => (
                <option key={s.id} value={s.id}>{s.stream_name}</option>
              ))}
            </select>
          </div>

          {/* Key Considerations Box */}
          <div className="lg:col-span-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col justify-between">
            <h4 className="font-bold text-[15px] text-[#202C25]">Key Considerations</h4>
            <ul className="space-y-2 text-[13px] text-[#56645A] my-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#278653]"></span>
                <span>Alloy grade verified via assay</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <span>Contamination status unproven</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#26734D]"></span>
                <span>Economic feasibility modeling active</span>
              </li>
            </ul>
            <span className="text-[11px] text-[#778279]">Evidence verified from certified lab registers</span>
          </div>

        </div>

        {/* Potential Recovery Routes Cards matching Panel 9 */}
        <div className="space-y-3">
          <h3 className="font-bold text-[18px] text-[#202C25]">Potential Recovery Routes</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEE3] text-[#26734D] flex items-center justify-center font-bold">
                  <Recycle className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5EEE3] text-[#26734D]">
                  High Potential
                </span>
              </div>
              <h4 className="font-bold text-[16px] text-[#202C25]">Metal Recycling & Remelt</h4>
              <p className="text-[13px] text-[#56645A] leading-relaxed">
                Recover non-ferrous metal matrix through high-efficiency furnace induction recycling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5DD] text-[#8A5A00] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF5DD] text-[#8A5A00]">
                  Medium Potential
                </span>
              </div>
              <h4 className="font-bold text-[16px] text-[#202C25]">Material Briquetting & In-House Reuse</h4>
              <p className="text-[13px] text-[#56645A] leading-relaxed">
                Cold compress turnings into high-density briquettes for charge remelt in internal processes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FDECEC] text-[#A42D2D] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDECEC] text-[#A42D2D]">
                  Low Potential
                </span>
              </div>
              <h4 className="font-bold text-[16px] text-[#202C25]">Chemical Hydrometallurgical Extraction</h4>
              <p className="text-[13px] text-[#56645A] leading-relaxed">
                Acid leaching and electrowinning. Applicable primarily if contaminated with refractory oxides.
              </p>
            </div>
          </div>
        </div>

        {/* Mass Balance & Economic Calculation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Parameter Form */}
          <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DCE5DA]">
              <div className="w-9 h-9 rounded-xl bg-[#E5EEE3] text-[#26734D] flex items-center justify-center font-bold">
                <Calculator className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-[17px] text-[#202C25]">Evaluate Recovery Scenario</h4>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4 text-[14px]">
              <div>
                <label className="block font-medium text-[#202C25] mb-1">Target Recoverable Material *</label>
                <input
                  type="text"
                  value={form.target_material}
                  onChange={(e) => setForm({ ...form, target_material: e.target.value })}
                  placeholder="e.g., Aluminium (Al), Copper (Cu)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                />
              </div>

              {/* Assay Mode Selector */}
              <div className="p-3.5 rounded-xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-2">
                <span className="text-[12px] font-bold text-[#56645A] uppercase tracking-wider block">Mode Selection</span>
                
                {linkedLabs.length > 0 ? (
                  <div>
                    <label className="block text-[12px] text-[#56645A] mb-1">Linked Verified Assay</label>
                    <select
                      value={selectedLabId}
                      onChange={(e) => handleLabSelectChange(e.target.value)}
                      disabled={scenarioType === 'HYPOTHETICAL_SCENARIO'}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DCE5DA] bg-[#FFFFFF] text-[13px]"
                    >
                      {linkedLabs.map(l => (
                        <option key={l.id} value={l.id}>{l.measured_parameter}: {l.result_value_str} {l.unit}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-[12px] text-[#8A5A00]">No verified laboratory assay attached to this stream.</p>
                )}

                <div className="flex items-center gap-4 pt-1 text-[13px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario_type"
                      checked={scenarioType === 'CONFIRMED_LAB_ASSAY'}
                      onChange={() => {
                        if (linkedLabs.length > 0) setScenarioType('CONFIRMED_LAB_ASSAY');
                        else setErrorMsg('No verified assay available for this stream.');
                      }}
                      disabled={linkedLabs.length === 0}
                      className="accent-[#278653]"
                    />
                    <span>Confirmed Assay</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario_type"
                      checked={scenarioType === 'HYPOTHETICAL_SCENARIO'}
                      onChange={() => setScenarioType('HYPOTHETICAL_SCENARIO')}
                      className="accent-[#278653]"
                    />
                    <span>Hypothetical Scenario</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Material Fraction (0-1) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={form.confirmed_material_fraction}
                    onChange={(e) => setForm({ ...form, confirmed_material_fraction: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                    required
                  />
                  <span className="text-[11px] text-[#778279] mt-0.5 block">
                    {(form.confirmed_material_fraction * 100).toFixed(1)}% of total mass
                  </span>
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Recovery Yield (0-1) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={form.recovery_rate_assumption}
                    onChange={(e) => setForm({ ...form, recovery_rate_assumption: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                    required
                  />
                  <span className="text-[11px] text-[#778279] mt-0.5 block">
                    {(form.recovery_rate_assumption * 100).toFixed(0)}% process efficiency
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Market Price (₹/kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.market_price_per_kg}
                    onChange={(e) => setForm({ ...form, market_price_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Processing Cost (₹/kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.processing_cost_per_kg}
                    onChange={(e) => setForm({ ...form, processing_cost_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full mt-2 py-3 px-4 bg-[#278653] hover:bg-[#227549] text-white rounded-xl font-semibold text-[14px] transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>{calculating ? 'Calculating Mass Balance...' : 'Calculate Economics'}</span>
              </button>
            </form>
          </div>

          {/* Evaluated Scenarios History */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-bold text-[17px] text-[#202C25]">
              Computed Recovery Models ({scenarios.length})
            </h4>

            {scenarios.map((sc) => (
              <div key={sc.id} className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DA]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[17px] text-[#202C25]">{sc.target_material}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      sc.scenario_type === 'CONFIRMED_LAB_ASSAY'
                        ? 'bg-[#E5EEE3] text-[#26734D] border-[#C2D8C4]'
                        : 'bg-[#F0F5EC] text-[#56645A] border-[#DCE5DA]'
                    }`}>
                      {sc.scenario_type === 'CONFIRMED_LAB_ASSAY' ? 'Confirmed Assay' : 'Hypothetical Scenario'}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#778279] font-mono">{sc.created_at?.split('T')[0]}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#F0F5EC] border border-[#DCE5DA]">
                    <span className="text-[11px] text-[#778279] uppercase font-semibold">Monthly Waste</span>
                    <p className="text-[18px] font-bold text-[#202C25] mt-1">{sc.waste_quantity_kg_per_month} kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0F5EC] border border-[#DCE5DA]">
                    <span className="text-[11px] text-[#778279] uppercase font-semibold">Assumed Fraction</span>
                    <p className="text-[18px] font-bold text-[#26734D] mt-1">{(sc.confirmed_material_fraction * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0F5EC] border border-[#DCE5DA]">
                    <span className="text-[11px] text-[#778279] uppercase font-semibold">Recovered Mass</span>
                    <p className="text-[18px] font-bold text-[#202C25] mt-1">{sc.estimated_recovered_quantity_kg} kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#E5EEE3] border border-[#C2D8C4]">
                    <span className="text-[11px] text-[#26734D] uppercase font-semibold">Est. Net Benefit</span>
                    <p className="text-[18px] font-extrabold text-[#26734D] mt-1">
                      {sc.net_value ? `₹ ${Math.round(sc.net_value).toLocaleString('en-IN')}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {sc.notes && (
                  <p className="text-[12px] text-[#56645A] italic bg-[#F7F8F3] p-3 rounded-xl border border-[#DCE5DA]">
                    {sc.notes}
                  </p>
                )}
              </div>
            ))}

            {scenarios.length === 0 && (
              <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] text-center text-[#778279] text-[14px]">
                No recovery scenario computed yet for this stream. Fill in the parameters on the left to calculate.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
