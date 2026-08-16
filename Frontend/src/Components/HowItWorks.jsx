// Marketing section walking visitors through the four-step "how it works"
// flow. The `color` field maps to Tailwind color classes via colorMap below.
const steps = [
  {
    number: "01",
    title: "Create Your Poll",
    description:
      "Build a poll in seconds using our intuitive editor. Add questions, set access controls, and configure expiry times.",
    color: "teal",
  },
  {
    number: "02",
    title: "Share Instantly",
    description:
      "Generate a unique public link and share it directly with your audience, or drop it in any chat.",
    color: "sky",
  },
  {
    number: "03",
    title: "Watch Live Results",
    description:
      "See votes roll in live on your dashboard. Our WebSocket engine updates results the instant someone submits.",
    color: "indigo",
  },
  {
    number: "04",
    title: "Publish Insights",
    description:
      "Dive into detailed analytics on drop-off rates, then publish the final results back to your audience with a single click.",
    color: "cyan",
  },
];

// Maps a step's color name to the Tailwind classes used for its dot and number.
const colorMap = {
  teal: { dot: "bg-teal-400", num: "text-teal-400" },
  sky: { dot: "bg-sky-400", num: "text-sky-400" },
  indigo: { dot: "bg-indigo-400", num: "text-indigo-400" },
  cyan: { dot: "bg-cyan-400", num: "text-cyan-400" },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-12 md:pb-28">
      <div className="h-px bg-white/10 mb-12 md:mb-24" />
      <div className="text-center max-w-3xl mx-auto mb-20">
        <p className="text-xs uppercase tracking-[0.12em] text-cyan-400 font-semibold">
          How It Works
        </p>
        <h3 className="mt-5 text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08]">
          From idea to live poll{" "}
          <br className="hidden sm:block" />
          in under 60 seconds.
        </h3>
      </div>
      <div className="relative">
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-white/20" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const c = colorMap[step.color];
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div
                  className={`relative z-10 w-5 h-5 rounded-full ${c.dot} mb-6 hidden lg:block ring-4 ring-[#030b14]`}
                />
                <span
                  className={`hidden lg:block text-4xl font-bold ${c.num} opacity-40 mb-2 tracking-[-0.025em]`}
                >
                  {step.number}
                </span>
                <span
                  className={`lg:hidden text-sm font-bold ${c.num} opacity-60 mb-2`}
                >
                  {step.number}
                </span>
                <h4 className="text-lg font-bold text-white mb-3">
                  {step.title}
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
