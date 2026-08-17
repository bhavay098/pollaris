// Summary stats row shown at the top of the dashboard. Displays the counts for
// total polls, live polls, total responses, and drafts.
export default function DashboardStats({ stats }) {
  return (
    <div className="stat-grid" aria-label="Poll overview">
      <div className="stat-card">
        <span className="stat-label">Polls in space</span>
        <strong className="stat-value">{stats.total}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Live now</span>
        <strong className="stat-value success">{stats.active}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Responses</span>
        <strong className="stat-value">{stats.totalResponses}</strong>
      </div>
      <div className="stat-card">
        <span className="stat-label">Drafts</span>
        <strong className="stat-value accent">{stats.draft}</strong>
      </div>
    </div>
  );
}
