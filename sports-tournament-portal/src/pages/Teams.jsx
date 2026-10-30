import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Users } from 'lucide-react';
import { useFetch }    from '../hooks/useFetch';
import { getTeams, getTournaments, getPlayers, deleteTeam } from '../services/api';
import SearchBar     from '../components/SearchBar';
import ConfirmDialog  from '../components/ConfirmDialog';
import Loading        from '../components/Loading';
import ErrorMessage   from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import '../styles/tables.css';

export default function Teams() {
  const navigate   = useNavigate();
  const { data: teams,       loading: tLoading, error: tError, refetch } = useFetch(getTeams);
  const { data: tournaments, loading: tourLoading }                      = useFetch(getTournaments);
  const { data: players,     loading: pLoading }                         = useFetch(getPlayers);

  const [search,     setSearch]     = useState('');
  const [tournament, setTournament] = useState('All');
  const [sport,      setSport]      = useState('All');
  const [confirm,    setConfirm]    = useState(null);
  const [feedback,   setFeedback]   = useState(null);

  const loading = tLoading || tourLoading || pLoading;
  if (loading) return <Loading />;
  if (tError)  return <ErrorMessage message={tError} onRetry={refetch} />;

  const tourMap        = Object.fromEntries((tournaments || []).map(t => [t.id, t.name]));
  const allTournaments = ['All', ...(tournaments || []).map(t => t.name)];
  const allSports      = ['All', ...new Set((teams || []).map(t => t.sport))];

  // Player count by teamId
  const playerCounts = (players || []).reduce((acc, p) => {
    acc[p.teamId] = (acc[p.teamId] || 0) + 1;
    return acc;
  }, {});

  const filtered = (teams || []).filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.coach?.toLowerCase().includes(search.toLowerCase()) ||
      t.captain?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase());
    const matchTour  = tournament === 'All' || tourMap[t.tournamentId] === tournament;
    const matchSport = sport === 'All' || t.sport === sport;
    return matchSearch && matchTour && matchSport;
  });

  async function handleDelete() {
    if (!confirm) return;
    try {
      await deleteTeam(confirm.id);
      setFeedback({ type: 'success', msg: `Team "${confirm.name}" deleted.` });
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
        <div><h1>Teams</h1><p>{(teams || []).length} team(s) registered</p></div>
        <Link to="/teams/new" className="btn btn-primary"><Plus size={16}/> Register Team</Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="table-controls">
        <SearchBar id="team-search" value={search} onChange={setSearch} placeholder="Search by team, coach, captain, or city…" />
        <select id="tournament-filter" className="filter-select" value={tournament} onChange={e => setTournament(e.target.value)} aria-label="Filter by tournament">
          {allTournaments.map(t => <option key={t}>{t}</option>)}
        </select>
        <select id="sport-filter" className="filter-select" value={sport} onChange={e => setSport(e.target.value)} aria-label="Filter by sport">
          {allSports.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={32} /></div>
            <h3>No teams found</h3>
            <p>Try adjusting filters or register a new team.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>Sport</th>
                <th>Tournament</th>
                <th>Squad</th>
                <th>Coach</th>
                <th>Captain</th>
                <th>City</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td className="td-name">
                    <Link to={`/teams/${t.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {t.name}
                    </Link>
                  </td>
                  <td>{t.sport}</td>
                  <td>{tourMap[t.tournamentId] || '—'}</td>
                  <td>
                    <span className="badge badge-scheduled" style={{ fontSize: '0.75rem' }}>
                      {playerCounts[t.id] || 0} player(s)
                    </span>
                  </td>
                  <td>{t.coach}</td>
                  <td>{t.captain}</td>
                  <td>{t.city}</td>
                  <td>{formatDate(t.registrationDate)}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon view" title="View Team Details" onClick={() => navigate(`/teams/${t.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon edit" title="Edit" onClick={() => navigate(`/teams/${t.id}/edit`)}>
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
        <div className="table-footer">Showing {filtered.length} of {(teams || []).length} team(s)</div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title="Delete Team"
        message={`Delete "${confirm?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
