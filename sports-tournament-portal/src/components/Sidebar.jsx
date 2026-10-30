import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Users, User, Calendar, Medal, Award,
  ChevronRight, X
} from 'lucide-react';
import '../styles/layout.css';

const navItems = [
  { to: '/',            label: 'Dashboard',      icon: LayoutDashboard, section: null },
  { to: '/tournaments', label: 'Tournaments',     icon: Trophy,          section: 'Management' },
  { to: '/teams',       label: 'Teams',           icon: Users,           section: 'Management' },
  { to: '/players',     label: 'Players',         icon: User,            section: 'Management' },
  { to: '/matches',     label: 'Match Schedule',  icon: Calendar,        section: 'Competition' },
  { to: '/results',     label: 'Match Results',   icon: Medal,           section: 'Competition' },
  { to: '/standings',   label: 'Standings',       icon: Award,           section: 'Competition' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon" aria-hidden="true">🏆</div>
          <div className="logo-text">
            <h2>SportsPro</h2>
            <p>Tournament Portal</p>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close menu"
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {(() => {
            let lastSection = null;
            return navItems.map((item) => {
              const showLabel = item.section && item.section !== lastSection;
              lastSection = item.section;
              return (
                <div key={item.to}>
                  {showLabel && (
                    <div className="sidebar-section-label">{item.section}</div>
                  )}
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                </div>
              );
            });
          })()}
        </nav>

        <div className="sidebar-footer">© 2026 SportsPro Portal v1.0</div>
      </aside>
    </>
  );
}
