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
  HiOutlineClock,
  HiOutlineUser
} from 'react-icons/hi';

import {
  Play,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const navItems = [
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard', id: 'tour-sidebar-dash' },
  { to: '/ingest', icon: HiOutlineCloudUpload, label: 'Data Ingestion', id: 'tour-sidebar-ingest' },
  { to: '/network', icon: HiOutlineGlobe, label: 'Network Analysis', id: 'tour-sidebar-network' },
  { to: '/map', icon: HiOutlineMap, label: 'Geo-Spatial Map' },
  { to: '/entities', icon: HiOutlineUserGroup, label: 'Entity Intel' },
  { to: '/timeline', icon: HiOutlineClock, label: 'Temporal Timeline' },
  { to: '/patterns', icon: HiOutlineShieldExclamation, label: 'Pattern Detection' },
  { to: '/suspect', icon: HiOutlineUser, label: 'Prime Suspect' },
  { to: '/export', icon: HiOutlineDocumentDownload, label: 'Case Export' },
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
      className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '76px' : '250px',
        transition: 'width 0.25s ease',
        overflow: 'visible'
      }}
    >

      {/* BRAND */}
      <div
        className="sidebar-brand"
        style={{
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >

          <div className="sidebar-brand-icon">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="sidebar-brand-text">
              Criminal Network
              <br />
              Intel System
            </div>
          )}

        </div>

        {/* MOBILE CLOSE */}
        <button
          className="mobile-close-btn"
          style={{
            display: isOpen ? 'block' : 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          ✕
        </button>

      </div>

      {/* COLLAPSE BUTTON */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: '72px',
          right: '-15px',
          width: '30px',
          height: '30px',
          borderRadius: '9px',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        {collapsed ? (
          <PanelLeftOpen size={17} strokeWidth={2} />
        ) : (
          <PanelLeftClose size={17} strokeWidth={2} />
        )}
      </button>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        {navItems.map((item) => (

          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={item.id}
            onClick={() => setIsOpen && setIsOpen(false)}
            title={collapsed ? item.label : ''}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              paddingLeft: collapsed ? '0' : undefined,
              paddingRight: collapsed ? '0' : undefined
            }}
          >

            <span className="sidebar-link-icon">
              <item.icon />
            </span>

            {!collapsed && (
              <span>{item.label}</span>
            )}

          </NavLink>

        ))}

      </nav>

      {/* BOTTOM CONTROLS */}
      <div
        style={{
          padding: collapsed ? '20px 10px' : '20px 10px',
          marginTop: 'auto',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >

        {/* THEME BUTTON */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-block"
          title={collapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : ''}
          style={{
            fontSize: '0.7rem',
            padding: '10px',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >

          <span style={{ color: '#ffffff' }}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </span>

        </button>

        {/* GUIDED TOUR */}
        <button
          onClick={() => window.startTour && window.startTour()}
          className="btn btn-outline btn-block"
          title={collapsed ? 'Start Guided Tour' : ''}
          style={{
            fontSize: '0.7rem',
            padding: '10px',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >

          <Play size={14} />

          {!collapsed && (
            <span style={{ color: '#ffffff' }}>
              Start Guided Tour
            </span>
          )}

        </button>

      </div>

    </aside>
  );
}