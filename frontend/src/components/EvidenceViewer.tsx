import React from 'react';
import { X, Eye, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { Violation, ExtractedField } from '../types';

interface EvidenceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  violation?: Violation | null;
  field?: ExtractedField | null;
  imageUrl?: string;
  productName?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  isOpen,
  onClose,
  violation,
  field,
  imageUrl,
  productName,
}) => {
  if (!isOpen) return null;

  const defaultImg =
    imageUrl ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

  const bbox = field?.bounding_box || { x: 45, y: 120, width: 180, height: 40 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold font-display">CivicFlow Evidence Inspection Viewer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image with Bounding Box Overlay */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scanned Retail Label & Bounding Box
            </span>
            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center min-h-[260px]">
              <img
                src={defaultImg}
                alt="Product Label Evidence"
                className="w-full h-auto object-cover max-h-[300px]"
              />
              {/* Highlight Bounding Box Overlay */}
              <div
                className="absolute border-2 border-rose-500 bg-rose-500/20 rounded shadow-lg flex items-center justify-center"
                style={{
                  top: `${bbox.y / 2}%`,
                  left: `${bbox.x / 4}%`,
                  width: `${Math.min(90, bbox.width / 2)}%`,
                  height: '35%',
                }}
              >
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow absolute -top-5 left-0">
                  {violation ? violation.violation_type : field?.field_name || 'EVIDENCE'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic text-center">
              Target region flagged by computer vision inspection engine.
            </p>
          </div>

          {/* Right: Technical Evidence Details */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Product Reference
              </span>
              <h4 className="text-base font-bold text-slate-900">{productName || 'Packaged Commodity'}</h4>
            </div>

            {violation && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Violation Type: {violation.violation_type}
                </div>
                <p className="text-xs text-rose-700 mb-2">{violation.description}</p>
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-rose-200 font-mono">
                  <strong>Recommended Action:</strong> {violation.corrective_action}
                </div>
              </div>
            )}

            {field && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Field Name:</span>
                  <strong className="text-slate-900">{field.field_name}</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Extracted Value:</span>
                  <strong className="text-slate-900 font-mono">{field.field_value || 'NOT_FOUND'}</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>AI Confidence:</span>
                  <strong className="text-emerald-600">{Math.round(field.confidence_score * 100)}%</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Verification Status:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    {field.verification_status}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Legal Metrology Rule 6(1) audit trail record logged in CivicFlow preliminary inspection database.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition shadow"
          >
            Close Evidence Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
