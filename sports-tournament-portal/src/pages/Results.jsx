import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Medal } from 'lucide-react';
import { useFetch }    from '../hooks/useFetch';
import { getResults, getMatches, getTeams, getTournaments, deleteResult } from '../services/api';
import SearchBar     from '../components/SearchBar';
import ConfirmDialog  from '../components/ConfirmDialog';
import Loading        from '../components/Loading';
import ErrorMessage   from '../components/ErrorMessage';
import { formatDateTime, formatDate } from '../utils/formatters';
import '../styles/tables.css';

export default function Results() {
  const navigate = useNavigate();
  const { data: results,     loading: rLoad, error: rErr, refetch } = useFetch(getResults);
  const { data: matches,     loading: mLoad }                        = useFetch(getMatches);
  const { data: teams,       loading: tLoad }                        = useFetch(getTeams);
  const { data: tournaments, loading: tourLoad }                     = useFetch(getTournaments);

  const [search,      setSearch]      = useState('');
  const [tourFilt,    setTourFilt]    = useState('All');
  const [confirm,     setConfirm]     = useState(null);
  const [feedback,    setFeedback]    = useState(null);

  if (rLoad || mLoad || tLoad || tourLoad) return <Loading />;
  if (rErr) return <ErrorMessage message={rErr} onRetry={refetch} />;

  const matchMap = Object.fromEntries((matches || []).map(m => [m.id, m]));
  const teamMap  = Object.fromEntries((teams  || []).map(t => [t.id, t.name]));
  const tourMap  = Object.fromEntries((tournaments || []).map(t => [t.id, t.name]));
  const allTours = ['All', ...(tournaments || []).map(t => t.name)];

  const enriched = (results || []).map(r => {
    const match = matchMap[r.matchId] || {};
    return {
      ...r,
      tournamentName: tourMap[match.tournamentId] || '—',
      tournamentId: match.tournamentId,
      matchDate: match.matchDate,
      teamA: teamMap[match.teamAId] || 'Team A',
      teamB: teamMap[match.teamBId] || 'Team B',
      winner: r.winnerTeamId ? teamMap[r.winnerTeamId] : 'Draw',
    };
  });

  const filtered = enriched.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.teamA.toLowerCase().includes(q) ||
      r.teamB.toLowerCase().includes(q) ||
      r.winner.toLowerCase().includes(q) ||
      r.tournamentName.toLowerCase().includes(q);
    const matchTour = tourFilt === 'All' || r.tournamentName === tourFilt;
    return matchSearch && matchTour;
  });

  async function handleDelete() {
    if (!confirm) return;
    try {
      await deleteResult(confirm.id);
      setFeedback({ type: 'success', msg: 'Result deleted.' });
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
        <div><h1>Match Results</h1><p>{(results || []).length} result(s) recorded</p></div>
        <Link to="/results/new" className="btn btn-primary"><Plus size={16}/> Record Result</Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="table-controls">
        <SearchBar id="result-search" value={search} onChange={setSearch} placeholder="Search by team, tournament, or winner…" />
        <select id="result-tour-filter" className="filter-select" value={tourFilt} onChange={e => setTourFilt(e.target.value)} aria-label="Filter by tournament">
          {allTours.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Medal size={32}/></div>
            <h3>No results recorded</h3>
            <p>Record the result of a completed match.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tournament</th>
                <th>Match</th>
                <th>Score</th>
                <th>Winner / Result</th>
                <th>Remarks</th>
                <th>Recorded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.tournamentName}</td>
                  <td className="td-name">{r.teamA} vs {r.teamB}</td>
                  <td>
                    <span style={{
                      fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)',
                      background: 'var(--gray-100)', padding: '0.15rem 0.5rem', borderRadius: 4
                    }}>
                      {r.teamAScore} – {r.teamBScore}
                    </span>
                  </td>
                  <td>
                    {r.winnerTeamId
                      ? <span className="badge badge-ongoing">🏆 {r.winner}</span>
                      : <span className="badge badge-draw">Draw</span>
                    }
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.remarks || '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{formatDateTime(r.recordedAt)}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon edit" title="Edit" onClick={() => navigate(`/results/${r.id}/edit`)}>
                        <Edit2 size={16}/>
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => setConfirm({ id: r.id })}>
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">Showing {filtered.length} of {(results || []).length} result(s)</div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title="Delete Result"
        message="Delete this match result? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
