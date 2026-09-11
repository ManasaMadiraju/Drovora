import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { DriverLocationProvider } from './contexts/DriverLocationContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewPickup from './pages/customer/NewPickup';
import TrackPickup from './pages/customer/TrackPickup';
import History from './pages/customer/History';
import DriverDashboard from './pages/driver/DriverDashboard';
import JobDetails from './pages/driver/JobDetails';
import Earnings from './pages/driver/Earnings';
import AdminDashboard from './pages/admin/AdminDashboard';
import Orders from './pages/admin/Orders';
import Drivers from './pages/admin/Drivers';
import Analytics from './pages/admin/Analytics';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'driver') return <Navigate to="/driver" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/customer" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/new" element={<ProtectedRoute roles={['customer']}><NewPickup /></ProtectedRoute>} />
        <Route path="/customer/track/:id" element={<ProtectedRoute roles={['customer']}><TrackPickup /></ProtectedRoute>} />
        <Route path="/customer/history" element={<ProtectedRoute roles={['customer']}><History /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/job/:id" element={<ProtectedRoute roles={['driver']}><JobDetails /></ProtectedRoute>} />
        <Route path="/driver/earnings" element={<ProtectedRoute roles={['driver']}><Earnings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><Orders /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute roles={['admin']}><Drivers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationsProvider>
          <DriverLocationProvider>
            <ConfirmProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3500,
                  style: { background: '#171a26', color: '#fff', fontSize: '13.5px', fontWeight: 500, borderRadius: '12px', padding: '10px 14px' },
                  success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
              <AppRoutes />
            </ConfirmProvider>
          </DriverLocationProvider>
        </NotificationsProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
