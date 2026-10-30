import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ArrowLeft, Trophy, Calendar, MapPin, Users, Medal, Plus, Award } from 'lucide-react';
import {
  getTournamentById, getTeams, getMatches, getResults, getPlayers, deleteTournament
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading       from '../components/Loading';
import { formatDate, formatTime, statusBadgeClass } from '../utils/formatters';
import '../styles/forms.css';
import '../styles/tables.css';

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [teams,      setTeams]      = useState([]);
  const [matches,    setMatches]    = useState([]);
  const [results,    setResults]    = useState([]);
  const [players,    setPlayers]    = useState([]);
  const [activeTab,  setActiveTab]  = useState('standings'); // 'standings' | 'teams' | 'matches' | 'info'
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [confirm,    setConfirm]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, allTms, allMts, allRes, allPls] = await Promise.all([
          getTournamentById(id),
          getTeams(),
          getMatches(),
          getResults(),
          getPlayers(),
        ]);
        setTournament(t);
        setTeams(allTms.filter(tm => tm.tournamentId === id));
        setMatches(allMts.filter(m => m.tournamentId === id));
        setResults(allRes);
        setPlayers(allPls);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleDelete() {
    try {
      await deleteTournament(id);
      navigate('/tournaments');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;
  if (error || !tournament) return (
    <div className="page-content">
      <div className="alert alert-error">{error || 'Tournament not found.'}</div>
      <Link to="/tournaments" className="btn btn-secondary"><ArrowLeft size={16}/> Back</Link>
    </div>
  );

  const t = tournament;
  const resultMap = Object.fromEntries(results.map(r => [r.matchId, r]));
  const teamMap   = Object.fromEntries(teams.map(tm => [tm.id, tm.name]));
  const playerCounts = players.reduce((acc, p) => {
    acc[p.teamId] = (acc[p.teamId] || 0) + 1;
    return acc;
  }, {});

  // Compute standings table for this tournament
  const standings = teams.map(tm => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let scoreFor = 0;
    let scoreAgainst = 0;

    matches.forEach(m => {
      const res = resultMap[m.id];
      if (!res) return;

      const isTeamA = m.teamAId === tm.id;
      const isTeamB = m.teamBId === tm.id;

      if (isTeamA || isTeamB) {
        played += 1;
        const myScore = isTeamA ? res.teamAScore : res.teamBScore;
        const oppScore = isTeamA ? res.teamBScore : res.teamAScore;
        scoreFor += myScore;
        scoreAgainst += oppScore;

        if (res.winnerTeamId === tm.id) {
          won += 1;
        } else if (!res.winnerTeamId) {
          drawn += 1;
        } else {
          lost += 1;
        }
      }
    });

    const points = (won * 3) + (drawn * 1);
    const diff = scoreFor - scoreAgainst;

    return {
      team: tm,
      played,
      won,
      drawn,
      lost,
      scoreFor,
      scoreAgainst,
      diff,
      points,
    };
  }).sort((a, b) => b.points - a.points || b.diff - a.diff || b.scoreFor - a.scoreFor);

  const completedCount = matches.filter(m => m.status === 'Completed').length;
  const scheduledCount = matches.filter(m => m.status === 'Scheduled').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1>{t.name}</h1>
            <span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span>
          </div>
          <p>
            {t.sport} &nbsp;·&nbsp; 📍 {t.venue} &nbsp;·&nbsp; 📅 {formatDate(t.startDate)} to {formatDate(t.endDate)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
            <ArrowLeft size={16} /> Back
          </button>
          <Link to={`/tournaments/${t.id}/edit`} className="btn btn-primary">
            <Edit2 size={15} /> Edit
          </Link>
          <button className="btn btn-danger" onClick={() => setConfirm(true)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="stat-label">Teams Registered</div>
          <div className="stat-value">{teams.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div className="stat-label">Total Fixtures</div>
          <div className="stat-value">{matches.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="stat-label">Matches Completed</div>
          <div className="stat-value">{completedCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--orange)' }}>
          <div className="stat-label">Upcoming Fixtures</div>
          <div className="stat-value">{scheduledCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('standings')}
          className={`btn ${activeTab === 'standings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <Award size={16} /> Points Table
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`btn ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <Calendar size={16} /> Matches ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <Users size={16} /> Teams ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <Trophy size={16} /> Overview
        </button>
      </div>

      {/* Tab: Standings / Points Table */}
      {activeTab === 'standings' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--accent)"/> Tournament Standings
            </h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {standings.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No teams registered for this tournament yet.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Rank</th>
                      <th>Team</th>
                      <th>City</th>
                      <th style={{ textAlign: 'center' }}>P</th>
                      <th style={{ textAlign: 'center' }}>W</th>
                      <th style={{ textAlign: 'center' }}>D</th>
                      <th style={{ textAlign: 'center' }}>L</th>
                      <th style={{ textAlign: 'center' }}>Diff</th>
                      <th style={{ textAlign: 'center' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, idx) => (
                      <tr key={s.team.id}>
                        <td>
                          {idx === 0 ? (
                            <span style={{ fontWeight: 800, color: '#ca8a04' }}>🥇 1</span>
                          ) : idx === 1 ? (
                            <span style={{ fontWeight: 800, color: '#64748b' }}>🥈 2</span>
                          ) : idx === 2 ? (
                            <span style={{ fontWeight: 800, color: '#b45309' }}>🥉 3</span>
                          ) : (
                            idx + 1
                          )}
                        </td>
                        <td className="td-name">
                          <Link to={`/teams/${s.team.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {s.team.name}
                          </Link>
                        </td>
                        <td>{s.team.city}</td>
                        <td style={{ textAlign: 'center' }}>{s.played}</td>
                        <td style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 600 }}>{s.won}</td>
                        <td style={{ textAlign: 'center', color: 'var(--gray-600)' }}>{s.drawn}</td>
                        <td style={{ textAlign: 'center', color: 'var(--red)' }}>{s.lost}</td>
                        <td style={{ textAlign: 'center' }}>{s.diff > 0 ? `+${s.diff}` : s.diff}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>
                          {s.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Matches */}
      {activeTab === 'matches' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--accent)"/> Fixtures & Schedule
            </h2>
            <Link to="/matches/new" className="btn btn-sm btn-primary">
              <Plus size={14}/> Schedule Match
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {matches.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No matches scheduled for this tournament yet.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team A</th>
                      <th>Team B</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, idx) => {
                      const res = resultMap[m.id];
                      return (
                        <tr key={m.id}>
                          <td>{idx + 1}</td>
                          <td className="td-name">{teamMap[m.teamAId] || 'Team A'}</td>
                          <td className="td-name">{teamMap[m.teamBId] || 'Team B'}</td>
                          <td>{formatDate(m.matchDate)} · {formatTime(m.matchTime)}</td>
                          <td>{m.venue}</td>
                          <td><span className={`badge ${statusBadgeClass(m.status)}`}>{m.status}</span></td>
                          <td>
                            {res ? (
                              <span style={{ fontWeight: 700, background: 'var(--gray-100)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
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
                            </div>
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
      )}

      {/* Tab: Teams */}
      {activeTab === 'teams' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent)"/> Participating Teams
            </h2>
            <Link to="/teams/new" className="btn btn-sm btn-primary">
              <Plus size={14}/> Register Team
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {teams.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No teams registered for this tournament yet.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team Name</th>
                      <th>City</th>
                      <th>Head Coach</th>
                      <th>Captain</th>
                      <th>Squad</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((tm, idx) => (
                      <tr key={tm.id}>
                        <td>{idx + 1}</td>
                        <td className="td-name">
                          <Link to={`/teams/${tm.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {tm.name}
                          </Link>
                        </td>
                        <td>{tm.city}</td>
                        <td>{tm.coach}</td>
                        <td>{tm.captain}</td>
                        <td>
                          <span className="badge badge-scheduled" style={{ fontSize: '0.75rem' }}>
                            {playerCounts[tm.id] || 0} player(s)
                          </span>
                        </td>
                        <td>
                          <div className="td-actions">
                            <button className="btn-icon view" title="View Team" onClick={() => navigate(`/teams/${tm.id}`)}>
                              <Users size={16}/>
                            </button>
                            <button className="btn-icon edit" title="Edit Team" onClick={() => navigate(`/teams/${tm.id}/edit`)}>
                              <Edit2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Overview Info */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="var(--accent)" /> Tournament Details
            </h2>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">Tournament Name</span>
                <span className="detail-value">{t.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Sport</span>
                <span className="detail-value">{t.sport}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Status</span>
                <span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Venue</span>
                <span className="detail-value">{t.venue}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{formatDate(t.startDate)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{formatDate(t.endDate)}</span>
              </div>
              {t.description && (
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{t.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${t.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
