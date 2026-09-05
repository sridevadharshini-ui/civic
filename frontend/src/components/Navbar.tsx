import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Scan, LogOut, User as UserIcon, Award, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isInspector, isConsumer } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Hackathon Tag */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-900 bg-clip-text text-transparent">
                CIVICFLOW
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                SIH 2026
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          <Link
            to="/scanner"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm transition shadow-sm hover:shadow-md"
          >
            <Scan className="w-4 h-4" />
            <span>New Inspection</span>
          </Link>

          {/* User Profile & Role Info */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
