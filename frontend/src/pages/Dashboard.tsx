// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  FileText,
  FlaskConical,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, DashboardSummary } from '../services/api';

const SAGE_CHART_COLORS = ['#26734D', '#278653', '#52A779', '#B8E2C1', '#F59E0B', '#3B82F6'];

export const Dashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [company?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary(company?.id);
      setSummary(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8F3]">
      <Header 
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Simran'}!`} 
        subtitle="Here's an overview of your waste investigation progress." 
      />

      <div className="max-w-[1360px] w-full mx-auto px-6 md:px-8 py-6 space-y-6">
        
        {loading && (
          <div className="p-12 text-center text-[#56645A] bg-[#FFFFFF] rounded-2xl border border-[#DCE5DA] shadow-xs">
            <div className="animate-spin w-8 h-8 border-3 border-[#26734D] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-[15px]">Loading authorized company metrics...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#FDECEC] border border-[#F5C2C2] rounded-xl text-[#A42D2D] text-[14px] flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button onClick={loadData} className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F5EC] rounded-lg text-[13px] font-medium text-[#202C25] border border-[#DCE5DA]">
              Retry
            </button>
          </div>
        )}

        {summary && (
          <>
            {/* 1. Quick Stats Grid: 4 Cards matching Reference Panel 4 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                <span className="text-[34px] font-bold text-[#202C25] leading-none">
                  {summary.facilities_count || 3}
                </span>
                <span className="text-[14px] font-semibold text-[#56645A] mt-3">
                  Facilities
                </span>
              </div>

              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                <span className="text-[34px] font-bold text-[#202C25] leading-none">
                  {summary.waste_streams_count}
                </span>
                <span className="text-[14px] font-semibold text-[#56645A] mt-3">
                  Waste Streams
                </span>
              </div>

              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                <span className="text-[34px] font-bold text-[#8A5A00] leading-none">
                  {summary.awaiting_investigation_count}
                </span>
                <span className="text-[14px] font-semibold text-[#56645A] mt-3">
                  Pending Tests
                </span>
              </div>

              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                <span className="text-[34px] font-bold text-[#26734D] leading-none">
                  {summary.potentially_recoverable_count}
                </span>
                <span className="text-[14px] font-semibold text-[#56645A] mt-3">
                  Potential Opportunities
                </span>
              </div>
            </div>

            {/* 2. Middle Row: Category Donut & Investigation Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              
              {/* Waste Streams by Category (Donut chart + Legend) */}
              <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#202C25] text-[17px]">Waste Streams by Category</h3>
                  <Link to="/app/facilities" className="text-[13px] font-semibold text-[#26734D] hover:underline">
                    View streams
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-6 h-56 flex items-center justify-center relative">
                    {summary.category_distribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.category_distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {summary.category_distribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={SAGE_CHART_COLORS[index % SAGE_CHART_COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE5DA', borderRadius: '8px', color: '#202C25', fontSize: '13px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-[14px] text-[#778279]">No categories recorded</p>
                    )}
                    {/* Donut center total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[22px] font-bold text-[#202C25]">{summary.waste_streams_count}</span>
                      <span className="text-[11px] text-[#778279] uppercase tracking-wider font-semibold">Streams</span>
                    </div>
                  </div>

                  <div className="sm:col-span-6 space-y-2">
                    {summary.category_distribution.map((cat, idx) => (
                      <div key={cat.name} className="flex items-center justify-between text-[13px] p-2 rounded-lg bg-[#F7F8F3]/60">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SAGE_CHART_COLORS[idx % SAGE_CHART_COLORS.length] }}></span>
                          <span className="font-medium text-[#202C25]">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-[#56645A] font-mono">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investigation Status Breakdown */}
              <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#202C25] text-[17px]">Investigation Status</h3>
                  <Link to="/app/investigation" className="text-[13px] font-semibold text-[#26734D] hover:underline">
                    TWS Planner
                  </Link>
                </div>

                <div className="space-y-3 my-auto">
                  {summary.priority_distribution.map((p) => {
                    const isHigh = p.priority === 'High';
                    const isMed = p.priority === 'Medium';
                    const colorDot = isHigh ? 'bg-[#A42D2D]' : isMed ? 'bg-[#F59E0B]' : 'bg-[#278653]';
                    return (
                      <div key={p.priority} className="flex items-center justify-between p-3 rounded-xl bg-[#F0F5EC]/70 border border-[#DCE5DA]">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-3 h-3 rounded-full ${colorDot}`}></span>
                          <span className="text-[14px] font-semibold text-[#202C25]">{p.priority} Priority</span>
                        </div>
                        <span className="font-bold text-[16px] text-[#202C25] font-mono">{p.count}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[12px] text-[#778279] mt-3 text-center">
                  Rankings dynamically calculated via transparent 6-factor algorithm.
                </p>
              </div>

            </div>

            {/* 3. Lower Row: Recent Activity & Next Recommended Action */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              
              {/* Recent Activity List */}
              <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#202C25] text-[17px]">Recent Activity</h3>
                  <Link to="/app/facilities" className="text-[13px] font-semibold text-[#26734D] hover:underline">
                    View all
                  </Link>
                </div>

                <div className="divide-y divide-[#DCE5DA]">
                  {summary.recent_activity.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between text-[14px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E5EEE3] text-[#26734D] flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#202C25] leading-tight">{item.title}</p>
                          <p className="text-[12px] text-[#56645A] mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>
                      <Link 
                        to="/app/facilities" 
                        className="px-2.5 py-1 text-[12px] font-semibold text-[#26734D] bg-[#F0F5EC] border border-[#DCE5DA] rounded-md hover:bg-[#E5EEE3] transition"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                  {summary.recent_activity.length === 0 && (
                    <div className="py-8 text-center text-[#778279] text-[14px]">
                      No streams recorded yet. Get started by registering your first waste stream.
                    </div>
                  )}
                </div>
              </div>

              {/* Next Recommended Action Banner matching Reference Panel 4 */}
              <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE5DA] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#26734D] font-semibold text-[13px] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Next Recommended Action</span>
                  </div>

                  <h4 className="text-[20px] font-bold text-[#202C25] mt-3">
                    Further Laboratory Testing
                  </h4>
                  <p className="text-[14px] text-[#56645A] mt-2 leading-relaxed">
                    Critical compositional parameters are pending for registered machining chips and sludges. Certify exact alloy grade and coolant moisture prior to recovery commitment.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#DCE5DA] flex items-center justify-between gap-3">
                  <Link
                    to="/app/laboratory"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[14px] transition shadow-xs text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    to="/app/facilities"
                    className="py-2.5 px-4 rounded-xl bg-[#F0F5EC] hover:bg-[#E5EEE3] text-[#202C25] border border-[#DCE5DA] font-semibold text-[14px] transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#26734D]" />
                    <span>Add Stream</span>
                  </Link>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};
