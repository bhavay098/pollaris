// Settings page (route "/dashboard/settings"): lets the logged-in user update
// their display name, change their password, or permanently delete the account.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppShell from "../Components/AppShell.jsx";
import { useAuthStore } from "../store/auth-store";
import { authClient } from "../lib/auth-client";

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Profile Form State: the editable name field plus a busy flag.
  const [name, setName] = useState(user?.name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State: both inputs plus a busy flag.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete Account State: busy flag so the button can't be double-clicked.
  const [isDeleting, setIsDeleting] = useState(false);

  // Call better-auth to rename the user, then confirm with a toast.
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { error } = await authClient.updateUser({ name });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Ask better-auth to change the password and revoke all other sessions so a
  // leaked/stolen session dies with the old password. Clear fields on success.
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw error;
      
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Permanently delete the account after a confirm dialog, then go home.
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const { error } = await authClient.deleteUser();
      if (error) throw error;
      
      toast.success("Account deleted.");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Account management</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your profile details and security preferences.</p>
        </div>
        <Link to="/dashboard" className="btn btn-quiet">Back to dashboard</Link>
      </div>

      <div className="builder-grid">
        <section className="panel builder-details" aria-labelledby="profile-heading">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Personal Info</span>
              <h2 id="profile-heading" className="panel-title">Profile</h2>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="field">
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={user?.email || ""}
                disabled
                className="opacity-60 cursor-not-allowed"
                title="Email cannot be changed"
              />
            </div>
            <div className="button-row" style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={isUpdatingProfile || name === user?.name}>
                {isUpdatingProfile ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel builder-details" aria-labelledby="security-heading">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Security</span>
              <h2 id="security-heading" className="panel-title">Password</h2>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="field">
              <label htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="field">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                minLength={8}
              />
            </div>
            <div className="button-row" style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={isUpdatingPassword || !currentPassword || !newPassword}>
                {isUpdatingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel builder-details border-red-500/20" aria-labelledby="danger-heading">
          <div className="panel-heading">
            <div>
              <span className="eyebrow text-red-500">Danger Zone</span>
              <h2 id="danger-heading" className="panel-title">Delete Account</h2>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Once you delete your account, there is no going back. All of your polls and responses will be permanently deleted. Please be certain.
          </p>
          <div className="button-row">
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
