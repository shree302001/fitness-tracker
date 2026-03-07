import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export function Input({ label, error, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400 font-medium">{label}</label>}
      <div className="relative flex items-center">
        <input
          {...props}
          className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400 transition-colors text-sm ${suffix ? 'pr-10' : ''} ${className}`}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
