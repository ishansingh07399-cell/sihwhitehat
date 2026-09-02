import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';
import LoadingOverlay from '../components/LoadingOverlay';
import { runAnalysis } from '../api/client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const API_URL = import.meta.env.VITE_API_URL || '';

function FileDropzone({ label, hint, file, onDrop, onRemove }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files[0]),
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="form-label">{label}</div>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-icon"><HiOutlineCloudUpload /></div>
        <div className="dropzone-text">
          {isDragActive ? 'Drop file here...' : 'Drag & drop or click to browse'}
        </div>
        <div className="dropzone-hint">{hint}</div>
      </div>
      {file && (
        <div className="dropzone-file">
          <HiOutlineDocumentText />
          <span style={{ flex: 1 }}>{file.name}</span>
          <HiOutlineX
            style={{ cursor: 'pointer', opacity: 0.6 }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          />
        </div>
      )}
    </div>
  );
}

export default function DataIngestion({ onAnalysisComplete }) {
  const [rawText, setRawText] = useState('');
  const [cdrFile, setCdrFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    if (!rawText.trim() && !cdrFile && !bankFile) return;

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (rawText.trim()) formData.append('raw_text', rawText);
      if (cdrFile) formData.append('cdr_file', cdrFile);
      if (bankFile) formData.append('bank_file', bankFile);

      const result = await runAnalysis(formData);
      onAnalysisComplete(result);
      navigate('/network');
    } catch (err) {
      console.error('Analysis failed:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.code === 'ECONNREFUSED';
      setError(
        isNetworkError
          ? `Cannot reach FastAPI backend at ${API_URL}. Make sure the server is running: uvicorn api_server:app --reload`
          : `Analysis failed: ${err.response?.data?.detail || err.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [rawText, cdrFile, bankFile, onAnalysisComplete, navigate]);

  const loadSampleData = () => {
    setRawText(
      "Suspect Rajesh Mehta was seen transferring funds at the Mumbai Central Bank branch in Bandra. " +
      "His known associate Sandeep Arora operates Silverstone Exports Ltd from Connaught Place, New Delhi. " +
      "Intelligence suggests Priya Sharma, CEO of Nightfall Imports Co., has been routing payments " +
      "through shell accounts in Dubai and Lucknow. Arun Volkov, a former employee of Silverstone Exports, " +
      "was recently spotted near Hazratganj, Lucknow and later at Indira Gandhi International Airport, Delhi. " +
      "Multiple sub-threshold transactions (Rs 8,50,000 / Rs 7,90,000 / Rs 9,10,000) " +
      "have been flagged converging into shell account ACCT-3344-SHELL. " +
      "A hawala network node was identified operating from Dharavi, Mumbai connecting to a Pakistan-based handler in Karachi."
    );
  };

  const hasInput = rawText.trim() || cdrFile || bankFile;

  return (
    <>
      <LoadingOverlay isLoading={isLoading} text="Running Multi-Modal AI Analysis..." />

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        {/* Page Header */}
        <motion.div className="page-header" variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 className="page-title">Data Ingestion</h1>
              <p className="page-subtitle">Upload intelligence data for AI-powered analysis</p>
            </div>
            {}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
              borderRadius: 20, fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
              background: API_URL ? 'rgba(40,167,69,0.12)' : 'rgba(255,193,7,0.12)',
              border: `1px solid ${API_URL ? 'rgba(40,167,69,0.4)' : 'rgba(255,193,7,0.4)'}`,
              color: API_URL ? 'var(--accent-green)' : 'var(--accent-yellow)',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: API_URL ? 'var(--accent-green)' : 'var(--accent-yellow)',
                boxShadow: API_URL ? '0 0 6px var(--accent-green)' : '0 0 6px var(--accent-yellow)',
              }} />
              {API_URL ? `Backend: ${API_URL}` : 'Demo Mode (no backend)'}
            </div>
          </div>
        </motion.div>

        {}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(220, 53, 69, 0.12)', border: '1px solid rgba(220, 53, 69, 0.5)',
              borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}
          >
            <span style={{ fontSize: '1.1rem', marginTop: 1 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--accent-red)', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>
                Backend Error
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                {error}
              </div>
            </div>
            <button onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, fontSize: '1rem' }}>
              ✕
            </button>
          </motion.div>
        )}

        <motion.div className="grid-2" variants={fadeUp}>
          {}
          <div className="card">
            <div className="card-title">Unstructured Intelligence</div>
            <div className="form-group">
              <label className="form-label">FIR / Surveillance Report / Raw Intel</label>
              <textarea
                className="form-textarea"
                placeholder="Paste FIR text, surveillance report, intelligence briefing, or any unstructured crime-related data here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ minHeight: 300 }}
              />
            </div>
            <button
              className="btn btn-outline"
              onClick={loadSampleData}
              style={{ fontSize: '0.65rem' }}
            >
              Load Sample Intelligence
            </button>
          </div>

          {}
          <div className="card">
            <div className="card-title">Structured Data Upload</div>

            <FileDropzone
              label="Call Detail Records (CDR)"
              hint="CSV — Expected columns: Caller, Receiver, Duration"
              file={cdrFile}
              onDrop={setCdrFile}
              onRemove={() => setCdrFile(null)}
            />

            <FileDropzone
              label="Financial Ledger"
              hint="CSV — Expected columns: Source, Target, Amount"
              file={bankFile}
              onDrop={setBankFile}
              onRemove={() => setBankFile(null)}
            />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={fadeUp} style={{ marginTop: 28, textAlign: 'center' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={!hasInput}
            style={{
              minWidth: 320,
              opacity: !hasInput ? 0.4 : 1,
            }}
          >
            ⚡ Run AI Analysis
          </button>
          {!API_URL && (
            <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Running in demo mode — set <code style={{ color: 'var(--accent-cyan)' }}>VITE_API_URL</code> in <code>.env</code> and restart dev server to connect to FastAPI.
            </p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
