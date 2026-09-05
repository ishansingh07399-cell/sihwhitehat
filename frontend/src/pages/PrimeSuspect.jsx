import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function caseId() {
  const d = new Date();
  return `CID/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
}
const CASE_NO = caseId();
const TODAY = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 22px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 6,
      border: `1px solid ${color}33`,
      minWidth: 110,
      flex: 1,
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>{value}</div>
      <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '1.2px', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px',
      borderRadius: 3, fontSize: '0.8rem', fontWeight: 600,
      background: `${color}15`, border: `1px solid ${color}40`,
      color, marginRight: 8, marginBottom: 8,
      fontFamily: 'var(--font-mono)',
    }}>{text}</span>
  );
}

export default function PrimeSuspect({ analysisData }) {
  const navigate = useNavigate();

  const { primeSuspect, linkedLocs, linkedPersons, linkedOrgs, linkedAccounts, reasons } = useMemo(() => {
    if (!analysisData) return {};

    const personMetrics = analysisData.metrics.filter(m => m.category === 'PERSON');
    if (personMetrics.length === 0) return {};

    const sorted = [...personMetrics].sort((a, b) => b.influence - a.influence);
    const top = sorted[0];

    const edges = analysisData.edges.filter(e => e.source === top.entity || e.target === top.entity);
    const connectedIds = edges.map(e => e.source === top.entity ? e.target : e.source);

    const locs    = analysisData.nodes.filter(n => n.group === 'LOC'     && connectedIds.includes(n.id)).map(n => n.id);
    const persons = analysisData.nodes.filter(n => n.group === 'PERSON'  && connectedIds.includes(n.id) && n.id !== top.entity).map(n => n.id);
    const orgs    = analysisData.nodes.filter(n => n.group === 'ORG'     && connectedIds.includes(n.id)).map(n => n.id);
    const accts   = analysisData.nodes.filter(n => n.group === 'ACCOUNT' && connectedIds.includes(n.id)).map(n => n.id);

    const rs = [];
    rs.push(`Highest PageRank influence score (${top.influence.toFixed(4)}) among all persons — ${((top.influence / (sorted[1]?.influence || top.influence)) * 100 - 100).toFixed(0)}% more influential than the next-ranked individual.`);
    if (top.broker > 0.1) rs.push(`Betweenness centrality (broker score: ${top.broker.toFixed(4)}) confirms this individual controls critical information flow between separate criminal factions.`);
    if (top.connections >= 3) rs.push(`Maintains ${top.connections} direct network connections — indicating a broad operational footprint.`);
    if (locs.length > 0) rs.push(`Operational activity geo-traced to ${locs.length} location(s): ${locs.join(', ')}.`);
    if (persons.length > 0) rs.push(`Directly linked to ${persons.length} co-accused: ${persons.join(', ')}.`);
    if (orgs.length > 0) rs.push(`Associated with organisation(s): ${orgs.join(', ')}.`);
    if (accts.length > 0) rs.push(`Financial transactions traced through ${accts.length} account(s).`);
    if (analysisData.alerts?.primary_suspect === top.entity) rs.push('Independently flagged as primary suspect by automated PageRank alert system.');
    if (analysisData.alerts?.smurfing?.length > 0) rs.push('Smurfing (structured financial fraud) detected in this network — subject is the highest-influence node.');

    return { primeSuspect: top, linkedLocs: locs, linkedPersons: persons, linkedOrgs: orgs, linkedAccounts: accts, reasons: rs };
  }, [analysisData]);

  if (!analysisData || !primeSuspect) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Prime Suspect Assessment</h1>
          <p className="page-subtitle">AI-powered criminal network centrality analysis</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎯</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            {!analysisData ? 'No analysis data yet' : 'No person entities found'}
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 28px' }}>
            Run an intelligence analysis to identify the prime suspect.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>

      {/* PAGE HEADER */}
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Prime Suspect Assessment</h1>
        <p className="page-subtitle">AI-Powered Network Centrality Analysis — Restricted Intelligence Report</p>
      </motion.div>

      {/* ── GOVT SUSPECT BANNER ─────────────────────────────────── */}
      <motion.div variants={fadeUp} className="card" style={{
        padding: 0, overflow: 'hidden', marginBottom: 20,
        border: '1px solid rgba(220,38,38,0.35)',
        boxShadow: '0 4px 24px rgba(220,38,38,0.1)',
      }}>

        {/* Classified strip */}
        <div style={{
          background: '#7a0000',
          padding: '6px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5555', boxShadow: '0 0 6px #ff5555' }} />
            <span style={{ fontSize: '0.65rem', color: '#ffcccc', fontFamily: 'var(--font-mono)', letterSpacing: '2.5px', fontWeight: 700 }}>
              TOP SECRET — LAW ENFORCEMENT EYES ONLY
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#ffaaaa', fontFamily: 'var(--font-mono)' }}>
            {CASE_NO} &nbsp;|&nbsp; {TODAY}
          </span>
        </div>

        {/* MHA header */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0e2244 100%)',
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '2px solid #f59e0b',
            background: 'rgba(245,158,11,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
          }}>🔱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.58rem', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              GOVERNMENT OF INDIA — MINISTRY OF HOME AFFAIRS
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', marginTop: 2 }}>
              CRIMINAL INTELLIGENCE INVESTIGATION DOSSIER
            </div>
          </div>
          <div style={{
            display: 'inline-block', padding: '4px 12px',
            background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.5)',
            borderRadius: 4, fontSize: '0.65rem', color: '#fca5a5',
            fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', fontWeight: 700,
          }}>
            ⚠ PRIORITY: CRITICAL
          </div>
        </div>

        {/* Suspect identity */}
        <div style={{
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          {/* Photo placeholder */}
          <div style={{
            width: 72, height: 72, borderRadius: 6,
            background: 'rgba(220,38,38,0.08)',
            border: '2px solid rgba(220,38,38,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0, gap: 2,
          }}>
            👤
            <div style={{ fontSize: '0.45rem', color: '#64748b', fontFamily: 'var(--font-mono)', textAlign: 'center', lineHeight: 1.3 }}>
              PHOTO<br/>N/A
            </div>
          </div>

          {/* Name */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-block', padding: '2px 10px', marginBottom: 8,
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: 3, fontSize: '0.6rem', color: '#f87171',
              fontFamily: 'var(--font-mono)', letterSpacing: '2px', fontWeight: 700,
            }}>
              ⚠ PRIME SUSPECT — HIGHEST PRIORITY TARGET
            </div>
            <div style={{
              fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-0.5px',
            }}>
              {primeSuspect.entity}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              Rank: <strong style={{ color: '#ef4444' }}>#1</strong> of {analysisData.metrics.filter(m => m.category === 'PERSON').length} suspects &nbsp;|&nbsp;
              Category: Person of Interest &nbsp;|&nbsp;
              Status: Under Investigation
            </div>
          </div>

          {/* Threat level */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: 6 }}>THREAT LEVEL</div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid #dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(220,38,38,0.1)',
              boxShadow: '0 0 18px rgba(220,38,38,0.3)',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>HIGH</div>
            </div>
          </div>
        </div>

        {/* Stat badges */}
        <div style={{
          padding: '0 24px 24px', display: 'flex', gap: 12, flexWrap: 'wrap',
        }}>
          <StatBadge label="Influence Score"     value={primeSuspect.influence.toFixed(4)} color="#ef4444" />
          <StatBadge label="Broker Score"        value={primeSuspect.broker.toFixed(4)}    color="#f59e0b" />
          <StatBadge label="Connections"         value={primeSuspect.connections}           color="#3b82f6" />
          {linkedLocs.length > 0    && <StatBadge label="Linked Locations" value={linkedLocs.length}    color="#10b981" />}
          {linkedPersons.length > 0 && <StatBadge label="Known Associates" value={linkedPersons.length} color="#8b5cf6" />}
          {linkedAccounts.length > 0 && <StatBadge label="Linked Accounts" value={linkedAccounts.length} color="#f97316" />}
        </div>
      </motion.div>

      {/* ── BODY: same layout as before ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* AI REASONING */}
        <motion.div variants={fadeUp} className="card">
          <div className="card-title" style={{ color: '#ef4444', marginBottom: 16 }}>🔎 AI Reasoning</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: 24, height: 24, borderRadius: 4,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.68rem', color: '#ef4444', fontWeight: 700,
                  fontFamily: 'var(--font-mono)', flexShrink: 0,
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>{r}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* NETWORK CONNECTIONS */}
        <motion.div variants={fadeUp} className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>🕸️ Network Connections</div>

          {linkedPersons.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                👤 Associated Persons
              </div>
              <div>{linkedPersons.map(p => <Tag key={p} text={p} color="#8b5cf6" />)}</div>
            </div>
          )}

          {linkedLocs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                📍 Operational Locations
              </div>
              <div>{linkedLocs.map(l => <Tag key={l} text={l} color="#10b981" />)}</div>
            </div>
          )}

          {linkedOrgs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                🏢 Linked Organisations
              </div>
              <div>{linkedOrgs.map(o => <Tag key={o} text={o} color="#f59e0b" />)}</div>
            </div>
          )}

          {linkedAccounts.length > 0 && (
            <div>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                💰 Financial Accounts
              </div>
              <div>{linkedAccounts.map(a => <Tag key={a} text={a} color="#f97316" />)}</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ACTION BUTTONS */}
      <motion.div variants={fadeUp} style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/export')} style={{ flex: '1 1 250px' }}>
          📄 Generate Official Dossier PDF
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/network')} style={{ flex: '1 1 180px' }}>
          🕸️ View Network Graph
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/map')} style={{ flex: '1 1 180px' }}>
          📍 Geo-Spatial Map
        </button>
      </motion.div>

    </motion.div>
  );
}
