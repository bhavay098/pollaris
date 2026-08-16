// App routes. Every URL the app can show is declared here, mapped to a page
// component. Routes wrapped in <ProtectedRoute> require a logged-in user.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PollBuilder from "./pages/PollBuilder";
import PollAnalytics from "./pages/PollAnalytics";
import PublicPoll from "./pages/PublicPoll";
import ProtectedRoute from "./Components/ProtectedRoute";
import GuestRoute from "./Components/GuestRoute";
import AuthTimeoutManager from "./Components/AuthTimeoutManager";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import GlobalErrorFallback from "./Components/GlobalErrorFallback";

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => {
        // Reset the state of your app here if needed
        window.location.reload();
      }}
    >
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
        <AuthTimeoutManager />
      <Routes>
        {/* Public marketing page */}
        <Route path="/" element={<Home />} />
        {/* Auth pages: signed-in users bounce straight to the dashboard */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Authenticated (login required): poll management */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Same PollBuilder page handles both creating and editing: the
            :pollId URL param (or its absence) decides which mode it's in */}
        <Route
          path="/dashboard/polls/new"
          element={
            <ProtectedRoute>
              <PollBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/polls/:pollId/edit"
          element={
            <ProtectedRoute>
              <PollBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/polls/:pollId/analytics"
          element={
            <ProtectedRoute>
              <PollAnalytics />
            </ProtectedRoute>
          }
        />
        {/* Public shareable poll: anyone can visit /p/<slug> without logging in */}
        <Route path="/p/:slug" element={<PublicPoll />} />

        {/* Any unknown URL redirects back to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
