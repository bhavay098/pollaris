// Reusable button/link. Renders a <button> by default, or the component passed
// through `as` when it needs to be used as a link. The `variant` prop picks
// the color style from the map below.
const variantClasses = {
  primary: "bg-teal-500 text-white hover:bg-teal-600",
  accent: "bg-teal-300 text-black hover:bg-teal-200",
  secondary: "border border-white/10 bg-white/5 text-white hover:bg-white/9",
  subtle:
    "border border-white/8 bg-white/4 text-zinc-300 hover:bg-white/8 hover:text-white",
};

export default function ActionButton({
  as = "button",
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-semibold";
  const classes = `${base} ${variantClasses[variant]} ${className}`.trim();

  // Render as a button by default; otherwise render the requested element or
  // component (for example, React Router's Link).
  if (as !== "button") {
    const Component = as;
    return <Component className={classes} {...props}>{children}</Component>;
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
