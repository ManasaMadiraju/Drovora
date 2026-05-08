import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(({ data }) => setUnread(data.unreadCount)).catch(() => {});
  }, [user]);

  const navLinks: Record<string, { to: string; label: string }[]> = {
    customer: [{ to: '/customer', label: 'Dashboard' }, { to: '/customer/new', label: 'New Pickup' }, { to: '/customer/history', label: 'History' }],
    driver:   [{ to: '/driver', label: 'Dashboard' }, { to: '/driver/earnings', label: 'Earnings' }],
    admin:    [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/orders', label: 'Orders' }, { to: '/admin/drivers', label: 'Drivers' }, { to: '/admin/analytics', label: 'Analytics' }],
  };
  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">D</span></div>
            <span className="font-bold text-xl text-brand-700">Drovora</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">{link.label}</Link>
              ))}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-medium capitalize">{user.role}</span>
              {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unread}</span>}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-600">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-semibold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
