import { Radio, CheckCircle2, BarChart3, FileEdit } from "lucide-react";

export default function DashboardStats({ stats, activeStatus, onStatusChange }) {
  const cards = [
    {
      id: "all",
      label: "Total Polls",
      value: stats?.total ?? 0,
      icon: Radio,
      color: "text-[var(--app-text)]",
    },
    {
      id: "active",
      label: "Live Now",
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      id: "all",
      label: "Total Responses",
      value: stats?.totalResponses ?? 0,
      icon: BarChart3,
      color: "text-[var(--app-primary)]",
      nonFilterable: true,
    },
    {
      id: "draft",
      label: "Drafts",
      value: stats?.draft ?? 0,
      icon: FileEdit,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="stat-grid" aria-label="Poll overview">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isClickable = !card.nonFilterable && onStatusChange;
        const isActive = isClickable && activeStatus === card.id;

        return (
          <div
            key={card.label}
            onClick={() => {
              if (isClickable) {
                onStatusChange(card.id);
              }
            }}
            className={`stat-card relative overflow-hidden group ${
              isClickable ? "clickable" : ""
            } ${isActive ? "active-filter" : ""}`}
            title={isClickable ? `Click to filter by ${card.label}` : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">{card.label}</span>
              <IconComponent className={`h-4 w-4 ${card.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
            <strong className={`stat-value ${card.color}`}>{card.value}</strong>
          </div>
        );
      })}
    </div>
  );
}
