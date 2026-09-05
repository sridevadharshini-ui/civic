import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ComplianceRule } from '../types';
import { Scale, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const RulesAdminPage: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this legal rule?')) return;
    try {
      await api.deleteRule(id);
      fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Legal Metrology Rule Engine Configuration
          </span>
          <h1 className="text-2xl font-extrabold font-display mt-2">
            Packaged Commodities (LMPC) Statutory Rules
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Configurable database rule definitions based on Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading rule registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4 rounded-l-xl">Rule Code</th>
                  <th className="py-3 px-4">Rule Title</th>
                  <th className="py-3 px-4">Required Declaration</th>
                  <th className="py-3 px-4">Category Scope</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{r.rule_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.rule_name}</td>
                    <td className="py-3 px-4">{r.required_field}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{r.product_category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.active ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
