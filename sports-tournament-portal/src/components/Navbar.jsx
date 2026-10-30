import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import '../styles/layout.css';

const routeLabels = {
  '/':              'Dashboard',
  '/tournaments':   'Tournaments',
  '/teams':         'Teams',
  '/players':       'Players',
  '/matches':       'Matches',
  '/results':       'Results',
  '/standings':     'Standings',
};

function getLabel(pathname) {
  if (pathname === '/') return 'Dashboard';
  const key = Object.keys(routeLabels)
    .filter(k => k !== '/')
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return routeLabels[key] || 'SportsPro';
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const pageLabel    = getLabel(pathname);

  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-expanded="false"
        >
          <Menu size={22} />
        </button>
        <span className="navbar-title">🏆 SportsPro</span>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span>Portal</span>
          <span>›</span>
          <strong>{pageLabel}</strong>
        </nav>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar" aria-hidden="true">AD</div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}
