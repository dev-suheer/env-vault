"use client";

import { Modal } from "@/components/brand/modal";
import { mute } from "@/lib/styles";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className={`mt-2 text-sm ${mute}`}>{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#eff2f5] sm:py-2 dark:hover:bg-ink-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 sm:py-2"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
