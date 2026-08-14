// Reusable marketing section header: small "eyebrow" label, big title, and
// optional description. `align` can be "center" (default) or "left". The
// title can be a plain string or an array of strings rendered on separate
// lines.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  eyebrowClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  const widthClass = align === "left" ? "" : "mx-auto";

  return (
    <div className={`${alignClass} ${widthClass} max-w-3xl`}> 
      {eyebrow && (
        <p className={`text-xs uppercase tracking-[0.35em] font-semibold ${eyebrowClassName}`.trim()}>
          {eyebrow}
        </p>
      )}
      <h3 className={`mt-5 text-4xl md:text-5xl font-black tracking-tight leading-tight ${titleClassName}`.trim()}>
        {Array.isArray(title)
          ? title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))
          : title}
      </h3>
      {description && (
        <p className={`mt-6 text-zinc-400 text-base leading-relaxed ${descriptionClassName}`.trim()}>
          {description}
        </p>
      )}
    </div>
  );
}
