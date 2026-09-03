import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

const NODE_COLORS = {
  PERSON: '#2491FF',  // Bright Blue
  ORG: '#005EA2',     // Medium Blue
  LOC: '#4BA3FF',     // Lighter Blue
  PHONE: '#73B9FF',   // Very Light Blue
  ACCOUNT: '#1A4480', // Darker Blue
  MISC: '#A9AEB1',    // Grey
};

const FILTERS = ['PERSON', 'ORG', 'LOC', 'PHONE', 'ACCOUNT', 'MISC'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function NetworkGraph({ analysisData }) {
  const navigate = useNavigate();
  const data = analysisData;

  const [filters, setFilters] = useState({
    PERSON: true,
    ORG: true,
    LOC: true,
    PHONE: true,
    ACCOUNT: true,
    MISC: true,
  });
  const [minInfluence, setMinInfluence] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 800, height: 500 });
  const initialCenter = useRef(false);
  const graphContainerRef = useRef(null);
  const graphRef = useRef(null);

  
  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGraphDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height, // use full container height
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (!analysisData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Network Graph</h1>
          <p className="page-subtitle">Interactive force-directed criminal network visualization</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🕸️</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>No network data yet</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>Run an analysis to build an interactive force-directed graph of the criminal network.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>
        </div>
      </motion.div>
    );
  }

  // Build graph data with filters
  const graphData = useMemo(() => {
    let filteredNodes = data.nodes.filter(n => filters[n.group] !== false);

    // Apply minimum influence filter if available in metrics
    if (minInfluence > 0) {
      filteredNodes = filteredNodes.filter(n => {
        const metric = data.metrics.find(m => m.entity === n.id);
        return metric ? metric.influence >= minInfluence : true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.id.toLowerCase().includes(term)
      );
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Show all edges where both endpoints are in the filtered node set
    const filteredEdges = data.edges.filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return {
      nodes: filteredNodes.map(n => ({
        ...n,
        color: NODE_COLORS[n.group] || NODE_COLORS.MISC,
        val: n.size || 10,
      })),
      links: filteredEdges.map(e => ({
        source: e.source,
        target: e.target,
        color: e.color || 'rgba(255,255,255,0.25)',
        label: e.label,
        curvature: 0.1,
      })),
    };
  }, [data, filters, minInfluence, searchTerm]);

  useEffect(() => {
    if (graphRef.current) {
      // Spread nodes out to prevent label overlap
      graphRef.current.d3Force('charge').strength(-150); // Decreased repulsion
      graphRef.current.d3Force('link').distance(80);     // Decreased link distance
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2.5, 500);
    }
  }, []);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
    
    // Make nodes noticeably larger, fallback to a default val if node.val is invalid
    const val = (typeof node.val === 'number' && node.val >= 0) ? node.val : 4;
    const r = Math.sqrt(val) * 2.2;
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isGnnEdge = data.edges.some(
      e => e.label === 'GNN Predicted Link' && (e.source === node.id || e.target === node.id)
    );
    const isLightMode = document.body.classList.contains('light-mode');

    // Outer ring for selected or GNN nodes
    if (isSelected || isGnnEdge) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? (isLightMode ? '#1B1B1B' : '#FFFFFF') : '#ff4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Node circle (3D Sphere Effect)
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    
    const gradient = ctx.createRadialGradient(
      node.x - r/3, node.y - r/3, r/10,
      node.x, node.y, r
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Shine
    gradient.addColorStop(0.4, node.color); // Base color
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)'); // Shadow
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dynamic label rendering for clarity
    // Scale font size inversely with zoom so it remains readable
    const fontSize = Math.max(4, 12 / globalScale);
    ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const label = node.id.length > 20 ? node.id.substring(0, 18) + '…' : node.id;
    
    // Draw label background for better contrast
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.7)'; // Dynamic bg with opacity
    ctx.fillRect(node.x - textWidth/2 - 2, node.y + r + 1, textWidth + 4, fontSize + 3);
    
    ctx.fillStyle = isLightMode ? '#1B1B1B' : '#f8fafc'; // Explicit hex for text color
    ctx.fillText(label, node.x, node.y + r + 2);
  }, [selectedNode, data.edges]);

  const linkCanvasObject = useCallback((link, ctx, globalScale) => {
    const isGnn = link.label === 'GNN Predicted Link';
    const start = link.source;
    const end = link.target;
    const isLightMode = document.body.classList.contains('light-mode');

    // Draw Line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = isGnn ? '#ff4444' : (isLightMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.9)');
    ctx.lineWidth = isGnn ? 2.5 : 2.0;
    if (isGnn) {
      ctx.setLineDash([2, 2]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Link Label - Only when highly zoomed in, and ignore generic co-occurrence labels
    if (link.label && link.label !== "Co-occurrence" && globalScale > 2.0) {
      const midX = start.x + (end.x - start.x) / 2;
      const midY = start.y + (end.y - start.y) / 2;
      
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      
      ctx.save();
      ctx.translate(midX, midY);
      // Keep text upright
      if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
        ctx.rotate(angle + Math.PI);
      } else {
        ctx.rotate(angle);
      }
      
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      const textWidth = ctx.measureText(link.label).width;
      ctx.fillRect(-textWidth/2 - 2, -fontSize - 2, textWidth + 4, fontSize + 4);
      
      ctx.fillStyle = isGnn ? '#ff4444' : '#94a3b8'; // Hex color instead of text-secondary
      ctx.fillText(link.label, 0, -1);
      ctx.restore();
    }
  }, []);

  
  const nodeDetails = useMemo(() => {
    if (!selectedNode) return null;
    const metric = data.metrics.find(m => m.entity === selectedNode.id);
    const connections = data.edges.filter(
      e => e.source === selectedNode.id || e.target === selectedNode.id
    );
    return { ...selectedNode, metric, connections };
  }, [selectedNode, data]);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Network Analysis</h1>
        <p className="page-subtitle">Interactive criminal network topology — click nodes to inspect</p>
      </motion.div>

      <motion.div
        className="graph-container"
        ref={graphContainerRef}
        variants={fadeUp}
        style={{ height: 'calc(100vh - 160px)', position: 'relative' }}
      >
        {/* Toolbar */}
        <div className="graph-toolbar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`graph-filter-btn ${filters[f] ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, [f]: !prev[f] }))}
                style={{ borderColor: NODE_COLORS[f] || NODE_COLORS.MISC, color: filters[f] ? (NODE_COLORS[f] || NODE_COLORS.MISC) : undefined, opacity: filters[f] ? 1 : 0.6 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: filters[f] ? (NODE_COLORS[f] || NODE_COLORS.MISC) : 'transparent', border: `1px solid ${NODE_COLORS[f] || NODE_COLORS.MISC}` }} />
                  {f}
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min Influence:</span>
            <input 
              type="range" 
              min="0" 
              max="0.5" 
              step="0.01" 
              value={minInfluence}
              onChange={(e) => setMinInfluence(parseFloat(e.target.value))}
              style={{ width: '80px', accentColor: 'var(--accent-cyan)' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', width: '32px', fontFamily: 'monospace' }}>{minInfluence.toFixed(2)}</span>
          </div>

          <input
            className="graph-search"
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginLeft: 'auto' }}
          />
        </div>

        {}
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={graphDimensions.width}
            height={graphDimensions.height}
            backgroundColor="transparent"
            nodeCanvasObject={nodeCanvasObject}
            linkCanvasObject={linkCanvasObject}
            onNodeClick={handleNodeClick}
            onBackgroundClick={() => setSelectedNode(null)}
            onEngineStop={() => {
              if (!initialCenter.current && graphRef.current) {
                graphRef.current.zoomToFit(400, 50);
                initialCenter.current = true;
              }
            }}
            nodeRelSize={6}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            d3VelocityDecay={0.3}
            cooldownTime={3000}
            warmupTicks={50}
          />

        {/* Node Details Panel */}
        {nodeDetails && (
          <div className="node-details-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="node-details-title">{nodeDetails.id}</div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', padding: 4 }}
              >✕</button>
            </div>

            <span className={`entity-badge ${nodeDetails.group.toLowerCase()}`}>
              {nodeDetails.group}
            </span>

            {nodeDetails.metric && (
              <>
                <div className="node-detail-row" style={{ marginTop: 20 }}>
                  <span className="node-detail-label">PageRank Influence</span>
                  <span className="node-detail-value">{nodeDetails.metric.influence.toFixed(3)}</span>
                </div>
                <div className="node-detail-row">
                  <span className="node-detail-label">Betweenness Centrality</span>
                  <span className="node-detail-value">{nodeDetails.metric.broker.toFixed(3)}</span>
                </div>
                <div className="node-detail-row">
                  <span className="node-detail-label">Connections</span>
                  <span className="node-detail-value">{nodeDetails.connections.length}</span>
                </div>
              </>
            )}

            <div style={{ marginTop: 20 }}>
              <div className="card-title">Connected To</div>
              {nodeDetails.connections.map((edge, i) => {
                const other = edge.source === nodeDetails.id ? edge.target : edge.source;
                return (
                  <div key={i} className="node-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span className="node-detail-label" style={{ fontSize: '0.8rem' }}>{other}</span>
                      <span className="node-detail-value" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {edge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {edge.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Bar — replaces broken timeline slider */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', padding: '10px 20px',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 24,
          boxShadow: 'var(--shadow-card)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
        }}>
          <span>⬤ <strong style={{ color: 'var(--accent-cyan)' }}>{graphData.nodes.length}</strong> nodes</span>
          <span style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
          <span>— <strong style={{ color: 'var(--accent-cyan)' }}>{graphData.links.length}</strong> edges</span>
          <span style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
          <span>🔴 <strong style={{ color: '#ff6b6b' }}>{graphData.links.filter(l => l.label?.includes('Predicted')).length}</strong> predicted links</span>
        </div>

        {}
        <div className="graph-legend">
          {Object.entries(NODE_COLORS).filter(([k]) => k !== 'MISC').map(([label, color]) => (
            <div className="graph-legend-item" key={label}>
              <div className="graph-legend-dot" style={{ backgroundColor: color, color }} />
              <span>{label}</span>
            </div>
          ))}
          <div className="graph-legend-item">
            <div style={{ width: 20, height: 2, background: '#ff0000', boxShadow: '0 0 6px #ff0000' }} />
            <span>GNN Predicted</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
