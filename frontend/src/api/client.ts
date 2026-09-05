import axios from 'axios';
import { Inspection, Complaint, ComplianceRule, User, DashboardAnalytics, ScanResult, Product } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicflow_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData: { name: string; email: string; password: string; role: string; phone?: string }) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get('/products');
    return res.data;
  },
  getProduct: async (id: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: any): Promise<Product> => {
    const res = await apiClient.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, updates: any): Promise<Product> => {
    const res = await apiClient.put(`/products/${id}`, updates);
    return res.data;
  },
  deleteProduct: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // Scan & OCR
  processScan: async (formData: FormData): Promise<ScanResult> => {
    const res = await apiClient.post('/scan/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  runOCR: async (inspectionId: string) => {
    const res = await apiClient.post(`/ocr/${inspectionId}`);
    return res.data;
  },
  runExtraction: async (inspectionId: string) => {
    const res = await apiClient.post(`/extraction/${inspectionId}`);
    return res.data;
  },

  // Compliance Engine
  runCompliance: async (inspectionId: string) => {
    const res = await apiClient.post(`/compliance/${inspectionId}`);
    return res.data;
  },
  getCompliance: async (inspectionId: string) => {
    const res = await apiClient.get(`/compliance/${inspectionId}`);
    return res.data;
  },

  // Inspections
  getInspections: async (params?: { status?: string; risk_level?: string; category?: string }): Promise<Inspection[]> => {
    const res = await apiClient.get('/inspections', { params });
    return res.data;
  },
  getInspection: async (id: string): Promise<Inspection> => {
    const res = await apiClient.get(`/inspections/${id}`);
    return res.data;
  },
  createInspection: async (data: any): Promise<Inspection> => {
    const res = await apiClient.post('/inspections', data);
    return res.data;
  },
  updateInspection: async (id: string, updates: any): Promise<Inspection> => {
    const res = await apiClient.put(`/inspections/${id}`, updates);
    return res.data;
  },
  deleteInspection: async (id: string) => {
    const res = await apiClient.delete(`/inspections/${id}`);
    return res.data;
  },
  uploadInspectionImage: async (inspectionId: string, imageType: string, imageUrl?: string) => {
    const res = await apiClient.post(`/inspections/${inspectionId}/images`, null, {
      params: { image_type: imageType, image_url: imageUrl },
    });
    return res.data;
  },

  // Reports
  downloadPdfReport: (inspectionId: string) => {
    return `${API_BASE}/reports/${inspectionId}/pdf`;
  },

  // Complaints
  getComplaints: async (): Promise<Complaint[]> => {
    const res = await apiClient.get('/complaints');
    return res.data;
  },
  createComplaint: async (data: any): Promise<Complaint> => {
    const res = await apiClient.post('/complaints', data);
    return res.data;
  },
  updateComplaintStatus: async (id: string, status: string): Promise<Complaint> => {
    const res = await apiClient.put(`/complaints/${id}`, { status });
    return res.data;
  },

  // Rules
  getRules: async (): Promise<ComplianceRule[]> => {
    const res = await apiClient.get('/rules');
    return res.data;
  },
  createRule: async (data: any): Promise<ComplianceRule> => {
    const res = await apiClient.post('/rules', data);
    return res.data;
  },
  updateRule: async (id: string, data: any): Promise<ComplianceRule> => {
    const res = await apiClient.put(`/rules/${id}`, data);
    return res.data;
  },
  deleteRule: async (id: string) => {
    const res = await apiClient.delete(`/rules/${id}`);
    return res.data;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/users');
    return res.data;
  },
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const res = await apiClient.put(`/users/${userId}`, null, { params: { role } });
    return res.data;
  },

  // Analytics
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data;
  },
  getAnalyticsOverview: async () => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },
  getAnalyticsViolations: async () => {
    const res = await apiClient.get('/analytics/violations');
    return res.data;
  },
  getAnalyticsTrends: async () => {
    const res = await apiClient.get('/analytics/trends');
    return res.data;
  },
};

