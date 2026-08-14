// Marketing section walking visitors through the four-step "how it works"
// flow. The `color` field maps to Tailwind color classes via colorMap below.
const steps = [
  {
    number: "01",
    title: "Create Your Poll",
    description:
      "Build a poll in seconds using our intuitive editor. Add questions, set options, and customize the look.",
    color: "teal",
  },
  {
    number: "02",
    title: "Share Instantly",
    description:
      "Generate a unique link or embed the poll anywhere - your website, Slack, email, or social media.",
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
    title: "Analyze & Export",
    description:
      "Dive into detailed analytics, filter by segment, and export data as CSV or PDF for your reports.",
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
    <section className="max-w-6xl mx-auto px-6 pb-28">
      <div className="h-px bg-white/10 mb-24" />
      <div className="text-center max-w-3xl mx-auto mb-20">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-semibold">
          How It Works
        </p>
        <h3 className="mt-5 text-4xl md:text-5xl font-black tracking-tight leading-tight">
          From idea to live poll
          <br />
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
                  className={`hidden lg:block text-4xl font-black ${c.num} opacity-40 mb-2 tracking-[-0.04em]`}
                >
                  {step.number}
                </span>
                <span
                  className={`lg:hidden text-sm font-black ${c.num} opacity-60 mb-2`}
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
