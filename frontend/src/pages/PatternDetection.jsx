import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineExclamation, HiOutlineLightningBolt, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
export default function PatternDetection({ analysisData }) {
  const navigate = useNavigate();
  const [expandedXai, setExpandedXai] = useState(false);
  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Pattern Detection</h1>
          <p className="page-subtitle">AI-detected anomalies, suspicious patterns, and predictive alerts</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20, color: 'var(--text-muted)' }}><HiOutlineExclamation /></div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>No patterns detected yet</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>Submit intelligence data to activate structural analysis, link prediction, and feature interpretation.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }
  const data = analysisData;
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Pattern Detection</h1>
        <p className="page-subtitle">Automated anomaly detection, structural analysis, and predictive alerts</p>
      </motion.div>
      {}
      <motion.div className="grid-3" variants={fadeUp} style={{ marginBottom: 28 }}>
        {}
        <div className="alert-card danger">
          <div className="alert-card-header">
            <span className="alert-card-icon"><HiOutlineExclamation /></span>
            <span className="alert-card-title">Smurfing Detection</span>
          </div>
          <div className="alert-card-body">
            {data.alerts.smurfing.length > 0 ? (
              <>
                <p style={{ marginBottom: 8 }}>
                  <strong style={{ color: 'var(--accent-red)' }}>CRITICAL:</strong> Financial structuring
                  pattern detected. Multiple sub-threshold transactions converging into flagged accounts.
                </p>
                <div style={{ marginTop: 12 }}>
                  {data.alerts.smurfing.map(acct => (
                    <div key={acct} style={{
                      padding: '6px 12px',
                      background: 'var(--accent-red-dim)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--accent-red)',
                    }}>
                      ⚠ {acct}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>No structuring patterns detected in current transaction data.</p>
            )}
          </div>
        </div>
        {}
        {}
        <div className="alert-card warning">
          <div className="alert-card-header">
            <span className="alert-card-icon"><HiOutlineExclamation /></span>
            <span className="alert-card-title">Primary Suspect</span>
          </div>
          <div className="alert-card-body">
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--accent-orange)',
              marginBottom: 8,
            }}>
              {data.alerts.primary_suspect}
            </div>
            <p>Identified as highest influence node by PageRank centrality analysis across the criminal network.</p>
          </div>
        </div>
      </motion.div>
      {}
    </motion.div>
  );
}
