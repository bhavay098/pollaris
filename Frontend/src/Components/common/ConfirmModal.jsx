import Modal from "../ui/Modal.jsx";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  verificationString = null,
  verificationInput = "",
  onVerificationChange = null,
}) {
  const isVerificationSatisfied =
    !verificationString || verificationInput.trim() === verificationString;

  const handleConfirm = async () => {
    if (!isVerificationSatisfied) return;
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      maxWidth="max-w-md"
      showCloseButton={!isLoading}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Warning Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            variant === "danger"
              ? "bg-red-500/10 text-red-500"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--app-text)]">{title}</h3>
          <p className="mt-1 text-xs text-[var(--app-muted)] leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Verification Input (if required, e.g. typing "DELETE") */}
        {verificationString && (
          <div className="w-full text-left pt-2">
            <label className="block text-xs font-semibold text-[var(--app-muted)] mb-1.5">
              Type <strong className="text-[var(--app-danger)]">{verificationString}</strong> to confirm:
            </label>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => onVerificationChange?.(e.target.value)}
              placeholder={verificationString}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] text-xs text-[var(--app-text)] outline-none font-mono"
            />
          </div>
        )}

        {/* Modal buttons */}
        <div className="flex w-full items-center gap-3 pt-4 border-t border-[var(--app-border)]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 btn btn-secondary text-xs min-h-[40px] justify-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading || !isVerificationSatisfied}
            onClick={handleConfirm}
            className={`flex-1 text-xs min-h-[40px] justify-center font-semibold rounded-xl transition-all ${
              variant === "danger"
                ? "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                : "btn-primary disabled:opacity-50"
            }`}
          >
            {isLoading ? "Processing…" : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
