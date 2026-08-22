import { FileSpreadsheet, FileJson, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AnalyticsExport({ summary, questions, participation }) {
  const [copied, setCopied] = useState(false);

  const exportCSV = () => {
    if (!questions || questions.length === 0) {
      toast.error("No question data to export");
      return;
    }

    const rows = [
      ["Question ID", "Question Text", "Option ID", "Option Text", "Vote Count", "Percentage"],
    ];

    questions.forEach((q) => {
      const totalVotes = q.options.reduce((sum, o) => sum + o.count, 0);
      q.options.forEach((opt) => {
        const percentage = totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0;
        rows.push([
          `"${q.questionId}"`,
          `"${(q.text || "").replace(/"/g, '""')}"`,
          `"${opt.optionId}"`,
          `"${(opt.text || "").replace(/"/g, '""')}"`,
          opt.count,
          `${percentage}%`,
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `poll_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded!");
  };

  const exportJSON = () => {
    const data = {
      summary,
      questions,
      participation,
      exportedAt: new Date().toISOString(),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `poll_analytics_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("JSON export downloaded!");
  };

  const copySummaryText = async () => {
    if (!summary || !questions) return;

    let text = `📊 Pollaris Analytics Summary\n`;
    text += `Total Responses: ${summary.totalResponses}\n`;
    text += `Anonymous: ${summary.participantBreakdown.anonymous} | Authenticated: ${summary.participantBreakdown.authenticated}\n\n`;

    questions.forEach((q, idx) => {
      const totalVotes = q.options.reduce((sum, o) => sum + o.count, 0);
      text += `Q${idx + 1}: ${q.text}\n`;
      q.options.forEach((opt) => {
        const percentage = totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0;
        text += `  • ${opt.text}: ${opt.count} votes (${percentage}%)\n`;
      });
      text += `\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportCSV}
        className="btn btn-quiet text-xs py-1.5 px-3 min-h-[36px] gap-1.5"
        title="Download CSV"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
        <span>Export CSV</span>
      </button>

      <button
        type="button"
        onClick={exportJSON}
        className="btn btn-quiet text-xs py-1.5 px-3 min-h-[36px] gap-1.5"
        title="Download JSON"
      >
        <FileJson className="h-3.5 w-3.5 text-sky-400" />
        <span>Export JSON</span>
      </button>

      <button
        type="button"
        onClick={copySummaryText}
        className="btn btn-quiet text-xs py-1.5 px-3 min-h-[36px] gap-1.5"
        title="Copy Summary Text"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[var(--app-muted)]" />
            <span>Copy Text</span>
          </>
        )}
      </button>
    </div>
  );
}
