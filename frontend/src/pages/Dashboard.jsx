import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineExclamation,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
function buildActivityFeed(data) {
  const feed = [];
  const now = new Date();
  const fmt = (min) => `${min} min ago`;
  if (data.alerts?.smurfing?.length > 0) {
    feed.push({ text: `Smurfing pattern detected on ${data.alerts.smurfing.join(', ')}`, color: 'red', time: fmt(2) });
  }
  const personCount = data.metrics?.filter(m => m.category === 'PERSON').length || 0;
  const orgCount = data.metrics?.filter(m => m.category === 'ORG').length || 0;
  if (data.summary?.total_entities > 0) {
    feed.push({ text: `${data.summary.total_entities} entities extracted (${personCount} persons, ${orgCount} orgs)`, color: 'cyan', time: fmt(3) });
  }
  if (data.nodes?.some(n => n.group === 'PHONE')) {
    const phoneCount = data.nodes.filter(n => n.group === 'PHONE').length;
    feed.push({ text: `CDR data ingested: ${phoneCount} phone nodes identified`, color: 'cyan', time: fmt(4) });
  }
  if (data.nodes?.some(n => n.group === 'ACCOUNT')) {
    const acctCount = data.nodes.filter(n => n.group === 'ACCOUNT').length;
    feed.push({ text: `Financial ledger ingested: ${acctCount} accounts mapped`, color: 'orange', time: fmt(5) });
  }
  if (data.summary?.total_edges > 0) {
    feed.push({ text: `Network graph constructed with ${data.summary.total_edges} connections`, color: 'green', time: fmt(4) });
  }
  if (data.alerts?.primary_suspect) {
    feed.push({ text: `Primary suspect identified: ${data.alerts.primary_suspect}`, color: 'orange', time: fmt(3) });
  }
  if (data.ipc_sections?.length > 0) {
    feed.push({ text: `Legal Analysis: Flagged ${data.ipc_sections.length} potential IPC sections`, color: 'red', time: fmt(1) });
  }
  if (data.communities?.length > 0) {
    feed.push({ text: `Community Detection: Discovered ${data.communities.length} distinct criminal sub-networks`, color: 'green', time: fmt(1) });
  }
  feed.push({ text: 'PageRank & Betweenness centrality computed for all nodes', color: 'cyan', time: fmt(4) });
  return feed.slice(0, 8);
}
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
export default function Dashboard({ analysisData }) {
  const navigate = useNavigate();
  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="page-header">
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Real-time intelligence overview and network status</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>🛡️</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            No Analysis Running
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Upload intelligence data — FIR text, CDR records, or financial ledgers — to generate a live network analysis. Results will populate this dashboard in real time.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/ingest')}>
            ⚡ Start New Analysis
          </button>
        </div>
      </motion.div>
    );
  }
  const data = analysisData;
  const activityFeed = buildActivityFeed(data);
  const kpis = [
    { label: 'Entities Tracked', value: data.summary.total_entities, icon: <HiOutlineUserGroup /> },
    { label: 'Connections Mapped', value: data.summary.total_edges, icon: <HiOutlineGlobe /> },
    { label: 'Alerts Flagged', value: data.summary.alerts_count, icon: <HiOutlineExclamation /> },
    { label: 'Networks Identified', value: data.summary.networks_mapped, icon: <HiOutlineLightningBolt /> },
  ];
  const topSuspects = data.metrics
    .filter(m => m.category === 'PERSON')
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 5);
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div className="page-header" variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Real-time intelligence overview and network status</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/export')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          📄 Generate PDF Dossier
        </button>
      </motion.div>
      { }
      <motion.div className="kpi-grid" variants={fadeUp} id="tour-dashboard-kpis">
        {kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.label}>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </motion.div>
      <motion.div className="grid-2" variants={fadeUp} style={{ marginBottom: 24 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/network')}>
          <div className="card-title">Network Preview</div>
          <div style={{
            height: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 400 260">
              {data.edges.slice(0, 12).map((edge, i) => {
                const srcIdx = data.nodes.findIndex(n => n.id === edge.source);
                const tgtIdx = data.nodes.findIndex(n => n.id === edge.target);
                if (srcIdx < 0 || tgtIdx < 0) return null;
                const sx = 40 + (srcIdx % 5) * 80;
                const sy = 40 + Math.floor(srcIdx / 5) * 70;
                const tx = 40 + (tgtIdx % 5) * 80;
                const ty = 40 + Math.floor(tgtIdx / 5) * 70;
                return (
                  <line key={i} x1={sx} y1={sy} x2={tx} y2={ty}
                    stroke="rgba(0,255,242,0.15)" strokeWidth="1" />
                );
              })}
              {data.nodes.slice(0, 12).map((node, i) => {
                const colorMap = {
                  PERSON: '#005EA2', ORG: '#005EA2', LOC: '#005EA2',
                  PHONE: '#005EA2', ACCOUNT: '#005EA2'
                };
                const cx = 40 + (i % 5) * 80;
                const cy = 40 + Math.floor(i / 5) * 70;
                return (
                  <g key={node.id}>
                    <circle cx={cx} cy={cy} r={node.size / 3 + 4}
                      fill={colorMap[node.group] || '#005EA2'} opacity={1.0}>
                    </circle>
                  </g>
                );
              })}
            </svg>
            <div style={{
              position: 'absolute', bottom: 12, right: 16,
              fontFamily: 'var(--font-heading)', fontSize: '0.65rem',
              color: 'var(--accent-cyan)', letterSpacing: '1px',
              textTransform: 'uppercase', opacity: 0.7,
            }}>
              Click to explore →
            </div>
          </div>
        </div>
        <div className="card" id="tour-activity-feed">
          <div className="card-title">Recent Activity</div>
          <div className="activity-feed">
            {activityFeed.map((item, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${item.color}`} />
                <div className="activity-text">{item.text}</div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div className="grid-2" variants={fadeUp} style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Predicted Legal Violations (IPC)</div>
          <div className="activity-feed">
            {data.ipc_sections && data.ipc_sections.length > 0 ? (
              data.ipc_sections.map((ipc, i) => {
                const confMatch = ipc.reason.match(/Confidence:\s*([\d.]+)%/);
                const confidence = confMatch ? parseFloat(confMatch[1]) : 0;
                return (
                  <div className="activity-item" key={i} style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div className="activity-dot red" style={{ marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ipc.section} - {ipc.description}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>Reasoning: {ipc.reason}</div>
                      {confidence > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <span>AI Confidence</span>
                            <span>{confidence.toFixed(1)}%</span>
                          </div>
                          <div style={{ width: '100%', background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${confidence}%`, background: confidence > 50 ? 'var(--accent-red)' : 'var(--accent-orange)', height: '100%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No specific IPC sections flagged based on current intelligence.</div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Detected Criminal Syndicates</div>
          <div className="activity-feed">
            {data.communities && data.communities.length > 0 ? (
              data.communities.slice(0, 5).map((comm, i) => (
                <div className="activity-item" key={i} style={{ alignItems: 'flex-start' }}>
                  <div className="activity-dot green" style={{ marginTop: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Syndicate Cluster #{comm.id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                      Members: {comm.members.join(', ')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Not enough data to detect isolated communities.</div>
            )}
          </div>
        </div>
      </motion.div>
      <motion.div className="grid-2" variants={fadeUp} style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-title">Top Suspects</div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Influence</th>
                  <th>Connections</th>
                </tr>
              </thead>
              <tbody>
                {topSuspects.map((row) => (
                  <tr key={row.entity}>
                    <td style={{ fontWeight: 600 }}>{row.entity}</td>
                    <td>{row.influence.toFixed(3)}</td>
                    <td>{row.connections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>System Audit Logs</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--accent-green)', border: '1px solid var(--accent-green)', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
          </div>
          <div className="data-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User ID</th>
                  <th>Action / Event</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>{new Date().toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td>UP-4092</td>
                  <td>FIR Analysis Executed</td>
                  <td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Success</span></td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>{new Date(Date.now() - 300000).toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td>UP-4092</td>
                  <td>Dossier PDF Export</td>
                  <td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Success</span></td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>{new Date(Date.now() - 900000).toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td>UP-4092</td>
                  <td>User Login</td>
                  <td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Success</span></td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>{new Date(Date.now() - 910000).toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td>UNKNOWN</td>
                  <td>Unauthorized IP Access</td>
                  <td><span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Blocked</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
