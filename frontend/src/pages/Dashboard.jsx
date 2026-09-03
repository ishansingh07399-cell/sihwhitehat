import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  HiOutlineUserGroup,
  HiOutlineExclamation,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlinePhone,
  HiOutlineCreditCard,
} from 'react-icons/hi';


// =========================================================
// THEME-AWARE COLORS
// =========================================================
// These use your existing CSS variables wherever possible.
// This is what fixes the dark-mode issue.
// =========================================================

const C = {
  bg: 'var(--bg-primary, #f6f8fb)',
  surface: 'var(--bg-secondary, #ffffff)',
  surfaceAlt: 'var(--bg-tertiary, #f8fafc)',

  text: 'var(--text-primary, #172033)',
  textSecondary: 'var(--text-secondary, #667085)',
  textMuted: 'var(--text-muted, #98a2b3)',

  border: 'var(--border-default, #e4e9f0)',

  blue: 'var(--accent-blue, #2563eb)',
  cyan: 'var(--accent-cyan, #0891b2)',
  green: 'var(--accent-green, #16a34a)',
  orange: 'var(--accent-orange, #d97706)',
  red: 'var(--accent-red, #dc2626)',
};


// =========================================================
// ACTIVITY FEED
// =========================================================

function buildActivityFeed(data) {
  const feed = [];

  const fmt = (min) => `${min} min ago`;

  if (data.alerts?.smurfing?.length > 0) {
    feed.push({
      text: `Smurfing pattern detected`,
      subtext: data.alerts.smurfing.join(', '),
      color: 'danger',
      icon: '!',
      time: fmt(2),
    });
  }

  const personCount =
    data.metrics?.filter(
      (m) => m.category === 'PERSON'
    ).length || 0;

  const orgCount =
    data.metrics?.filter(
      (m) => m.category === 'ORG'
    ).length || 0;

  if (data.summary?.total_entities > 0) {
    feed.push({
      text: `${data.summary.total_entities} entities extracted`,
      subtext: `${personCount} persons · ${orgCount} organizations`,
      color: 'blue',
      icon: '◉',
      time: fmt(3),
    });
  }

  if (
    data.nodes?.some(
      (n) => n.group === 'PHONE'
    )
  ) {
    const phoneCount = data.nodes.filter(
      (n) => n.group === 'PHONE'
    ).length;

    feed.push({
      text: 'CDR data processed',
      subtext: `${phoneCount} phone entities identified`,
      color: 'cyan',
      icon: '⌕',
      time: fmt(4),
    });
  }

  if (
    data.nodes?.some(
      (n) => n.group === 'ACCOUNT'
    )
  ) {
    const accountCount = data.nodes.filter(
      (n) => n.group === 'ACCOUNT'
    ).length;

    feed.push({
      text: 'Financial records processed',
      subtext: `${accountCount} accounts mapped`,
      color: 'orange',
      icon: '₹',
      time: fmt(5),
    });
  }

  if (data.summary?.total_edges > 0) {
    feed.push({
      text: 'Network graph constructed',
      subtext: `${data.summary.total_edges} relationships mapped`,
      color: 'green',
      icon: '↗',
      time: fmt(4),
    });
  }

  if (data.alerts?.primary_suspect) {
    feed.push({
      text: 'Primary suspect identified',
      subtext: data.alerts.primary_suspect,
      color: 'orange',
      icon: '!',
      time: fmt(3),
    });
  }

  if (data.ipc_sections?.length > 0) {
    feed.push({
      text: 'Legal analysis completed',
      subtext: `${data.ipc_sections.length} potential sections flagged`,
      color: 'danger',
      icon: '§',
      time: fmt(1),
    });
  }

  if (data.communities?.length > 0) {
    feed.push({
      text: 'Criminal network clusters detected',
      subtext: `${data.communities.length} distinct sub-networks`,
      color: 'green',
      icon: '◎',
      time: fmt(1),
    });
  }

  feed.push({
    text: 'Network centrality analysis completed',
    subtext: 'PageRank & Betweenness calculated',
    color: 'blue',
    icon: '◆',
    time: fmt(4),
  });

  return feed.slice(0, 8);
}


// =========================================================
// ANIMATION
// =========================================================

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 12,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  children,
  type = 'success',
}) {
  const config = {
    success: {
      background: 'rgba(22,163,74,0.10)',
      color: C.green,
      border: 'rgba(22,163,74,0.25)',
    },

    danger: {
      background: 'rgba(220,38,38,0.10)',
      color: C.red,
      border: 'rgba(220,38,38,0.25)',
    },

    warning: {
      background: 'rgba(217,119,6,0.10)',
      color: C.orange,
      border: 'rgba(217,119,6,0.25)',
    },

    blue: {
      background: 'rgba(37,99,235,0.10)',
      color: C.blue,
      border: 'rgba(37,99,235,0.25)',
    },
  };

  const style = config[type] || config.success;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 9px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.3px',
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.color,
        }}
      />

      {children}
    </span>
  );
}


// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 15,
        marginBottom: 17,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              margin: '5px 0 0',
              fontSize: 11.5,
              color: C.textSecondary,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}


// =========================================================
// NETWORK PREVIEW
// =========================================================

function NetworkPreview({
  data,
  navigate,
}) {
  const nodes = data.nodes?.slice(0, 16) || [];
  const edges = data.edges?.slice(0, 20) || [];

  const positions = [
    [50, 50],
    [22, 25],
    [78, 24],
    [18, 70],
    [80, 70],
    [38, 20],
    [63, 20],
    [35, 78],
    [65, 78],
    [12, 48],
    [88, 48],
    [50, 15],
    [50, 88],
    [30, 48],
    [70, 48],
    [50, 50],
  ];

  const getColor = (group) => {
    switch (group) {
      case 'PERSON':
        return C.blue;

      case 'ORG':
        return '#7C3AED';

      case 'PHONE':
        return C.cyan;

      case 'ACCOUNT':
        return C.orange;

      case 'LOC':
        return C.green;

      default:
        return C.textMuted;
    }
  };

  const nodeIndex = {};

  nodes.forEach((node, index) => {
    nodeIndex[node.id] = index;
  });

  return (
    <div
      onClick={() => navigate('/network')}
      style={{
        height: 380,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 13,
        cursor: 'pointer',

        background:
          'var(--network-preview-bg, radial-gradient(circle at center, rgba(37,99,235,0.05), transparent 65%), var(--bg-tertiary, #f7f9fc))',

        border:
          '1px solid var(--border-default, #e4e9f0)',
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,

          backgroundImage: `
            linear-gradient(
              var(--network-grid-color, rgba(100,116,139,0.08)) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              var(--network-grid-color, rgba(100,116,139,0.08)) 1px,
              transparent 1px
            )
          `,

          backgroundSize: '38px 38px',
        }}
      />

      {/* Center glow */}
      <div
        style={{
          position: 'absolute',
          width: 230,
          height: 230,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.09), transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {edges.map((edge, index) => {
          const sourceIndex =
            nodeIndex[edge.source];

          const targetIndex =
            nodeIndex[edge.target];

          if (
            sourceIndex === undefined ||
            targetIndex === undefined
          ) {
            return null;
          }

          const source =
            positions[
              sourceIndex % positions.length
            ];

          const target =
            positions[
              targetIndex % positions.length
            ];

          return (
            <line
              key={`edge-${index}`}
              x1={source[0]}
              y1={source[1]}
              x2={target[0]}
              y2={target[1]}
              stroke="var(--network-line-color, #AFC1D6)"
              strokeWidth="0.35"
              opacity="0.65"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, index) => {
        const position =
          positions[index % positions.length];

        const nodeSize = Math.max(
          18,
          Math.min(34, Number(node.size) / 2 || 20)
        );

        const color = getColor(node.group);

        return (
          <motion.div
            key={node.id}
            initial={{
              opacity: 0,
              scale: 0.6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: index * 0.035,
              duration: 0.3,
            }}
            style={{
              position: 'absolute',
              left: `${position[0]}%`,
              top: `${position[1]}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              title={`${node.label || node.id} • ${node.group}`}
              style={{
                width: nodeSize,
                height: nodeSize,

                borderRadius:
                  node.group === 'PERSON'
                    ? '50%'
                    : 7,

                background:
                  'var(--network-node-bg, #ffffff)',

                border: `2px solid ${color}`,

                boxShadow:
                  `0 3px 12px ${color}35`,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: color,
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          bottom: 13,

          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,

          padding: '7px 10px',

          borderRadius: 8,

          background:
            'var(--network-legend-bg, rgba(255,255,255,0.92))',

          border:
            '1px solid var(--border-default, #e2e8f0)',

          backdropFilter: 'blur(8px)',
        }}
      >
        {[
          [C.blue, 'Person'],
          ['#7C3AED', 'Organization'],
          [C.cyan, 'Phone'],
          [C.orange, 'Account'],
          [C.green, 'Location'],
        ].map(([color, label]) => (
          <span
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: C.textSecondary,
              fontSize: 9.5,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
              }}
            />

            {label}
          </span>
        ))}
      </div>

      {/* Explore button */}
      <div
        style={{
          position: 'absolute',
          right: 14,
          bottom: 13,

          padding: '7px 10px',

          borderRadius: 7,

          background:
            'var(--network-action-bg, #ffffff)',

          border:
            '1px solid var(--border-default, #dce5ef)',

          color: C.blue,

          fontSize: 10.5,
          fontWeight: 650,
        }}
      >
        Explore network →
      </div>
    </div>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyDashboard({ navigate }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 120px)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '30px 20px',

        background: C.bg,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1050,

          background: C.surface,

          border:
            `1px solid ${C.border}`,

          borderRadius: 18,

          overflow: 'hidden',

          boxShadow:
            'var(--dashboard-shadow, 0 8px 30px rgba(15,23,42,0.06))',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 36px',

            borderBottom:
              `1px solid ${C.border}`,

            background:
              'var(--dashboard-header-bg, rgba(255,255,255,0.5))',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 750,
              color: C.blue,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Investigation Workspace
          </div>

          <h1
            style={{
              margin: 0,
              color: C.text,
              fontSize: 29,
              fontWeight: 750,
              letterSpacing: '-0.7px',
            }}
          >
            Command Center
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: C.textSecondary,
              fontSize: 13.5,
            }}
          >
            Start an investigation by adding intelligence sources.
          </p>
        </div>

        {/* Sources */}
        <div
          style={{
            padding: 36,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 15,
              marginBottom: 28,
            }}
          >
            {[
              {
                icon: <HiOutlineDocumentText />,
                title: 'FIR Intelligence',
                description:
                  'Extract people, locations, organizations and offences.',
              },

              {
                icon: <HiOutlinePhone />,
                title: 'CDR Records',
                description:
                  'Map communication patterns and relationships.',
              },

              {
                icon: <HiOutlineCreditCard />,
                title: 'Financial Records',
                description:
                  'Identify suspicious transactions and financial networks.',
              },
            ].map((source) => (
              <div
                key={source.title}
                style={{
                  padding: 20,

                  background:
                    'var(--card-secondary-bg, rgba(127,127,127,0.035))',

                  border:
                    `1px solid ${C.border}`,

                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    background:
                      'rgba(37,99,235,0.10)',

                    color: C.blue,

                    fontSize: 19,

                    marginBottom: 14,
                  }}
                >
                  {source.icon}
                </div>

                <div
                  style={{
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {source.title}
                </div>

                <div
                  style={{
                    color: C.textSecondary,
                    fontSize: 11.5,
                    lineHeight: 1.55,
                  }}
                >
                  {source.description}
                </div>
              </div>
            ))}
          </div>

          {/* Start action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,

              padding: '18px 20px',

              borderRadius: 12,

              background:
                'rgba(37,99,235,0.06)',

              border:
                '1px solid rgba(37,99,235,0.15)',
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Ready to begin?
              </div>

              <div
                style={{
                  color: C.textSecondary,
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                Upload intelligence data to generate the investigation network.
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/ingest')}
              style={{
                border: 0,
                borderRadius: 8,

                padding: '11px 17px',

                background: C.blue,
                color: '#ffffff',

                fontWeight: 700,
                fontSize: 12,

                cursor: 'pointer',

                boxShadow:
                  '0 5px 14px rgba(37,99,235,0.20)',

                whiteSpace: 'nowrap',
              }}
            >
              Start Investigation →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


// =========================================================
// MAIN DASHBOARD
// =========================================================

export default function Dashboard({
  analysisData,
}) {
  const navigate = useNavigate();

  // -------------------------------------------------------
  // NO ANALYSIS
  // -------------------------------------------------------

  if (!analysisData) {
    return (
      <EmptyDashboard
        navigate={navigate}
      />
    );
  }

  // -------------------------------------------------------
  // DATA
  // -------------------------------------------------------

  const data = analysisData;

  const summary = data.summary || {};

  const activityFeed =
    buildActivityFeed(data);

  // -------------------------------------------------------
  // KPI DATA
  // -------------------------------------------------------

  const kpis = [
    {
      label: 'Entities',
      value: summary.total_entities || 0,
      icon: <HiOutlineUserGroup />,
      color: C.blue,
      background:
        'rgba(37,99,235,0.10)',
    },

    {
      label: 'Connections',
      value: summary.total_edges || 0,
      icon: <HiOutlineGlobe />,
      color: C.cyan,
      background:
        'rgba(8,145,178,0.10)',
    },

    {
      label: 'Alerts',
      value: summary.alerts_count || 0,
      icon: <HiOutlineExclamation />,
      color: C.red,
      background:
        'rgba(220,38,38,0.10)',
    },

    {
      label: 'Networks',
      value: summary.networks_mapped || 0,
      icon: <HiOutlineLightningBolt />,
      color: '#7C3AED',
      background:
        'rgba(124,58,237,0.10)',
    },
  ];

  // -------------------------------------------------------
  // TOP SUSPECTS
  // -------------------------------------------------------

  const topSuspects = (
    data.metrics || []
  )
    .filter(
      (metric) =>
        metric.category === 'PERSON'
    )
    .sort(
      (a, b) =>
        (b.influence || 0) -
        (a.influence || 0)
    )
    .slice(0, 5);

  // -------------------------------------------------------
  // RISK
  // -------------------------------------------------------

  const alertsCount =
    Number(summary.alerts_count) || 0;

  const totalEntities =
    Number(summary.total_entities) || 1;

  const riskScore = Math.min(
    100,
    Math.round(
      (alertsCount / totalEntities) *
        100
    )
  );

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        width: '100%',
        maxWidth: 1500,
        margin: '0 auto',
        padding: '0 0 40px',
        color: C.text,
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 20,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: C.green,
                boxShadow:
                  '0 0 0 4px rgba(22,163,74,0.12)',
              }}
            />

            <span
              style={{
                fontSize: 10,
                fontWeight: 750,
                color: C.green,
                letterSpacing: '0.7px',
              }}
            >
              ANALYSIS ACTIVE
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 29,
              fontWeight: 750,
              color: C.text,
              letterSpacing: '-0.7px',
            }}
          >
            Investigation Overview
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: C.textSecondary,
              fontSize: 13,
            }}
          >
            Intelligence summary and relationship analysis
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <StatusBadge>
            ANALYSIS COMPLETE
          </StatusBadge>

          <button
            type="button"
            onClick={() =>
              navigate('/export')
            }
            style={{
              display: 'flex',
              alignItems: 'center',

              border:
                `1px solid ${C.border}`,

              background: C.surface,
              color: C.text,

              padding: '9px 13px',

              borderRadius: 8,

              cursor: 'pointer',

              fontWeight: 650,
              fontSize: 11.5,
            }}
          >
            <HiOutlineDocumentText
              style={{
                fontSize: 16,
                marginRight: 6,
              }}
            />

            Export Dossier
          </button>
        </div>
      </motion.div>


      {/* =================================================
          KPIs
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap: 13,
          marginBottom: 17,
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: C.surface,
              border:
                `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '17px 18px',

              boxShadow:
                'var(--card-shadow, 0 3px 12px rgba(15,23,42,0.025))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  width: 37,
                  height: 37,
                  borderRadius: 9,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  background: kpi.background,
                  color: kpi.color,

                  fontSize: 19,
                }}
              >
                {kpi.icon}
              </div>

              <HiOutlineArrowRight
                style={{
                  color: C.textMuted,
                  fontSize: 14,
                }}
              />
            </div>

            <div
              style={{
                color: C.text,
                fontSize: 24,
                lineHeight: 1,
                fontWeight: 750,
                marginBottom: 7,
              }}
            >
              {Number(
                kpi.value
              ).toLocaleString()}
            </div>

            <div
              style={{
                color: C.textSecondary,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {kpi.label}
            </div>
          </div>
        ))}
      </motion.div>


      {/* =================================================
          NETWORK + ACTIVITY
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.65fr) minmax(300px, 0.75fr)',
          gap: 17,
          marginBottom: 17,
        }}
      >

        {/* NETWORK */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
            boxShadow:
              'var(--card-shadow, 0 3px 12px rgba(15,23,42,0.025))',
          }}
        >
          <SectionHeader
            title="Relationship Network"
            subtitle="Visual representation of detected entities and connections"
            action={
              <button
                type="button"
                onClick={() =>
                  navigate('/network')
                }
                style={{
                  border:
                    `1px solid ${C.border}`,

                  background:
                    'rgba(37,99,235,0.07)',

                  color: C.blue,

                  padding: '7px 10px',

                  borderRadius: 7,

                  fontSize: 10.5,
                  fontWeight: 650,

                  cursor: 'pointer',
                }}
              >
                Open Network Analysis →
              </button>
            }
          />

          <NetworkPreview
            data={data}
            navigate={navigate}
          />
        </div>


        {/* ACTIVITY */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
          }}
        >
          <SectionHeader
            title="Investigation Activity"
            subtitle="Latest intelligence events"
          />

          <div>
            {activityFeed.map(
              (item, index) => {
                const colorMap = {
                  blue: C.blue,
                  cyan: C.cyan,
                  green: C.green,
                  orange: C.orange,
                  danger: C.red,
                };

                const color =
                  colorMap[item.color] ||
                  C.textSecondary;

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '10px 0',

                      borderBottom:
                        index <
                        activityFeed.length - 1
                          ? `1px solid ${C.border}`
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 27,
                        height: 27,
                        flexShrink: 0,

                        borderRadius: 7,

                        background:
                          `${color}15`,

                        color,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color: C.text,
                          fontWeight: 650,
                          fontSize: 11.5,
                          lineHeight: 1.35,
                        }}
                      >
                        {item.text}
                      </div>

                      {item.subtext && (
                        <div
                          style={{
                            color: C.textSecondary,
                            fontSize: 9.8,
                            marginTop: 3,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.subtext}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        color: C.textMuted,
                        fontSize: 9,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </motion.div>


      {/* =================================================
          RISK / CLUSTERS / STATUS
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1.1fr 1fr 0.75fr',
          gap: 17,
          marginBottom: 17,
        }}
      >

        {/* RISK */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
          }}
        >
          <SectionHeader
            title="Risk Assessment"
            subtitle="Current investigation risk profile"
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              paddingTop: 8,
            }}
          >
            <div
              style={{
                width: 105,
                height: 105,
                flexShrink: 0,

                borderRadius: '50%',

                background: `
                  conic-gradient(
                    ${C.red} ${riskScore}%,
                    rgba(127,127,127,0.15) ${riskScore}% 100%
                  )
                `,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 81,
                  height: 81,
                  borderRadius: '50%',

                  background: C.surface,

                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: C.text,
                    fontSize: 24,
                    fontWeight: 750,
                  }}
                >
                  {riskScore}
                </span>

                <span
                  style={{
                    color: C.textMuted,
                    fontSize: 8,
                    fontWeight: 700,
                  }}
                >
                  RISK INDEX
                </span>
              </div>
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              {[
                [
                  'High priority alerts',
                  C.red,
                  alertsCount,
                ],

                [
                  'Active networks',
                  '#7C3AED',
                  summary.networks_mapped || 0,
                ],

                [
                  'Total connections',
                  C.blue,
                  summary.total_edges || 0,
                ],
              ].map(
                ([label, color, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',

                      marginBottom: 11,

                      fontSize: 10.5,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: C.textSecondary,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: color,
                        }}
                      />

                      {label}
                    </span>

                    <strong
                      style={{
                        color: C.text,
                      }}
                    >
                      {Number(
                        value
                      ).toLocaleString()}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        </div>


        {/* CLUSTERS */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
          }}
        >
          <SectionHeader
            title="Network Clusters"
            subtitle="Potential criminal syndicates"
          />

          {data.communities?.length > 0 ? (
            <div>
              {data.communities
                .slice(0, 4)
                .map((community, index) => (
                  <div
                    key={community.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,

                      padding: '9px 0',

                      borderBottom:
                        index <
                        Math.min(
                          data.communities.length,
                          4
                        ) - 1
                          ? `1px solid ${C.border}`
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 31,
                        height: 31,

                        borderRadius: 8,

                        background:
                          index === 0
                            ? 'rgba(220,38,38,0.10)'
                            : 'rgba(124,58,237,0.10)',

                        color:
                          index === 0
                            ? C.red
                            : '#7C3AED',

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        fontSize: 10,
                        fontWeight: 750,
                      }}
                    >
                      C{community.id}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color: C.text,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        Cluster #{community.id}
                      </div>

                      <div
                        style={{
                          color: C.textSecondary,
                          fontSize: 9.5,
                          marginTop: 3,

                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {community.members?.length ||
                          0}{' '}
                        linked entities
                      </div>
                    </div>

                    <span
                      style={{
                        color:
                          index === 0
                            ? C.red
                            : '#7C3AED',

                        fontSize: 10,
                        fontWeight: 750,
                      }}
                    >
                      →
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div
              style={{
                padding: '30px 10px',
                textAlign: 'center',
                color: C.textSecondary,
                fontSize: 11,
              }}
            >
              No isolated communities detected.
            </div>
          )}
        </div>


        {/* STATUS */}

        <div
          style={{
            background:
              'var(--status-card-bg, #172033)',

            borderRadius: 14,

            padding: 19,

            color:
              'var(--status-card-text, #ffffff)',

            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 750,
              letterSpacing: '0.8px',
              opacity: 0.65,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Analysis Status
          </div>

          <div
            style={{
              fontSize: 21,
              fontWeight: 750,
              marginBottom: 5,
            }}
          >
            Complete
          </div>

          <div
            style={{
              color:
                'var(--status-card-muted, #AEB8C8)',

              fontSize: 10,
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            All available intelligence has been processed.
          </div>

          <div
            style={{
              height: 5,
              borderRadius: 20,

              background:
                'rgba(255,255,255,0.12)',

              overflow: 'hidden',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',

                background:
                  'var(--status-progress, #4ade80)',

                borderRadius: 20,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',

              color:
                'var(--status-card-muted, #AEB8C8)',

              fontSize: 9,
            }}
          >
            <span>Processing</span>
            <span>100%</span>
          </div>
        </div>
      </motion.div>


      {/* =================================================
          LEGAL + TOP ENTITIES
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1.15fr 1fr',
          gap: 17,
          marginBottom: 17,
        }}
      >

        {/* LEGAL ANALYSIS */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
          }}
        >
          <SectionHeader
            title="Legal Analysis"
            subtitle="Potential IPC violations identified from current intelligence"
            action={
              <HiOutlineShieldCheck
                style={{
                  color: C.blue,
                  fontSize: 20,
                }}
              />
            }
          />

          {data.ipc_sections?.length > 0 ? (
            <div>
              {data.ipc_sections
                .slice(0, 4)
                .map((ipc, index) => {
                  const match =
                    ipc.reason?.match(
                      /Confidence:\s*([\d.]+)%/
                    );

                  const confidence =
                    match
                      ? parseFloat(
                          match[1]
                        )
                      : 0;

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px 0',

                        borderBottom:
                          index <
                          Math.min(
                            data.ipc_sections.length,
                            4
                          ) - 1
                            ? `1px solid ${C.border}`
                            : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          gap: 12,
                          marginBottom: 7,
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              display:
                                'inline-block',

                              padding:
                                '3px 6px',

                              marginRight: 7,

                              borderRadius: 4,

                              background:
                                'rgba(37,99,235,0.10)',

                              color: C.blue,

                              fontSize: 9,
                              fontWeight: 750,
                            }}
                          >
                            {ipc.section}
                          </span>

                          <span
                            style={{
                              color: C.text,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {ipc.description}
                          </span>
                        </div>

                        {confidence > 0 && (
                          <span
                            style={{
                              color:
                                confidence >= 70
                                  ? C.red
                                  : C.orange,

                              fontSize: 10,
                              fontWeight: 750,
                            }}
                          >
                            {confidence.toFixed(
                              0
                            )}
                            %
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          color: C.textSecondary,
                          fontSize: 9.8,
                          lineHeight: 1.5,
                          marginBottom:
                            confidence > 0
                              ? 8
                              : 0,
                        }}
                      >
                        {ipc.reason}
                      </div>

                      {confidence > 0 && (
                        <div
                          style={{
                            height: 4,
                            borderRadius: 10,

                            background:
                              'rgba(127,127,127,0.15)',

                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                confidence
                              )}%`,

                              height: '100%',

                              background:
                                confidence >= 70
                                  ? C.red
                                  : C.orange,

                              borderRadius: 10,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: C.textSecondary,
                fontSize: 11,
              }}
            >
              No specific IPC sections flagged based on current intelligence.
            </div>
          )}
        </div>


        {/* TOP ENTITIES */}

        <div
          style={{
            background: C.surface,
            border:
              `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 19,
          }}
        >
          <SectionHeader
            title="Priority Entities"
            subtitle="Individuals ranked by network influence"
          />

          {topSuspects.length > 0 ? (
            <div>
              {topSuspects.map(
                (row, index) => (
                  <div
                    key={row.entity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,

                      padding: '11px 0',

                      borderBottom:
                        index <
                        topSuspects.length - 1
                          ? `1px solid ${C.border}`
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 27,
                        height: 27,
                        flexShrink: 0,

                        borderRadius: '50%',

                        background:
                          index === 0
                            ? 'rgba(220,38,38,0.10)'
                            : 'rgba(127,127,127,0.10)',

                        color:
                          index === 0
                            ? C.red
                            : C.textSecondary,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        fontSize: 10,
                        fontWeight: 750,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color: C.text,
                          fontSize: 11.5,
                          fontWeight: 700,

                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {row.entity}
                      </div>

                      <div
                        style={{
                          color: C.textSecondary,
                          fontSize: 9.5,
                          marginTop: 3,
                        }}
                      >
                        {row.connections || 0}{' '}
                        connections
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <div
                        style={{
                          color:
                            index === 0
                              ? C.red
                              : C.blue,

                          fontWeight: 750,
                          fontSize: 11.5,
                        }}
                      >
                        {Number(
                          row.influence || 0
                        ).toFixed(3)}
                      </div>

                      <div
                        style={{
                          color: C.textMuted,
                          fontSize: 8.5,
                          marginTop: 2,
                        }}
                      >
                        influence
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: C.textSecondary,
                fontSize: 11,
              }}
            >
              No person entities available.
            </div>
          )}
        </div>
      </motion.div>


      {/* =================================================
          AUDIT LOG
      ================================================= */}

      <motion.div
        variants={fadeUp}
        style={{
          background: C.surface,
          border:
            `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '17px 19px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            borderBottom:
              `1px solid ${C.border}`,
          }}
        >
          <div>
            <div
              style={{
                color: C.text,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              System Audit Trail
            </div>

            <div
              style={{
                color: C.textSecondary,
                fontSize: 10.5,
                marginTop: 3,
              }}
            >
              Traceable record of investigation activity
            </div>
          </div>

          <StatusBadge>
            LIVE
          </StatusBadge>
        </div>

        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 11,
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    'var(--table-header-bg, rgba(127,127,127,0.045))',
                }}
              >
                {[
                  'Timestamp',
                  'User',
                  'Action / Event',
                  'Status',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: 'left',
                      padding:
                        '10px 19px',

                      color:
                        C.textSecondary,

                      fontSize: 9,
                      fontWeight: 750,

                      textTransform:
                        'uppercase',

                      letterSpacing:
                        '0.5px',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                [
                  new Date(),
                  'UP-4092',
                  'FIR Analysis Executed',
                  'Success',
                ],

                [
                  new Date(
                    Date.now() -
                      300000
                  ),
                  'UP-4092',
                  'Dossier PDF Export',
                  'Success',
                ],

                [
                  new Date(
                    Date.now() -
                      900000
                  ),
                  'UP-4092',
                  'User Login',
                  'Success',
                ],

                [
                  new Date(
                    Date.now() -
                      910000
                  ),
                  'UNKNOWN',
                  'Unauthorized IP Access',
                  'Blocked',
                ],
              ].map(
                (row, index) => (
                  <tr
                    key={index}
                    style={{
                      borderTop:
                        `1px solid ${C.border}`,
                    }}
                  >
                    <td
                      style={{
                        padding:
                          '12px 19px',

                        color:
                          C.textSecondary,

                        fontFamily:
                          'monospace',

                        fontSize: 9.5,
                      }}
                    >
                      {row[0]
                        .toISOString()
                        .slice(
                          0,
                          19
                        )
                        .replace(
                          'T',
                          ' '
                        )}
                    </td>

                    <td
                      style={{
                        padding:
                          '12px 19px',

                        color: C.text,
                        fontWeight: 600,
                      }}
                    >
                      {row[1]}
                    </td>

                    <td
                      style={{
                        padding:
                          '12px 19px',

                        color: C.text,
                        fontWeight: 600,
                      }}
                    >
                      {row[2]}
                    </td>

                    <td
                      style={{
                        padding:
                          '12px 19px',
                      }}
                    >
                      <span
                        style={{
                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          gap: 5,

                          color:
                            row[3] ===
                            'Blocked'
                              ? C.red
                              : C.green,

                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius:
                              '50%',

                            background:
                              row[3] ===
                              'Blocked'
                                ? C.red
                                : C.green,
                          }}
                        />

                        {row[3]}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}