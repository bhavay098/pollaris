// Marketing section showing tool integrations.
import { MessageSquare, FileText, Palette, CheckSquare, Layers, Video } from "lucide-react";

const integrations = [
  { name: "Slack", icon: MessageSquare, color: "bg-emerald-500" },
  { name: "Notion", icon: FileText, color: "bg-zinc-600" },
  { name: "Figma", icon: Palette, color: "bg-pink-500" },
  { name: "Linear", icon: Layers, color: "bg-violet-500" },
  { name: "Jira", icon: CheckSquare, color: "bg-blue-500" },
  { name: "Zoom", icon: Video, color: "bg-sky-500" },
];

export default function Integrations() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-12 md:pb-28">
      <div className="h-px bg-white/10 mb-12 md:mb-24" />
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-zinc-800/50 p-8 md:p-12">
        <div className="relative text-center mb-12">
          <p className="text-xs uppercase tracking-[0.12em] text-teal-400 font-semibold">
            Share Anywhere
          </p>
          <h3 className="mt-5 text-3xl md:text-4xl font-bold tracking-[-0.025em] leading-[1.08]">
            Works where your audience is.
          </h3>
          <p className="mt-4 text-zinc-400 text-sm">
            Drop your poll link in the tools your team already uses.
          </p>
        </div>
        <div className="relative grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4">
          {integrations.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.name}>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl cursor-pointer hover:border-white/20 hover:bg-white/8 transition-all">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${item.color} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="relative text-center mt-8 text-zinc-500 text-xs">
          Easily accessible from mobile, desktop, or tablet.
        </p>
      </div>
    </section>
  );
}
