import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, User, Calendar, Medal, CheckCircle, Clock, TrendingUp, Plus, Award
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getTournaments, getTeams, getPlayers, getMatches, getResults } from '../services/api';
import { formatDate, formatTime, formatDay, formatMonthAbbr, statusBadgeClass } from '../utils/formatters';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [tournaments, teams, players, matches, results] = await Promise.all([
        getTournaments(), getTeams(), getPlayers(), getMatches(), getResults(),
      ]);
      setData({ tournaments, teams, players, matches, results });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  if (loading) return <Loading message="Loading dashboard…" />;
  if (error)   return <ErrorMessage message={error} onRetry={loadAll} />;

  const { tournaments, teams, players, matches, results } = data;

  const completed  = matches.filter(m => m.status === 'Completed');
  const upcoming   = matches.filter(m => m.status === 'Scheduled')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate))
    .slice(0, 5);

  // enrich results with team names
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));
  const matchMap = Object.fromEntries(matches.map(m => [m.id, m]));

  const recentResults = [...results]
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    .slice(0, 5)
    .map(r => {
      const match = matchMap[r.matchId] || {};
      return {
        ...r,
        teamA: teamMap[match.teamAId] || 'Team A',
        teamB: teamMap[match.teamBId] || 'Team B',
        winner: r.winnerTeamId ? teamMap[r.winnerTeamId] : 'Draw',
      };
    });

  const stats = [
    { label: 'Tournaments',     value: tournaments.length, icon: Trophy,      accentColor: '#1a56db', bgColor: '#dbeafe', iconColor: '#1a56db', to: '/tournaments' },
    { label: 'Teams',           value: teams.length,       icon: Users,       accentColor: '#16a34a', bgColor: '#d1fae5', iconColor: '#16a34a', to: '/teams' },
    { label: 'Players',         value: players.length,     icon: User,        accentColor: '#7c3aed', bgColor: '#ede9fe', iconColor: '#7c3aed', to: '/players' },
    { label: 'Total Matches',   value: matches.length,     icon: Calendar,    accentColor: '#ea580c', bgColor: '#ffedd5', iconColor: '#ea580c', to: '/matches' },
    { label: 'Completed',       value: completed.length,   icon: CheckCircle, accentColor: '#0891b2', bgColor: '#cffafe', iconColor: '#0891b2', to: '/results' },
    { label: 'Upcoming',        value: upcoming.length,    icon: Clock,       accentColor: '#ca8a04', bgColor: '#fef9c3', iconColor: '#ca8a04', to: '/matches' },
    { label: 'Results Recorded',value: results.length,     icon: Medal,       accentColor: '#db2777', bgColor: '#fce7f3', iconColor: '#db2777', to: '/results' },
    { label: 'Active Tourneys', value: tournaments.filter(t => t.status === 'Ongoing').length,
      icon: TrendingUp, accentColor: '#059669', bgColor: '#d1fae5', iconColor: '#059669', to: '/tournaments' },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Admin — here's today's tournament overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/tournaments/new" className="btn btn-primary">
            <Plus size={16} /> Tournament
          </Link>
          <Link to="/teams/new" className="btn btn-secondary">
            <Plus size={16} /> Team
          </Link>
          <Link to="/matches/new" className="btn btn-secondary">
            <Plus size={16} /> Match
          </Link>
          <Link to="/results/new" className="btn btn-secondary">
            <Plus size={16} /> Result
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent Results + Upcoming Matches */}
      <div className="dashboard-grid">
        {/* Recent Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Results</h2>
            <Link to="/results" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body">
            {recentResults.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No results recorded yet.</p>
            ) : (
              <ul className="result-list">
                {recentResults.map(r => (
                  <li key={r.id} className="result-item">
                    <div className="result-teams">
                      {r.teamA}
                      <span className="result-score">{r.teamAScore} – {r.teamBScore}</span>
                      {r.teamB}
                    </div>
                    <div className="result-meta">
                      🏆 {r.winnerTeamId ? `Winner: ${r.winner}` : 'Draw'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Matches</h2>
            <Link to="/matches" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body">
            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No upcoming matches.</p>
            ) : (
              upcoming.map(m => {
                const teamA = teamMap[m.teamAId] || 'TBD';
                const teamB = teamMap[m.teamBId] || 'TBD';
                return (
                  <div key={m.id} className="match-item">
                    <div className="match-date-badge">
                      <div className="mday">{formatDay(m.matchDate)}</div>
                      <div className="mmonth">{formatMonthAbbr(m.matchDate)}</div>
                    </div>
                    <div className="match-info">
                      <div className="match-teams">{teamA} vs {teamB}</div>
                      <div className="match-meta">
                        🕐 {formatTime(m.matchTime)} &nbsp;·&nbsp; 📍 {m.venue}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Standings Quick Banner */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%)' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--accent)" /> Tournament Standings & Points Tables
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              Check current tournament rankings, points tables, win-loss records, and goal differentials.
            </p>
          </div>
          <Link to="/standings" className="btn btn-primary">
            View Live Standings →
          </Link>
        </div>
      </div>
    </div>
  );
}
