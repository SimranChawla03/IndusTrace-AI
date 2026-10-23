/// <reference types="vite/client" />
// frontend/src/services/api.ts
// In production on Vercel, requests use relative path '/api' transparently proxied
// by vercel.json rewrites to https://industrace-ai-backend.onrender.com/api.
// This completely eliminates cross-origin CORS preflight issues in all browsers.
const RAW_API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');
const API_BASE = (RAW_API_URL ? RAW_API_URL.replace(/\/$/, '') : '') + '/api';

export interface User {
  id: number;
  company_id: number;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  company_size?: string;
  location?: string;
  contact_info?: string;
  email?: string;
  manufacturing_process: string;
  process_description?: string;
  data_origin?: string;
  created_at?: string;
}

export interface Facility {
  id: number;
  company_id: number;
  name: string;
  location?: string;
  primary_process: string;
  description?: string;
  image_url?: string;
  waste_stream_count?: number;
  created_at?: string;
}

export interface WasteStream {
  id: number;
  company_id: number;
  facility_id?: number;
  facility_name?: string;
  stream_name: string;
  waste_category: string;
  generating_process: string;
  quantity?: number;
  quantity_unit?: string;
  frequency?: string;
  current_handling?: string;
  known_characteristics?: string;
  estimated_handling_cost?: number;
  recovery_info?: string;
  data_origin?: string;
  created_at?: string;
}

export interface FactorScore {
  name: string;
  weight_percent: number;
  raw_value: any;
  normalized_score: number;
  weighted_contribution: number;
  data_status: string;
  explanation: string;
}

export interface RecommendationDetail {
  action: string;
  priority: string;
  reason: string;
  supporting_evidence: string[];
  missing_information: string[];
  limitations: string;
  suggested_next_step: string;
}

export interface Assessment {
  id: number;
  waste_stream_id: number;
  stream_name: string;
  company_name: string;
  tws_score?: number;
  priority_level: string;
  factor_breakdown: FactorScore[];
  missing_critical_info: string[];
  matched_rules: any[];
  recommendation: string;
  recommendation_details: RecommendationDetail;
  scoring_version: string;
  created_at: string;
}

export interface WIRRule {
  id: string;
  waste_stream: string;
  investigation_area: string;
  missing_or_condition: string;
  rule_action: string;
  candidate_system_use?: string;
  evidence_source_id?: string;
  source_url?: string;
  record_type: string;
  evidence_confidence?: string;
  limitations?: string;
}

export interface ResearchSource {
  source_id: string;
  title: string;
  authors?: string;
  publication_year?: number;
  venue?: string;
  url: string;
  source_type?: string;
  scope?: string;
  relevant_summary?: string;
  caveat?: string;
}

export interface LabResult {
  id: number;
  waste_stream_id?: number;
  stream_name?: string;
  sample_id: string;
  sample_date?: string;
  laboratory?: string;
  test_name: string;
  measured_parameter: string;
  result_value_str: string;
  result_value_numeric?: number;
  unit?: string;
  detection_limit?: string;
  test_method?: string;
  notes?: string;
  data_origin: string;
  created_at: string;
}

export interface RegistrationTrend {
  month: string;
  registrations: number;
}

export interface PlatformOverview {
  total_companies: number;
  registered_companies: number;
  demo_companies: number;
  total_users: number;
  production_users: number;
  total_facilities: number;
  production_facilities: number;
  total_waste_streams: number;
  production_waste_streams: number;
  total_assessments: number;
  production_assessments: number;
  total_recovery_scenarios: number;
  production_recovery_scenarios: number;
  total_monthly_volume_kg: number;
  production_monthly_volume_kg: number;
  users_by_role: Record<string, number>;
  registration_trends?: RegistrationTrend[];
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    company_name: string;
    company_id: number;
    created_at?: string;
  }>;
}

export interface PlatformCompanySummary {
  id: number;
  name: string;
  industry: string;
  location?: string;
  email?: string;
  company_size?: string;
  created_at?: string;
  data_origin?: string;
  user_count: number;
  facility_count?: number;
  waste_stream_count: number;
  total_monthly_volume_kg: number;
  high_priority_streams_count: number;
}

export interface PlatformCompanyDetail {
  company: PlatformCompanySummary;
  facilities_count: number;
  waste_streams_count: number;
  stream_categories: Record<string, number>;
  assessments_count: number;
  recovery_scenarios_count: number;
  privacy_notice: string;
}

export interface DashboardSummary {
  facilities_count: number;
  waste_streams_count: number;
  awaiting_investigation_count: number;
  with_lab_results_count: number;
  recommended_further_testing_count: number;
  potentially_recoverable_count: number;
  category_distribution: { name: string; value: number }[];
  priority_distribution: { priority: string; count: number }[];
  recent_activity: { id: string; type: string; title: string; subtitle: string; date: string }[];
  next_recommended_action?: {
    action: string;
    stream_name?: string;
    category?: string;
    reason: string;
    suggested_next_step: string;
    priority: string;
    evidence_status: string;
  };
}

export interface RecoveryScenario {
  id: number;
  waste_stream_id: number;
  target_material: string;
  waste_quantity_kg_per_month: number;
  confirmed_material_fraction: number;
  recovery_rate_assumption: number;
  market_price_per_kg?: number;
  processing_cost_per_kg?: number;
  testing_cost_fixed?: number;
  transport_handling_cost?: number;
  other_cost?: number;
  theoretical_quantity_kg: number;
  estimated_recovered_quantity_kg: number;
  gross_value?: number;
  net_value?: number;
  calculation_status: string;
  scenario_type?: string;
  notes?: string;
  created_at: string;
}

// Token storage helper
export const authStorage = {
  getToken: () => localStorage.getItem('industrace_token'),
  setToken: (token: string) => localStorage.setItem('industrace_token', token),
  clearToken: () => {
    localStorage.removeItem('industrace_token');
    localStorage.removeItem('industrace_user');
    localStorage.removeItem('industrace_company');
  },
  getUser: (): User | null => {
    const u = localStorage.getItem('industrace_user');
    return u ? JSON.parse(u) : null;
  },
  setUser: (user: User) => localStorage.setItem('industrace_user', JSON.stringify(user)),
  getCompany: (): Company | null => {
    const c = localStorage.getItem('industrace_company');
    return c ? JSON.parse(c) : null;
  },
  setCompany: (company: Company) => localStorage.setItem('industrace_company', JSON.stringify(company)),
};

// Fetch helper with multi-tenant auth injection
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = authStorage.getToken();
  const company = authStorage.getCompany();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(company ? { 'X-Company-Id': String(company.id) } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  getHealth: () => request<any>('/health'),
  
  // Auth
  login: (data: { email: string; password: string }) => 
    request<{ token: string; user: User; company: Company }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  registerCompany: (data: any) => 
    request<{ token: string; user: User; company: Company }>('/auth/register-company', { method: 'POST', body: JSON.stringify(data) }),
  getCurrentSession: () => request<{ user: User; company: Company }>('/auth/me'),

  // Dashboard
  getDashboardSummary: (companyId?: number) => 
    request<DashboardSummary>(companyId ? `/dashboard/summary?company_id=${companyId}` : '/dashboard/summary'),
  
  // Facilities
  getFacilities: (companyId?: number) => 
    request<Facility[]>(companyId ? `/facilities?company_id=${companyId}` : '/facilities'),
  createFacility: (data: Partial<Facility>) => 
    request<Facility>('/facilities', { method: 'POST', body: JSON.stringify(data) }),

  // Companies & Settings
  getCompanies: () => request<Company[]>('/companies'),
  createCompany: (data: Partial<Company>) => request<Company>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  getCompany: (id: number) => request<Company>(`/companies/${id}`),
  updateCompany: (id: number, data: Partial<Company>) => request<Company>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Waste Streams
  getWasteStreams: (companyId?: number) => 
    request<WasteStream[]>(companyId ? `/waste-streams?company_id=${companyId}` : '/waste-streams'),
  createWasteStream: (data: Partial<WasteStream>) => 
    request<WasteStream>('/waste-streams', { method: 'POST', body: JSON.stringify(data) }),
  getWasteStream: (id: number) => request<WasteStream>(`/waste-streams/${id}`),
  updateWasteStream: (id: number, data: Partial<WasteStream>) => 
    request<WasteStream>(`/waste-streams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // WIR
  getWirRules: (query?: string) => request<WIRRule[]>(query ? `/wir?query=${encodeURIComponent(query)}` : '/wir'),
  getResearchSources: () => request<ResearchSource[]>('/wir/sources'),

  // Assessments
  runAssessment: (streamId: number) => request<Assessment>(`/assessment/${streamId}`, { method: 'POST' }),
  getAssessment: (streamId: number) => request<Assessment>(`/assessment/${streamId}`),
  getAssessmentRanking: (companyId?: number) => 
    request<Assessment[]>(companyId ? `/assessments/ranking?company_id=${companyId}` : '/assessments/ranking'),

  // Lab Results
  getLabResults: (streamId?: number, companyId?: number) => {
    let q = '';
    if (streamId) q += `waste_stream_id=${streamId}&`;
    if (companyId) q += `company_id=${companyId}&`;
    return request<LabResult[]>(q ? `/lab-results?${q}` : '/lab-results');
  },
  createLabResult: (data: Partial<LabResult>) => 
    request<LabResult>('/lab-results', { method: 'POST', body: JSON.stringify(data) }),

  // Recovery Analysis
  analyzeRecovery: (streamId: number, data: any) => 
    request<RecoveryScenario>(`/recovery/analyze/${streamId}`, { method: 'POST', body: JSON.stringify(data) }),
  getRecoveryScenarios: (streamId: number) => 
    request<RecoveryScenario[]>(`/recovery/scenarios/${streamId}`),

  // Datasets
  getDatasetSummary: () => request<any>('/datasets/summary'),
  getPlantCSample: (limit: number = 25) => request<any>(`/datasets/plant-c/sample?limit=${limit}`),

  // Platform Owner Governance Endpoints
  getPlatformOverview: () => request<PlatformOverview>('/platform/overview'),
  getPlatformCompanies: () => request<PlatformCompanySummary[]>('/platform/companies'),
  getPlatformCompanyDetail: (companyId: number) => request<PlatformCompanyDetail>(`/platform/companies/${companyId}`),

  // PDF Report Download
  downloadReportPdf: async (reportType: string, streamId: number, fallbackFilename?: string) => {
    const token = authStorage.getToken();
    const company = authStorage.getCompany();
    const headers: Record<string, string> = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(company ? { 'X-Company-Id': String(company.id) } : {}),
    };

    const res = await fetch(`${API_BASE}/reports/pdf/${reportType}/${streamId}`, {
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Report generation failed: ${res.statusText}`);
    }

    const disposition = res.headers.get('Content-Disposition');
    let filename = fallbackFilename || `IndusTrace_${reportType}_${streamId}.pdf`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
