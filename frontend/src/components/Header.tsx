// frontend/src/components/Header.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, company } = useAuth();

  return (
    <header className="bg-[#F7F8F3]/95 backdrop-blur-md border-b border-[#DCE5DA] px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="max-w-2xl">
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[#202C25] leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] sm:text-[14px] text-[#56645A] mt-0.5 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Workspace Pill matching Header of Reference Image 4-11 */}
        <Link
          to="/app/settings"
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DCE5DA] hover:bg-[#F0F5EC] transition text-[13px] font-medium text-[#202C25] shadow-2xs"
        >
          <Building2 className="w-4 h-4 text-[#26734D]" />
          <span className="font-semibold truncate max-w-[180px]">
            {company?.name || 'ABC Manufacturing Pvt. Ltd.'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#778279]" />
        </Link>

        {/* User initials / avatar */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-9 h-9 rounded-full bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] font-bold text-[14px] shadow-2xs">
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'IT'}
          </div>
        </div>
      </div>
    </header>
  );
};
