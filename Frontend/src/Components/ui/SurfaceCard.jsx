// Reusable rounded "card" container. The `variant` prop picks border/background
// styling from the map below.
const variants = {
  default: "border-white/8 bg-zinc-800/50",
  soft: "border-white/8 bg-white/4 backdrop-blur-xl",
  highlighted: "border-teal-500/40 bg-zinc-800",
};

export default function SurfaceCard({
  variant = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={`rounded-3xl border ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
