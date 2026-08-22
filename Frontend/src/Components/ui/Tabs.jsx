export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1.5 p-1 rounded-2xl border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_60%,transparent)] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[var(--app-primary)] text-[var(--app-primary-ink)] shadow-sm"
                : "text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--app-surface-raised)_70%,transparent)]"
            }`}
          >
            {tab.icon && <span className="h-3.5 w-3.5 flex items-center justify-center">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive
                    ? "bg-black/20 text-current"
                    : "bg-[color-mix(in_srgb,var(--app-muted)_20%,transparent)] text-[var(--app-muted)]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
