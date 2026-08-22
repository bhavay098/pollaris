import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import DropdownMenu, { DropdownItem, DropdownDivider } from "../ui/DropdownMenu.jsx";
import { Settings, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function UserDropdown() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out right now.");
    }
  };

  // User initials (e.g. "Bhavay Nagpal" -> "BN")
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const trigger = (
    <button
      type="button"
      className="inline-flex items-center gap-2.5 rounded-2xl border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_80%,transparent)] p-1.5 pr-3.5 hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-raised)] transition-all duration-200"
      aria-label="User profile menu"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-surface-solid))] text-[var(--app-primary)] text-xs font-bold shadow-inner">
        {initials}
      </div>
      <span className="text-xs font-semibold text-[var(--app-text)] max-w-[120px] truncate">
        {user.name || "User"}
      </span>
    </button>
  );

  return (
    <DropdownMenu trigger={trigger} align="right">
      <div className="px-3 py-2.5">
        <p className="text-xs font-bold text-[var(--app-text)] truncate">{user.name}</p>
        <p className="text-[11px] text-[var(--app-subtle)] truncate mt-0.5">{user.email}</p>
      </div>
      <DropdownDivider />
      <DropdownItem as={Link} to="/dashboard">
        <LayoutDashboard className="h-4 w-4 text-[var(--app-primary)]" />
        <span>My Dashboard</span>
      </DropdownItem>
      <DropdownItem as={Link} to="/dashboard/settings">
        <Settings className="h-4 w-4 text-[var(--app-muted)]" />
        <span>Account Settings</span>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem variant="danger" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </DropdownItem>
    </DropdownMenu>
  );
}
