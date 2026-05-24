import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import LessonListPage from "./pages/LessonListPage";
import LessonPage from "./pages/LessonPage";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRedirect({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to={role === "admin" ? "/admin" : "/"} replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminRedirect>
              <LessonListPage />
            </AdminRedirect>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:id"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/book/:token" element={<BookingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
