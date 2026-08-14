// Fixed top navigation bar for the marketing pages. Shows the brand, anchor
// links, and Login / Get Started buttons.
import ActionButton from "./ui/ActionButton.jsx";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-5 pt-4">
      <div className="max-w-8xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/2 backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-linear-to-b from-white/8 via-transparent to-white/2" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,200,200,0.08),transparent_50%)]" />
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-400/8 rounded-full blur-2xl" />
          <div className="relative px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
                <span className="text-sm font-black text-white">P</span>
              </div>
              <div>
                <h1 className="text-base font-black tracking-[-0.03em]">
                  PulsePoll
                </h1>
                <p className="text-[9px] text-zinc-500 tracking-[0.22em] uppercase leading-none mt-0.5">
                  Realtime Intelligence
                </p>
              </div>
            </div>
            {/* Desktop-only nav links (hidden below lg breakpoint) */}
            <nav className="hidden lg:flex items-center gap-1">
              {["Features", "How It Works", "Pricing", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/6"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2.5">
              <ActionButton
                as={Link}
                to="/login"
                variant="subtle"
                className="px-4 py-2 rounded-xl text-sm font-medium"
              >
                Login
              </ActionButton>
              <ActionButton
                as={Link}
                to="/register"
                variant="accent"
                className="px-5 py-2 rounded-xl text-sm font-semibold"
              >
                Get Started
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
