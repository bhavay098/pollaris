// Marketing section listing the platform's four main capabilities.
// Data is static: each feature just supplies its title, blurb, icon, and color.
const features = [
  {
    title: "Live Analytics",
    description:
      "Watch responses update instantly with immersive real-time dashboards powered by WebSockets.",
    icon: "◈",
    bgColor: "bg-teal-500",
  },
  {
    title: "Smart Poll Sharing",
    description:
      "Share beautiful public poll links with built-in expiry, access control, and publishing.",
    icon: "◉",
    bgColor: "bg-sky-500",
  },
  {
    title: "Audience Insights",
    description:
      "Understand participation patterns, completion rates, and live engagement trends.",
    icon: "◎",
    bgColor: "bg-indigo-500",
  },
  {
    title: "Realtime Collaboration",
    description:
      "Synchronize poll activity and analytics across devices without refreshing the page.",
    icon: "◌",
    bgColor: "bg-cyan-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 pb-24">
      <div className="h-px bg-white/10 mb-24" />
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.12em] text-teal-400 font-semibold">
          Platform Features
        </p>
        <h3 className="mt-5 text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08]">
          Designed for modern
          <br />
          realtime engagement.
        </h3>
        <p className="mt-6 text-zinc-400 text-base leading-relaxed">
          Everything needed to create immersive polling experiences with
          analytics, synchronization, and modern collaboration.
        </p>
      </div>
      <div className="mt-16 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {features.map((feature) => (
          <div key={feature.title} className="h-full">
            <div className="group flex h-full flex-col rounded-3xl border border-white/8 bg-zinc-800/50 p-7">
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center text-lg font-semibold text-white`}
              >
                {feature.icon}
              </div>
              <h4 className="mt-6 text-lg font-bold text-white">
                {feature.title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
