// Bottom call-to-action banner on the home page, prompting sign-up/login.
import ActionButton from "./ui/ActionButton.jsx";

export default function CtaBanner() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-zinc-900 p-14 text-center">
                <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-400/25 bg-teal-400/8 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-xs text-teal-300 tracking-[0.15em] uppercase font-medium">
              Start for free today
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to run your
            <br />
            <span className="text-teal-400">
              first live poll?
            </span>
          </h2>
          <p className="mt-6 text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of teams already using PulsePoll to run smarter,
            faster, and more engaging polls.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <ActionButton as="a" href="/register" variant="accent" className="px-8 py-4 text-base font-bold">
              Create Your First Poll — Free
            </ActionButton>
            <ActionButton as="a" href="/login" variant="secondary" className="px-8 py-4 text-base">
              Login
            </ActionButton>
          </div>
          <p className="mt-6 text-zinc-600 text-xs">
            No credit card required · Free forever plan available · Cancel
            anytime
          </p>
        </div>
      </div>
    </section>
  );
}
