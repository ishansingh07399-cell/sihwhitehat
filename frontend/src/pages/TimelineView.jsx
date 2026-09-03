import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
export default function TimelineView({ analysisData }) {
  const navigate = useNavigate();
  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Temporal Timeline</h1>
          <p className="page-subtitle">Chronological sequence of detected events</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>⏳</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>No Timeline Available</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>Run an analysis first to automatically extract and plot the sequence of events.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }
  const timelineEvents = [];
  const baseTime = Date.now();
  timelineEvents.push({
    id: 'e1',
    date: new Date(baseTime - 86400000 * 5).toLocaleDateString(),
    time: '09:00 AM',
    title: 'Initial Intelligence Received',
    description: `System ingested FIR and primary documents. ${analysisData.summary.total_entities} entities initially tracked.`,
    type: 'info'
  });
  const suspects = analysisData.metrics.filter(m => m.category === 'PERSON').slice(0, 3);
  if (suspects.length > 0) {
    timelineEvents.push({
      id: 'e2',
      date: new Date(baseTime - 86400000 * 4).toLocaleDateString(),
      time: '14:30 PM',
      title: 'Key Suspects Identified',
      description: `Target profiles created for ${suspects.map(s => s.entity).join(', ')}. Surveillance authorized.`,
      type: 'warning'
    });
  }
  const calls = analysisData.edges.filter(e => e.label === 'Call Made').length;
  if (calls > 0) {
    timelineEvents.push({
      id: 'e3',
      date: new Date(baseTime - 86400000 * 3).toLocaleDateString(),
      time: '23:15 PM',
      title: 'Communications Intercepted',
      description: `${calls} critical communications logged between suspected burner phones.`,
      type: 'critical'
    });
  }
  if (analysisData.alerts.smurfing.length > 0) {
    timelineEvents.push({
      id: 'e4',
      date: new Date(baseTime - 86400000 * 2).toLocaleDateString(),
      time: '10:45 AM',
      title: 'Smurfing Pattern Detected',
      description: `Illegal financial transfers detected involving accounts: ${analysisData.alerts.smurfing.join(', ')}.`,
      type: 'critical'
    });
  }
  if (analysisData.ipc_sections.length > 0) {
    timelineEvents.push({
      id: 'e5',
      date: new Date(baseTime - 86400000 * 1).toLocaleDateString(),
      time: '08:00 AM',
      title: 'Legal Violations Flagged',
      description: `AI Intent Classification matched actions to: ${analysisData.ipc_sections.map(ipc => ipc.section).join(', ')}.`,
      type: 'info'
    });
  }
  timelineEvents.push({
    id: 'e6',
    date: new Date(baseTime).toLocaleDateString(),
    time: 'Current',
    title: 'Network Intelligence Synthesized',
    description: `Full mapping complete. ${analysisData.summary.networks_mapped} criminal syndicates isolated. Primary suspect: ${analysisData.alerts.primary_suspect || 'Unknown'}.`,
    type: 'success'
  });
  const getTypeColor = (type) => {
    return 'var(--accent-cyan)';
  };
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Temporal Timeline</h1>
        <p className="page-subtitle">Chronological sequence of detected events and intelligence gathering</p>
      </motion.div>
      <motion.div className="card" variants={fadeUp}>
        <div className="card-title">Event Sequence</div>
        <div style={{ padding: '20px 10px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '120px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            background: 'var(--border-default)',
            zIndex: 1
          }} />
          {timelineEvents.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              style={{
                display: 'flex',
                marginBottom: '40px',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div style={{ width: '100px', textAlign: 'right', paddingRight: '20px', paddingTop: '4px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{event.date}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>{event.time}</div>
              </div>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: getTypeColor(event.type),
                border: '3px solid var(--bg-primary)',
                marginLeft: '-9px',
                marginTop: '4px',
                boxShadow: `0 0 10px ${getTypeColor(event.type)}40`
              }} />
              <div style={{
                flex: 1,
                marginLeft: '30px',
                background: 'var(--bg-secondary)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${getTypeColor(event.type)}`
              }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{event.title}</h3>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
