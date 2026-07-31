const integrations = [
  { name: "Slack", icon: "◈", color: "bg-emerald-500" },
  { name: "Notion", icon: "◉", color: "bg-zinc-400" },
  { name: "Figma", icon: "◎", color: "bg-pink-500" },
  { name: "Linear", icon: "◌", color: "bg-violet-500" },
  { name: "Jira", icon: "◈", color: "bg-blue-500" },
  { name: "Zoom", icon: "◉", color: "bg-sky-500" },
];

export default function Integrations() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-28">
      <div className="h-px bg-white/10 mb-24" />
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-zinc-800/50 p-12">
        <div className="relative text-center mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-400 font-semibold">
            Integrations
          </p>
          <h3 className="mt-5 text-3xl md:text-4xl font-black tracking-tight">
            Works where your team works.
          </h3>
          <p className="mt-4 text-zinc-400 text-sm">
            Connect PulsePoll with the tools you already use.
          </p>
        </div>
        <div className="relative flex flex-wrap justify-center gap-4">
          {integrations.map((item) => (
            <div
              key={item.name}
            >
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl cursor-pointer hover:border-white/15">
                <div
                  className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-sm font-black text-white`}
                >
                  {item.icon}
                </div>
                <span className="text-sm font-semibold text-zinc-200">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="relative text-center mt-8 text-zinc-500 text-xs">
          + Zapier, Make, REST API, and 40+ more integrations
        </p>
      </div>
    </section>
  );
}
