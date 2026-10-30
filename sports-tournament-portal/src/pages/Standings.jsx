import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Trophy, Users, Calendar, Medal } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getTournaments, getTeams, getMatches, getResults } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/tables.css';

export default function Standings() {
  const { data: tournaments, loading: tLoad, error: tErr, refetch: rTours } = useFetch(getTournaments);
  const { data: teams,       loading: tmLoad }                              = useFetch(getTeams);
  const { data: matches,     loading: mLoad }                               = useFetch(getMatches);
  const { data: results,     loading: rLoad }                               = useFetch(getResults);

  const [selectedTourId, setSelectedTourId] = useState('');

  if (tLoad || tmLoad || mLoad || rLoad) return <Loading message="Calculating tournament standings…" />;
  if (tErr) return <ErrorMessage message={tErr} onRetry={rTours} />;

  const tourList = tournaments || [];
  const currentTourId = selectedTourId || (tourList[0]?.id || '');
  const activeTournament = tourList.find(t => t.id === currentTourId);

  const tourTeams = (teams || []).filter(t => t.tournamentId === currentTourId);
  const tourMatches = (matches || []).filter(m => m.tournamentId === currentTourId);
  const resultMap = Object.fromEntries((results || []).map(r => [r.matchId, r]));

  // Calculate table
  const standings = tourTeams.map(tm => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let scoreFor = 0;
    let scoreAgainst = 0;

    tourMatches.forEach(m => {
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

  const leader = standings[0];
  const completedMatches = tourMatches.filter(m => resultMap[m.id]).length;
  const totalScores = (results || [])
    .filter(r => tourMatches.some(m => m.id === r.matchId))
    .reduce((sum, r) => sum + r.teamAScore + r.teamBScore, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Points Table & Standings</h1>
          <p>Live rankings, team form, and competition leaderboards.</p>
        </div>
        {activeTournament && (
          <Link to={`/tournaments/${activeTournament.id}`} className="btn btn-outline">
            <Trophy size={16}/> Tournament Details
          </Link>
        )}
      </div>

      {/* Tournament Selector Bar */}
      <div className="table-controls" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: 450 }}>
          <label htmlFor="standings-select" style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>
            Select Tournament:
          </label>
          <select
            id="standings-select"
            className="filter-select"
            style={{ width: '100%' }}
            value={currentTourId}
            onChange={e => setSelectedTourId(e.target.value)}
          >
            {tourList.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.sport} - {t.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Highlights Bar */}
      {activeTournament && standings.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #eab308' }}>
            <div className="stat-label">Current Leader</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--navy)' }}>
              {leader ? `👑 ${leader.team.name}` : '—'}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="stat-label">Competing Teams</div>
            <div className="stat-value">{standings.length}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
            <div className="stat-label">Matches Completed</div>
            <div className="stat-value">{completedMatches} / {tourMatches.length}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--orange)' }}>
            <div className="stat-label">Total Points / Scores</div>
            <div className="stat-value">{totalScores}</div>
          </div>
        </div>
      )}

      {/* Standings Table Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--accent)" /> {activeTournament ? activeTournament.name : 'Standings'}
          </h2>
          {activeTournament && (
            <span className="badge badge-ongoing">{activeTournament.sport}</span>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {standings.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem' }}>
              <Award size={40} color="var(--gray-400)" />
              <h3>No teams registered</h3>
              <p>Register teams for this tournament to generate the points table.</p>
              <Link to="/teams/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Users size={16}/> Register Team
              </Link>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Team</th>
                    <th>City</th>
                    <th style={{ textAlign: 'center' }}>Played</th>
                    <th style={{ textAlign: 'center' }}>Won</th>
                    <th style={{ textAlign: 'center' }}>Drawn</th>
                    <th style={{ textAlign: 'center' }}>Lost</th>
                    <th style={{ textAlign: 'center' }}>Score For</th>
                    <th style={{ textAlign: 'center' }}>Score Against</th>
                    <th style={{ textAlign: 'center' }}>Diff</th>
                    <th style={{ textAlign: 'center' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, idx) => (
                    <tr key={s.team.id}>
                      <td style={{ fontWeight: 800 }}>
                        {idx === 0 ? (
                          <span style={{ color: '#ca8a04', fontSize: '1.1rem' }}>🥇 1</span>
                        ) : idx === 1 ? (
                          <span style={{ color: '#64748b', fontSize: '1.1rem' }}>🥈 2</span>
                        ) : idx === 2 ? (
                          <span style={{ color: '#b45309', fontSize: '1.1rem' }}>🥉 3</span>
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
                      <td style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700 }}>{s.won}</td>
                      <td style={{ textAlign: 'center', color: 'var(--gray-600)' }}>{s.drawn}</td>
                      <td style={{ textAlign: 'center', color: 'var(--red)', fontWeight: 700 }}>{s.lost}</td>
                      <td style={{ textAlign: 'center' }}>{s.scoreFor}</td>
                      <td style={{ textAlign: 'center' }}>{s.scoreAgainst}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {s.diff > 0 ? `+${s.diff}` : s.diff}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)' }}>
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
    </div>
  );
}
