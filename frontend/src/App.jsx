import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataIngestion from './pages/DataIngestion';
import NetworkGraph from './pages/NetworkGraph';
import EntityIntel from './pages/EntityIntel';
import PatternDetection from './pages/PatternDetection';
import CaseExport from './pages/CaseExport';
import GeoMap from './pages/GeoMap';
import TourGuide from './components/TourGuide';
import './index.css';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <TourGuide />
      <div className="app-layout">
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-brand-icon" style={{ width: 28, height: 28, fontSize: 14 }}>🛡️</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700 }}>COMMAND CENTER</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '8px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
        
        {isSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}

        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard analysisData={analysisData} />} />
            <Route path="/ingest" element={<DataIngestion onAnalysisComplete={setAnalysisData} />} />
            <Route path="/network" element={<NetworkGraph analysisData={analysisData} />} />
            <Route path="/entities" element={<EntityIntel analysisData={analysisData} />} />
            <Route path="/patterns" element={<PatternDetection analysisData={analysisData} />} />
            <Route path="/export" element={<CaseExport analysisData={analysisData} />} />
            <Route path="/map" element={<GeoMap analysisData={analysisData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
