import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Scan,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  MapPin,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-display text-slate-900">
                CIVICFLOW
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                SIH 2026
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              to="/scanner"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" /> Start Inspection
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-brand-200 mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span>SMART INDIA HACKATHON 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Smarter Product Compliance.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Stronger Consumer Protection.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            CivicFlow uses AI, computer vision OCR, and configurable legal rules to help inspectors and consumers assess packaged commodity declarations faster and with explainable evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
            >
              <Scan className="w-5 h-5" /> Start Inspection Now
            </Link>
            <Link
              to="/consumer/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base backdrop-blur-sm border border-white/20 transition flex items-center justify-center gap-2"
            >
              Check a Product <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10 text-left">
            <div>
              <div className="text-2xl font-extrabold text-brand-400">100%</div>
              <div className="text-xs text-slate-400">Legal Metrology Rules 2011 Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">8+</div>
              <div className="text-xs text-slate-400">Mandatory Declarations Parsed</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-400">&lt; 3s</div>
              <div className="text-xs text-slate-400">AI Extraction & Risk Scoring Time</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-indigo-400">PDF</div>
              <div className="text-xs text-slate-400">Official Preliminary Audit Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* How CivicFlow Works */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              AUTOMATED WORKFLOW
            </h2>
            <h3 className="text-3xl font-bold font-display text-slate-900">How CivicFlow Operates</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'SCAN', desc: 'Capture or upload retail package label image.', icon: Scan },
              { step: '02', title: 'EXTRACT', desc: 'OpenCV quality check & OCR parses mandatory text.', icon: Sparkles },
              { step: '03', title: 'VERIFY', desc: 'Inspector verifies or edits parsed field values.', icon: Eye },
              { step: '04', title: 'CHECK', desc: 'Rule engine evaluates Legal Metrology rules.', icon: Layers },
              { step: '05', title: 'REPORT', desc: 'Generate compliance score & downloadable PDF.', icon: FileText },
            ].map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-brand-300 transition">
                <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-4 inline-block">
                  STEP {s.step}
                </span>
                <s.icon className="w-8 h-8 text-slate-800 mb-3 group-hover:text-brand-600 transition" />
                <h4 className="font-bold text-slate-900 mb-1">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              ENTERPRISE CAPABILITIES
            </h2>
            <h3 className="text-3xl font-bold font-display text-slate-900">Key Platform Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI-Powered OCR & Field Extraction',
                desc: 'Automatically parses MRP, Net Quantity, Mfg Date, Country of Origin, and Customer Care info with fuzzy logic handling.',
                icon: Sparkles,
              },
              {
                title: 'Configurable Legal Rule Engine',
                desc: 'Database-driven legal metrology rules with category scoping, versioning, and severity penalties.',
                icon: Layers,
              },
              {
                title: 'Explainable Violations & Evidence',
                desc: 'Interactive Evidence Viewer highlighting bounding boxes on package images for full transparency.',
                icon: Eye,
              },
              {
                title: 'Dynamic Risk Scoring',
                desc: '0-100 preliminary compliance scoring with LOW, MEDIUM, HIGH, and CRITICAL risk categorization.',
                icon: AlertTriangle,
              },
              {
                title: 'Human-in-the-Loop Verification',
                desc: 'Allows legal inspectors to review, override, and verify AI extractions with complete audit logging.',
                icon: CheckCircle2,
              },
              {
                title: 'Geo-Tagged Inspection Analytics',
                desc: 'Interactive Leaflet maps tracking inspection locations, violation hotspots, and consumer grievances.',
                icon: MapPin,
              },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">{f.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statutory Disclaimer Section */}
      <section className="py-8 bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>STATUTORY DISCLAIMER:</strong> CivicFlow is an AI-assisted preliminary compliance assessment and decision support tool developed for Smart India Hackathon 2026. Automated OCR predictions and preliminary compliance scores do not constitute legally binding determinations. Final statutory legal enforcement belongs exclusively to authorized competent officers under the Legal Metrology Act, 2009.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-slate-950 text-slate-500 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-slate-300">CIVICFLOW</span>
            <span>| SMART INDIA HACKATHON 2026</span>
          </div>
          <div>© 2026 CivicFlow System. Legal Metrology Packaged Commodities Compliance.</div>
        </div>
      </footer>
    </div>
  );
};
