import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HabitsPage from "./pages/Habits";
import JournalPage from "./pages/Journal";
import MoodPage from "./pages/Mood";
import BadgesPage from "./pages/Badges";
import LeaderboardPage from "./pages/Leaderboard";
import SettingsPage from "./pages/Settings";
import { PrivateRoute } from "./components/PrivateRoute";
import { AppLayout } from "./components/AppLayout";
import { useAuthStore } from "./store/authStore";

function RootRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return <Navigate to={accessToken ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/mood" element={<MoodPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
