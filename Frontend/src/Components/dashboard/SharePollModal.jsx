import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import { Copy, Check, ExternalLink, Link2, ShieldCheck, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SharePollModal({ isOpen, onClose, poll }) {
  const [copied, setCopied] = useState(false);

  if (!poll) return null;

  const publicUrl = `${window.location.origin}/p/${poll.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Poll link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Poll"
      description="Share this link with your audience to start collecting live responses."
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Poll summary banner */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_70%,transparent)] p-4">
          <h3 className="font-bold text-[var(--app-text)] text-base truncate">{poll.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--app-muted)]">
            <span className="inline-flex items-center gap-1.5">
              {poll.responseMode === "AUTHENTICATED" ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Authenticated only</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-teal-400" />
                  <span>Anonymous public</span>
                </>
              )}
            </span>
            <span>•</span>
            <span>{poll.totalResponses || 0} responses recorded</span>
          </div>
        </div>

        {/* Link copy box */}
        <div>
          <label className="block text-xs font-semibold text-[var(--app-muted)] mb-2">
            Public Response URL
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--app-subtle)]">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] text-xs text-[var(--app-text)] font-mono outline-none select-all"
                onClick={(e) => e.target.select()}
              />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                copied
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "btn-primary min-h-[40px]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--app-border)]">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--app-primary)] hover:underline"
          >
            <span>Open in new tab</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-quiet text-xs px-4 py-2"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
