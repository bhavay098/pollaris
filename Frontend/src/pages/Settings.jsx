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
import PasswordInput from "../Components/ui/PasswordInput.jsx";
import Tabs from "../Components/ui/Tabs.jsx";
import ConfirmModal from "../Components/common/ConfirmModal.jsx";
import { Card, CardHeader, CardTitle, CardEyebrow, CardContent } from "../Components/ui/Card.jsx";
import { User, Lock, AlertTriangle, ArrowLeft, Save, KeyRound, Trash2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
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
      setShowDeleteModal(false);
    }
  };

  return (
    <AppShell>
      <div className="page-heading flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Account management</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">
            Manage your profile details and security preferences.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-quiet text-xs gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="mb-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" /> },
            { id: "security", label: "Security & Password", icon: <Lock className="h-3.5 w-3.5" /> },
            { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
          ]}
        />
      </div>

      {/* Profile Section */}
      {activeTab === "profile" && (
        <Card className="builder-details max-w-2xl animate-in fade-in duration-200" aria-labelledby="profile-heading">
          <CardHeader>
            <CardEyebrow>Personal Info</CardEyebrow>
            <CardTitle id="profile-heading">Profile Details</CardTitle>
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
                helpText="Email address is tied to your account and cannot be changed."
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  loadingText="Saving…"
                  disabled={name === user?.name || !name.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Section */}
      {activeTab === "security" && (
        <Card className="builder-details max-w-2xl animate-in fade-in duration-200" aria-labelledby="security-heading">
          <CardHeader>
            <CardEyebrow>Security</CardEyebrow>
            <CardTitle id="security-heading">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <PasswordInput
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <PasswordInput
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 8 chars)"
                autoComplete="new-password"
                showStrength
                minLength={8}
                helpText="Changing your password will automatically revoke other active sessions for security."
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isUpdatingPassword}
                  loadingText="Updating…"
                  disabled={!currentPassword || !newPassword || newPassword.length < 8}
                  className="gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone Section */}
      {activeTab === "danger" && (
        <Card className="builder-details border-red-500/20 max-w-2xl animate-in fade-in duration-200" aria-labelledby="danger-heading">
          <CardHeader>
            <CardEyebrow className="text-red-400">Danger Zone</CardEyebrow>
            <CardTitle id="danger-heading">Delete Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-[var(--app-muted)] mb-5 leading-relaxed">
              Once you delete your account, there is no going back. All of your created polls, historical responses, and live analytics will be permanently erased.
            </p>
            <div>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleteConfirmText("");
                  setShowDeleteModal(true);
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete My Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently delete your account?"
        description="This action is irreversible. All of your polls and data will be erased forever."
        confirmText="Delete Account"
        isLoading={isDeleting}
        verificationString="DELETE"
        verificationInput={deleteConfirmText}
        onVerificationChange={setDeleteConfirmText}
      />
    </AppShell>
  );
}
