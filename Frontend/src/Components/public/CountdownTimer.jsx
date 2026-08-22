import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Poll Closed</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold transition-colors ${
        isUrgent
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300 animate-pulse"
          : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_70%,transparent)] text-[var(--app-muted)]"
      }`}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>
        Closes in{" "}
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
      </span>
    </div>
  );
}
