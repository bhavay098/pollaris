import { useState, useId, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label = "Password",
  id,
  value = "",
  onChange,
  required = false,
  placeholder = "••••••••",
  autoComplete = "current-password",
  minLength = 8,
  showStrength = false,
  className = "",
  helpText,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Compute password strength if showStrength is enabled
  const strength = useMemo(() => {
    if (!showStrength || !value) return null;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-teal-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  }, [value, showStrength]);

  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          className={`pr-11 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--app-subtle)] hover:text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--app-muted)_15%,transparent)] transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value && strength && (
        <div className="mt-1 space-y-1.5">
          <div className="flex gap-1.5 h-1 w-full bg-[color-mix(in_srgb,var(--app-muted)_20%,transparent)] rounded-full overflow-hidden">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  step <= strength.score ? strength.color : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--app-subtle)]">
            <span>Minimum 8 characters</span>
            <span className="font-semibold text-[var(--app-muted)]">{strength.label}</span>
          </div>
        </div>
      )}

      {helpText && (
        <span className="muted" style={{ fontSize: "11px", marginTop: "-4px" }}>
          {helpText}
        </span>
      )}
    </div>
  );
}
