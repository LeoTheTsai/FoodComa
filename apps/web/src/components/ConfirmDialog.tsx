import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  if (!open) return null;

  const node = (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white/90 backdrop-blur shadow-xl">
          <div className="p-5 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={onCancel} className="px-4 py-2 rounded-full border border-emerald-200 bg-white text-gray-700 hover:bg-emerald-50">{cancelText}</button>
              <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700">{confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
