// Bottom call-to-action banner on the home page, prompting sign-up/login.
import ActionButton from "./ui/ActionButton.jsx";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { Sparkles, ArrowRight } from "lucide-react";

export default function CtaBanner() {
  const { user } = useAuthStore();
  const authTarget = user ? "/dashboard" : "/login";

  return (
    <section className="max-w-6xl mx-auto px-6 pb-12 md:pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-zinc-900 p-8 md:p-14 text-center">
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-400/25 bg-teal-400/8 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs text-teal-300 tracking-[0.12em] uppercase font-semibold">
              Start for free today
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.025em] leading-[1.08]">
            Ready to run your <br className="hidden sm:block" />{" "}
            <span className="text-teal-400">first live poll?</span>
          </h2>
          <p className="mt-6 text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of teams already using Pollaris to run smarter,
            faster, and more engaging polls.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <ActionButton
              as={Link}
              to={authTarget}
              variant="accent"
              className="px-8 py-4 text-base font-semibold gap-2"
            >
              <span>{user ? "Go to Your Dashboard" : "Create Your First Poll — Free"}</span>
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              as={Link}
              to={authTarget}
              variant="secondary"
              className="px-8 py-4 text-base"
            >
              {user ? "Create Poll" : "Login"}
            </ActionButton>
          </div>
          <p className="mt-6 text-zinc-500 text-xs">
            100% Free to use · No credit card required · Open source
          </p>
        </div>
      </div>
    </section>
  );
}
