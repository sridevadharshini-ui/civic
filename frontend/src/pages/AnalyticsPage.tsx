import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DashboardAnalytics } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart3, MapPin, Shield, Layers, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading Legal Metrology Analytics...</div>;
  }

  const PIE_COLORS = ['#16a34a', '#eab308', '#f97316', '#dc2626'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
          Executive Compliance Intelligence
        </span>
        <h1 className="text-2xl font-extrabold font-display mt-2">
          Legal Metrology Inspection Analytics & Spatial Mapping
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Interactive metrics, category violation trends, and geographical geo-tagged inspection locations.
        </p>
      </div>

      {/* Recharts Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Score Monthly Trend */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" /> Compliance Rating & Inspection Trend
          </h3>
          <p className="text-xs text-slate-500 mb-4">Monthly average preliminary compliance score</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.compliance_trend || []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="avg_score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" /> Risk Level Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Proportion of scanned products by risk severity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.risk_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.risk_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations by Product Category */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> Violations Frequency by Product Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">Category-wise comparison of flagged label defects</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.violations_by_category || []}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaflet Spatial Map Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" /> Interactive Inspection Map
            </h3>
            <p className="text-xs text-slate-500">Geo-tagged commodity inspections across regional centers</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            OpenStreetMap Live Layer
          </span>
        </div>

        <div className="h-96 rounded-2xl overflow-hidden border border-slate-200 relative">
          <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(analytics?.inspection_locations || []).map((loc, i) => (
              <Marker key={i} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="text-xs font-sans space-y-1">
                    <strong className="block text-slate-900 font-bold">{loc.product_name}</strong>
                    <div>Score: <strong>{loc.score}/100</strong></div>
                    <div>Risk: <strong className="text-rose-600">{loc.risk}</strong></div>
                    <div className="text-slate-500">{loc.location_name}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
