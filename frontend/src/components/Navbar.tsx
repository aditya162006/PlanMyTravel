import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, ShieldAlert, LogOut, Wallet as WalletIcon,
  Globe, Compass, Sparkles, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, admin, isAuthenticated, isAdmin, walletBalance, openAuthModal, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Search Bar State
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhen, setSearchWhen] = useState('');
  const [searchWho, setSearchWho] = useState('2 guests');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isAnyLoggedIn = isAuthenticated || isAdmin;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dest = searchWhere.trim();
    if (dest) {
      navigate(`/stays?destination=${encodeURIComponent(dest)}`);
    } else {
      navigate('/stays');
    }
  };

  const navCategories = [
    { id: 'all', label: 'All', icon: '🌐', path: '/explore' },
    { id: 'experiences', label: 'Experiences', icon: '🎈', path: '/concierge' },
    { id: 'services', label: 'Services', icon: '🛎️', path: '/become-a-guide' },
    { id: 'homes', label: 'Homes', icon: '🏡', path: '/stays' },
    { id: 'expenses', label: 'Expenses', icon: '💳', path: '/expenses' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DDDDDD] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Logo, Center Category Switcher, Right Controls */}
        <div className="flex items-center justify-between h-20">
          
          {/* 1. Left Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            {/* Airbnb-style Coral Logo */}
            <svg
              className="w-8 h-8 text-[#FF385C] flex-shrink-0"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.116 8.342 6.16 12.871 1.613 3.574 2.556 6.302 2.556 8.835 0 5.43-4.22 8-8.5 8-3.082 0-5.466-1.341-7.5-3.666-2.034 2.325-4.418 3.666-7.5 3.666-4.28 0-8.5-2.57-8.5-8 0-2.533.943-5.261 2.556-8.835 2.044-4.529 4.206-9.041 6.16-12.871l.533-1.025C9.537 1.963 10.992 1 13 1h3zm0 2c-1.352 0-2.395.666-3.414 2.502l-.527 1.014c-1.936 3.794-4.084 8.277-6.115 12.775-1.503 3.33-2.344 5.753-2.344 7.709 0 4.148 3.267 6 6.5 6 2.585 0 4.67-1.258 6.452-3.479l.948-1.182.948 1.182C20.23 29.742 22.315 31 24.9 31c3.233 0 6.5-1.852 6.5-6 0-1.956-.841-4.379-2.344-7.709-2.031-4.498-4.179-8.981-6.115-12.775l-.527-1.014C21.395 3.666 20.352 3 19 3h-3zm0 15c2.485 0 4.5 2.015 4.5 4.5 0 2.213-1.42 4.045-3.375 4.418l-.375.044c-2.485 0-4.5-2.015-4.5-4.5 0-2.213 1.42-4.045 3.375-4.418l.375-.044zm0 2c-1.381 0-2.5 1.119-2.5 2.5 0 1.256.924 2.296 2.128 2.476l.172.014c1.381 0 2.5-1.119 2.5-2.5 0-1.256-.924-2.296-2.128-2.476l-.172-.014z" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-[#FF385C] hidden sm:inline-block">
              airbnb
            </span>
          </Link>

          {/* 2. Center: Categories Switcher with underline indicator */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navCategories.map((cat) => {
              const active = isActive(cat.path);
              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all relative ${
                    active
                      ? 'text-[#222222] border-b-2 border-[#222222]'
                      : 'text-[#717171] hover:text-[#222222] border-b-2 border-transparent'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Become a host, Wallet, User Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/become-a-guide"
              className="hidden lg:inline-block text-xs font-semibold text-[#222222] hover:bg-[#F2F2F2] px-3.5 py-2 rounded-full transition-colors cursor-pointer"
            >
              Become a host
            </Link>

            {/* Wallet Balance Pill */}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F7F7] hover:bg-[#F2F2F2] border border-[#DDDDDD] text-xs font-semibold text-[#222222] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Trip Wallet"
              >
                <WalletIcon className="w-3.5 h-3.5 text-[#FF385C]" />
                <span>₹{(walletBalance || 0).toLocaleString('en-IN')}</span>
              </Link>
            )}

            {/* Admin Console shortcut if staff */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#222222] text-white text-[11px] font-semibold hover:bg-[#FF385C] transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#FF385C]" />
                <span>Admin</span>
              </Link>
            )}

            {/* Combined Hamburger + User Avatar Pill */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-3.5 pr-1.5 py-1.5 rounded-full border border-[#DDDDDD] hover:shadow-md transition-all cursor-pointer bg-white"
                title="Account menu"
              >
                <Menu className="w-4 h-4 text-[#222222]" />
                <div className="w-7 h-7 rounded-full bg-[#FF385C] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DDDDDD] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {isAnyLoggedIn ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#DDDDDD]">
                        <p className="text-xs text-[#717171]">Signed in as</p>
                        <p className="text-sm font-bold text-[#222222] truncate">{user?.name || user?.email || admin?.email}</p>
                      </div>

                      <div className="py-1 text-xs text-[#222222]">
                        <Link
                          to="/trips"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                        >
                          My Trips
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                        >
                          My Bookings
                        </Link>
                        <Link
                          to="/wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                        >
                          <span>Trip Wallet</span>
                          <span className="font-bold text-[#008A05]">₹{(walletBalance || 0).toLocaleString('en-IN')}</span>
                        </Link>
                        <Link
                          to="/expenses"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                        >
                          Journey Expense Tracker
                        </Link>
                        <Link
                          to="/become-a-guide"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                        >
                          Become a Host / Guide
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2.5 hover:bg-[#F2F2F2] text-[#FF385C] font-semibold transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#DDDDDD]">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#FF385C] hover:bg-[#FFF0F2] font-semibold transition-colors cursor-pointer"
                        >
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-1 text-xs text-[#222222]">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#F2F2F2] font-semibold transition-colors cursor-pointer"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          openAuthModal('register');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors cursor-pointer"
                      >
                        Sign up
                      </button>
                      <div className="border-t border-[#DDDDDD] my-1"></div>
                      <Link
                        to="/become-a-guide"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                      >
                        Become a host / Guide
                      </Link>
                      <Link
                        to="/concierge"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors"
                      >
                        AI Concierge
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING 3-PART SEARCH PILL: Where | When | Who [Search Button] */}
        <div className="pb-5 pt-1 flex justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl bg-white border border-[#DDDDDD] rounded-full shadow-md hover:shadow-lg transition-all flex items-center p-2 divide-x divide-[#DDDDDD]"
          >
            {/* Where */}
            <div className="flex-1 px-4 py-1 text-left min-w-0">
              <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                Where
              </label>
              <input
                type="text"
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
                placeholder="Search destinations (e.g. Noida, Kyoto)"
                className="w-full bg-transparent text-xs text-[#222222] placeholder-[#717171] outline-none font-medium truncate"
              />
            </div>

            {/* When */}
            <div className="flex-1 px-4 py-1 text-left hidden sm:block min-w-0">
              <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                When
              </label>
              <input
                type="text"
                value={searchWhen}
                onChange={(e) => setSearchWhen(e.target.value)}
                placeholder="Add dates"
                className="w-full bg-transparent text-xs text-[#222222] placeholder-[#717171] outline-none font-medium"
              />
            </div>

            {/* Who */}
            <div className="flex-1 px-4 py-1 text-left hidden sm:block min-w-0">
              <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                Who
              </label>
              <input
                type="text"
                value={searchWho}
                onChange={(e) => setSearchWho(e.target.value)}
                placeholder="Add guests"
                className="w-full bg-transparent text-xs text-[#222222] placeholder-[#717171] outline-none font-medium"
              />
            </div>

            {/* Circular Coral Search Button */}
            <div className="pl-2 pr-1">
              <button
                type="submit"
                className="w-11 h-11 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Search stays"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </header>
  );
};
