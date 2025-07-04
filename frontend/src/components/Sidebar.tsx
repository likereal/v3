import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaTachometerAlt, FaFolderOpen, FaBook, FaGraduationCap, FaUsers, FaChartLine, FaSearch, FaPuzzlePiece, FaBell, FaCog, FaSignInAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';
import './Sidebar.css';

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
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, width, setWidth, minWidth, maxWidth, minimized, setMinimized }) => {
  const [resizing, setResizing] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
        width: minimized ? 60 : width,
        left: open ? 0 : -(minimized ? 60 : width),
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
        className={`sidebar${open ? ' open' : ''}${resizing ? ' resizing' : ''}${minimized ? ' minimized' : ''}`}
        style={sidebarStyle}
      >
        {open && !minimized && (
          <div className="sidebar-header">
            <button
              className="sidebar-toggle-btn"
              aria-label="Minimize sidebar"
              onClick={() => setMinimized(true)}
              style={{ left: 0, position: 'relative', top: 0, margin: '0.5rem' }}
            >
              <span>&#10094;</span>
            </button>
          </div>
        )}
        {open && minimized && (
          <div className="sidebar-header">
            <button
              className="sidebar-toggle-btn"
              aria-label="Expand sidebar"
              onClick={() => setMinimized(false)}
              style={{ left: 0, position: 'relative', top: 0, margin: '0.5rem' }}
            >
              <span>&#10095;</span>
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
                >
                  <Link to={link.to} onClick={() => !isDesktop && setOpen(false)}>
                    {Icon && React.createElement(Icon as React.ComponentType<any>, { className: 'sidebar-link-icon' })}
                    {!minimized && <span className="sidebar-link-text">{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {isDesktop && open && !minimized && (
          <div
            className="sidebar-resizer"
            onMouseDown={() => setResizing(true)}
            title="Resize sidebar"
          />
        )}
      </div>
      {open && !isDesktop && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Sidebar; 