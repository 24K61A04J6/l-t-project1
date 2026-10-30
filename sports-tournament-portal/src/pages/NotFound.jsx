import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#fef3c7', color: 'var(--orange)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem', fontSize: '2rem',
      }}>
        <AlertTriangle size={40} />
      </div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--gray-700)', margin: '0.5rem 0 1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', maxWidth: 360, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16}/> Back to Dashboard
      </Link>
    </div>
  );
}
