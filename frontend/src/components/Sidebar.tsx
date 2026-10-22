// frontend/src/components/Sidebar.tsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Target, 
  FlaskConical, 
  TrendingUp, 
  FileText, 
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();

  // Company-facing primary navigation matching Section 6 & Reference Image
  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/facilities', label: 'Facilities & Waste Streams', icon: Building2 },
    { to: '/app/investigation', label: 'Investigation Planner', icon: Target },
    { to: '/app/laboratory', label: 'Laboratory Reports', icon: FlaskConical },
    { to: '/app/recovery', label: 'Recovery Opportunities', icon: TrendingUp },
    { to: '/app/recommendations', label: 'Reports & Recommendations', icon: FileText },
    { to: '/app/settings', label: 'Company Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <aside className="w-64 bg-[#E5EEE3] text-[#202C25] min-h-screen flex flex-col justify-between flex-shrink-0 border-r border-[#DCE5DA]">
      <div>
        {/* Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-[#DCE5DA]">
          <div className="w-9 h-9 rounded-xl bg-[#D0E3D1] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] font-bold text-base tracking-wide shadow-2xs">
            IT
          </div>
          <div>
            <h1 className="font-semibold text-[17px] leading-tight text-[#202C25] tracking-tight">IndusTrace AI</h1>
            <p className="text-[12px] text-[#56645A] mt-0.5 truncate max-w-[150px]">
              {company?.name || 'Enterprise Workspace'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {user?.role === 'platform_owner' && (
            <NavLink
              to="/app/platform-owner"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all mb-2 ${
                  isActive
                    ? 'bg-[#D0E3D1] text-[#202C25] font-semibold shadow-2xs border-l-[3px] border-[#26734D]'
                    : 'text-[#184E34] bg-[#E5EEE3] hover:bg-[#DCE8DA] hover:text-[#202C25]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-[#26734D]' : 'text-[#26734D]'}`} />
                  <span className="font-semibold">Platform Governance</span>
                </>
              )}
            </NavLink>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#D0E3D1] text-[#202C25] font-semibold shadow-2xs border-l-[3px] border-[#26734D]'
                      : 'text-[#56645A] hover:bg-[#DCE8DA] hover:text-[#202C25]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-[#26734D]' : 'text-[#778279]'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Workspace identity */}
      <div className="p-4 border-t border-[#DCE5DA] space-y-3 bg-[#DDE7DB]/60">
        <Link
          to="/console"
          className="flex items-center justify-between text-[13px] text-[#56645A] hover:text-[#202C25] transition px-2 py-1"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#26734D]" />
            <span>Research Console</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#778279]" />
        </Link>

        <div className="pt-2 border-t border-[#DCE5DA] flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#278653] text-white flex items-center justify-center text-xs font-bold">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#202C25] truncate leading-tight">
                {user?.full_name || 'Simran Chawla'}
              </p>
              <p className="text-[11px] text-[#778279] truncate">{user?.role || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[#778279] hover:text-[#A42D2D] hover:bg-[#FDECEC] rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
