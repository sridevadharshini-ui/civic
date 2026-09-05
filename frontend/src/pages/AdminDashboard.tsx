import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { DashboardAnalytics, ComplianceRule } from '../types';
import { Shield, Scale, Users, FileCheck2, Settings, Plus, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, rData] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getRules(),
        ]);
        setAnalytics(aData);
        setRules(rData);
      } catch (err) {
        console.error('Admin data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
            System Administrator Control Panel
          </span>
          <h1 className="text-2xl font-extrabold font-display mt-2">
            Legal Metrology System Administration
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage statutory compliance rules, versioning, category scopes, user credentials, and complaints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/rules"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Scale className="w-4 h-4" /> Manage Compliance Rules
          </Link>
        </div>
      </div>

      {/* Admin Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Active Rules</div>
          <div className="text-2xl font-extrabold text-slate-900">{rules.length || 8}</div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Rule 6 LMPC 2011</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Inspections</div>
          <div className="text-2xl font-extrabold text-slate-900">{analytics?.total_inspections || 10}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Audited Records</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Open Grievances</div>
          <div className="text-2xl font-extrabold text-amber-600">{analytics?.open_complaints || 2}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Consumer Cell</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Avg System Score</div>
          <div className="text-2xl font-extrabold text-brand-600">{analytics?.avg_compliance_score || 88.5}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">National Baseline</span>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" /> Active Statutory Rules Summary
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {rules.slice(0, 5).map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="block font-bold text-slate-900">{r.rule_code}</strong>
                  <span className="text-slate-500">{r.rule_name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {r.severity}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/admin/rules"
            className="block text-center py-2 text-xs font-bold text-brand-600 hover:underline"
          >
            View & Edit All Rules →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Platform Access & User Roles
          </h3>
          <p className="text-xs text-slate-500">
            Manage legal inspectors, system administrators, and public consumer role permissions.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Inspectors Enrolled:</span>
              <strong className="text-slate-900">4 Active Officers</strong>
            </div>
            <div className="flex justify-between">
              <span>Administrators:</span>
              <strong className="text-slate-900">2 Accounts</strong>
            </div>
            <div className="flex justify-between">
              <span>Consumer Registrations:</span>
              <strong className="text-slate-900">18 Accounts</strong>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="block text-center py-2 text-xs font-bold text-brand-600 hover:underline"
          >
            Manage User Directory →
          </Link>
        </div>
      </div>
    </div>
  );
};
