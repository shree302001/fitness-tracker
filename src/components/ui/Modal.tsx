import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-gray-900 rounded-t-3xl sm:rounded-2xl border border-gray-800 max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-gray-100">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
