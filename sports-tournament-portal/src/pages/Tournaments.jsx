import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Trophy } from 'lucide-react';
import { useFetch }      from '../hooks/useFetch';
import { getTournaments, deleteTournament } from '../services/api';
import SearchBar    from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading       from '../components/Loading';
import ErrorMessage  from '../components/ErrorMessage';
import { formatDate, statusBadgeClass } from '../utils/formatters';
import '../styles/tables.css';

const SPORTS = ['All', 'Cricket', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Hockey', 'Other'];
const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

export default function Tournaments() {
  const navigate = useNavigate();
  const { data: tournaments, loading, error, refetch } = useFetch(getTournaments);

  const [search,  setSearch]  = useState('');
  const [sport,   setSport]   = useState('All');
  const [status,  setStatus]  = useState('All');
  const [confirm, setConfirm] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (loading) return <Loading />;
  if (error)   return <ErrorMessage message={error} onRetry={refetch} />;

  const filtered = (tournaments || []).filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchSport  = sport  === 'All' || t.sport  === sport;
    const matchStatus = status === 'All' || t.status === status;
    return matchSearch && matchSport && matchStatus;
  });

  async function handleDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      await deleteTournament(confirm.id);
      setFeedback({ type: 'success', msg: `Tournament "${confirm.name}" deleted.` });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Tournaments</h1>
          <p>{(tournaments || []).length} tournament(s) registered</p>
        </div>
        <Link to="/tournaments/new" className="btn btn-primary">
          <Plus size={16} /> New Tournament
        </Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="table-controls">
        <SearchBar id="tournament-search" value={search} onChange={setSearch} placeholder="Search tournaments…" />
        <select id="sport-filter" className="filter-select" value={sport} onChange={e => setSport(e.target.value)} aria-label="Filter by sport">
          {SPORTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select id="status-filter" className="filter-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Trophy size={32} /></div>
            <h3>No tournaments found</h3>
            <p>Try adjusting your search or filters, or create a new tournament.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sport</th>
                <th>Venue</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td className="td-name">{t.name}</td>
                  <td>{t.sport}</td>
                  <td>{t.venue}</td>
                  <td>{formatDate(t.startDate)}</td>
                  <td>{formatDate(t.endDate)}</td>
                  <td><span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span></td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon view" title="View" onClick={() => navigate(`/tournaments/${t.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon edit" title="Edit" onClick={() => navigate(`/tournaments/${t.id}/edit`)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => setConfirm({ id: t.id, name: t.name })}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">Showing {filtered.length} of {(tournaments || []).length} tournament(s)</div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${confirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
