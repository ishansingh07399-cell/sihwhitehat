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
import { Play, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard', id: 'tour-sidebar-dash' },
  { to: '/ingest', icon: HiOutlineCloudUpload, label: 'Data Ingestion', id: 'tour-sidebar-ingest' },
  { to: '/network', icon: HiOutlineGlobe, label: 'Network Analysis', id: 'tour-sidebar-network' },
  { to: '/map', icon: HiOutlineMap, label: 'Geo-Spatial Map' },
  { to: '/entities', icon: HiOutlineUserGroup, label: 'Entity Intel' },
  { to: '/timeline', icon: HiOutlineClock, label: 'Temporal Timeline' },
  { to: '/patterns', icon: HiOutlineShieldExclamation, label: 'Pattern Detection' },
  { to: '/export', icon: HiOutlineDocumentDownload, label: 'Case Export' },
];

export default function Sidebar({ isOpen, setIsOpen, theme, toggleTheme }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-brand-icon">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">Criminal Network<br />Intel System</div>
        </div>
        <button 
          className="mobile-close-btn"
          style={{ display: isOpen ? 'block' : 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }} 
          onClick={() => setIsOpen && setIsOpen(false)}
        >✕</button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={item.id}
            onClick={() => setIsOpen && setIsOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">
              <item.icon />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '20px 10px', marginTop: 'auto', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={toggleTheme}
          className="btn btn-outline btn-block"
          style={{ fontSize: '0.7rem', padding: '10px', justifyContent: 'center' }}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <button 
          onClick={() => window.startTour && window.startTour()}
          className="btn btn-outline btn-block"
          style={{ fontSize: '0.7rem', padding: '10px', justifyContent: 'center' }}
        >
          <Play size={14} /> Start Guided Tour
        </button>
      </div>
    </aside>
  );
}
