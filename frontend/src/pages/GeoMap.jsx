import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "/india-states.json";

const INDIA_BOUNDS = { minLng: 68.1, maxLng: 97.4, minLat: 6.5, maxLat: 37.1 };

const INDIAN_STATES = new Set([
  'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh','goa',
  'gujarat','haryana','himachal pradesh','jharkhand','karnataka','kerala',
  'madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland',
  'odisha','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura',
  'uttar pradesh','uttarakhand','west bengal','andaman and nicobar islands',
  'chandigarh','dadra and nagar haveli','daman and diu','delhi','jammu and kashmir',
  'ladakh','lakshadweep','puducherry','jammu','kashmir','india',
]);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function isInsideIndia(coords) {
  if (!coords) return false;
  const [lng, lat] = coords;
  return lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng &&
         lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat;
}

function isApprox(coords) {
  return coords && coords[0] === 78.9629 && coords[1] === 20.5937;
}

/**
 * Iterative label repulsion: each label starts directly above its dot,
 * then we push overlapping labels apart vertically until they no longer overlap.
 */
function computeLabelOffsets(locs, zoom) {
  const LABEL_H = 22 / zoom;        // approximate label height
  const CHAR_W = 10 / zoom;         // approximate char width
  const DOT_R = 10 / zoom;

  // Initial: all labels above the dot
  const offsets = locs.map(loc => ({
    dy: -(DOT_R + 4 / zoom),
    dx: 0,
    anchor: 'middle',
    estW: loc.id.length * CHAR_W,
  }));

  // Simple O(n²) repulsion — run a few iterations
  const ITERATIONS = 10;
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < locs.length; i++) {
      for (let j = i + 1; j < locs.length; j++) {
        const dLng = (locs[i].coordinates[0] - locs[j].coordinates[0]) * 111; // rough km
        const dLat = (locs[i].coordinates[1] - locs[j].coordinates[1]) * 111;
        const geoDist = Math.sqrt(dLng * dLng + dLat * dLat);

        // Only resolve if dots are within ~20 km of each other
        if (geoDist > 20) continue;

        const yi = offsets[i].dy;
        const yj = offsets[j].dy;
        const hiTop = yi - LABEL_H;
        const hjTop = yj - LABEL_H;

        // Check vertical overlap (both labels above their dot, so negative dy)
        const overlapV = Math.min(Math.abs(yi), Math.abs(yj)) + LABEL_H - Math.abs(yi - yj);
        if (overlapV > 0) {
          if (yi < yj) {
            // i is higher (more negative) → push i further up, j further down
            offsets[i].dy -= overlapV / 2 + 2 / zoom;
            offsets[j].dy += overlapV / 2 + 2 / zoom;
          } else {
            offsets[i].dy += overlapV / 2 + 2 / zoom;
            offsets[j].dy -= overlapV / 2 + 2 / zoom;
          }
        }
      }
    }
  }

  return offsets;
}

export default function GeoMap({ analysisData }) {
  const navigate = useNavigate();
  const data = analysisData;

  const allLocNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter(n => n.group === 'LOC' && n.coordinates);
  }, [data]);

  const { indiaLocs, outsideLocs } = useMemo(() => {
    const inside = [];
    const outside = [];
    allLocNodes.forEach(n => {
      const raw = { ...n, coordinates: [...n.coordinates] };
      const nameKey = n.id.toLowerCase().trim();
      if (INDIAN_STATES.has(nameKey)) return;

      // Locations with good coords inside India go on map
      if (isInsideIndia(n.coordinates) && !isApprox(n.coordinates)) {
        inside.push(raw);
      } else if (isApprox(n.coordinates)) {
        // Fallback coords (geocoding failed) — assume India, show on map with dashed marker
        inside.push({ ...raw, approx: true });
      } else {
        outside.push(raw);
      }
    });
    return { indiaLocs: inside, outsideLocs: outside };
  }, [allLocNodes]);

  const mapCenter = useMemo(() => {
    const precise = indiaLocs.filter(l => !l.approx);
    const use = precise.length > 0 ? precise : indiaLocs;
    if (use.length === 0) return [82.0, 22.0];
    const avgLng = use.reduce((s, l) => s + l.coordinates[0], 0) / use.length;
    const avgLat = use.reduce((s, l) => s + l.coordinates[1], 0) / use.length;
    return [avgLng, avgLat];
  }, [indiaLocs]);

  const [position, setPosition] = useState({ coordinates: [82.0, 22.0], zoom: 1 });

  useEffect(() => {
    setPosition({
      coordinates: mapCenter,
      zoom: indiaLocs.length > 0 ? 10 : 2,
    });
  }, [mapCenter, indiaLocs.length]);

  const connections = useMemo(() => {
    const locIds = new Set(indiaLocs.map(l => l.id));
    const paths = [];
    if (!data) return paths;
    data.nodes.filter(n => n.group === 'PERSON').forEach(person => {
      const personEdges = data.edges.filter(e => e.source === person.id || e.target === person.id);
      const connectedLocs = personEdges
        .map(e => e.source === person.id ? e.target : e.source)
        .filter(id => locIds.has(id));
      if (connectedLocs.length > 1) {
        for (let i = 0; i < connectedLocs.length - 1; i++) {
          for (let j = i + 1; j < connectedLocs.length; j++) {
            const locA = indiaLocs.find(l => l.id === connectedLocs[i]);
            const locB = indiaLocs.find(l => l.id === connectedLocs[j]);
            if (locA && locB) paths.push({ from: locA.coordinates, to: locB.coordinates });
          }
        }
      }
    });
    return paths;
  }, [data, indiaLocs]);

  if (!analysisData || allLocNodes.length === 0) {
    const rawLocNodes = analysisData?.nodes?.filter(n => n.group === 'LOC') || [];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Geo-Spatial Intelligence</h1>
          <p className="page-subtitle">Mapping of extracted locations and entity movements</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🌍</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            {analysisData ? 'No location entities detected' : 'No geo-data yet'}
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 28px' }}>
            {analysisData
              ? rawLocNodes.length > 0
                ? `Found ${rawLocNodes.length} LOC node(s) but none have coordinates.`
                : 'The NER model did not extract any location entities. Try including place names.'
              : 'Run an analysis containing location data to see a live geo-intelligence map.'}
          </p>
          {!analysisData && <button className="btn btn-primary" onClick={() => navigate('/ingest')}>⚡ Run Analysis</button>}
        </div>
      </motion.div>
    );
  }

  const zoom = position.zoom;
  const labelOffsets = computeLabelOffsets(indiaLocs, zoom);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div className="page-header" variants={fadeUp}>
        <h1 className="page-title">Geo-Spatial Intelligence</h1>
        <p className="page-subtitle">Mapping of extracted locations and entity movements</p>
      </motion.div>

      <motion.div className="card" variants={fadeUp} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>

        {/* Legend */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          background: 'rgba(10,20,40,0.85)', backdropFilter: 'blur(6px)',
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'transparent', border: '2px dashed var(--text-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Approx. Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>International</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 2, background: 'var(--accent-cyan)', opacity: 0.5 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Entity Travel</span>
          </div>
        </div>

        {/* International locations panel — floated in top-right empty space */}
        {outsideLocs.length > 0 && (
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            background: 'rgba(10,20,40,0.88)', backdropFilter: 'blur(8px)',
            padding: '12px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(245,158,11,0.35)',
            minWidth: 200, maxWidth: 240,
          }}>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: 10, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🌐 International Locations
            </div>
            {outsideLocs.map((loc) => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
                <div style={{ marginTop: 4, width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{loc.id}</div>
                  {loc.country && (
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 1 }}>{loc.country}</div>
                  )}
                  {!isApprox(loc.coordinates) && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {loc.coordinates[1].toFixed(2)}°N, {loc.coordinates[0].toFixed(2)}°E
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.0, 22.0], scale: 900 }}
          style={{ width: '100%', height: 'calc(100vh - 220px)', background: 'transparent' }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={0.5}
            maxZoom={100}
            onMoveEnd={setPosition}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--bg-primary)"
                    stroke="var(--text-muted)"
                    strokeWidth={1.2 / zoom}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: 'var(--bg-card-hover)', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {connections.map((path, i) => (
              <Line
                key={i}
                from={path.from}
                to={path.to}
                stroke="var(--accent-cyan)"
                strokeWidth={1.2 / zoom}
                strokeLinecap="round"
                style={{ opacity: 0.35 }}
              />
            ))}

            {indiaLocs.map((loc, idx) => {
              const off = labelOffsets[idx] || { dy: -14 / zoom, dx: 0, anchor: 'middle' };
              const approx = !!loc.approx;
              return (
                <Marker key={loc.id} coordinates={loc.coordinates}>
                  <circle
                    r={10 / zoom}
                    fill={approx ? 'transparent' : 'var(--accent-cyan)'}
                    stroke={approx ? 'var(--text-muted)' : 'none'}
                    strokeWidth={approx ? 3 / zoom : 0}
                    strokeDasharray={approx ? `${6 / zoom},${5 / zoom}` : 'none'}
                  />
                  <text
                    textAnchor={off.anchor}
                    dx={off.dx}
                    y={off.dy}
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fill: approx ? 'var(--text-secondary)' : 'var(--text-primary)',
                      fontSize: `${18 / zoom}px`,
                      fontWeight: 600,
                      letterSpacing: `${0.8 / zoom}px`,
                      pointerEvents: 'none',
                      textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,1)',
                    }}
                  >
                    {loc.id}{approx ? ' ~' : ''}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>
    </motion.div>
  );
}
