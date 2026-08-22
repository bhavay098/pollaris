import { Clock } from "lucide-react";

export default function ExpiryPresets({ onSelectPreset }) {
  const pad = (n) => String(n).padStart(2, "0");

  const setDuration = (hours) => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + hours);

    const dateStr = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
    const timeStr = `${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`;

    onSelectPreset({ expiryDate: dateStr, expiryTime: timeStr });
  };

  const presets = [
    { label: "24 Hours", hours: 24 },
    { label: "3 Days", hours: 72 },
    { label: "1 Week", hours: 168 },
    { label: "1 Month", hours: 720 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-[11px] text-[var(--app-subtle)] flex items-center gap-1 mr-1">
        <Clock className="h-3 w-3" /> Quick set:
      </span>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => setDuration(preset.hours)}
          className="px-2.5 py-1 rounded-lg border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_80%,transparent)] text-[11px] font-medium text-[var(--app-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-raised)] transition-colors"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
