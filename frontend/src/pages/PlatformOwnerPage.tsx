// frontend/src/pages/PlatformOwnerPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Trash2, 
  Scale, 
  FileCheck2, 
  TrendingUp, 
  Search, 
  Filter, 
  X, 
  Eye, 
  Lock,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { 
  api, 
  PlatformOverview, 
  PlatformCompanySummary, 
  PlatformCompanyDetail 
} from '../services/api';

export const PlatformOwnerPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [companies, setCompanies] = useState<PlatformCompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<'ALL' | 'USER_REGISTERED' | 'DEMO'>('ALL');

  // Inspection Modal State
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [companyDetail, setCompanyDetail] = useState<PlatformCompanyDetail | null>(null);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ov, cos] = await Promise.all([
        api.getPlatformOverview(),
        api.getPlatformCompanies()
      ]);
      setOverview(ov);
      setCompanies(cos);
    } catch (err: any) {
      setError(err.message || 'Failed to load platform governance data. Ensure you have Platform Owner privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectCompany = async (companyId: number) => {
    try {
      setSelectedCompanyId(companyId);
      setDetailLoading(true);
      const detail = await api.getPlatformCompanyDetail(companyId);
      setCompanyDetail(detail);
    } catch (err: any) {
      alert(`Could not load tenant details: ${err.message}`);
      setSelectedCompanyId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredCompanies = companies.filter(co => {
    const matchesSearch = 
      co.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      co.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (co.location && co.location.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (originFilter === 'USER_REGISTERED') {
      return co.data_origin === 'USER_REGISTERED';
    }
    if (originFilter === 'DEMO') {
      return co.data_origin === 'SYNTHETIC_DEMO' || co.data_origin === 'PLATFORM_SYSTEM';
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3]">
      <Header
        title="Platform Governance & Oversight"
        subtitle="Global tenant registry, aggregated waste material metrics, and tenant governance."
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">

        {/* Tenant Assay Confidentiality Protection Notice */}
        <div className="bg-[#EBF5EE] border border-[#C2E0C8] rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="p-2 rounded-xl bg-[#26734D] text-white flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-[#184E34] flex items-center gap-2">
              <span>Confidential Tenant Assays Protected</span>
              <span className="bg-[#26734D]/15 text-[#26734D] text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Strict Isolation
              </span>
            </h3>
            <p className="text-[13px] text-[#325A41] leading-relaxed">
              Platform Owner oversight provides operational metadata, company directories, and aggregate material streams. 
              Proprietary chemical spectroscopy, detailed assay values, and trade-secret laboratory compositions remain strictly quarantined within each tenant’s isolated workspace.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-[#FDECEC] border border-[#F5C2C2] text-[#A42D2D] rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-[#56645A] bg-white rounded-2xl border border-[#DCE5DA] shadow-xs">
            <div className="animate-spin w-8 h-8 border-3 border-[#26734D] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-[15px]">Loading global platform telemetry...</p>
          </div>
        ) : overview ? (
          <>
            {/* Global Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">Total Companies</span>
                  <Building2 className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">{overview.total_companies}</span>
                  <div className="text-[11px] text-[#778279] mt-1 flex items-center gap-1.5">
                    <span className="text-[#26734D] font-medium">{overview.registered_companies} registered</span>
                    <span>•</span>
                    <span>{overview.demo_companies} demo</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">Platform Users</span>
                  <Users className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">{overview.total_users}</span>
                  <p className="text-[11px] text-[#778279] mt-1">
                    {overview.users_by_role['platform_owner'] || 0} platform owners
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">Waste Streams</span>
                  <Trash2 className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">{overview.total_waste_streams}</span>
                  <p className="text-[11px] text-[#778279] mt-1">Across {overview.total_facilities} facilities</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">Monthly Volume</span>
                  <Scale className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">
                    {overview.total_monthly_volume_kg >= 1000
                      ? `${(overview.total_monthly_volume_kg / 1000).toFixed(1)} t`
                      : `${overview.total_monthly_volume_kg.toFixed(0)} kg`}
                  </span>
                  <p className="text-[11px] text-[#778279] mt-1">Aggregated waste mass</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">TWS Assessments</span>
                  <FileCheck2 className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">{overview.total_assessments}</span>
                  <p className="text-[11px] text-[#778279] mt-1">Evaluations logged</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE5DA] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#56645A]">
                  <span className="text-[13px] font-medium">Recovery Scenarios</span>
                  <TrendingUp className="w-4 h-4 text-[#26734D]" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#202C25]">{overview.total_recovery_scenarios}</span>
                  <p className="text-[11px] text-[#778279] mt-1">Circular models</p>
                </div>
              </div>
            </div>

            {/* Company Directory Section */}
            <div className="bg-white rounded-2xl border border-[#DCE5DA] shadow-xs overflow-hidden">
              <div className="p-6 border-b border-[#DCE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#202C25]">Registered Tenants & Workspaces</h2>
                  <p className="text-[13px] text-[#56645A] mt-0.5">
                    Displaying {filteredCompanies.length} of {companies.length} tenant organizations.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#778279]" />
                    <input
                      type="text"
                      placeholder="Search company or industry..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-[13px] bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl focus:outline-none focus:border-[#26734D] w-64"
                    />
                  </div>

                  <select
                    value={originFilter}
                    onChange={(e: any) => setOriginFilter(e.target.value)}
                    className="py-2 px-3 text-[13px] bg-[#F7F8F3] border border-[#DCE5DA] rounded-xl focus:outline-none focus:border-[#26734D] text-[#202C25]"
                  >
                    <option value="ALL">All Tenants</option>
                    <option value="USER_REGISTERED">User Registered</option>
                    <option value="DEMO">Demo & System</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#F7F8F3] border-b border-[#DCE5DA] text-[#56645A] font-semibold">
                      <th className="py-3.5 px-6">Company / Workspace</th>
                      <th className="py-3.5 px-4">Industry & Location</th>
                      <th className="py-3.5 px-4 text-center">Users</th>
                      <th className="py-3.5 px-4 text-center">Streams</th>
                      <th className="py-3.5 px-4 text-right">Monthly Volume</th>
                      <th className="py-3.5 px-4 text-center">High Priority</th>
                      <th className="py-3.5 px-6 text-right">Oversight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DA]">
                    {filteredCompanies.map((co) => (
                      <tr key={co.id} className="hover:bg-[#F9FAF7] transition">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#202C25]">{co.name}</div>
                          <div className="text-[11px] text-[#778279] mt-0.5 flex items-center gap-1.5">
                            <span>ID #{co.id}</span>
                            <span>•</span>
                            <span>{co.email || 'No email registered'}</span>
                            <span>•</span>
                            <span className={co.data_origin === 'USER_REGISTERED' ? 'text-[#26734D] font-medium' : 'text-[#778279]'}>
                              {co.data_origin || 'DEMO'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[#202C25]">{co.industry}</div>
                          <div className="text-[11px] text-[#778279]">{co.location || 'India'}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-medium text-[#202C25]">{co.user_count}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-medium text-[#202C25]">{co.waste_stream_count}</span>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-[#202C25]">
                          {co.total_monthly_volume_kg > 0 ? (
                            co.total_monthly_volume_kg >= 1000 ? (
                              `${(co.total_monthly_volume_kg / 1000).toFixed(1)} t/mo`
                            ) : (
                              `${co.total_monthly_volume_kg.toFixed(0)} kg/mo`
                            )
                          ) : (
                            <span className="text-[#778279] font-normal">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {co.high_priority_streams_count > 0 ? (
                            <span className="bg-[#FDECEC] text-[#A42D2D] font-bold text-[11px] px-2 py-0.5 rounded-full border border-[#F5C2C2]">
                              {co.high_priority_streams_count} High
                            </span>
                          ) : (
                            <span className="text-[#778279] text-[11px]">0</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleInspectCompany(co.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E5EEE3] hover:bg-[#D0E3D1] text-[#26734D] font-medium rounded-lg text-xs transition border border-[#C2D8C4]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Overview</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Platform Activity Feed */}
            {overview.recent_activity && overview.recent_activity.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#DCE5DA] shadow-xs">
                <h3 className="text-[16px] font-semibold text-[#202C25] mb-4">Recent Multi-Tenant System Activity</h3>
                <div className="space-y-3">
                  {overview.recent_activity.map((act) => (
                    <div key={act.id} className="p-3 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA] flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D0E3D1] text-[#26734D] flex items-center justify-center font-bold text-xs">
                          IT
                        </div>
                        <div>
                          <p className="font-semibold text-[#202C25]">{act.title}</p>
                          <p className="text-[11px] text-[#56645A]">{act.company_name} (Company #{act.company_id})</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#778279] bg-white px-2 py-0.5 rounded-md border border-[#DCE5DA]">
                        {act.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Company Detail Modal */}
        {selectedCompanyId && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl border border-[#DCE5DA] overflow-hidden">
              <div className="p-5 border-b border-[#DCE5DA] flex items-center justify-between bg-[#F7F8F3]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#26734D] text-white flex items-center justify-center font-bold text-sm">
                    {companyDetail?.company.name.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#202C25]">
                      {companyDetail?.company.name || 'Loading Company...'}
                    </h3>
                    <p className="text-[11px] text-[#56645A]">
                      {companyDetail?.company.industry} • {companyDetail?.company.location || 'India'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className="p-1.5 text-[#778279] hover:text-[#202C25] hover:bg-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {detailLoading || !companyDetail ? (
                  <div className="py-12 text-center text-[#56645A]">
                    <div className="animate-spin w-6 h-6 border-2 border-[#26734D] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs">Fetching company workspace overview...</p>
                  </div>
                ) : (
                  <>
                    {/* Confidentiality Reminder inside Modal */}
                    <div className="p-3 bg-[#EBF5EE] border border-[#C2E0C8] rounded-xl text-[12px] text-[#184E34] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#26734D]" />
                      <span>Confidentiality Protected: Raw spectroscopy and lab assays are not exposed in Platform Owner view.</span>
                    </div>

                    {/* Operational Facilities */}
                    <div>
                      <h4 className="text-[13px] font-semibold text-[#202C25] mb-2 uppercase tracking-wide">
                        Facilities ({companyDetail.facilities.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {companyDetail.facilities.map((f) => (
                          <div key={f.id} className="p-3.5 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA]">
                            <div className="font-semibold text-[13px] text-[#202C25]">{f.name}</div>
                            <div className="text-[11px] text-[#56645A] mt-0.5">{f.primary_process}</div>
                            <div className="text-[10px] text-[#778279] mt-1">{f.location || 'Plant Location'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Waste Streams Summary */}
                    <div>
                      <h4 className="text-[13px] font-semibold text-[#202C25] mb-2 uppercase tracking-wide">
                        Waste Streams ({companyDetail.waste_streams_summary.length})
                      </h4>
                      {companyDetail.waste_streams_summary.length === 0 ? (
                        <p className="text-xs text-[#778279] italic p-3 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA]">
                          No waste streams registered yet for this workspace.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {companyDetail.waste_streams_summary.map((st) => (
                            <div key={st.id} className="p-3.5 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA] flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-[13px] text-[#202C25]">{st.stream_name}</span>
                                <div className="text-[11px] text-[#56645A] mt-0.5">
                                  {st.waste_category} • {st.quantity} {st.quantity_unit} • {st.facility_name}
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  st.priority_level === 'High' 
                                    ? 'bg-[#FDECEC] text-[#A42D2D] border border-[#F5C2C2]' 
                                    : 'bg-[#E5EEE3] text-[#26734D] border border-[#C2D8C4]'
                                }`}>
                                  {st.priority_level} (TWS {st.tws_score !== null ? st.tws_score : '—'})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Account Users */}
                    <div>
                      <h4 className="text-[13px] font-semibold text-[#202C25] mb-2 uppercase tracking-wide">
                        Authorized Users ({companyDetail.users.length})
                      </h4>
                      <div className="space-y-2">
                        {companyDetail.users.map((u) => (
                          <div key={u.id} className="p-3 bg-[#F7F8F3] rounded-xl border border-[#DCE5DA] flex items-center justify-between text-[12px]">
                            <div>
                              <span className="font-semibold text-[#202C25]">{u.full_name}</span>
                              <span className="text-[#778279] ml-2">({u.email})</span>
                            </div>
                            <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#DCE5DA] font-medium text-[#56645A]">
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-[#DCE5DA] bg-[#F7F8F3] flex justify-end">
                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className="px-4 py-2 bg-white text-[#202C25] font-semibold rounded-xl text-xs border border-[#DCE5DA] hover:bg-[#DCE8DA] transition"
                >
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
