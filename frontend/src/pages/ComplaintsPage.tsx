import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Complaint } from '../types';
import { AlertCircle, Plus, CheckCircle2, Clock, Send, ShieldAlert } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [complaintType, setComplaintType] = useState('MISSING_DECLARATION');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('New Delhi');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        product_name: productName,
        brand_name: brandName,
        complaint_type: complaintType,
        description,
        location,
      });
      setShowModal(false);
      setProductName('');
      setDescription('');
      fetchComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
            Consumer Protection Cell
          </span>
          <h1 className="text-2xl font-extrabold font-display mt-1">
            Packaged Commodity Grievances & Complaints
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Submit grievances regarding overcharging MRP, missing declarations, or illegal pre-packed commodities.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> File New Consumer Complaint
        </button>
      </div>

      {/* Complaints List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold font-display text-slate-900 mb-4">
          Active Consumer Grievance Log
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading complaint records...</div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No consumer complaints recorded.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                      {c.complaint_type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{c.product_name || 'Packaged Commodity'}</h4>
                    <p className="text-xs text-slate-500">Brand: {c.brand_name || 'N/A'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  {c.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Location: {c.location || 'New Delhi'}</span>
                  <span>Date: {c.created_at?.substring(0, 10) || '2026-09-02'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
              File Legal Metrology Complaint
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Report non-compliant packaged commodities directly to Legal Metrology inspectors.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Local Brand Packaged Sugar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Choice Mart"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Type</label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="MISSING_DECLARATION">Missing Mandatory Declaration</option>
                    <option value="OVERCHARGING_MRP">Overcharging Above MRP</option>
                    <option value="EXPIRED_PRODUCT">Expired / Best Before Date Passed</option>
                    <option value="FAKE_QUANTITY">Shortage in Net Quantity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grievance Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the label issue or overcharging details..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Karol Bagh, New Delhi"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
