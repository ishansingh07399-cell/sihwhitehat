import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function GeoMap({ analysisData }) {
  const navigate = useNavigate();

  const data = analysisData;

  const locations = useMemo(() => {
    if (!data) return [];
    
    const locs = data.nodes
      .filter(n => n.group === 'LOC' && n.coordinates)
      .map(n => ({ ...n, coordinates: [...n.coordinates] }));
      
    // Group locs that are very close to each other to prevent overlap
    const threshold = 2.5; // degrees (groups items closer than ~275km)
    const processed = new Set();
    
    for (let i = 0; i < locs.length; i++) {
        if (processed.has(i)) continue;
        
        const cluster = [locs[i]];
        processed.add(i);
        
        for (let j = i + 1; j < locs.length; j++) {
            if (processed.has(j)) continue;
            const dx = locs[i].coordinates[0] - locs[j].coordinates[0];
            const dy = locs[i].coordinates[1] - locs[j].coordinates[1];
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < threshold) {
                cluster.push(locs[j]);
                processed.add(j);
            }
        }
        
        if (cluster.length > 1) {
            const cx = cluster.reduce((sum, l) => sum + l.coordinates[0], 0) / cluster.length;
            const cy = cluster.reduce((sum, l) => sum + l.coordinates[1], 0) / cluster.length;
            
            // Apply radial spread
            const radius = Math.max(0.6, 0.4 * cluster.length);
            cluster.forEach((l, idx) => {
                const angle = (idx / cluster.length) * Math.PI * 2;
                l.coordinates = [
                    cx + Math.cos(angle) * radius,
                    cy + Math.sin(angle) * radius
                ];
                l.angle = angle;
            });
        }
    }
    
    return locs;
  }, [data]);

  const isApprox = (coords) =>
    coords && coords[0] === 78.9629 && coords[1] === 20.5937;

  // Calculate average coordinates for auto-centering
  const mapCenter = useMemo(() => {
    if (locations.length === 0) return [0, 20];
    // Filter out approx India coordinates if there are better ones to focus on
    const preciseLocs = locations.filter(l => !isApprox(l.coordinates));
    const locsToUse = preciseLocs.length > 0 ? preciseLocs : locations;
    
    const avgLng = locsToUse.reduce((sum, l) => sum + l.coordinates[0], 0) / locsToUse.length;
    const avgLat = locsToUse.reduce((sum, l) => sum + l.coordinates[1], 0) / locsToUse.length;
    return [avgLng, avgLat];
  }, [locations]);

  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  useEffect(() => {
    setPosition({
      coordinates: mapCenter,
      zoom: locations.length > 0 ? 12 : 1
    });
  }, [mapCenter, locations.length]);

  const handleMoveEnd = (pos) => {
    setPosition(pos);
  };

  if (!analysisData || locations.length === 0) {
    const allLocNodes = analysisData?.nodes?.filter(n => n.group === 'LOC') || [];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Geo-Spatial Intelligence</h1>
          <p className="page-subtitle">Global mapping of extracted locations and entity movements</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🌍</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            {analysisData ? 'No location entities detected' : 'No geo-data yet'}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            {analysisData
              ? allLocNodes.length > 0
                ? `Found ${allLocNodes.length} LOC node(s) but none have coordinates. Check the API server logs.`
                : 'The NER model did not extract any location (LOC) entities from the input text. Try including place names like cities, countries, or regions.'
              : 'Run an analysis containing location data to see a live geo-intelligence map.'}
          </p>
          {!analysisData && <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>}
        </div>
      </motion.div>
    );
  }

  const connections = useMemo(() => {
    const locIds = new Set(locations.map(l => l.id));
    // Find entities connected to multiple locations to draw paths
    const paths = [];
    data.nodes.filter(n => n.group === 'PERSON').forEach(person => {
      const personEdges = data.edges.filter(e => e.source === person.id || e.target === person.id);
      const connectedLocs = personEdges
        .map(e => e.source === person.id ? e.target : e.source)
        .filter(id => locIds.has(id));
      
      if (connectedLocs.length > 1) {
        for (let i = 0; i < connectedLocs.length - 1; i++) {
          for (let j = i + 1; j < connectedLocs.length; j++) {
            const locA = locations.find(l => l.id === connectedLocs[i]);
            const locB = locations.find(l => l.id === connectedLocs[j]);
            paths.push({
              from: locA.coordinates,
              to: locB.coordinates,
              person: person.id
            });
          }
        }
      }
    });
    return paths;
  }, [data, locations]);

  const zoom = position.zoom;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Geo-Spatial Intelligence</h1>
        <p className="page-subtitle">Global mapping of extracted locations and entity movements</p>
      </motion.div>

      <motion.div className="card" variants={fadeUp} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Extracted Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 14, height: 2, background: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Entity Travel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '2px dashed var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Approx. Location</span>
          </div>
        </div>

        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }} style={{ width: '100%', height: 'calc(100vh - 200px)', background: 'transparent' }}>
          <ZoomableGroup 
            center={position.coordinates} 
            zoom={position.zoom} 
            minZoom={1} 
            maxZoom={100}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--bg-primary)"
                    stroke="var(--border-default)"
                    strokeWidth={0.5 / zoom}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: 'var(--bg-card-hover)', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Arcs for travel */}
            {connections.map((path, i) => (
              <Line
                key={i}
                from={path.from}
                to={path.to}
                stroke="var(--text-muted)"
                strokeWidth={1.5 / zoom}
                strokeLinecap="round"
                style={{ opacity: 0.6 }}
              />
            ))}

            {locations.map((loc) => {
              let textAnchor = "middle";
              let dx = 0;
              let dy = -24 / zoom;
              
              if (loc.angle !== undefined) {
                  let deg = (loc.angle * 180) / Math.PI;
                  
                  if (deg > 315 || deg <= 45) { // Right (East)
                      textAnchor = "start";
                      dx = 16 / zoom;
                      dy = 6 / zoom;
                  } else if (deg > 45 && deg <= 135) { // Top (North)
                      textAnchor = "middle";
                      dx = 0;
                      dy = -24 / zoom;
                  } else if (deg > 135 && deg <= 225) { // Left (West)
                      textAnchor = "end";
                      dx = -16 / zoom;
                      dy = 6 / zoom;
                  } else { // Bottom (South)
                      textAnchor = "middle";
                      dx = 0;
                      dy = 28 / zoom;
                  }
              }

              return (
              <Marker key={loc.id} coordinates={loc.coordinates}>
                <circle
                  r={12 / zoom}
                  fill={isApprox(loc.coordinates) ? 'transparent' : 'var(--accent-cyan)'}
                  stroke={isApprox(loc.coordinates) ? 'var(--text-muted)' : 'none'}
                  strokeWidth={isApprox(loc.coordinates) ? 4.5 / zoom : 0}
                  strokeDasharray={isApprox(loc.coordinates) ? `${12 / zoom},${12 / zoom}` : 'none'}
                />
                <text
                  textAnchor={textAnchor}
                  dx={dx}
                  y={dy}
                  style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fill: 'var(--text-primary)', 
                    fontSize: `${24 / zoom}px`, 
                    letterSpacing: `${1.2 / zoom}px`,
                    pointerEvents: 'none',
                    textShadow: `0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.9)` // Make text readable over other elements
                  }}
                >
                  {loc.id}{isApprox(loc.coordinates) ? ' ~' : ''}
                </text>
              </Marker>
            )})}
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>
    </motion.div>
  );
}
