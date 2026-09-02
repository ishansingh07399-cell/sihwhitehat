import axios from 'axios';
import { MOCK_ANALYSIS_DATA } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export async function runAnalysis(formData) {
  if (!API_URL) {
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    return MOCK_ANALYSIS_DATA;
  }

  const response = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function exportPdf(analysisData) {
  if (!API_URL) {
    
    return null;
  }

  const response = await api.post('/api/export-pdf', analysisData, {
    responseType: 'blob',
  });
  return response.data;
}

export async function healthCheck() {
  if (!API_URL) return { status: 'demo' };
  const response = await api.get('/api/health');
  return response.data;
}
