import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import PublicLayout from './components/PublicLayout';
import { Spinner } from './components/ui';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Jobs from './pages/Jobs';
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Companies from './pages/admin/Companies';
import Drives from './pages/admin/Drives';
import Applications from './pages/admin/Applications';
import StudentOverview from './pages/student/Overview';
import StudentDrives from './pages/student/Drives';
import StudentProfile from './pages/student/Profile';

// Only lets in logged-in users with the right role, inside the sidebar layout
function RequireRole({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="fullpage"><Spinner label="Loading…" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <AppLayout />;
}

// Login/register pages send already-logged-in users to their dashboard
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="fullpage"><Spinner /></div>;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route path="/admin" element={<RequireRole role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="companies" element={<Companies />} />
        <Route path="drives" element={<Drives />} />
        <Route path="applications" element={<Applications />} />
        <Route path="jobs" element={<Jobs />} />
      </Route>

      <Route path="/student" element={<RequireRole role="student" />}>
        <Route index element={<StudentOverview />} />
        <Route path="drives" element={<StudentDrives />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="jobs" element={<Jobs />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
