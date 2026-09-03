import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "/india-composite.geojson";

const INDIA_CENTER = [78.9629, 22.5937];
const DEFAULT_ZOOM = 4.2;

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
};

/* =========================================================
   COORDINATE HELPERS
========================================================= */

function isValidCoordinate(coords) {
  if (!Array.isArray(coords) || coords.length < 2) {
    return false;
  }

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);

  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= 60 &&
    lng <= 105 &&
    lat >= 0 &&
    lat <= 40
  );
}

function normalizeCoordinates(coords) {
  return [
    Number(coords[0]),
    Number(coords[1]),
  ];
}

/* =========================================================
   MAP VIEW CALCULATOR
========================================================= */

function calculateMapView(locations) {
  if (!locations || locations.length === 0) {
    return {
      coordinates: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
    };
  }

  const lngs = locations.map(
    (location) => location.coordinates[0]
  );

  const lats = locations.map(
    (location) => location.coordinates[1]
  );

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  const lngSpan = Math.max(maxLng - minLng, 2);
  const latSpan = Math.max(maxLat - minLat, 2);

  const span = Math.max(lngSpan, latSpan);

  let zoom = 4.5;

  if (span < 2.5) {
    zoom = 7.5;
  } else if (span < 5) {
    zoom = 6.5;
  } else if (span < 10) {
    zoom = 5.8;
  } else if (span < 18) {
    zoom = 5.1;
  } else {
    zoom = 4.5;
  }

  return {
    coordinates: [
      centerLng,
      centerLat,
    ],
    zoom,
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function GeoMap({ analysisData }) {
  const navigate = useNavigate();

  const data = analysisData || {
    nodes: [],
    edges: [],
  };

  /* -------------------------------------------------------
     Extract locations
  ------------------------------------------------------- */

  const locations = useMemo(() => {
    const nodes = Array.isArray(data.nodes)
      ? data.nodes
      : [];

    return nodes
      .filter((node) => {
        if (!node) return false;

        const isLocation =
          node.group === "LOC" ||
          node.type === "LOC" ||
          node.entity_type === "LOC";

        return (
          isLocation &&
          isValidCoordinate(node.coordinates)
        );
      })
      .map((node) => ({
        ...node,
        coordinates: normalizeCoordinates(
          node.coordinates
        ),
      }));
  }, [data]);

  /* -------------------------------------------------------
     Stable calculated initial view
     
     IMPORTANT:
     No useEffect + setState loop here.
  ------------------------------------------------------- */

  const calculatedView = useMemo(
    () => calculateMapView(locations),
    [locations]
  );

  const [position, setPosition] = useState(
    calculatedView
  );

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  /* -------------------------------------------------------
     Statistics
  ------------------------------------------------------- */

  const locationStats = useMemo(() => {
    let approximate = 0;

    locations.forEach((location) => {
      if (
        location.approximate === true ||
        location.isApproximate === true
      ) {
        approximate++;
      }
    });

    return {
      total: locations.length,
      exact: locations.length - approximate,
      approximate,
    };
  }, [locations]);

  /* =========================================================
     ENTITY → LOCATION CONNECTIONS
  ========================================================= */

  const connections = useMemo(() => {
    const nodes = Array.isArray(data.nodes)
      ? data.nodes
      : [];

    const edges = Array.isArray(data.edges)
      ? data.edges
      : [];

    const locationIds = new Set(
      locations.map((location) => location.id)
    );

    const paths = [];
    const seen = new Set();

    const people = nodes.filter((node) => {
      return (
        node &&
        (
          node.group === "PERSON" ||
          node.type === "PERSON" ||
          node.entity_type === "PERSON"
        )
      );
    });

    people.forEach((person) => {
      const relatedLocations = [];

      edges.forEach((edge) => {
        if (!edge) return;

        if (
          edge.source === person.id &&
          locationIds.has(edge.target)
        ) {
          relatedLocations.push(edge.target);
        }

        if (
          edge.target === person.id &&
          locationIds.has(edge.source)
        ) {
          relatedLocations.push(edge.source);
        }
      });

      const uniqueLocations = [
        ...new Set(relatedLocations),
      ];

      for (
        let i = 0;
        i < uniqueLocations.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < uniqueLocations.length;
          j++
        ) {
          const locationA = locations.find(
            (location) =>
              location.id === uniqueLocations[i]
          );

          const locationB = locations.find(
            (location) =>
              location.id === uniqueLocations[j]
          );

          if (!locationA || !locationB) {
            continue;
          }

          const key =
            `${person.id}-${locationA.id}-${locationB.id}`;

          if (seen.has(key)) {
            continue;
          }

          seen.add(key);

          paths.push({
            from: locationA.coordinates,
            to: locationB.coordinates,
            person: person.id,
          });
        }
      }
    });

    return paths;
  }, [data, locations]);

  /* =========================================================
     MAP CONTROLS
  ========================================================= */

  const handleMoveEnd = (newPosition) => {
    if (!newPosition) return;

    setPosition({
      coordinates:
        Array.isArray(newPosition.coordinates)
          ? newPosition.coordinates
          : INDIA_CENTER,

      zoom:
        Number.isFinite(newPosition.zoom)
          ? newPosition.zoom
          : DEFAULT_ZOOM,
    });
  };

  const zoomIn = () => {
    setPosition((previous) => ({
      ...previous,
      zoom: Math.min(
        previous.zoom * 1.35,
        12
      ),
    }));
  };

  const zoomOut = () => {
    setPosition((previous) => ({
      ...previous,
      zoom: Math.max(
        previous.zoom / 1.35,
        1.8
      ),
    }));
  };

  const resetView = () => {
    setPosition(calculateMapView(locations));
    setSelectedLocation(null);
  };

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (
    !analysisData ||
    locations.length === 0
  ) {
    const allLocationNodes =
      analysisData?.nodes?.filter(
        (node) =>
          node?.group === "LOC" ||
          node?.type === "LOC" ||
          node?.entity_type === "LOC"
      ) || [];

    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        <motion.div
          className="page-header"
          variants={fadeUp}
        >
          <h1 className="page-title">
            Geo-Spatial Intelligence
          </h1>

          <p className="page-subtitle">
            Geographic intelligence layer for
            extracted locations and movements
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="card"
          style={{
            padding: "70px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              marginBottom: "18px",
            }}
          >
            ◉
          </div>

          <h2
            style={{
              fontFamily:
                "var(--font-heading)",
              color:
                "var(--text-primary)",
              marginBottom: "10px",
            }}
          >
            {analysisData
              ? "No mappable locations detected"
              : "No geo-intelligence available"}
          </h2>

          <p
            style={{
              color:
                "var(--text-secondary)",
              maxWidth: "520px",
              margin:
                "0 auto 26px",
              lineHeight: 1.7,
            }}
          >
            {analysisData
              ? allLocationNodes.length > 0
                ? `Found ${allLocationNodes.length} location node(s), but valid coordinates are unavailable.`
                : "No LOC entities were extracted from the intelligence input."
              : "Run an investigation containing location information to activate the geo-spatial intelligence layer."}
          </p>

          {!analysisData && (
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/ingest")
              }
            >
              ⚡ Run Analysis
            </button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  /* =========================================================
     MAIN MAP
  ========================================================= */

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        className="page-header"
        variants={fadeUp}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-end",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background:
                    "var(--accent-cyan)",
                  boxShadow:
                    "0 0 14px var(--accent-cyan)",
                }}
              />

              <span
                style={{
                  fontSize:
                    "0.72rem",
                  letterSpacing:
                    "2px",
                  fontFamily:
                    "var(--font-heading)",
                  color:
                    "var(--accent-cyan)",
                  textTransform:
                    "uppercase",
                }}
              >
                Live Intelligence Layer
              </span>
            </div>

            <h1 className="page-title">
              Geo-Spatial Intelligence
            </h1>

            <p className="page-subtitle">
              Geographic mapping of extracted
              entities, movements and
              investigation points
            </p>
          </div>

          {/* STATS */}

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <GeoStat
              value={
                locationStats.total
              }
              label="LOCATIONS"
            />

            <GeoStat
              value={
                locationStats.exact
              }
              label="VERIFIED"
            />

            <GeoStat
              value={
                locationStats.approximate
              }
              label="APPROX."
            />

            <GeoStat
              value={
                connections.length
              }
              label="ROUTES"
            />
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          MAP CARD
      ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          position: "relative",
          minHeight:
            "620px",
        }}
      >
        {/* ===================================================
            TOP OVERLAY
        =================================================== */}

        <div
          style={{
            position:
              "absolute",
            top: 18,
            left: 18,
            right: 18,
            zIndex: 20,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            pointerEvents:
              "none",
          }}
        >
          {/* LEGEND */}

          <div
            style={{
              pointerEvents:
                "auto",
              background:
                "rgba(8, 12, 18, 0.92)",
              backdropFilter:
                "blur(12px)",
              border:
                "1px solid var(--border-default)",
              borderRadius:
                "12px",
              padding:
                "14px 16px",
              minWidth:
                "225px",
            }}
          >
            <div
              style={{
                fontSize:
                  "0.68rem",
                color:
                  "var(--text-muted)",
                letterSpacing:
                  "1.5px",
                fontFamily:
                  "var(--font-heading)",
                marginBottom:
                  12,
              }}
            >
              INTELLIGENCE LEGEND
            </div>

            <LegendItem
              type="location"
              label="Extracted Location"
            />

            <LegendItem
              type="route"
              label="Entity Movement"
            />

            <LegendItem
              type="approx"
              label="Approximate Position"
            />
          </div>

          {/* MAP CONTROLS */}

          <div
            style={{
              pointerEvents:
                "auto",
              display: "flex",
              flexDirection:
                "column",
              gap: 6,
            }}
          >
            <MapButton
              onClick={zoomIn}
            >
              +
            </MapButton>

            <MapButton
              onClick={zoomOut}
            >
              −
            </MapButton>

            <MapButton
              onClick={resetView}
            >
              ⌖
            </MapButton>
          </div>
        </div>

        {/* ===================================================
            SELECTED LOCATION
        =================================================== */}

        {selectedLocation && (
          <div
            style={{
              position:
                "absolute",
              left: 18,
              bottom: 18,
              zIndex: 30,
              background:
                "rgba(8, 12, 18, 0.95)",
              backdropFilter:
                "blur(14px)",
              border:
                "1px solid var(--accent-cyan)",
              borderRadius:
                "12px",
              padding:
                "16px 18px",
              minWidth:
                "265px",
              boxShadow:
                "0 12px 45px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                fontSize:
                  "0.65rem",
                color:
                  "var(--accent-cyan)",
                letterSpacing:
                  "1.5px",
                fontFamily:
                  "var(--font-heading)",
                marginBottom:
                  8,
              }}
            >
              SELECTED LOCATION
            </div>

            <div
              style={{
                color:
                  "var(--text-primary)",
                fontFamily:
                  "var(--font-heading)",
                fontSize:
                  "1rem",
                marginBottom:
                  8,
              }}
            >
              {selectedLocation.id}
            </div>

            <div
              style={{
                color:
                  "var(--text-secondary)",
                fontSize:
                  "0.76rem",
                lineHeight:
                  1.7,
              }}
            >
              LAT{" "}
              <strong>
                {selectedLocation
                  .coordinates[1]
                  .toFixed(4)}
              </strong>

              <br />

              LNG{" "}
              <strong>
                {selectedLocation
                  .coordinates[0]
                  .toFixed(4)}
              </strong>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedLocation(
                  null
                )
              }
              style={{
                marginTop: 10,
                border: "none",
                background:
                  "transparent",
                color:
                  "var(--text-muted)",
                cursor:
                  "pointer",
                fontSize:
                  "0.7rem",
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ===================================================
            MAP
        =================================================== */}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 650,
          }}
          style={{
            width: "100%",
            height: "650px",
            background:
              "radial-gradient(circle at 50% 45%, rgba(25,55,70,0.16), transparent 55%)",
          }}
        >
          <ZoomableGroup
            center={
              position.coordinates
            }
            zoom={
              position.zoom
            }
            minZoom={1.8}
            maxZoom={12}
            onMoveEnd={
              handleMoveEnd
            }
          >
            {/* =================================================
                INDIA GEOMETRY
            ================================================= */}

            <Geographies
              geography={geoUrl}
            >
              {({
                geographies,
              }) =>
                geographies.map(
                  (geo) => (
                    <Geography
                      key={
                        geo.rsmKey
                      }
                      geography={
                        geo
                      }
                      fill="rgba(20, 29, 36, 0.96)"
                      stroke="rgba(130, 150, 160, 0.55)"
                      strokeWidth={
                        0.7 /
                        position.zoom
                      }
                      style={{
                        default: {
                          outline:
                            "none",
                        },

                        hover: {
                          fill:
                            "rgba(34, 52, 61, 1)",
                          outline:
                            "none",
                        },

                        pressed: {
                          fill:
                            "rgba(40, 60, 68, 1)",
                          outline:
                            "none",
                        },
                      }}
                    />
                  )
                )
              }
            </Geographies>

            {/* =================================================
                ENTITY MOVEMENT ROUTES
            ================================================= */}

            {connections.map(
              (
                connection,
                index
              ) => (
                <Line
                  key={`${connection.person}-${index}`}
                  from={
                    connection.from
                  }
                  to={
                    connection.to
                  }
                  stroke="rgba(0, 220, 255, 0.48)"
                  strokeWidth={
                    1.4 /
                    position.zoom
                  }
                  strokeLinecap="round"
                  strokeDasharray="5 4"
                  style={{
                    opacity:
                      0.75,
                  }}
                />
              )
            )}

            {/* =================================================
                LOCATION MARKERS
            ================================================= */}

            {locations.map(
              (location) => {
                const approximate =
                  location.approximate ===
                    true ||
                  location.isApproximate ===
                    true;

                const selected =
                  selectedLocation?.id ===
                  location.id;

                return (
                  <Marker
                    key={
                      location.id
                    }
                    coordinates={
                      location.coordinates
                    }
                    onClick={() =>
                      setSelectedLocation(
                        location
                      )
                    }
                  >
                    {/* OUTER RING */}

                    {!approximate && (
                      <circle
                        r={
                          16 /
                          position.zoom
                        }
                        fill="none"
                        stroke="rgba(0,220,255,0.22)"
                        strokeWidth={
                          1.5 /
                          position.zoom
                        }
                      />
                    )}

                    {/* MAIN NODE */}

                    <circle
                      r={
                        7.5 /
                        position.zoom
                      }
                      fill={
                        approximate
                          ? "transparent"
                          : "var(--accent-cyan)"
                      }
                      stroke={
                        approximate
                          ? "rgba(170,180,190,0.9)"
                          : selected
                          ? "#ffffff"
                          : "rgba(0,220,255,0.9)"
                      }
                      strokeWidth={
                        selected
                          ? 2.5 /
                            position.zoom
                          : 1.5 /
                            position.zoom
                      }
                      strokeDasharray={
                        approximate
                          ? `${
                              4 /
                              position.zoom
                            },${
                              3 /
                              position.zoom
                            }`
                          : "none"
                      }
                      style={{
                        cursor:
                          "pointer",
                        filter:
                          "drop-shadow(0 0 5px rgba(0,220,255,0.55))",
                      }}
                    />

                    {/* CORE */}

                    {!approximate && (
                      <circle
                        r={
                          2.2 /
                          position.zoom
                        }
                        fill="#ffffff"
                        pointerEvents="none"
                      />
                    )}

                    {/* LABEL */}

                    <text
                      x={0}
                      y={
                        -18 /
                        position.zoom
                      }
                      textAnchor="middle"
                      pointerEvents="none"
                      style={{
                        fill:
                          "var(--text-primary)",
                        fontFamily:
                          "var(--font-heading)",
                        fontSize:
                          `${
                            11 /
                            Math.sqrt(
                              position.zoom
                            )
                          }px`,
                        fontWeight: 600,
                        letterSpacing:
                          `${
                            0.7 /
                            position.zoom
                          }px`,
                        paintOrder:
                          "stroke",
                        stroke:
                          "rgba(5,9,13,0.95)",
                        strokeWidth:
                          `${
                            3 /
                            position.zoom
                          }px`,
                        strokeLinecap:
                          "round",
                        strokeLinejoin:
                          "round",
                      }}
                    >
                      {location.id}
                    </text>
                  </Marker>
                );
              }
            )}
          </ZoomableGroup>
        </ComposableMap>

        {/* ===================================================
            BOTTOM STATUS
        =================================================== */}

        <div
          style={{
            position:
              "absolute",
            left: 18,
            right: 18,
            bottom: 18,
            zIndex: 10,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 15,
            flexWrap: "wrap",
            pointerEvents:
              "none",
          }}
        >
          <div
            style={{
              background:
                "rgba(8,12,18,0.88)",
              backdropFilter:
                "blur(10px)",
              border:
                "1px solid var(--border-default)",
              borderRadius:
                "9px",
              padding:
                "9px 13px",
              fontSize:
                "0.68rem",
              color:
                "var(--text-secondary)",
              fontFamily:
                "var(--font-heading)",
            }}
          >
            MAP STATUS{" "}
            <span
              style={{
                color:
                  "var(--accent-cyan)",
              }}
            >
              ● LIVE
            </span>
          </div>

          <div
            style={{
              background:
                "rgba(8,12,18,0.88)",
              backdropFilter:
                "blur(10px)",
              border:
                "1px solid var(--border-default)",
              borderRadius:
                "9px",
              padding:
                "9px 13px",
              fontSize:
                "0.68rem",
              color:
                "var(--text-muted)",
              fontFamily:
                "var(--font-heading)",
            }}
          >
            ZOOM{" "}
            {position.zoom.toFixed(
              1
            )}
            ×
          </div>
        </div>

        {/* ===================================================
            LOCAL STYLES
        =================================================== */}

        <style>{`
          .geo-stat {
            min-width: 82px;
            padding: 10px 13px;
            border: 1px solid var(--border-default);
            background: var(--bg-card);
            border-radius: 9px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .geo-stat span {
            color: var(--text-primary);
            font-family: var(--font-heading);
            font-size: 1.05rem;
            line-height: 1;
          }

          .geo-stat small {
            color: var(--text-muted);
            font-size: 0.58rem;
            letter-spacing: 1px;
            font-family: var(--font-heading);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   GEO STAT
========================================================= */

function GeoStat({
  value,
  label,
}) {
  return (
    <div className="geo-stat">
      <span>{value}</span>

      <small>{label}</small>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function LegendItem({
  type,
  label,
}) {
  let visual = null;

  if (type === "location") {
    visual = (
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background:
            "var(--accent-cyan)",
          boxShadow:
            "0 0 8px rgba(0,220,255,0.7)",
        }}
      />
    );
  }

  if (type === "route") {
    visual = (
      <span
        style={{
          width: 20,
          height: 0,
          borderTop:
            "1px dashed rgba(0,220,255,0.7)",
        }}
      />
    );
  }

  if (type === "approx") {
    visual = (
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          border:
            "1.5px dashed rgba(170,180,190,0.9)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 9,
        marginBottom: 8,
      }}
    >
      {visual}

      <span
        style={{
          fontSize:
            "0.68rem",
          color:
            "var(--text-secondary)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   MAP BUTTON
========================================================= */

function MapButton({
  children,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border:
          "1px solid var(--border-default)",
        background:
          "rgba(8,12,18,0.92)",
        backdropFilter:
          "blur(10px)",
        color:
          "var(--text-primary)",
        cursor:
          "pointer",
        fontFamily:
          "var(--font-heading)",
        fontSize:
          "1rem",
        transition:
          "all 0.2s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor =
          "var(--accent-cyan)";

        event.currentTarget.style.color =
          "var(--accent-cyan)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor =
          "var(--border-default)";

        event.currentTarget.style.color =
          "var(--text-primary)";
      }}
    >
      {children}
    </button>
  );
}