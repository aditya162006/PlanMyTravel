import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Bed, MapPin, Wallet as WalletIcon, Menu, X, ShieldAlert, LogOut, Users, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, admin, isAuthenticated, isAdmin, walletBalance, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isAnyLoggedIn = isAuthenticated || isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-charcoal-100/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-forest-800 text-ivory-100 flex items-center justify-center shadow-soft transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5 text-sage-300 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-tight font-medium text-charcoal-900 leading-none">
                PlanMyTravel
              </span>
              <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-medium mt-1">
                AI Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'bg-charcoal-900 text-ivory-50'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200/60'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/stays"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/stays')
                  ? 'bg-charcoal-900 text-ivory-50'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200/60'
              }`}
            >
              Stays
            </Link>
            <Link
              to="/concierge"
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/concierge')
                  ? 'bg-forest-800 text-ivory-50 shadow-soft'
                  : 'text-forest-800 bg-sage-50/80 hover:bg-sage-100/80 border border-sage-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sage-500 fill-sage-400" />
              <span>AI Concierge</span>
            </Link>
            <Link
              to="/trips"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/trips')
                  ? 'bg-charcoal-900 text-ivory-50'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200/60'
              }`}
            >
              My Trips
            </Link>
            <Link
              to="/expenses"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/expenses')
                  ? 'bg-charcoal-900 text-ivory-50'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200/60'
              }`}
            >
              Expenses
            </Link>
          </nav>

          {/* Right Controls: Admin Pill, Wallet & Account */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct Admin Console Pill if Staff is logged in */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold shadow-soft hover:bg-forest-900 transition-all"
                title="Open Administrative Console"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-sage-300" />
                <span>Admin Console</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-charcoal-100 shadow-soft-sm hover:border-sage-300 transition-all group"
                title="Trip Wallet Balance"
              >
                <div className="w-6 h-6 rounded-full bg-sage-50 flex items-center justify-center text-forest-800">
                  <WalletIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-charcoal-400 uppercase tracking-wider font-medium leading-none">Wallet</span>
                  <span className="text-xs font-semibold text-charcoal-800">₹{walletBalance.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            )}

            {/* User or Admin Dropdown */}
            {isAnyLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-charcoal-200 hover:border-charcoal-300 hover:shadow-soft-sm transition-all"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isAdmin && !user ? 'bg-forest-800 text-ivory-100' : 'bg-charcoal-800 text-ivory-100'
                  }`}>
                    {isAdmin && !user ? 'A' : (user?.name?.[0]?.toUpperCase() || 'T')}
                  </div>
                  <span className="text-sm font-medium text-charcoal-800 max-w-[120px] truncate">
                    {user?.name || (isAdmin ? 'Staff Admin' : 'Traveler')}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-float border border-charcoal-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-charcoal-100">
                      <p className="text-xs text-charcoal-400 font-medium">
                        {isAdmin && !user ? 'Staff Account' : 'Signed in as'}
                      </p>
                      <p className="text-sm font-semibold text-charcoal-900 truncate">
                        {user?.email || admin?.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-forest-800 bg-sage-50/50 hover:bg-sage-100 transition-colors font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-forest-800" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    {isAuthenticated && (
                      <>
                        <Link
                          to="/trips"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-charcoal-400" />
                          <span>My Saved Trips</span>
                        </Link>
                        <Link
                          to="/expenses"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
                        >
                          <PieChart className="w-4 h-4 text-charcoal-400" />
                          <span>Journey Expenses</span>
                        </Link>
                        <Link
                          to="/wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
                        >
                          <WalletIcon className="w-4 h-4 text-charcoal-400" />
                          <span>Trip Wallet</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
                        >
                          <Bed className="w-4 h-4 text-charcoal-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/become-a-guide"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
                        >
                          <Users className="w-4 h-4 text-charcoal-400" />
                          <span>Become a Local Guide</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-charcoal-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-terracotta-600 hover:bg-terracotta-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-full text-sm font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-forest-800 text-ivory-50 hover:bg-forest-900 shadow-soft-sm transition-all"
                >
                  Get started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-2.5 py-1 rounded-full bg-forest-800 text-white text-[11px] font-semibold"
              >
                Admin
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-charcoal-100 text-xs font-semibold text-charcoal-800"
              >
                <WalletIcon className="w-3.5 h-3.5 text-sage-600" />
                <span>₹{walletBalance.toLocaleString('en-IN')}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-charcoal-700 hover:bg-ivory-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6] border-b border-charcoal-100 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-semibold bg-forest-800 text-white flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-sage-300" />
                <span>Admin Console</span>
              </Link>
            )}
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/explore') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              Explore Destinations
            </Link>
            <Link
              to="/stays"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/stays') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              Boutique Stays
            </Link>
            <Link
              to="/concierge"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium flex items-center gap-2 ${
                isActive('/concierge') ? 'bg-forest-800 text-white' : 'text-forest-800 bg-sage-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sage-500 fill-sage-400" />
              <span>AI Trip Concierge</span>
            </Link>
            <Link
              to="/trips"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/trips') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              My Saved Trips
            </Link>
            <Link
              to="/expenses"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/expenses') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              Journey Expenses
            </Link>
            <Link
              to="/wallet"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/wallet') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              Trip Wallet
            </Link>
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                isActive('/bookings') ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              My Bookings
            </Link>
          </nav>

          <div className="pt-4 border-t border-charcoal-100">
            {isAnyLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-3 rounded-xl text-center text-sm font-medium text-terracotta-600 bg-terracotta-50"
              >
                Sign Out ({user?.email || admin?.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-3 rounded-xl text-center text-sm font-medium bg-white border border-charcoal-200 text-charcoal-900"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="py-3 rounded-xl text-center text-sm font-medium bg-forest-800 text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
