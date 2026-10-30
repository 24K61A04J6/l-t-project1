import { Search, X } from 'lucide-react';

/**
 * SearchBar — controlled search input
 *
 * Props:
 *  value       string
 *  onChange    (value: string) => void
 *  placeholder string
 *  id          string (for accessibility)
 */
export default function SearchBar({ value, onChange, placeholder = 'Search…', id }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: '0.625rem',
          color: 'var(--gray-400)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          padding: '0.45rem 2.25rem 0.45rem 2rem',
          border: '1.5px solid var(--gray-200)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem',
          color: 'var(--gray-700)',
          background: 'var(--white)',
          minWidth: '220px',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e)  => (e.target.style.borderColor = 'var(--gray-200)')}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gray-400)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
