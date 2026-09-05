import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ScanResult } from '../types';
import { ImageQualityIndicator } from '../components/ImageQualityIndicator';
import { RiskBadge } from '../components/RiskBadge';
import {
  Upload,
  Camera,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Shield,
  Layers,
  Scan,
  Play,
  Video,
  VideoOff,
  Image as ImageIcon,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

type InputTab = 'CAMERA' | 'UPLOAD' | 'BARCODE' | 'DEMO';

export const ScannerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InputTab>('UPLOAD');

  // Image & File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('FRONT');
  const [categoryHint, setCategoryHint] = useState<string>('Food');
  const [productName, setProductName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Camera State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Analysis state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Stop camera when unmounting or switching tab
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Webcam permission denied or camera unequipped:', err);
      setCameraError('Camera unavailable or permission denied. You can upload a product image instead.');
      setIsCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUrl);
      setSelectedFile(null);
      stopCamera();
    }
  };

  const handleTabChange = (tab: InputTab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setIsDemoMode(false);
      setError('');
    }
  };

  const handleDemoPreset = (type: 'food' | 'cosmetics' | 'household') => {
    setIsDemoMode(true);
    setActiveTab('DEMO');

    if (type === 'food') {
      setProductName('Organic Whole Wheat Atta 5kg');
      setBrand('NaturaFresh');
      setCategoryHint('Food');
      setPreviewUrl('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80');
    } else if (type === 'cosmetics') {
      setProductName('PureGlow Herbal Face Wash 150ml');
      setBrand('PureGlow Organic');
      setCategoryHint('Cosmetics');
      setPreviewUrl('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80');
    } else {
      setProductName('Sparkle Clean Dishwash Gel 500ml');
      setBrand('Sparkle Clean');
      setCategoryHint('Household Products');
      setPreviewUrl('https://images.unsplash.com/photo-1585830812416-a6c86bb14576?auto=format&fit=crop&w=600&q=80');
    }

    setScanResult(null);
  };

  const handleRunAnalysis = async () => {
    setScanning(true);
    setError('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (previewUrl) {
        formData.append('image_data', previewUrl);
      }
      formData.append('category_hint', categoryHint);
      formData.append('image_type', imageType);

      const res = await api.processScan(formData);
      setScanResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Scan processing failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveInspection = async () => {
    if (!scanResult) return;
    try {
      const newInsp = await api.createInspection({
        product_name: productName || 'Scanned Packaged Commodity',
        category: categoryHint || scanResult.detected_category,
        brand: brand || 'Generic Brand',
        image_url: previewUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        image_type: imageType,
        location_name: 'Connaught Place, New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        inspector_notes: isDemoMode
          ? 'Inspection record created in Hackathon Presentation Demo Mode.'
          : 'Initial laptop camera scanner analysis completed.',
      });
      navigate(`/inspections/${newInsp.id}`);
    } catch (err) {
      console.error('Error saving inspection:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
              Laptop-First Inspection Engine
            </span>
            {isDemoMode && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Demo Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold font-display">
            Packaged Commodity Compliance Scanner
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Uses laptop webcam, image uploads, or offline demo modes to assess applicable Legal Metrology declarations.
          </p>
        </div>

        {/* Demo Mode Trigger Badge */}
        <button
          onClick={() => handleDemoPreset('food')}
          className="shrink-0 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" /> 🎬 Try Demo Product (Instant Run)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 4 Mode Option Cards Bar (Section 6 Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => handleTabChange('CAMERA')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTab === 'CAMERA'
              ? 'bg-brand-600 text-white border-brand-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-6 h-6 mb-2" />
          <div>
            <div className="text-xs font-bold">📷 Capture with Camera</div>
            <div className="text-[10px] opacity-80">Laptop webcam preview</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('UPLOAD')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTab === 'UPLOAD'
              ? 'bg-brand-600 text-white border-brand-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-6 h-6 mb-2" />
          <div>
            <div className="text-xs font-bold">📁 Upload Product Images</div>
            <div className="text-[10px] opacity-80">JPG, PNG, WEBP labels</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('BARCODE')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTab === 'BARCODE'
              ? 'bg-brand-600 text-white border-brand-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-6 h-6 mb-2" />
          <div>
            <div className="text-xs font-bold">🔳 Scan Barcode / QR</div>
            <div className="text-[10px] opacity-80">Optional product ID</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleDemoPreset('food')}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTab === 'DEMO'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-bold'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Play className="w-6 h-6 mb-2 fill-current" />
          <div>
            <div className="text-xs font-bold">🎬 Try Demo Product</div>
            <div className="text-[10px] opacity-80">Offline presentation mode</div>
          </div>
        </button>
      </div>

      {/* Main Interactive Scanner Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Capture / Input Zone */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Retail Package Input
              </h3>
              {/* Label Angle Selector */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                {['FRONT', 'BACK', 'SIDE'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setImageType(view)}
                    className={`px-2 py-1 rounded-lg transition ${
                      imageType === view ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: WEBCAM / CAMERA MODE */}
            {activeTab === 'CAMERA' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <VideoOff className="w-4 h-4 text-amber-600" /> Camera Unavailable
                    </div>
                    <p>{cameraError}</p>
                    <button
                      onClick={() => handleTabChange('UPLOAD')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                    >
                      Switch to File Upload
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {isCameraActive && (
                      <div className="absolute inset-0 border-2 border-brand-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-32 border-2 border-dashed border-brand-300 rounded-xl" />
                      </div>
                    )}
                  </div>
                )}

                {isCameraActive && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Capture Snapshot
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: UPLOAD MODE */}
            {activeTab === 'UPLOAD' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-brand-50/20 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl && !isCameraActive ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Selected Package"
                      className="max-h-52 mx-auto rounded-xl shadow-md object-contain"
                    />
                    <div className="text-[11px] font-bold text-brand-600 mt-2">Click to replace image</div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      Upload Retail Package Images
                    </div>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP formats</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BARCODE / QR OPTIONAL MODE */}
            {activeTab === 'BARCODE' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <QrCode className="w-4 h-4 text-brand-600" /> Optional Product Identification
                </div>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or enter 13-digit EAN Barcode (e.g., 8901234567890)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-[11px] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Barcode scanning is an optional secondary identifier. Legal Metrology compliance checks are performed on retail package label images.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 4: DEMO MODE SAMPLES */}
            {activeTab === 'DEMO' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Select Hackathon Demo Preset:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoPreset('food')}
                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition text-left"
                  >
                    Wheat Atta
                    <span className="block text-[10px] font-normal text-emerald-600">Compliant (100)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoPreset('cosmetics')}
                    className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold hover:bg-orange-100 transition text-left"
                  >
                    Face Wash
                    <span className="block text-[10px] font-normal text-orange-600">High Risk (60)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoPreset('household')}
                    className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 transition text-left"
                  >
                    Dishwash
                    <span className="block text-[10px] font-normal text-rose-600">Critical (40)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Product Meta Data Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Organic Whole Wheat Atta 5kg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. NaturaFresh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={categoryHint}
                    onChange={(e) => setCategoryHint(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Household Products">Household</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Electrical / Consumer Goods">Electrical</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={scanning}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Running Vision OCR & Rule Engine...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Compliance Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: OCR Results & Compliance Evaluation */}
        <div className="md:col-span-7 space-y-4">
          {scanResult ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 animate-fade-in">
              {/* Quality & Mode Indicator */}
              <div className="flex items-center justify-between">
                <ImageQualityIndicator quality={scanResult.quality} />
                {isDemoMode && (
                  <span className="shrink-0 ml-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
                    Demo Mode
                  </span>
                )}
              </div>

              {/* Compliance Rating Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Preliminary Compliance Score
                  </span>
                  <div className="text-3xl font-extrabold font-display text-emerald-400 mt-0.5">
                    {scanResult.compliance_score} / 100
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Legal Metrology (Packaged Commodities) rating
                  </p>
                </div>
                <div>
                  <RiskBadge level={scanResult.risk_level} />
                </div>
              </div>

              {/* Extracted Label Fields */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Parsed Legal Declarations ({scanResult.extracted_fields.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scanResult.extracted_fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                    >
                      <div className="text-[11px] font-semibold text-slate-500">{field.field_name}</div>
                      <div className="text-xs font-bold text-slate-900 mt-1 font-mono truncate">
                        {field.field_value !== 'NOT_FOUND' ? field.field_value : (
                          <span className="text-rose-600 italic">NOT DETECTED</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Confidence: {Math.round(field.confidence_score * 100)}%</span>
                        <span className="text-brand-600 font-semibold">{field.verification_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Inspection Button */}
              <button
                onClick={handleSaveInspection}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Inspection & Generate Official PDF Report
              </button>
            </div>
          ) : (
            <div className="h-full min-h-[420px] p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Scan className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Awaiting Package Label Input</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Use your laptop camera, upload label images, or click <strong>Try Demo Product</strong> for an offline presentation run.
              </p>
              <button
                onClick={() => handleDemoPreset('food')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" /> Try Instant Demo Product Run
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
