
import React from 'react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};
