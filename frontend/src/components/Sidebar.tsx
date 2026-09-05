import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Scan,
  FileCheck2,
  AlertCircle,
  BarChart3,
  Scale,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAdmin, isInspector } = useAuth();

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInspector) return '/inspector/dashboard';
    return '/consumer/dashboard';
  };

  const navItems = [
    { label: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
    { label: 'Label Scanner', path: '/scanner', icon: Scan },
    { label: 'Inspections', path: '/inspections', icon: FileCheck2 },
    { label: 'Analytics & Maps', path: '/analytics', icon: BarChart3 },
    { label: 'Consumer Complaints', path: '/complaints', icon: AlertCircle },
  ];

  if (isAdmin) {
    navItems.push(
      { label: 'Compliance Rules', path: '/admin/rules', icon: Scale },
      { label: 'User Directory', path: '/admin/users', icon: Users }
    );
  }

  return (
    <aside className="w-64 shrink-0 hidden md:block glass-panel border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4">
      {/* Role Banner */}
      <div className="p-3 mb-6 rounded-xl bg-gradient-to-r from-slate-900 to-brand-900 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {user?.role || 'INSPECTOR'} PORTAL
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          Legal Metrology Packaged Commodities (LMPC) System
        </p>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
