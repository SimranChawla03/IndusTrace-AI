// frontend/src/pages/FacilitiesAndStreamsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Trash2, 
  Plus, 
  ArrowRight, 
  MapPin, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  X,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, Facility, WasteStream } from '../services/api';

export const FacilitiesAndStreamsPage: React.FC = () => {
  const { company } = useAuth();
  const [activeTab, setActiveTab] = useState<'facilities' | 'waste_streams'>('facilities');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [showAddStream, setShowAddStream] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Facility Form State
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    location: '',
    primary_process: '',
    description: '',
  });

  // Stream Form State matching Panel 6 of Reference
  const [streamForm, setStreamForm] = useState({
    facility_id: '',
    stream_name: '',
    waste_category: 'Machining Chips',
    frequency: 'Daily',
    generating_process: '',
    quantity: '',
    quantity_unit: 'kg/week',
    current_handling: 'Stored in labelled bins for collection',
    known_characteristics: '',
  });

  useEffect(() => {
    loadAll();
  }, [company?.id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [facData, streamData] = await Promise.all([
        api.getFacilities(company?.id),
        api.getWasteStreams(company?.id),
      ]);
      setFacilities(facData);
      setStreams(streamData);
      if (facData.length > 0 && !streamForm.facility_id) {
        setStreamForm(prev => ({ ...prev, facility_id: String(facData[0].id) }));
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error loading records' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name.trim() || !facilityForm.primary_process.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Facility name and primary process are required.' });
      return;
    }
    try {
      await api.createFacility({
        company_id: company?.id,
        name: facilityForm.name,
        location: facilityForm.location || 'Nagpur, Maharashtra',
        primary_process: facilityForm.primary_process,
        description: facilityForm.description,
        image_url: '/images/facility-cnc.jpg'
      });
      setFeedbackMsg({ type: 'success', text: `Facility "${facilityForm.name}" registered successfully.` });
      setShowAddFacility(false);
      setFacilityForm({ name: '', location: '', primary_process: '', description: '' });
      loadAll();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to create facility' });
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.stream_name.trim() || !streamForm.generating_process.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Stream name and generating process are required.' });
      return;
    }
    try {
      await api.createWasteStream({
        company_id: company?.id,
        facility_id: streamForm.facility_id ? parseInt(streamForm.facility_id) : undefined,
        stream_name: streamForm.stream_name,
        waste_category: streamForm.waste_category,
        generating_process: streamForm.generating_process,
        frequency: streamForm.frequency,
        quantity: streamForm.quantity ? parseFloat(streamForm.quantity) : undefined,
        quantity_unit: streamForm.quantity_unit,
        current_handling: streamForm.current_handling,
        known_characteristics: streamForm.known_characteristics,
      });
      setFeedbackMsg({ type: 'success', text: `Waste stream "${streamForm.stream_name}" registered.` });
      setShowAddStream(false);
      setStreamForm(prev => ({
        ...prev,
        stream_name: '',
        generating_process: '',
        quantity: '',
        known_characteristics: '',
      }));
      loadAll();
      setActiveTab('waste_streams');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to record stream' });
    }
  };

  const filteredStreams = streams.filter(s => 
    s.stream_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.waste_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.facility_name && s.facility_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3]">
      <Header
        title="Facilities & Waste Streams"
        subtitle="Manage your facilities, processes and registered waste streams."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        {/* Alerts */}
        {feedbackMsg && (
          <div className={`p-4 rounded-xl text-[14px] flex items-center justify-between shadow-2xs ${
            feedbackMsg.type === 'success' 
              ? 'bg-[#EAF7EE] border border-[#B8E2C1] text-[#26734D]' 
              : 'bg-[#FDECEC] border border-[#F5C2C2] text-[#A42D2D]'
          }`}>
            <div className="flex items-center gap-2.5">
              {feedbackMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab & Action Bar matching Reference Panel 5 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center bg-[#E5EEE3] p-1.5 rounded-xl border border-[#DCE5DA]">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-5 py-2 rounded-lg text-[14px] font-semibold transition ${
                activeTab === 'facilities'
                  ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                  : 'text-[#56645A] hover:text-[#202C25]'
              }`}
            >
              Facilities ({facilities.length})
            </button>
            <button
              onClick={() => setActiveTab('waste_streams')}
              className={`px-5 py-2 rounded-lg text-[14px] font-semibold transition ${
                activeTab === 'waste_streams'
                  ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                  : 'text-[#56645A] hover:text-[#202C25]'
              }`}
            >
              Waste Streams ({streams.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'facilities' ? (
              <button
                onClick={() => setShowAddFacility(true)}
                className="px-4 py-2.5 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[14px] transition shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Facility</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddStream(true)}
                className="px-4 py-2.5 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[14px] transition shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Stream</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Facilities Grid matching Panel 5 of Reference */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {facilities.map((fac) => (
                <div 
                  key={fac.id} 
                  className="rounded-2xl border border-[#DCE5DA] overflow-hidden bg-[#FFFFFF] shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <img 
                      src={fac.image_url || '/images/facility-main.jpg'} 
                      alt={fac.name} 
                      className="w-full h-44 object-cover object-center"
                    />
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-[18px] text-[#202C25]">{fac.name}</h3>
                      <p className="text-[13px] text-[#56645A] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#26734D]" />
                        <span>{fac.location || 'Nagpur, Maharashtra'}</span>
                      </p>
                      <p className="text-[13px] text-[#778279] mt-1 line-clamp-2">
                        {fac.description || fac.primary_process}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-[#DCE5DA]/60 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[22px] font-bold text-[#202C25]">{fac.waste_stream_count || 0}</span>
                      <span className="text-[12px] text-[#56645A] block">Waste Streams</span>
                    </div>

                    <button 
                      onClick={() => {
                        setStreamForm(prev => ({ ...prev, facility_id: String(fac.id) }));
                        setShowAddStream(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#26734D] hover:underline"
                    >
                      <span>Add Stream</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Register Strip matching bottom of Panel 5 */}
            <div className="p-6 rounded-2xl bg-[#E5EEE3] border border-[#C2D8C4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D0E3D1] text-[#26734D] flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-[#202C25]">Register a New Waste Stream</h4>
                  <p className="text-[13px] text-[#56645A]">Add a manufacturing waste stream to start the investigation process.</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddStream(true)}
                className="px-5 py-2.5 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[14px] transition shadow-xs flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Register Stream</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Waste Streams Table */}
        {activeTab === 'waste_streams' && (
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5DA]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#778279] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search streams or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl text-[14px] text-[#202C25] focus:outline-none focus:ring-1 focus:ring-[#278653]"
                />
              </div>

              <span className="text-[13px] text-[#778279] font-mono">
                Showing {filteredStreams.length} registered streams
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[12px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Waste Stream</th>
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Quantity / Freq</th>
                    <th className="py-3 px-4">Current Handling</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DA]">
                  {filteredStreams.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F0F5EC]/50 transition">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-[#202C25]">{s.stream_name}</p>
                        <p className="text-[12px] text-[#778279] mt-0.5">{s.generating_process}</p>
                      </td>
                      <td className="py-4 px-4 text-[#56645A] font-medium text-[13px]">
                        {s.facility_name || 'Main Unit'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#F0F5EC] border border-[#DCE5DA] text-[#202C25] text-[12px] font-medium">
                          {s.waste_category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[13px]">
                        {s.quantity ? (
                          <span className="font-bold text-[#202C25]">{s.quantity} {s.quantity_unit}</span>
                        ) : (
                          <span className="text-[#8A5A00] italic">Unrecorded</span>
                        )}
                        <span className="text-[12px] text-[#778279] block">{s.frequency || 'Regular'}</span>
                      </td>
                      <td className="py-4 px-4 text-[13px] text-[#56645A] max-w-xs truncate">
                        {s.current_handling || 'Stored on site'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/app/investigation?streamId=${s.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E5EEE3] hover:bg-[#D0E3D1] text-[#26734D] font-semibold text-[13px] transition"
                        >
                          <span>Audit TWS</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredStreams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#778279]">
                        No waste streams registered. Click "Register Stream" above to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Facility Modal */}
        {showAddFacility && (
          <div className="fixed inset-0 z-50 bg-[#10271E]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[#DCE5DA] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DA]">
                <h3 className="font-bold text-[18px] text-[#202C25]">Add Manufacturing Facility</h3>
                <button onClick={() => setShowAddFacility(false)} className="p-1 text-[#778279] hover:text-[#202C25]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFacility} className="space-y-4 text-[14px]">
                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Facility Name *</label>
                  <input
                    type="text"
                    value={facilityForm.name}
                    onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                    placeholder="e.g., Foundry & Casting Bay"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Location / Industrial Estate</label>
                  <input
                    type="text"
                    value={facilityForm.location}
                    onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                    placeholder="e.g., Butibori MIDC, Nagpur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Primary Process *</label>
                  <input
                    type="text"
                    value={facilityForm.primary_process}
                    onChange={(e) => setFacilityForm({ ...facilityForm, primary_process: e.target.value })}
                    placeholder="e.g., Die Casting & Induction Melting"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202C25] mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={facilityForm.description}
                    onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                    placeholder="Brief description of operations..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653] resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFacility(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#DCE5DA] text-[#56645A] font-semibold hover:bg-[#F0F5EC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold shadow-xs"
                  >
                    Save Facility
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Register Waste Stream Modal matching Reference Panel 6 */}
        {showAddStream && (
          <div className="fixed inset-0 z-50 bg-[#10271E]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-[#DCE5DA] shadow-xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DA] mb-6">
                <div>
                  <h3 className="font-bold text-[22px] text-[#202C25]">Register Waste Stream</h3>
                  <p className="text-[13px] text-[#56645A] mt-0.5">Add details about your manufacturing waste stream.</p>
                </div>
                <button onClick={() => setShowAddStream(false)} className="p-1.5 text-[#778279] hover:text-[#202C25]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Form Fields matching Panel 6 */}
                <form onSubmit={handleCreateStream} className="lg:col-span-7 space-y-4 text-[14px]">
                  <div>
                    <label className="block font-medium text-[#202C25] mb-1">Facility *</label>
                    <select
                      value={streamForm.facility_id}
                      onChange={(e) => setStreamForm({ ...streamForm, facility_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                      required
                    >
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.primary_process})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#202C25] mb-1">Waste Stream Name *</label>
                    <input
                      type="text"
                      value={streamForm.stream_name}
                      onChange={(e) => setStreamForm({ ...streamForm, stream_name: e.target.value })}
                      placeholder="e.g., Steel Machining Chips"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#202C25] mb-1">Category *</label>
                      <select
                        value={streamForm.waste_category}
                        onChange={(e) => setStreamForm({ ...streamForm, waste_category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                      >
                        <option value="Machining Chips">Machining Chips</option>
                        <option value="Metal Scrap">Metal Scrap</option>
                        <option value="Sludge">Industrial Sludge</option>
                        <option value="Wastewater / Effluent">Wastewater / Effluent</option>
                        <option value="Filter Dust">Filter Dust</option>
                        <option value="Spent Catalyst">Spent Catalyst</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-[#202C25] mb-1">Frequency</label>
                      <select
                        value={streamForm.frequency}
                        onChange={(e) => setStreamForm({ ...streamForm, frequency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Batch / Episodic">Batch / Episodic</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#202C25] mb-1">Generating Process *</label>
                    <input
                      type="text"
                      value={streamForm.generating_process}
                      onChange={(e) => setStreamForm({ ...streamForm, generating_process: e.target.value })}
                      placeholder="e.g., CNC Milling, Chemical Pickling"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#202C25] mb-1">Quantity (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        value={streamForm.quantity}
                        onChange={(e) => setStreamForm({ ...streamForm, quantity: e.target.value })}
                        placeholder="e.g., 150"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#202C25] mb-1">Unit</label>
                      <select
                        value={streamForm.quantity_unit}
                        onChange={(e) => setStreamForm({ ...streamForm, quantity_unit: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                      >
                        <option value="kg/week">kg/week</option>
                        <option value="kg/day">kg/day</option>
                        <option value="tonnes/month">tonnes/month</option>
                        <option value="tonnes/year">tonnes/year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#202C25] mb-1">Current Handling / Disposal</label>
                    <input
                      type="text"
                      value={streamForm.current_handling}
                      onChange={(e) => setStreamForm({ ...streamForm, current_handling: e.target.value })}
                      placeholder="Stored in labelled bins for collection"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#202C25] mb-1">Known Characteristics / Contaminants</label>
                    <textarea
                      rows={2}
                      value={streamForm.known_characteristics}
                      onChange={(e) => setStreamForm({ ...streamForm, known_characteristics: e.target.value })}
                      placeholder="e.g., Oily residue from synthetic coolant"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddStream(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#DCE5DA] text-[#56645A] font-semibold hover:bg-[#F0F5EC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold shadow-xs"
                    >
                      Save Waste Stream
                    </button>
                  </div>
                </form>

                {/* Right: Photographic Preview Panel matching Panel 6 */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#DCE5DA] shadow-sm bg-[#10271E] h-[460px]">
                  <img
                    src="/images/stream-swarf.jpg"
                    alt="Good Data Better Insights"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10271E] via-[#10271E]/30 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DCE5DA] shadow-md space-y-2">
                    <h4 className="font-bold text-[15px] text-[#202C25]">Good Data, Better Insights</h4>
                    <p className="text-[12px] text-[#56645A] leading-relaxed">
                      Entering accurate physical characteristics empowers the TWS algorithm to pinpoint required assays and prevents wasteful analytical spend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
