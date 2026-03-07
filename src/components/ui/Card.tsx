import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 ${className}`}>
      {children}
    </div>
  );
}
