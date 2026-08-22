import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { CheckCircle2, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function SubmissionCelebration({ pollTitle }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire confetti burst on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#63dbc7", "#2cbca7", "#ffc27b", "#8ae2af"],
      });
    } catch {
      // Ignore if canvas isn't supported
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Poll link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-8 sm:p-12 text-center shadow-[var(--app-shadow)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
      {/* Big Green Success Badge */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 shadow-inner">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <span className="eyebrow text-xs">Response Recorded</span>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--app-text)]">
        Thank you for participating!
      </h2>

      <p className="mt-3 text-sm text-[var(--app-muted)] leading-relaxed">
        Your response to <strong className="text-[var(--app-text)]">"{pollTitle}"</strong> has been securely submitted and synchronized in real time.
      </p>

      {/* Share Poll Action */}
      <div className="mt-8 pt-6 border-t border-[var(--app-border)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-secondary text-xs py-2.5 px-4 w-full sm:w-auto gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Share this Poll</span>
              </>
            )}
          </button>
        </div>

        {/* Viral CTA */}
        <div className="mt-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-left sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="space-y-0.5 mb-3 sm:mb-0">
            <p className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Create your own live poll</span>
            </p>
            <p className="text-[11px] text-[var(--app-muted)]">
              Gather instant realtime answers from your audience for free.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline flex-shrink-0"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
