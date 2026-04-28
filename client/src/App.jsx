import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';

// Redirect authenticated users away from auth pages
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'PRINCIPAL' ? '/principal' : '/teacher'} replace />;
  return children;
};

// Redirect unauthenticated users to login
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/teacher" element={
        <PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>
      } />
      <Route path="/principal" element={
        <PrivateRoute role="PRINCIPAL"><PrincipalDashboard /></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

