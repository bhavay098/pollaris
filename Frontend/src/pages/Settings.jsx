// Settings page (route "/dashboard/settings"): lets the logged-in user update
// their display name, change their password, or permanently delete the account.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppShell from "../Components/AppShell.jsx";
import { useAuthStore } from "../store/auth-store";
import { authClient } from "../lib/auth-client";
import Button from "../Components/ui/Button.jsx";
import Input from "../Components/ui/Input.jsx";
import { Card, CardHeader, CardTitle, CardEyebrow, CardContent } from "../Components/ui/Card.jsx";

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
    } finally {
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
        <Card className="builder-details" aria-labelledby="profile-heading">
          <CardHeader>
            <CardEyebrow>Personal Info</CardEyebrow>
            <CardTitle id="profile-heading">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <Input
                id="name"
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
              />
              <Input
                id="email"
                label="Email"
                value={user?.email || ""}
                disabled
                className="opacity-60 cursor-not-allowed"
                title="Email cannot be changed"
              />
              <div className="button-row" style={{ marginTop: "1rem" }}>
                <Button 
                  type="submit" 
                  isLoading={isUpdatingProfile} 
                  loadingText="Saving…"
                  disabled={name === user?.name}
                >
                  Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="builder-details" aria-labelledby="security-heading">
          <CardHeader>
            <CardEyebrow>Security</CardEyebrow>
            <CardTitle id="security-heading">Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <Input
                id="current-password"
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
              <Input
                id="new-password"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                minLength={8}
              />
              <div className="button-row" style={{ marginTop: "1rem" }}>
                <Button 
                  type="submit" 
                  isLoading={isUpdatingPassword} 
                  loadingText="Updating…"
                  disabled={!currentPassword || !newPassword}
                >
                  Update password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="builder-details border-red-500/20" aria-labelledby="danger-heading">
          <CardHeader>
            <CardEyebrow className="text-red-500">Danger Zone</CardEyebrow>
            <CardTitle id="danger-heading">Delete Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Once you delete your account, there is no going back. All of your polls and responses will be permanently deleted. Please be certain.
            </p>
            <div className="button-row">
              <Button 
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                loadingText="Deleting…"
              >
                Delete my account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
