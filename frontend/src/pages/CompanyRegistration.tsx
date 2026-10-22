// frontend/src/pages/CompanyRegistration.tsx
import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { ScientificNotice } from '../components/ScientificNotice';
import { api, Company } from '../services/api';

export const CompanyRegistration: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    industry: 'Metal Fabrication & Metallurgy',
    location: '',
    contact_info: '',
    manufacturing_process: '',
    process_description: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch registered companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name.trim() || !form.manufacturing_process.trim()) {
      setErrorMsg('Company Name and Manufacturing Process are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createCompany(form);
      setSuccessMsg(`Company "${form.name}" successfully registered into database.`);
      setForm({
        name: '',
        industry: 'Metal Fabrication & Metallurgy',
        location: '',
        contact_info: '',
        manufacturing_process: '',
        process_description: '',
      });
      loadCompanies();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving company record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3]">
      <Header
        title="Company & Process Registration"
        subtitle="Register manufacturing facilities, process descriptions, and operational contexts."
      />

      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        <ScientificNotice>
          <p>
            <strong>Engineering Context:</strong> Process descriptions provide baseline contextual routing for the Waste Intelligence Repository. Exact alloy formulations, slag chemistry, and contaminants vary significantly between facilities and must never be extrapolated without direct sample assay.
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
          {/* Registration Form */}
          <div className="lg:col-span-1 bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#DCE5DA]">
              <div className="w-9 h-9 rounded-lg bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center text-[#26734D]">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h2 className="font-semibold text-[#202C25] text-[17px]">Register New Facility</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-[15px]">
              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Apex Precision Castings Ltd"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] focus:border-[#278653] text-[15px] transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Industry Sector *</label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] focus:ring-1 focus:ring-[#278653] focus:border-[#278653] text-[15px] transition"
                >
                  <option value="Metal Fabrication & Metallurgy">Metal Fabrication & Metallurgy</option>
                  <option value="Automotive & Transportation Components">Automotive & Transportation Components</option>
                  <option value="Electroplating & Surface Finishing">Electroplating & Surface Finishing</option>
                  <option value="Chemical Manufacturing & Inorganics">Chemical Manufacturing & Inorganics</option>
                  <option value="Electronic Equipment & Semiconductors">Electronic Equipment & Semiconductors</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Location / Industrial Estate</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., MIDC Butibori, Nagpur, Maharashtra"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                />
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Contact Information (Optional)</label>
                <input
                  type="text"
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                  placeholder="e.g., EHS Officer / plant@apex.com"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                />
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Manufacturing Process *</label>
                <input
                  type="text"
                  value={form.manufacturing_process}
                  onChange={(e) => setForm({ ...form, manufacturing_process: e.target.value })}
                  placeholder="e.g., CNC Milling & Turning, Copper Electroplating"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#56645A] mb-1.5">Process Description</label>
                <textarea
                  rows={3}
                  value={form.process_description}
                  onChange={(e) => setForm({ ...form, process_description: e.target.value })}
                  placeholder="Describe tooling, coolants used, feedstocks, batch vs continuous..."
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE5DA] rounded-lg text-[#202C25] placeholder-[#778279] focus:ring-1 focus:ring-[#278653] text-[15px] resize-none transition"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#278653] hover:bg-[#227549] text-white rounded-lg font-semibold text-[15px] transition shadow-xs"
              >
                <Plus className="w-4.5 h-4.5 text-white" />
                <span>{submitting ? 'Saving Facility...' : 'Register Facility'}</span>
              </button>
            </form>
          </div>

          {/* Registered Facilities Table */}
          <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-xl border border-[#DCE5DA] shadow-xs">
            <h2 className="font-semibold text-[#202C25] text-[17px] mb-4">
              Registered Manufacturing Facilities ({companies.length})
            </h2>

            {loading ? (
              <p className="text-[14px] text-[#778279] py-8 text-center">Loading companies...</p>
            ) : companies.length === 0 ? (
              <p className="text-[14px] text-[#778279] py-8 text-center">No companies registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#F0F5EC] text-[#56645A] border-b border-[#DCE5DA] text-[13px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Company Name</th>
                      <th className="py-3.5 px-4">Industry</th>
                      <th className="py-3.5 px-4">Primary Process</th>
                      <th className="py-3.5 px-4">Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DA]">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F0F5EC]/60 transition">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-[#202C25]">{c.name}</p>
                          <p className="text-[13px] text-[#778279] mt-0.5">{c.location || 'Location unrecorded'}</p>
                        </td>
                        <td className="py-4 px-4 text-[#56645A]">{c.industry}</td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-[#202C25] bg-[#F0F5EC] border border-[#DCE5DA] px-3 py-1 rounded text-[13px]">
                            {c.manufacturing_process}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded text-[13px] font-medium border ${
                            c.data_origin === 'SYNTHETIC_DEMO' 
                              ? 'bg-[#F0F5EC] text-[#56645A] border-[#DCE5DA]' 
                              : 'bg-[#E5EEE3] text-[#26734D] border-[#C2D8C4]'
                          }`}>
                            {c.data_origin === 'SYNTHETIC_DEMO' ? 'Synthetic Demo' : 'User Registered'}
                          </span>
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
