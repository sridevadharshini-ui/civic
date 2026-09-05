import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Inspection, ExtractedField, Violation } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { EvidenceViewer } from '../components/EvidenceViewer';
import {
  FileText,
  Download,
  CheckCircle2,
  Edit3,
  Eye,
  ShieldAlert,
  MapPin,
  Clock,
  ArrowLeft,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  // Human-in-the-loop state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [inspectorNotes, setInspectorNotes] = useState<string>('');

  // Evidence Viewer modal state
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchInspection = async () => {
      try {
        const data = await api.getInspection(id);
        setInspection(data);
        setInspectorNotes(data.inspector_notes || '');
      } catch (err) {
        console.error('Error fetching inspection:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspection();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading inspection report details...</div>;
  }

  if (!inspection) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Inspection Record Not Found</h3>
        <button onClick={() => navigate('/inspections')} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Inspections List
        </button>
      </div>
    );
  }

  const prod = inspection.product;
  const mainImage =
    prod?.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const handleFieldSave = async (fieldId: string) => {
    try {
      const updated = await api.updateInspection(inspection.id, {
        field_updates: [
          {
            field_id: fieldId,
            field_value: editValue,
            verification_status: 'HUMAN_VERIFIED',
          },
        ],
      });
      setInspection(updated);
      setEditingFieldId(null);
    } catch (err) {
      console.error('Failed to save field override:', err);
    }
  };

  const handleNotesSave = async () => {
    try {
      const updated = await api.updateInspection(inspection.id, {
        inspector_notes: inspectorNotes,
      });
      setInspection(updated);
    } catch (err) {
      console.error('Failed to save inspector notes:', err);
    }
  };

  const openEvidenceForViolation = (v: Violation) => {
    setSelectedViolation(v);
    setSelectedField(null);
    setIsEvidenceOpen(true);
  };

  const openEvidenceForField = (f: ExtractedField) => {
    setSelectedField(f);
    setSelectedViolation(null);
    setIsEvidenceOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/inspections')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inspections
        </button>

        <div className="flex items-center gap-3">
          <a
            href={api.downloadPdfReport(inspection.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Download Official PDF Report
          </a>
        </div>
      </div>

      {/* Main Product Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <img
            src={mainImage}
            alt={prod?.product_name || 'Product'}
            className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-xs"
          />
        </div>

        <div className="md:col-span-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
              {prod?.category || 'Food'}
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {inspection.id.substring(0, 8)}</span>
          </div>

          <h1 className="text-2xl font-extrabold font-display text-slate-900">
            {prod?.product_name || 'Packaged Commodity'}
          </h1>
          <p className="text-xs text-slate-600">
            Brand: <strong>{prod?.brand || 'N/A'}</strong> • Country of Origin: <strong>{prod?.country_of_origin || 'India'}</strong>
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> {inspection.location_name || 'New Delhi'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {inspection.created_at?.substring(0, 10)}
            </span>
          </div>
        </div>

        <div className="md:col-span-3 p-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center text-center justify-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">CivicFlow Preliminary Score</span>
          <div className="text-3xl font-extrabold font-display text-emerald-400">
            {inspection.compliance_score} / 100
          </div>
          <RiskBadge level={inspection.risk_level} />
        </div>
      </div>

      {/* Human-in-the-Loop Extracted Fields Verification */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">
              Human-in-the-Loop Field Verification
            </h3>
            <p className="text-xs text-slate-500">
              Review AI OCR extractions. Click "Edit Value" to override fields and update compliance score in real time.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Human Overrides Supported
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 rounded-l-xl">Mandatory Field</th>
                <th className="py-3 px-4">Extracted Value</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {inspection.extracted_fields.map((f) => {
                const isEditing = editingFieldId === f.id;
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.field_name}</td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-1 rounded border border-brand-500 text-xs outline-none bg-white font-mono"
                          />
                          <button
                            onClick={() => handleFieldSave(f.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save Override"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono font-medium text-slate-800">
                          {f.field_value !== 'NOT_FOUND' ? f.field_value : (
                            <span className="text-rose-600 italic">NOT DETECTED</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                      {Math.round(f.confidence_score * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.verification_status === 'HUMAN_VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {f.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEvidenceForField(f)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Evidence
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingFieldId(f.id);
                            setEditValue(f.field_value || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violations & Explainable Evidence Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-display text-slate-900">
          Detected Legal Metrology Violations & Statutory Evidence
        </h3>

        {inspection.violations.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>No statutory violations detected. All required packaged commodity declarations are present as per Legal Metrology (Packaged Commodities) Rules, 2011.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {inspection.violations.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                      {v.severity}
                    </span>
                    <strong className="text-xs font-bold text-slate-900">{v.violation_type}</strong>
                  </div>
                  <p className="text-xs text-slate-700">{v.description}</p>
                  <p className="text-[11px] text-slate-500 italic">
                    <strong>Recommended Action:</strong> {v.corrective_action}
                  </p>
                </div>

                <button
                  onClick={() => openEvidenceForViolation(v)}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> View Bounding Evidence
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspector Notes Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold font-display text-slate-900">Inspector Audit Remarks</h3>
        <textarea
          rows={3}
          value={inspectorNotes}
          onChange={(e) => setInspectorNotes(e.target.value)}
          placeholder="Add official notes regarding physical inspection, retailer comments, or follow-up notice details..."
          className="w-full p-3 rounded-2xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
        />
        <div className="flex justify-end">
          <button
            onClick={handleNotesSave}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Audit Notes
          </button>
        </div>
      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceViewer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        violation={selectedViolation}
        field={selectedField}
        imageUrl={mainImage}
        productName={prod?.product_name}
      />
    </div>
  );
};
