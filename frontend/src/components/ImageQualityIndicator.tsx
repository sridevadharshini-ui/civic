import React from 'react';
import { QualityResult } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface QualityProps {
  quality: QualityResult;
  onRetake?: () => void;
}

export const ImageQualityIndicator: React.FC<QualityProps> = ({ quality, onRetake }) => {
  const { quality_score, quality_label, recommendation } = quality;
  const pct = Math.round(quality_score * 100);

  const getStyle = () => {
    if (quality_label === 'Good') {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        bar: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      };
    }
    if (quality_label === 'Moderate') {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        bar: 'bg-amber-500',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      };
    }
    return {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      bar: 'bg-rose-500',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
    };
  };

  const style = getStyle();

  return (
    <div className={`p-4 rounded-xl border ${style.bg} transition-all duration-200`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {style.icon}
          <span className="font-semibold text-sm">
            Image Quality: <strong className="uppercase">{quality_label}</strong> ({pct}%)
          </span>
        </div>
        {quality_label === 'Poor' && onRetake && (
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Image
          </button>
        )}
      </div>

      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      <p className="text-xs text-slate-600">{recommendation}</p>
    </div>
  );
};
