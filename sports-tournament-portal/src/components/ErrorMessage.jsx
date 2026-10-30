import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorMessage — displays API or fetch errors
 *
 * Props:
 *  message   string
 *  onRetry   () => void  (optional)
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '3rem 2rem', gap: '1rem', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#fee2e2', color: 'var(--red)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertCircle size={28} />
      </div>
      <div>
        <h3 style={{ color: 'var(--gray-800)', fontWeight: 700, marginBottom: '0.4rem' }}>
          Something went wrong
        </h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', maxWidth: '380px' }}>
          {message || 'Unable to load data. Please ensure JSON Server is running on port 3000.'}
        </p>
      </div>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry} style={{ gap: '0.4rem' }}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
