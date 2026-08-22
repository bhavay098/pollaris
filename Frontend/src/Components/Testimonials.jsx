// Marketing section with customer quotes.
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Aisha Patel",
    role: "Product Lead @ Notion",
    avatar: "AP",
    avatarColor: "bg-teal-500",
    quote:
      "Pollaris transformed how we run sprint retrospectives. The live results made discussions so much more energetic and data-driven.",
    stars: 5,
  },
  {
    name: "Marcus Chen",
    role: "CTO @ LayerZero",
    avatar: "MC",
    avatarColor: "bg-sky-500",
    quote:
      "We run weekly all-hands with 400+ people. Pollaris' WebSocket sync means zero lag - everyone sees the same results at the same time.",
    stars: 5,
  },
  {
    name: "Sofia Delgado",
    role: "UX Researcher @ Figma",
    avatar: "SD",
    avatarColor: "bg-indigo-500",
    quote:
      "The audience insights feature alone is worth it. Completion rates, drop-off patterns - it's like having a research analyst built into your poll tool.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 pb-12 md:pb-28">
      <div className="h-px bg-white/10 mb-12 md:mb-24" />
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-xs uppercase tracking-[0.12em] text-sky-400 font-semibold">
          Testimonials
        </p>
        <h3 className="mt-5 text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08]">
          Loved by teams who value <br className="hidden sm:block" />
          fast, clear decisions.
        </h3>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name}>
            <div className="h-full rounded-3xl border border-white/8 bg-zinc-800/50 p-7 transition-all duration-300 hover:border-white/20">
              <div className="flex gap-1 mb-5">
                {[...Array(t.stars)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-teal-400 text-teal-400"
                  />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-7">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className={`w-10 h-10 rounded-2xl ${t.avatarColor} flex items-center justify-center text-xs font-semibold text-white shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
