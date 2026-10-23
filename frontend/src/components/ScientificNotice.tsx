// frontend/src/components/ScientificNotice.tsx
import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface NoticeProps {
  title?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const ScientificNotice: React.FC<NoticeProps> = ({ 
  title = "Scientific Guardrails & Methodology Context", 
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-[#F4F7F2] border border-[#DCE5DA] rounded-xl p-3 sm:p-3.5 text-[13px] text-[#202C25] mb-5 shadow-2xs transition">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#E5EEE3] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] flex-shrink-0">
            <Info className="w-3 h-3" />
          </div>
          <span className="font-semibold text-[#202C25] text-[13px] sm:text-[14px]">
            {title}
          </span>
        </div>
        <button 
          type="button"
          aria-expanded={isExpanded}
          className="text-[12px] font-medium text-[#26734D] hover:underline flex items-center gap-1"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Methodology'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#DCE5DA] text-[#425246] leading-relaxed text-[13px] space-y-1.5 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};
