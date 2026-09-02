import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EntityIntel({ analysisData }) {
  const navigate = useNavigate();

  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Entity Intelligence</h1>
          <p className="page-subtitle">Comprehensive entity metrics with graph centrality analysis</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>No entities extracted yet</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>Run an analysis to see extracted entities, PageRank scores, and centrality metrics here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }

  const data = analysisData;
  const [sortKey, setSortKey] = useState('influence');
  const [sortDir, setSortDir] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('All');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedMetrics = useMemo(() => {
    let filtered = data.metrics;
    if (filterCategory !== 'All') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data.metrics, sortKey, sortDir, filterCategory]);

  const categories = ['All', ...new Set(data.metrics.map(m => m.category))];

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? <HiOutlineChevronUp style={{ fontSize: 12 }} /> : <HiOutlineChevronDown style={{ fontSize: 12 }} />;
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Entity Intelligence</h1>
        <p className="page-subtitle">Comprehensive entity metrics with graph centrality analysis</p>
      </motion.div>

      {}
      <motion.div className="kpi-grid" variants={fadeUp} style={{ marginBottom: 24 }}>
        {categories.filter(c => c !== 'All').map(cat => {
          const count = data.metrics.filter(m => m.category === cat).length;
          return (
            <div className="kpi-card" key={cat} style={{ cursor: 'pointer' }} onClick={() => setFilterCategory(cat)}>
              <div className="kpi-label">{cat}</div>
              <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{count}</div>
            </div>
          );
        })}
      </motion.div>

      {}
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`graph-filter-btn ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat === 'All' ? 'All Entities' : cat}
          </button>
        ))}
      </motion.div>

      {}
      <motion.div className="card" variants={fadeUp}>
        <div className="card-title">
          Entity Analysis — {sortedMetrics.length} entities
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('entity')} className={sortKey === 'entity' ? 'sorted' : ''}>
                  Entity <SortIcon column="entity" />
                </th>
                <th onClick={() => handleSort('category')} className={sortKey === 'category' ? 'sorted' : ''}>
                  Category <SortIcon column="category" />
                </th>
                <th onClick={() => handleSort('influence')} className={sortKey === 'influence' ? 'sorted' : ''}>
                  Influence (PageRank) <SortIcon column="influence" />
                </th>
                <th onClick={() => handleSort('broker')} className={sortKey === 'broker' ? 'sorted' : ''}>
                  Broker Role <SortIcon column="broker" />
                </th>
                <th onClick={() => handleSort('connections')} className={sortKey === 'connections' ? 'sorted' : ''}>
                  Connections <SortIcon column="connections" />
                </th>
                <th>Influence Bar</th>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((row) => {
                const maxInfluence = Math.max(...data.metrics.map(m => m.influence));
                const barWidth = (row.influence / maxInfluence) * 100;
                return (
                  <tr key={row.entity}>
                    <td style={{ fontWeight: 600 }}>{row.entity}</td>
                    <td>
                      <span className={`entity-badge ${row.category.toLowerCase()}`}>
                        {row.category}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {row.influence.toFixed(3)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.broker.toFixed(3)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.connections}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div className="feature-bar-track" style={{ height: 10 }}>
                        <div
                          className="feature-bar-fill"
                          style={{ width: `${barWidth}%`, height: '100%' }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
