import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Inspection, DashboardAnalytics } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';

export const InspectorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, iData] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getInspections(),
        ]);
        setAnalytics(aData);
        setInspections(iData);
      } catch (err) {
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInspections = inspections.filter((i) => {
    if (riskFilter === 'ALL') return true;
    return i.risk_level === riskFilter;
  });

  const highRiskPriority = inspections.filter((i) => i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 text-white shadow-lg">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
            Legal Inspector Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-2">
            Packaged Commodity Compliance Oversight
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time preliminary assessment monitoring & statutory Legal Metrology inspection support.
          </p>
        </div>
        <Link
          to="/scanner"
          className="shrink-0 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Start New Inspection
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Inspections</span>
            <FileCheck2 className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.total_inspections || inspections.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Compliant Products</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {analytics?.compliant_products || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Score &gt;= 90/100</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Needing Review</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {analytics?.needs_review_count || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Human-in-loop verify</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">High / Critical Risk</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {analytics?.high_risk_count || highRiskPriority.length}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1">Requires Action</span>
        </div>
      </div>

      {/* Priority High Risk Alerts Banner */}
      {highRiskPriority.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Priority Legal Inspections Flagged by AI ({highRiskPriority.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              High Severity
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highRiskPriority.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white border border-rose-200 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {item.product?.product_name || 'Packaged Commodity'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Score: <strong className="text-rose-600">{item.compliance_score}/100</strong> • Category: {item.product?.category}
                  </div>
                </div>
                <Link
                  to={`/inspections/${item.id}`}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Inspections Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">Inspections Record Log</h3>
            <p className="text-xs text-slate-500">Complete audit trail of scanned commodity packages</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading inspection database...</div>
        ) : filteredInspections.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No inspections found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 rounded-l-xl">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Compliance Score</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {insp.product?.product_name || 'Packaged Commodity'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">
                        {insp.product?.category || 'Food'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={insp.compliance_score >= 90 ? 'text-emerald-600' : 'text-rose-600'}>
                        {insp.compliance_score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={insp.risk_level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {insp.inspection_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {strToDate(insp.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/inspections/${insp.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 transition"
                      >
                        View Report <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function strToDate(str?: string) {
  if (!str) return '2026-09-02';
  return str.substring(0, 10);
}
