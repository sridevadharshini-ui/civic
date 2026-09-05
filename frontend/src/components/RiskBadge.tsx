import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showIcon = true }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  switch (normLevel) {
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          LOW RISK
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          MEDIUM RISK
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />}
          HIGH RISK
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          CRITICAL RISK
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          UNKNOWN
        </span>
      );
  }
};
