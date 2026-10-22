// frontend/src/pages/CompanySettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Mail,
  MapPin
} from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, Company } from '../services/api';

export const CompanySettingsPage: React.FC = () => {
  const { company, user, updateCompanyProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'preferences'>('profile');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    industry: '',
    company_size: '',
    location: '',
    email: '',
    manufacturing_process: '',
    process_description: '',
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        industry: company.industry || '',
        company_size: company.company_size || '50-250 employees',
        location: company.location || '',
        email: company.email || '',
        manufacturing_process: company.manufacturing_process || '',
        process_description: company.process_description || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSubmitting(true);
      await updateCompanyProfile(form);
      setFeedback({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Header
        title="Company Settings"
        subtitle="Manage your company profile, team members and preferences."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        {feedback && (
          <div className={`p-4 rounded-xl text-[14px] flex items-center gap-3 shadow-2xs ${
            feedback.type === 'success' 
              ? 'bg-[#EAF7EE] border border-[#B8E2C1] text-[#26734D]' 
              : 'bg-[#FDECEC] border border-[#F5C2C2] text-[#A42D2D]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tab Switcher matching Reference Panel 11 */}
        <div className="flex items-center bg-[#E5EEE3] p-1.5 rounded-xl border border-[#DCE5DA] max-w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2 rounded-lg text-[14px] font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                : 'text-[#56645A] hover:text-[#202C25]'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-5 py-2 rounded-lg text-[14px] font-semibold transition ${
              activeTab === 'team'
                ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                : 'text-[#56645A] hover:text-[#202C25]'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-5 py-2 rounded-lg text-[14px] font-semibold transition ${
              activeTab === 'preferences'
                ? 'bg-[#FFFFFF] text-[#202C25] shadow-2xs border border-[#DCE5DA]'
                : 'text-[#56645A] hover:text-[#202C25]'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Split Layout matching Reference Panel 11 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Area */}
          <div className="lg:col-span-8 bg-[#FFFFFF] p-8 rounded-3xl border border-[#DCE5DA] shadow-2xs">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-5 text-[14px]">
                <div>
                  <label className="block font-semibold text-[#202C25] mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#202C25] mb-1.5">Industry Type *</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    >
                      <option value="Metal Fabrication & Metallurgy">Metal Fabrication & Metallurgy</option>
                      <option value="Automotive & Transportation Components">Automotive & Transportation Components</option>
                      <option value="Electroplating & Surface Treatment">Electroplating & Surface Treatment</option>
                      <option value="Chemical Manufacturing & Inorganics">Chemical Manufacturing & Inorganics</option>
                      <option value="Electronic Equipment & Semiconductors">Electronic Equipment & Semiconductors</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#202C25] mb-1.5">Company Size</label>
                    <select
                      value={form.company_size}
                      onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    >
                      <option value="1-50 employees">1-50 employees</option>
                      <option value="50-250 employees">50-250 employees</option>
                      <option value="250-1000 employees">250-1000 employees</option>
                      <option value="1000+ employees">1000+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#202C25] mb-1.5">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g., Nagpur, Maharashtra, India"
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#202C25] mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#202C25] mb-1.5">Manufacturing Process *</label>
                  <input
                    type="text"
                    value={form.manufacturing_process}
                    onChange={(e) => setForm({ ...form, manufacturing_process: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#202C25] mb-1.5">Process & Facility Description</label>
                  <textarea
                    rows={3}
                    value={form.process_description}
                    onChange={(e) => setForm({ ...form, process_description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3] text-[#202C25] focus:outline-none focus:ring-2 focus:ring-[#278653] resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[14px] transition shadow-xs flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'team' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DA]">
                  <h4 className="font-bold text-[16px] text-[#202C25]">Workspace Team Members</h4>
                  <button 
                    onClick={() => alert('Invite member flow: An invite link has been generated for your company workspace.')}
                    className="px-4 py-2 rounded-xl bg-[#278653] text-white font-semibold text-[13px] flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Invite Member</span>
                  </button>
                </div>

                <div className="divide-y divide-[#DCE5DA]">
                  <div className="py-3 flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E5EEE3] text-[#26734D] font-bold flex items-center justify-center text-xs">
                        {user?.full_name ? user.full_name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-[#202C25]">{user?.full_name || 'Simran Chawla'}</p>
                        <p className="text-[12px] text-[#56645A]">{user?.email || 'simran@abcmfg.com'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5EEE3] text-[#26734D]">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4 text-[14px]">
                <h4 className="font-bold text-[16px] text-[#202C25]">Workspace System Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 cursor-pointer">
                    <div>
                      <p className="font-semibold text-[#202C25]">Automatic TWS Dynamic Re-evaluation</p>
                      <p className="text-[12px] text-[#56645A]">Re-score stream whenever new laboratory assay results are recorded</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#278653]" />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 cursor-pointer">
                    <div>
                      <p className="font-semibold text-[#202C25]">Strict Analytical Qualifier Protection</p>
                      <p className="text-[12px] text-[#56645A]">Mandate explicit confirmation before running models on qualified limits (&lt;0.030)</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#278653]" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Image Card matching Reference Panel 11 */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden border border-[#DCE5DA] shadow-md bg-[#10271E] h-[480px]">
            <img
              src="/images/settings-plant.jpg"
              alt="Your Sustainability Partner"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10271E] via-[#10271E]/40 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DCE5DA] shadow-lg space-y-2 text-center">
              <div className="w-9 h-9 rounded-full bg-[#E5EEE3] text-[#26734D] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[16px] text-[#202C25]">Your Sustainability Partner in Progress</h4>
              <p className="text-[12px] text-[#56645A] leading-relaxed">
                Manage your enterprise company information and team to drive uncompromised sustainability outcomes.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
