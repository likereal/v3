import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaTachometerAlt, FaFolderOpen, FaBook, FaGraduationCap, FaUsers, FaChartLine, FaSearch, FaPuzzlePiece, FaBell, FaCog, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

type NavLink = {
  to: string;
  label: string;
  icon: IconType;
};

const navLinks: NavLink[] = [
  { to: '/', label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/projects', label: 'Projects', icon: FaFolderOpen },
  { to: '/docs', label: 'Docs', icon: FaBook },
  { to: '/learning', label: 'Learning', icon: FaGraduationCap },
  { to: '/team', label: 'Team', icon: FaUsers },
  { to: '/insights', label: 'Insights', icon: FaChartLine },
  { to: '/search', label: 'Search', icon: FaSearch },
  { to: '/integrations', label: 'Integrations', icon: FaPuzzlePiece },
  { to: '/notifications', label: 'Notifications', icon: FaBell },
  { to: '/settings', label: 'Settings', icon: FaCog },
];

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
  minWidth: number;
  maxWidth: number;
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, width, setWidth, minWidth, maxWidth }) => {
  const [resizing, setResizing] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      let newWidth = e.clientX - (sidebarRef.current?.getBoundingClientRect().left || 0);
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setWidth(newWidth);
    };
    const handleMouseUp = () => setResizing(false);
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, minWidth, maxWidth, setWidth]);

  // Responsive: always open on desktop, overlay on mobile
  const isDesktop = window.innerWidth >= 900;
  const sidebarStyle: React.CSSProperties = isDesktop
    ? {
        width,
        left: open ? 0 : -width,
        transition: 'left 0.3s, width 0.2s',
      }
    : {};

  // Toggle icon: chevron for open, hamburger for closed
  const toggleIcon = open ? <span>&#10094;</span> : <span>&#9776;</span>;

  return (
    <>
      {!open && (
        <button
          className="sidebar-toggle-btn sidebar-toggle-btn-fixed"
          aria-label="Show sidebar"
          onClick={() => setOpen(true)}
        >
          {toggleIcon}
        </button>
      )}
      <div
        ref={sidebarRef}
        className={`sidebar${open ? ' open' : ''}${resizing ? ' resizing' : ''}`}
        style={sidebarStyle}
      >
        {open && (
          <div className="sidebar-header">
            <button
              className="sidebar-toggle-btn"
              aria-label="Hide sidebar"
              onClick={() => setOpen(false)}
              style={{ left: 0, position: 'relative', top: 0, margin: '0.5rem' }}
            >
              {toggleIcon}
            </button>
          </div>
        )}
        <nav>
          <ul>
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <li
                  key={link.to}
                  className={location.pathname === link.to ? 'active' : ''}
                  style={idx === 0 ? { borderTop: '1px solid #232946' } : {}}
                >
                  <Link to={link.to} onClick={() => !isDesktop && setOpen(false)}>
                    {Icon && React.createElement(Icon as React.ComponentType<any>, { className: 'sidebar-link-icon' })}
                    <span className="sidebar-link-text">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {isDesktop && open && (
          <div
            className="sidebar-resizer"
            onMouseDown={() => setResizing(true)}
            title="Resize sidebar"
          />
        )}
        {open && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #232946'
          }}>
            <button
              onClick={logout}
              style={{
                width: '100%',
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}></span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
      {open && !isDesktop && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Sidebar; 