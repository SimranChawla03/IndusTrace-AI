// frontend/src/pages/CreateAccountPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, Check, AlertCircle, Building2, User, CheckCircle2 } from 'lucide-react';

export const CreateAccountPage: React.FC = () => {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Company
    company_name: '',
    industry: 'Metal Fabrication & Metallurgy',
    company_size: '50-250 employees',
    location: '',
    manufacturing_process: 'CNC Machining & Precision Fabrication',

    // Step 2: Admin
    full_name: '',
    email: '',
    password: '',
    terms: true,
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!formData.company_name.trim()) {
        setError('Please enter your Company Name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in all administrator details.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      await registerCompany({
        company_name: formData.company_name.trim(),
        industry: formData.industry,
        company_size: formData.company_size,
        location: formData.location.trim(),
        manufacturing_process: formData.manufacturing_process.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#202C25] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-[1080px] w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Panel: 3-Step Wizard matching Panel 3 of Reference */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl p-8 sm:p-12 border border-[#DCE5DA] shadow-sm flex flex-col justify-between">
          <div>
            {/* Header */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#D0E3D1] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] font-bold text-base">
                IT
              </div>
              <span className="font-bold text-[18px] text-[#202C25]">IndusTrace AI</span>
            </Link>

            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#202C25] tracking-tight">
              Create Your Company Account
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#56645A] mt-1.5 mb-6">
              Join IndusTrace AI and start turning industrial waste into valuable opportunities.
            </p>

            {/* Stepper Progress matching Reference Panel 3 */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#DCE5DA]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= 1 ? 'bg-[#278653] text-white' : 'bg-[#E5EEE3] text-[#56645A]'
                }`}>
                  1
                </div>
                <span className={`text-[13px] font-semibold ${step === 1 ? 'text-[#202C25]' : 'text-[#778279]'}`}>
                  Company Details
                </span>
              </div>

              <div className="w-8 h-[1px] bg-[#DCE5DA] hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= 2 ? 'bg-[#278653] text-white' : 'bg-[#E5EEE3] text-[#56645A]'
                }`}>
                  2
                </div>
                <span className={`text-[13px] font-semibold ${step === 2 ? 'text-[#202C25]' : 'text-[#778279]'}`}>
                  Admin Details
                </span>
              </div>

              <div className="w-8 h-[1px] bg-[#DCE5DA] hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 3 ? 'bg-[#278653] text-white' : 'bg-[#E5EEE3] text-[#56645A]'
                }`}>
                  3
                </div>
                <span className={`text-[13px] font-semibold ${step === 3 ? 'text-[#202C25]' : 'text-[#778279]'}`}>
                  Get Started
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#A42D2D] text-[14px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Company Profile */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., ABC Manufacturing Pvt. Ltd."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                    Industry Type *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  >
                    <option value="Metal Fabrication & Metallurgy">Metal Fabrication & Metallurgy</option>
                    <option value="Automotive & Transportation Components">Automotive & Transportation Components</option>
                    <option value="Electroplating & Surface Treatment">Electroplating & Surface Treatment</option>
                    <option value="Chemical Manufacturing & Inorganics">Chemical Manufacturing & Inorganics</option>
                    <option value="Electronic Equipment & Semiconductors">Electronic Equipment & Semiconductors</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                      Company Size
                    </label>
                    <select
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                    >
                      <option value="1-50 employees">1-50 employees</option>
                      <option value="50-250 employees">50-250 employees</option>
                      <option value="250-1000 employees">250-1000 employees</option>
                      <option value="1000+ employees">1000+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Nagpur, Maharashtra"
                      className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[15px] transition shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Next: Admin Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Administrator Profile */}
            {step === 2 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g., Simran Chawla"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@yourcompany.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#202C25] mb-1.5">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE5DA] bg-[#F7F8F3]/60 text-[#202C25] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#278653] transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border border-[#DCE5DA] text-[#202C25] font-semibold text-[15px] hover:bg-[#F0F5EC] transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[15px] transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Review & Finalize Workspace Creation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-3">
                  <h4 className="font-bold text-[16px] text-[#202C25]">Workspace Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-[14px]">
                    <div>
                      <span className="text-[#778279]">Company:</span>
                      <p className="font-semibold text-[#202C25]">{formData.company_name}</p>
                    </div>
                    <div>
                      <span className="text-[#778279]">Industry:</span>
                      <p className="font-semibold text-[#202C25]">{formData.industry}</p>
                    </div>
                    <div>
                      <span className="text-[#778279]">Admin User:</span>
                      <p className="font-semibold text-[#202C25]">{formData.full_name}</p>
                    </div>
                    <div>
                      <span className="text-[#778279]">Email:</span>
                      <p className="font-semibold text-[#202C25]">{formData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl border border-[#DCE5DA] text-[#202C25] font-semibold text-[15px] hover:bg-[#F0F5EC] transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[15px] transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{loading ? 'Creating Workspace...' : 'Create Company Workspace'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#DCE5DA] text-center text-[14px] text-[#56645A]">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-[#26734D] hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Panel: Sustainability Brand Banner matching Reference */}
        <div className="hidden lg:block lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#DCE5DA] shadow-md bg-[#10271E]">
          <img
            src="/images/onboarding-bg.jpg"
            alt="Build a Sustainable Tomorrow"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10271E] via-[#10271E]/40 to-transparent"></div>

          <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#B8E2C1]/20 border border-[#B8E2C1]/30 flex items-center justify-center text-[#B8E2C1]">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-[26px] font-bold leading-tight">
              Build a Sustainable Tomorrow
            </h3>
            <p className="text-[14px] text-white/90 leading-relaxed">
              Join leading industrial units making data-driven decisions for a cleaner, greener, and more resource-efficient future.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
