// Reusable brand logo block: colored square mark + product name (+ optional
// tagline). `heading` renders the name as an <h1> instead of a <span>;
// `compact` hides the tagline.
export default function BrandMark({
  name,
  tagline,
  mark,
  compact = false,
  heading = false,
  className = "",
}) {
  const NameTag = heading ? "h1" : "span";

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
        <span className="text-sm font-black text-white">{mark}</span>
      </div>
      <div>
        <NameTag className="text-base font-black tracking-[-0.03em]">
          {name}
        </NameTag>
        {!compact && (
          <p className="text-[9px] text-zinc-500 tracking-[0.22em] uppercase leading-none mt-0.5">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
