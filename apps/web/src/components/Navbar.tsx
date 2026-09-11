import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationsBell from './NotificationsBell';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location.pathname]);

  const navLinks: Record<string, { to: string; label: string }[]> = {
    customer: [{ to: '/customer', label: 'Dashboard' }, { to: '/customer/new', label: 'New Pickup' }, { to: '/customer/history', label: 'History' }],
    driver:   [{ to: '/driver', label: 'Dashboard' }, { to: '/driver/earnings', label: 'Earnings' }],
    admin:    [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/orders', label: 'Orders' }, { to: '/admin/drivers', label: 'Drivers' }, { to: '/admin/analytics', label: 'Analytics' }],
  };
  const links = user ? (navLinks[user.role] || []) : [];
  const isActive = (to: string) => (to === `/${user?.role}` ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-ink-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center shrink-0">
              <Logo size="sm" />
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {links.map((link) => (
                  <Link key={link.to} to={link.to} className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${isActive(link.to) ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-1.5">
              <NotificationsBell />
              <div className="relative">
                <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-ink-100 transition-colors">
                  <div className="w-8 h-8 grad-avatar rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-ink-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`hidden sm:block text-ink-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-ink-100 rounded-2xl shadow-lift py-1.5 z-50 animate-slide-down">
                    <div className="px-3.5 py-2 border-b border-ink-100 mb-1">
                      <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
                      <p className="text-xs text-ink-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50 rounded-xl mx-1">
                      <UserIcon size={15} /> Profile
                    </Link>
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl mx-1">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-ink-600 hover:bg-ink-100">
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started</Link>
            </div>
          )}
        </div>

        {user && mobileOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-1 animate-slide-down">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={`px-3.5 py-2.5 rounded-full text-sm font-semibold ${isActive(link.to) ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:bg-ink-50'}`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
