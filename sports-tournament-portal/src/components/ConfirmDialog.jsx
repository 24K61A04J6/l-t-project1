import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog — modal confirmation before destructive actions
 *
 * Props:
 *  isOpen    boolean
 *  title     string
 *  message   string
 *  onConfirm () => void
 *  onCancel  () => void
 *  danger    boolean (default true)
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,32,68,0.55)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Dialog */}
      <div style={{
        position: 'relative',
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        maxWidth: '420px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: danger ? '#fee2e2' : '#dbeafe',
          color: danger ? 'var(--red)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <AlertTriangle size={26} />
        </div>

        <h3
          id="confirm-title"
          style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}
        >
          {title}
        </h3>

        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
