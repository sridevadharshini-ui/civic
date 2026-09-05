import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Complaint, Inspection } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Scan, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const ConsumerDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, iData] = await Promise.all([
          api.getComplaints(),
          api.getInspections(),
        ]);
        setComplaints(cData);
        setInspections(iData);
      } catch (err) {
        console.error('Consumer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Consumer Rights & Rights Protection
          </span>
          <h1 className="text-2xl font-extrabold font-display mt-2">
            Packaged Commodity Compliance Checker
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Check packaged product legal declarations, verify MRP transparency, and report consumer grievances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/scanner"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Scan className="w-4 h-4" /> Scan Product Package
          </Link>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">Check Product Declarations</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload any package image to check whether MRP, Net Quantity, Mfg Date, and Customer Care info conform to statutory standards.
            </p>
          </div>
          <Link
            to="/scanner"
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-center font-bold text-xs shadow-sm transition block"
          >
            Start Public Scan →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">Report Non-Compliant Product</h3>
            <p className="text-xs text-slate-500 mt-1">
              Found a product overcharging above MRP or missing mandatory customer care details? File a direct consumer complaint.
            </p>
          </div>
          <Link
            to="/complaints"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-bold text-xs shadow-sm transition block"
          >
            File Consumer Complaint →
          </Link>
        </div>
      </div>

      {/* Verified Products Showcase */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-display text-slate-900">
          Recently Checked Commodities
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading product records...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {inspections.slice(0, 6).map((insp) => (
              <div key={insp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {insp.product?.product_name || 'Product'}
                  </span>
                  <RiskBadge level={insp.risk_level} showIcon={false} />
                </div>
                <div className="text-[11px] text-slate-500">Category: {insp.product?.category}</div>
                <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-200">
                  <span>Preliminary Score:</span>
                  <strong className={insp.compliance_score >= 90 ? 'text-emerald-600' : 'text-rose-600'}>
                    {insp.compliance_score}/100
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
