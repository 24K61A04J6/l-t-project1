import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Medal } from 'lucide-react';
import { useFetch }    from '../hooks/useFetch';
import { getMatches, getTournaments, getTeams, getResults, deleteMatch } from '../services/api';
import SearchBar     from '../components/SearchBar';
import ConfirmDialog  from '../components/ConfirmDialog';
import Loading        from '../components/Loading';
import ErrorMessage   from '../components/ErrorMessage';
import { formatDate, formatTime, statusBadgeClass } from '../utils/formatters';
import '../styles/tables.css';

const STATUSES = ['All', 'Scheduled', 'In Progress', 'Completed'];

export default function Matches() {
  const navigate = useNavigate();
  const { data: matches,     loading: mLoad, error: mErr, refetch } = useFetch(getMatches);
  const { data: tournaments, loading: tLoad }                        = useFetch(getTournaments);
  const { data: teams,       loading: tmLoad }                       = useFetch(getTeams);
  const { data: results,     loading: rLoad }                        = useFetch(getResults);

  const [search,     setSearch]     = useState('');
  const [tourFilt,   setTourFilt]   = useState('All');
  const [statusFilt, setStatusFilt] = useState('All');
  const [confirm,    setConfirm]    = useState(null);
  const [feedback,   setFeedback]   = useState(null);

  if (mLoad || tLoad || tmLoad || rLoad) return <Loading />;
  if (mErr) return <ErrorMessage message={mErr} onRetry={refetch} />;

  const tourMap        = Object.fromEntries((tournaments || []).map(t => [t.id, t.name]));
  const teamMap        = Object.fromEntries((teams || []).map(t => [t.id, t.name]));
  const resultMap      = Object.fromEntries((results || []).map(r => [r.matchId, r]));
  const allTours       = ['All', ...(tournaments || []).map(t => t.name)];

  const filtered = (matches || []).filter(m => {
    const ta = teamMap[m.teamAId] || '';
    const tb = teamMap[m.teamBId] || '';
    const matchSearch = ta.toLowerCase().includes(search.toLowerCase()) ||
      tb.toLowerCase().includes(search.toLowerCase()) ||
      m.venue?.toLowerCase().includes(search.toLowerCase());
    const matchTour   = tourFilt === 'All' || tourMap[m.tournamentId] === tourFilt;
    const matchStatus = statusFilt === 'All' || m.status === statusFilt;
    return matchSearch && matchTour && matchStatus;
  });

  async function handleDelete() {
    if (!confirm) return;
    try {
      await deleteMatch(confirm.id);
      setFeedback({ type: 'success', msg: 'Match deleted.' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Match Schedule</h1><p>{(matches || []).length} match(es) scheduled</p></div>
        <Link to="/matches/new" className="btn btn-primary"><Plus size={16}/> Schedule Match</Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="table-controls">
        <SearchBar id="match-search" value={search} onChange={setSearch} placeholder="Search by team or venue…" />
        <select id="tour-filter" className="filter-select" value={tourFilt} onChange={e => setTourFilt(e.target.value)} aria-label="Filter by tournament">
          {allTours.map(t => <option key={t}>{t}</option>)}
        </select>
        <select id="status-filter" className="filter-select" value={statusFilt} onChange={e => setStatusFilt(e.target.value)} aria-label="Filter by status">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Calendar size={32}/></div>
            <h3>No matches found</h3>
            <p>Schedule a match or adjust your filters.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tournament</th>
                <th>Team A</th>
                <th>Team B</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Score / Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const res = resultMap[m.id];
                return (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td>{tourMap[m.tournamentId] || '—'}</td>
                    <td className="td-name">{teamMap[m.teamAId] || '—'}</td>
                    <td className="td-name">{teamMap[m.teamBId] || '—'}</td>
                    <td>{formatDate(m.matchDate)} · {formatTime(m.matchTime)}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.venue}</td>
                    <td><span className={`badge ${statusBadgeClass(m.status)}`}>{m.status}</span></td>
                    <td>
                      {res ? (
                        <span style={{ fontWeight: 700, color: 'var(--navy)', background: 'var(--gray-100)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                          {res.teamAScore} – {res.teamBScore}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="td-actions">
                        {res ? (
                          <button className="btn-icon view" title="Edit Result" onClick={() => navigate(`/results/${res.id}/edit`)}>
                            <Medal size={16} color="var(--accent)"/>
                          </button>
                        ) : (
                          <button className="btn-icon view" title="Record Result" onClick={() => navigate(`/results/new?matchId=${m.id}`)}>
                            <Medal size={16}/>
                          </button>
                        )}
                        <button className="btn-icon edit" title="Edit Match" onClick={() => navigate(`/matches/${m.id}/edit`)}>
                          <Edit2 size={16}/>
                        </button>
                        <button className="btn-icon delete" title="Delete Match" onClick={() => setConfirm({ id: m.id })}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="table-footer">Showing {filtered.length} of {(matches || []).length} match(es)</div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title="Delete Match"
        message="Are you sure you want to delete this match? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
