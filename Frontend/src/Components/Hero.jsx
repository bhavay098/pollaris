// Hero (first) section of the home page: headline, call-to-action buttons,
// and a mock "live poll" card on the right built from static demo data below.
import ActionButton from "./ui/ActionButton.jsx";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

// Marketing stats shown under the CTAs.
const stats = [
  { value: "14K+", label: "Live Responses" },
  { value: "3.8K+", label: "Polls Created" },
  { value: "99.9%", label: "Realtime Sync" },
];

// Mock poll results rendered in the demo card.
const pollOptions = [
  {
    label: "Product roadmap",
    value: "48%",
    width: "48%",
    color: "bg-teal-500",
  },
  {
    label: "Audience analytics",
    value: "31%",
    width: "31%",
    color: "bg-sky-500",
  },
  {
    label: "Public polls",
    value: "21%",
    width: "21%",
    color: "bg-indigo-500",
  },
];

export default function Hero() {
  // Signed-in users land on the dashboard instead of the auth pages.
  const { user } = useAuthStore();
  const authTarget = user ? "/dashboard" : "/login";

  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 md:pt-36 pb-12 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-teal-400/20 bg-teal-400/[0.07]">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-xs text-teal-300 tracking-[0.12em] uppercase font-medium">
              WebSocket Powered Live Polling
            </span>
          </div>
          <h2 className="home-hero-title mt-7 font-bold leading-[0.98] tracking-[-0.03em]">
            Polling <br className="hidden sm:block" />
            <span className="text-teal-400">Reimagined</span>{" "}
            <br className="hidden sm:block" />
            In Real Time.
          </h2>
          <p className="mt-7 text-base leading-relaxed text-zinc-400 max-w-lg">
            Create beautiful live polls, gather instant feedback, visualize
            participation analytics, and publish realtime insights through a
            modern collaborative platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
            <ActionButton
              as={Link}
              to={authTarget}
              className="w-full sm:w-auto px-7 py-3.5 justify-center"
            >
              Launch Poll
            </ActionButton>
            <ActionButton
              as={Link}
              to={authTarget}
              variant="secondary"
              className="w-full sm:w-auto px-7 py-3.5 justify-center"
            >
              Login
            </ActionButton>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-5"
              >
                <div className="text-2xl font-bold text-white">
                  {item.value}
                </div>
                <div className="mt-1.5 text-xs text-zinc-500 font-medium tracking-[0.04em]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero-visual relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-130 h-130 rounded-full border border-teal-500/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-105 h-105 rounded-full border border-cyan-400/08" />
          </div>
          <div className="relative w-full max-w-md rounded-4xl border border-white/9 bg-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-white/2" />
            <div className="relative border-b border-white/[0.07] px-7 py-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
                  Live Poll
                </p>
                <h3 className="mt-3 text-2xl font-bold leading-[1.08]">
                  What should we ship next?
                </h3>
              </div>
              <div className="w-16 h-16 rounded-full border border-teal-400/30 flex items-center justify-center text-teal-300 font-semibold text-lg shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                74%
              </div>
            </div>
            <div className="relative px-7 py-7 space-y-6">
              {pollOptions.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2.5 text-sm text-zinc-300">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-zinc-400">{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                    Votes cast
                  </p>
                  <h4 className="mt-2.5 text-3xl font-bold">1,248</h4>
                  <div className="mt-2 text-teal-400 text-xs font-medium">
                    +18 in the last minute
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                    Engagement
                  </p>
                  <h4 className="mt-2.5 text-3xl font-bold">94%</h4>
                  <div className="mt-2 text-sky-300 text-xs font-medium">
                    Strong signal quality
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
