import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

/**
 * StatCard — single dashboard metric card
 *
 * Props:
 *  label        string
 *  value        number | string
 *  icon         React element (Lucide icon)
 *  accentColor  CSS color string e.g. "#1a56db"
 *  bgColor      CSS color for icon background
 *  iconColor    CSS color for icon fill
 *  to           optional route path to navigate on click
 */
export default function StatCard({ label, value, icon: Icon, accentColor, bgColor, iconColor, to }) {
  const style = {
    '--card-accent': accentColor,
    '--card-bg':     bgColor,
    '--card-color':  iconColor,
    textDecoration:  'none',
    cursor:          to ? 'pointer' : 'default',
  };

  const cardContent = (
    <div className="stat-card" style={style}>
      <div className="stat-icon" aria-hidden="true">
        {Icon && <Icon size={22} />}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
