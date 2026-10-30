/** Loading spinner component */
export default function Loading({ message = 'Loading data…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '4rem 2rem', gap: '1rem',
      color: 'var(--gray-500)',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3.5px solid var(--gray-200)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} role="status" aria-label="Loading" />
      <span style={{ fontSize: '0.875rem' }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
