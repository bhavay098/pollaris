// Fixed top navigation bar for the marketing pages. Shows the brand, anchor
// links, mobile hamburger drawer, and Login / Get Started buttons.
import { useState } from "react";
import ActionButton from "./ui/ActionButton.jsx";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuthStore } from "../store/auth-store";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Signed-in users get sent straight to the dashboard instead of the
  // login/register pages.
  const { user } = useAuthStore();
  const authTarget = user ? "/dashboard" : "/login";

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-3 sm:px-5 pt-2 sm:pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/2 backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-linear-to-b from-white/8 via-transparent to-white/2" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,200,200,0.08),transparent_50%)]" />
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-400/8 rounded-full blur-2xl" />
          <div className="home-nav-bar relative px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
            <Link
              to="/"
              className="home-brand flex items-center gap-3"
              aria-label="Pollaris home"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-[-0.02em]">
                  Pollaris
                </h1>
                <p className="text-[9px] text-zinc-400 tracking-[0.12em] uppercase leading-none mt-0.5">
                  Realtime Intelligence
                </p>
              </div>
            </Link>

            {/* Desktop-only nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/6 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="home-nav-actions flex items-center gap-2">
              <ThemeToggle />
              <ActionButton
                as={Link}
                to={authTarget}
                variant="subtle"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium"
              >
                {user ? "Dashboard" : "Login"}
              </ActionButton>
              <ActionButton
                as={Link}
                to={authTarget}
                variant="accent"
                className="px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold"
              >
                {user ? "Go to App" : "Get Started"}
              </ActionButton>

              {/* Mobile hamburger menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile slide-down menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 px-4 py-4 space-y-2 bg-zinc-950/80 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>
              ))}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <Link
                  to={authTarget}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold bg-teal-500 text-white"
                >
                  {user ? "Dashboard" : "Sign In / Register"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
