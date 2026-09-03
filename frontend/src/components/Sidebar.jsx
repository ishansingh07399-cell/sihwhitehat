import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  HiOutlineViewGrid,
  HiOutlineCloudUpload,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineShieldExclamation,
  HiOutlineDocumentDownload,
  HiOutlineMap,
  HiOutlineClock
} from 'react-icons/hi';

import {
  Play,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';


const navItems = [

  {
    to: '/',
    icon: HiOutlineViewGrid,
    label: 'Dashboard',
    id: 'tour-sidebar-dash'
  },

  {
    to: '/ingest',
    icon: HiOutlineCloudUpload,
    label: 'Data Ingestion',
    id: 'tour-sidebar-ingest'
  },

  {
    to: '/network',
    icon: HiOutlineGlobe,
    label: 'Network Analysis',
    id: 'tour-sidebar-network'
  },

  {
    to: '/map',
    icon: HiOutlineMap,
    label: 'Geo-Spatial Map'
  },

  {
    to: '/entities',
    icon: HiOutlineUserGroup,
    label: 'Entity Intel'
  },

  {
    to: '/timeline',
    icon: HiOutlineClock,
    label: 'Temporal Timeline'
  },

  {
    to: '/patterns',
    icon: HiOutlineShieldExclamation,
    label: 'Pattern Detection'
  },

  {
    to: '/export',
    icon: HiOutlineDocumentDownload,
    label: 'Case Export'
  },

];


export default function Sidebar({
  isOpen,
  setIsOpen,
  theme,
  toggleTheme
}) {

  const [collapsed, setCollapsed] = useState(false);


  return (

    <aside
      className={`sidebar ${isOpen ? 'open' : ''} ${
        collapsed ? 'collapsed' : ''
      }`}

      style={{
        width: collapsed ? '76px' : '250px',
        transition: 'width 0.25s ease',
        overflow: 'visible'
      }}
    >


      {/* =====================================================
          BRAND
      ====================================================== */}

      <div
        className="sidebar-brand"

        style={{
          justifyContent: collapsed
            ? 'center'
            : 'space-between',

          transition: 'all 0.25s ease'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0
          }}
        >

          <div
            className="sidebar-brand-icon"
            style={{
              flexShrink: 0
            }}
            title={
              collapsed
                ? 'Criminal Network Intel System'
                : ''
            }
          >

            <ShieldCheck
              size={24}
              strokeWidth={2.5}
            />

          </div>


          {!collapsed && (

            <div
              className="sidebar-brand-text"
              style={{
                whiteSpace: 'nowrap'
              }}
            >
              Criminal Network
              <br />
              Intel System
            </div>

          )}

        </div>


        {/* Mobile Close */}

        <button

          className="mobile-close-btn"

          style={{
            display: isOpen
              ? 'block'
              : 'none',

            background: 'none',

            border: 'none',

            color:
              'var(--text-secondary)',

            fontSize: '1.2rem',

            cursor: 'pointer'
          }}

          onClick={() =>
            setIsOpen &&
            setIsOpen(false)
          }

        >
          ✕

        </button>

      </div>


      {/* =====================================================
          COLLAPSE / EXPAND BUTTON
      ====================================================== */}

      <button

        onClick={() =>
          setCollapsed(prev => !prev)
        }

        className="sidebar-collapse-btn"

        title={
          collapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }

        aria-label={
          collapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }

        style={{
          position: 'absolute',

          top: '72px',

          right: '-15px',

          width: '30px',

          height: '30px',

          borderRadius: '9px',

          border:
            '1px solid var(--border-default)',

          background:
            'var(--bg-secondary)',

          color:
            'var(--text-secondary)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          cursor: 'pointer',

          zIndex: 50,

          boxShadow:
            '0 4px 14px rgba(0,0,0,0.3)',

          transition:
            'all 0.2s ease'
        }}

      >

        {collapsed ? (

          <PanelLeftOpen
            size={17}
            strokeWidth={2}
          />

        ) : (

          <PanelLeftClose
            size={17}
            strokeWidth={2}
          />

        )}

      </button>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="sidebar-nav">

        {navItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink

              key={item.to}

              to={item.to}

              end={item.to === '/'}

              id={item.id}

              onClick={() =>
                setIsOpen &&
                setIsOpen(false)
              }

              title={
                collapsed
                  ? item.label
                  : undefined
              }

              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }

              style={{
                justifyContent:
                  collapsed
                    ? 'center'
                    : 'flex-start',

                padding:
                  collapsed
                    ? '12px'
                    : undefined,

                transition:
                  'all 0.2s ease'
              }}

            >

              <span
                className="sidebar-link-icon"
                style={{
                  flexShrink: 0
                }}
              >

                <Icon />

              </span>


              {!collapsed && (

                <span
                  style={{
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </span>

              )}

            </NavLink>

          );

        })}

      </nav>


      {/* =====================================================
          BOTTOM CONTROLS
      ====================================================== */}

      <div

        style={{
          padding: '20px 10px',

          marginTop: 'auto',

          borderTop:
            '1px solid var(--border-default)',

          display: 'flex',

          flexDirection: 'column',

          gap: '10px',

          alignItems: 'stretch'
        }}

      >


        {/* ==================================================
            LIGHT / DARK MODE
        ================================================== */}

        <button

          onClick={toggleTheme}

          className="btn btn-outline btn-block"

          title={
            collapsed
              ? theme === 'light'
                ? 'Dark Mode'
                : 'Light Mode'
              : undefined
          }

          style={{

            fontSize:
              collapsed
                ? '0'
                : '0.7rem',

            padding: '10px',

            justifyContent:
              'center',

            minHeight: '40px',

            gap: '6px',

            overflow: 'hidden'
          }}

        >

          <span
            style={{
              fontSize: '15px'
            }}
          >

            {theme === 'light'
              ? '🌙'
              : '☀️'}

          </span>


          {!collapsed && (

            <span
              style={{
                color: '#ffffff'
              }}
            >

              {theme === 'light'
                ? 'Dark Mode'
                : 'Light Mode'}

            </span>

          )}

        </button>


        {/* ==================================================
            GUIDED TOUR
        ================================================== */}

        <button

          onClick={() =>
            window.startTour &&
            window.startTour()
          }

          className="btn btn-outline btn-block"

          title={
            collapsed
              ? 'Start Guided Tour'
              : undefined
          }

          style={{

            fontSize:
              collapsed
                ? '0'
                : '0.7rem',

            padding: '10px',

            justifyContent:
              'center',

            minHeight: '40px',

            gap:
              collapsed
                ? '0'
                : '6px',

            overflow: 'hidden'
          }}

        >

          <Play
            size={14}
          />


          {!collapsed && (

            <span
              style={{
                color: '#ffffff'
              }}
            >

              Start Guided Tour

            </span>

          )}

        </button>


      </div>

    </aside>

  );

}