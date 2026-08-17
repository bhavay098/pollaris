// Skeleton loading state shown while the dashboard is fetching polls.
import Skeleton from "../ui/Skeleton.jsx";

export default function DashboardSkeleton() {
  return (
    <div className="poll-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="poll-card">
          <div className="card-heading">
            <div style={{ flex: 1 }}>
              <Skeleton className="h-6 w-3/4 max-w-sm mb-3" />
              <Skeleton className="h-4 w-1/4 max-w-xs" />
            </div>
            <div className="poll-meta" style={{ flex: 1, justifyContent: "flex-end" }}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" style={{ borderRadius: "999px" }} />
            </div>
          </div>
          <div className="card-actions" style={{ marginTop: "24px" }}>
            <Skeleton className="h-11 w-24" style={{ borderRadius: "12px" }} />
            <Skeleton className="h-11 w-32" style={{ borderRadius: "12px" }} />
            <Skeleton className="h-11 w-32" style={{ borderRadius: "12px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
