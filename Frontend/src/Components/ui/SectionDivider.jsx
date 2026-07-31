export default function SectionDivider({ className = "" }) {
  return <div className={`h-px bg-white/10 ${className}`.trim()} />;
}
