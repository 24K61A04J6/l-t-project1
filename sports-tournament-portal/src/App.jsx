import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar  from './components/Sidebar';
import Navbar   from './components/Navbar';

// Pages
import Dashboard         from './pages/Dashboard';
import Tournaments       from './pages/Tournaments';
import TournamentForm    from './pages/TournamentForm';
import TournamentDetails from './pages/TournamentDetails';
import Teams             from './pages/Teams';
import TeamForm          from './pages/TeamForm';
import TeamDetails       from './pages/TeamDetails';
import Players           from './pages/Players';
import PlayerForm        from './pages/PlayerForm';
import Matches           from './pages/Matches';
import MatchForm         from './pages/MatchForm';
import Results           from './pages/Results';
import ResultForm        from './pages/ResultForm';
import Standings         from './pages/Standings';
import NotFound          from './pages/NotFound';

import './styles/layout.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />

        <Routes>
          <Route path="/"                       element={<Dashboard />} />

          {/* Tournaments */}
          <Route path="/tournaments"            element={<Tournaments />} />
          <Route path="/tournaments/new"        element={<TournamentForm />} />
          <Route path="/tournaments/:id"        element={<TournamentDetails />} />
          <Route path="/tournaments/:id/edit"   element={<TournamentForm />} />

          {/* Teams */}
          <Route path="/teams"                  element={<Teams />} />
          <Route path="/teams/new"              element={<TeamForm />} />
          <Route path="/teams/:id"              element={<TeamDetails />} />
          <Route path="/teams/:id/edit"         element={<TeamForm />} />

          {/* Players */}
          <Route path="/players"                element={<Players />} />
          <Route path="/players/new"            element={<PlayerForm />} />
          <Route path="/players/:id/edit"       element={<PlayerForm />} />

          {/* Matches */}
          <Route path="/matches"                element={<Matches />} />
          <Route path="/matches/new"            element={<MatchForm />} />
          <Route path="/matches/:id/edit"       element={<MatchForm />} />

          {/* Results */}
          <Route path="/results"                element={<Results />} />
          <Route path="/results/new"            element={<ResultForm />} />
          <Route path="/results/:id/edit"       element={<ResultForm />} />

          {/* Standings / Leaderboard */}
          <Route path="/standings"              element={<Standings />} />

          <Route path="*"                       element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}
