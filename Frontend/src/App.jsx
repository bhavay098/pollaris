import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PollBuilder from "./pages/PollBuilder";
import PollAnalytics from "./pages/PollAnalytics";
import PublicPoll from "./pages/PublicPoll";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
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
        <Route path="/p/:slug" element={<PublicPoll />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
