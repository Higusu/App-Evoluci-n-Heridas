
import React from 'react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, label }) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              selected.includes(option)
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
