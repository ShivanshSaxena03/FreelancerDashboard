'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info' | 'success';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full shrink-0 ${
              type === 'danger'
                ? 'bg-red-50 text-red-600'
                : type === 'success'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-neutral-50 text-neutral-600'
            }`}>
              {type === 'danger' && <AlertTriangle className="w-5 h-5" />}
              {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">{title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 border border-neutral-200 bg-white rounded text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded text-[11px] font-semibold text-white transition-colors ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-black hover:bg-neutral-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
