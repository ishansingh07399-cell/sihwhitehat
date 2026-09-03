import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDocumentDownload, HiOutlineCode } from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
export default function CaseExport({ analysisData }) {
  const navigate = useNavigate();
  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Case Export</h1>
          <p className="page-subtitle">Generate tamper-evident intelligence dossiers and forensic reports</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>💾</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>No case data to export</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>Run an analysis first to generate a dossier, PDF report, and tamper-evident hash chain.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }
  const data = analysisData;
  const generatePdf = useCallback(() => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.setTextColor(180, 0, 0);
    pdf.text('LAW ENFORCEMENT INTELLIGENCE DOSSIER', 105, 20, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Generated: ${new Date().toLocaleString()} | Classification: STRICTLY CONFIDENTIAL`,
      105, 28, { align: 'center' }
    );
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', 14, 42);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(14, 44, 196, 44);
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const introText = `This AI-powered system analyzes structured and unstructured crime-related data to uncover criminal networks, identify key influencers, detect suspicious patterns, and provide actionable intelligence. Total entities: ${data.summary.total_entities} | Connections: ${data.summary.total_edges} | Alerts: ${data.summary.alerts_count}`;
    pdf.text(introText, 14, 52, { maxWidth: 180 });
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text('1. All Extracted Entities', 14, 70);
    pdf.line(14, 72, 196, 72);
    autoTable(pdf, {
      startY: 76,
      head: [['Entity', 'Category', 'Influence', 'Broker Role', 'Connections']],
      body: data.metrics.slice(0, 20).map(m => [
        m.entity, m.category, m.influence.toFixed(3), m.broker.toFixed(3), m.connections
      ]),
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 25 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
      }
    });
    let y = pdf.lastAutoTable.finalY + 12;
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text('2. Algorithmic Pattern Detections', 14, y);
    pdf.line(14, y + 2, 196, y + 2);
    y += 8;
    pdf.setFontSize(10);
    if (data.alerts.smurfing.length > 0) {
      pdf.setTextColor(180, 0, 0);
      pdf.text(`[CRITICAL] Smurfing Detected: ${data.alerts.smurfing.join(', ')}`, 14, y, { maxWidth: 180 });
      y += 8;
    }
    if (data.alerts.primary_suspect) {
      pdf.setTextColor(150, 60, 0);
      pdf.text(`[HIGH] Primary Suspect by PageRank: ${data.alerts.primary_suspect}`, 14, y, { maxWidth: 180 });
      y += 8;
    }
    y += 10;
    const locNodes = data.nodes?.filter(n => n.group === 'LOC') || [];
    if (locNodes.length > 0) {
      if (y > 240) { pdf.addPage(); y = 20; }
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(13);
      pdf.text('3. Operational Locations', 14, y);
      pdf.line(14, y + 2, 196, y + 2);
      y += 8;
      autoTable(pdf, {
        startY: y,
        head: [['Location', 'Connections', 'Influence']],
        body: locNodes.map(l => [l.id, data.metrics.find(m => m.entity === l.id)?.connections || '-', data.metrics.find(m => m.entity === l.id)?.influence.toFixed(3) || '-']),
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9 },
      });
      y = pdf.lastAutoTable.finalY + 12;
    }
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text('4. Digital Chain of Custody (SHA-256)', 14, y);
    pdf.line(14, y + 2, 196, y + 2);
    y += 8;
    pdf.setFontSize(8);
    Object.entries(data.evidence_hashes).forEach(([source, hash]) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${source}:`, 14, y);
      y += 4;
      pdf.setTextColor(0, 128, 128);
      pdf.text(hash, 14, y);
      y += 8;
    });
    pdf.save(`Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [data]);
  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Case Export</h1>
        <p className="page-subtitle">Generate court-ready dossiers and maintain evidence chain of custody</p>
      </motion.div>
      <motion.div className="card" variants={fadeUp} style={{ marginBottom: 24 }}>
        <div className="card-title">🔐 Digital Chain of Custody (SHA-256)</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Cryptographic hashes ensure tamper-proof integrity of all evidence sources.
        </p>
        {Object.entries(data.evidence_hashes).map(([source, hash]) => (
          <div className="hash-row" key={source}>
            <div className="hash-label">{source}</div>
            <div className="hash-value">{hash}</div>
          </div>
        ))}
      </motion.div>
      <motion.div className="card" variants={fadeUp} style={{ marginBottom: 24 }}>
        <div className="card-title">Dossier Preview</div>
        <div style={{
          background: '#fff',
          color: '#000',
          padding: 32,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'Georgia, serif',
          maxHeight: 400,
          overflow: 'auto',
        }}>
          <h2 style={{ color: '#8b0000', textAlign: 'center', fontSize: '1.2rem', marginBottom: 4 }}>
            LAW ENFORCEMENT INTELLIGENCE DOSSIER
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginBottom: 20 }}>
            Generated: {new Date().toLocaleString()} | Classification: STRICTLY CONFIDENTIAL
          </p>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #ccc', paddingBottom: 4, marginBottom: 12 }}>
            1. Key Culprits & High-Value Targets
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'left' }}>Entity</th>
                <th style={{ border: '1px solid #ccc', padding: '6px 8px' }}>Category</th>
                <th style={{ border: '1px solid #ccc', padding: '6px 8px' }}>Influence</th>
                <th style={{ border: '1px solid #ccc', padding: '6px 8px' }}>Broker Role</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.filter(m => m.category === 'PERSON').slice(0, 5).map(row => (
                <tr key={row.entity}>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.entity}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{row.category}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{row.influence.toFixed(3)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{row.broker.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #ccc', paddingBottom: 4, marginBottom: 12 }}>
            2. Algorithmic Pattern Detections
          </h3>
          {data.alerts.smurfing.length > 0 && (
            <p style={{ color: '#8b0000', fontSize: '0.85rem', marginBottom: 8 }}>
              [!] CRITICAL: Smurfing detected on accounts: {data.alerts.smurfing.join(', ')}
            </p>
          )}
        </div>
      </motion.div>
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={generatePdf} style={{ flex: 1, minWidth: 250 }}>
          <HiOutlineDocumentDownload style={{ fontSize: '1.2rem' }} />
          Download Intelligence Dossier (PDF)
        </button>
        <button className="btn btn-outline btn-lg" onClick={exportJson} style={{ flex: '0 1 250px' }}>
          <HiOutlineCode style={{ fontSize: '1.2rem' }} />
          Export Raw Data (JSON)
        </button>
      </motion.div>
    </motion.div>
  );
}
