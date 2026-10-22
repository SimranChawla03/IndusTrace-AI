// frontend/src/components/ScientificNotice.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NoticeProps {
  title?: string;
  children: React.ReactNode;
}

export const ScientificNotice: React.FC<NoticeProps> = ({ 
  title = "Important Scientific & Engineering Guardrails", 
  children 
}) => {
  return (
    <div className="bg-[#FFF5DD] border border-[#E8D8A7] rounded-xl p-4 text-[14px] flex gap-3.5 mb-6 shadow-xs">
      <AlertTriangle className="w-5 h-5 text-[#8A5A00] flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-semibold text-[#8A5A00] text-[15px]">{title}</h4>
        <div className="text-[#8A5A00]/90 leading-relaxed text-[14px] space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
};
