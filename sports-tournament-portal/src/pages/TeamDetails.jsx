import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ArrowLeft, Users, Plus, Trophy, Calendar, MapPin, Award } from 'lucide-react';
import { getTeamById, getTournaments, getPlayers, getMatches, getResults, deleteTeam } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading       from '../components/Loading';
import { formatDate, formatTime, statusBadgeClass } from '../utils/formatters';
import '../styles/forms.css';
import '../styles/tables.css';

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team,        setTeam]        = useState(null);
  const [tournament,  setTournament]  = useState(null);
  const [players,     setPlayers]     = useState([]);
  const [matches,     setMatches]     = useState([]);
  const [results,     setResults]     = useState([]);
  const [allTeams,    setAllTeams]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [confirm,     setConfirm]     = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tm, tours, pls, mts, rts] = await Promise.all([
          getTeamById(id),
          getTournaments(),
          getPlayers(),
          getMatches(),
          getResults(),
        ]);
        setTeam(tm);
        setTournament(tours.find(t => t.id === tm.tournamentId) || null);
        setPlayers(pls.filter(p => p.teamId === id));
        setMatches(mts.filter(m => m.teamAId === id || m.teamBId === id));
        setResults(rts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleDelete() {
    try {
      await deleteTeam(id);
      navigate('/teams');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;
  if (error || !team) return (
    <div className="page-content">
      <div className="alert alert-error">{error || 'Team not found.'}</div>
      <Link to="/teams" className="btn btn-secondary"><ArrowLeft size={16}/> Back</Link>
    </div>
  );

  const resultMap = Object.fromEntries(results.map(r => [r.matchId, r]));

  // Stats calculation
  const completedMatches = matches.filter(m => resultMap[m.id]);
  const wins = completedMatches.filter(m => resultMap[m.id]?.winnerTeamId === id).length;
  const losses = completedMatches.filter(m => {
    const res = resultMap[m.id];
    return res && res.winnerTeamId && res.winnerTeamId !== id;
  }).length;
  const draws = completedMatches.filter(m => {
    const res = resultMap[m.id];
    return res && !res.winnerTeamId;
  }).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1>{team.name}</h1>
            <span className="badge badge-upcoming">{team.sport}</span>
          </div>
          <p>
            {team.city} &nbsp;·&nbsp; Coach: <strong>{team.coach}</strong> &nbsp;·&nbsp; Captain: <strong>{team.captain}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/teams')}>
            <ArrowLeft size={16} /> Back
          </button>
          <Link to={`/teams/${team.id}/edit`} className="btn btn-primary">
            <Edit2 size={15} /> Edit
          </Link>
          <button className="btn btn-danger" onClick={() => setConfirm(true)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="stat-label">Squad Size</div>
          <div className="stat-value">{players.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div className="stat-label">Matches Scheduled</div>
          <div className="stat-value">{matches.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="stat-label">Record (W-D-L)</div>
          <div className="stat-value">{wins} - {draws} - {losses}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--orange)' }}>
          <div className="stat-label">Tournament</div>
          <div className="stat-value" style={{ fontSize: '1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {tournament ? tournament.name : 'Unassigned'}
          </div>
        </div>
      </div>

      {/* Team Details Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent)" /> Team Information
          </h2>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-label">Team Name</span>
              <span className="detail-value">{team.name}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Sport</span>
              <span className="detail-value">{team.sport}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">City</span>
              <span className="detail-value">{team.city}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Tournament</span>
              <span className="detail-value">
                {tournament ? (
                  <Link to={`/tournaments/${tournament.id}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {tournament.name}
                  </Link>
                ) : '—'}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Head Coach</span>
              <span className="detail-value">{team.coach}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Team Captain</span>
              <span className="detail-value">{team.captain}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Registration Date</span>
              <span className="detail-value">{formatDate(team.registrationDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Players Squad Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent)"/> Squad Roster ({players.length})
          </h2>
          <Link to="/players/new" className="btn btn-sm btn-primary">
            <Plus size={14}/> Add Player
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {players.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No players registered for this team yet.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Jersey</th>
                    <th>Player Name</th>
                    <th>Position</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{p.jerseyNumber}</td>
                      <td className="td-name">{p.name}</td>
                      <td>{p.position}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{p.email || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{p.phone || '—'}</td>
                      <td>
                        <button className="btn-icon edit" title="Edit Player" onClick={() => navigate(`/players/${p.id}/edit`)}>
                          <Edit2 size={15}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Team Matches Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent)"/> Fixtures & Results ({matches.length})
          </h2>
          <Link to="/matches/new" className="btn btn-sm btn-outline">
            <Plus size={14}/> Schedule Match
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {matches.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No matches scheduled for this team.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Match</th>
                    <th>Status</th>
                    <th>Score / Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => {
                    const res = resultMap[m.id];
                    let outcomeBadge = null;
                    if (res) {
                      if (res.winnerTeamId === id) {
                        outcomeBadge = <span className="badge badge-completed">Win</span>;
                      } else if (res.winnerTeamId) {
                        outcomeBadge = <span className="badge badge-cancelled">Loss</span>;
                      } else {
                        outcomeBadge = <span className="badge badge-draw">Draw</span>;
                      }
                    }
                    return (
                      <tr key={m.id}>
                        <td>{formatDate(m.matchDate)} {formatTime(m.matchTime)}</td>
                        <td>{m.venue}</td>
                        <td className="td-name">
                          {m.teamAId === id ? 'vs Team B' : 'at Team A'}
                        </td>
                        <td><span className={`badge ${statusBadgeClass(m.status)}`}>{m.status}</span></td>
                        <td>
                          {res ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700 }}>{res.teamAScore} – {res.teamBScore}</span>
                              {outcomeBadge}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm}
        title="Delete Team"
        message={`Delete "${team.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
