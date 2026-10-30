import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { useFetch }    from '../hooks/useFetch';
import { getPlayers, getTeams, deletePlayer } from '../services/api';
import SearchBar     from '../components/SearchBar';
import ConfirmDialog  from '../components/ConfirmDialog';
import Loading        from '../components/Loading';
import ErrorMessage   from '../components/ErrorMessage';
import '../styles/tables.css';

export default function Players() {
  const navigate = useNavigate();
  const { data: players, loading: pLoad, error: pErr, refetch } = useFetch(getPlayers);
  const { data: teams,   loading: tLoad }                        = useFetch(getTeams);

  const [search,   setSearch]   = useState('');
  const [teamFilt, setTeamFilt] = useState('All');
  const [sport,    setSport]    = useState('All');
  const [confirm,  setConfirm]  = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (pLoad || tLoad) return <Loading />;
  if (pErr) return <ErrorMessage message={pErr} onRetry={refetch} />;

  const teamMap  = Object.fromEntries((teams || []).map(t => [t.id, t.name]));
  const allTeams = ['All', ...(teams || []).map(t => t.name)];
  const allSports = ['All', ...new Set((players || []).map(p => p.sport))];

  const filtered = (players || []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchTeam   = teamFilt === 'All' || teamMap[p.teamId] === teamFilt;
    const matchSport  = sport   === 'All' || p.sport === sport;
    return matchSearch && matchTeam && matchSport;
  });

  async function handleDelete() {
    if (!confirm) return;
    try {
      await deletePlayer(confirm.id);
      setFeedback({ type: 'success', msg: `Player "${confirm.name}" removed.` });
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
        <div><h1>Players</h1><p>{(players || []).length} player(s) registered</p></div>
        <Link to="/players/new" className="btn btn-primary"><Plus size={16}/> Add Player</Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          {feedback.msg}
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="table-controls">
        <SearchBar id="player-search" value={search} onChange={setSearch} placeholder="Search players…" />
        <select id="team-filter" className="filter-select" value={teamFilt} onChange={e => setTeamFilt(e.target.value)} aria-label="Filter by team">
          {allTeams.map(t => <option key={t}>{t}</option>)}
        </select>
        <select id="sport-filter" className="filter-select" value={sport} onChange={e => setSport(e.target.value)} aria-label="Filter by sport">
          {allSports.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><User size={32} /></div>
            <h3>No players found</h3>
            <p>Try adjusting filters or add a new player.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sport</th>
                <th>Team</th>
                <th>Position</th>
                <th>Jersey</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="td-name">{p.name}</td>
                  <td>{p.sport}</td>
                  <td>{teamMap[p.teamId] || '—'}</td>
                  <td>{p.position}</td>
                  <td>#{p.jerseyNumber}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{p.email || '—'}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon edit" title="Edit" onClick={() => navigate(`/players/${p.id}/edit`)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => setConfirm({ id: p.id, name: p.name })}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">Showing {filtered.length} of {(players || []).length} player(s)</div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title="Remove Player"
        message={`Remove "${confirm?.name}" from the portal? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
