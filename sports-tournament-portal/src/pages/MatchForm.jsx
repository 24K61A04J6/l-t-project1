import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getMatchById, createMatch, updateMatch, getTournaments, getTeams } from '../services/api';
import { validateMatch, isValid } from '../utils/validation';
import Loading from '../components/Loading';
import '../styles/forms.css';

const STATUSES = ['Scheduled', 'In Progress', 'Completed'];

const EMPTY = {
  tournamentId: '', teamAId: '', teamBId: '',
  matchDate: '', matchTime: '', venue: '', status: 'Scheduled',
};

export default function MatchForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [form,         setForm]         = useState(EMPTY);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [apiError,     setApiError]     = useState(null);
  const [tournaments,  setTournaments]  = useState([]);
  const [allTeams,     setAllTeams]     = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [tours, teams] = await Promise.all([getTournaments(), getTeams()]);
        setTournaments(tours);
        setAllTeams(teams);

        if (isEdit) {
          const m = await getMatchById(id);
          const preset = {
            tournamentId: m.tournamentId, teamAId: m.teamAId, teamBId: m.teamBId,
            matchDate: m.matchDate, matchTime: m.matchTime, venue: m.venue, status: m.status,
          };
          setForm(preset);
          setFilteredTeams(teams.filter(t => t.tournamentId === m.tournamentId));
        }
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // Reset team selections when tournament changes
      if (name === 'tournamentId') {
        next.teamAId = '';
        next.teamBId = '';
        setFilteredTeams(allTeams.filter(t => t.tournamentId === value));
      }
      return next;
    });
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateMatch(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setSaving(true);
    setApiError(null);
    try {
      if (isEdit) await updateMatch(id, form);
      else await createMatch(form);
      navigate('/matches');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Match' : 'Schedule Match'}</h1>
          <p>{isEdit ? 'Update match details' : 'Schedule a new match between two teams'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/matches')}>
          <ArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h2>{isEdit ? 'Edit Match' : 'Match Scheduling'}</h2>
            <p>Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {apiError && <div className="alert alert-error">{apiError}</div>}

              <div className="form-grid">
                {/* Tournament */}
                <div className="form-group full-width">
                  <label htmlFor="tournamentId" className="form-label">Tournament <span className="required">*</span></label>
                  <select id="tournamentId" name="tournamentId" className={`form-control ${errors.tournamentId ? 'error' : ''}`}
                    value={form.tournamentId} onChange={handleChange}>
                    <option value="">-- Select Tournament --</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.tournamentId && <span className="field-error">{errors.tournamentId}</span>}
                  {form.tournamentId && filteredTeams.length === 0 && (
                    <span className="field-hint">⚠ No teams registered for this tournament yet.</span>
                  )}
                </div>

                {/* Team A */}
                <div className="form-group">
                  <label htmlFor="teamAId" className="form-label">Team A <span className="required">*</span></label>
                  <select id="teamAId" name="teamAId" className={`form-control ${errors.teamAId ? 'error' : ''}`}
                    value={form.teamAId} onChange={handleChange} disabled={!form.tournamentId}>
                    <option value="">-- Select Team A --</option>
                    {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.teamAId && <span className="field-error">{errors.teamAId}</span>}
                </div>

                {/* Team B */}
                <div className="form-group">
                  <label htmlFor="teamBId" className="form-label">Team B <span className="required">*</span></label>
                  <select id="teamBId" name="teamBId" className={`form-control ${errors.teamBId ? 'error' : ''}`}
                    value={form.teamBId} onChange={handleChange} disabled={!form.tournamentId}>
                    <option value="">-- Select Team B --</option>
                    {filteredTeams
                      .filter(t => t.id !== form.teamAId)
                      .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.teamBId && <span className="field-error">{errors.teamBId}</span>}
                </div>

                {/* Date */}
                <div className="form-group">
                  <label htmlFor="matchDate" className="form-label">Match Date <span className="required">*</span></label>
                  <input id="matchDate" name="matchDate" type="date" className={`form-control ${errors.matchDate ? 'error' : ''}`}
                    value={form.matchDate} onChange={handleChange} />
                  {errors.matchDate && <span className="field-error">{errors.matchDate}</span>}
                </div>

                {/* Time */}
                <div className="form-group">
                  <label htmlFor="matchTime" className="form-label">Match Time <span className="required">*</span></label>
                  <input id="matchTime" name="matchTime" type="time" className={`form-control ${errors.matchTime ? 'error' : ''}`}
                    value={form.matchTime} onChange={handleChange} />
                  {errors.matchTime && <span className="field-error">{errors.matchTime}</span>}
                </div>

                {/* Venue */}
                <div className="form-group full-width">
                  <label htmlFor="venue" className="form-label">Venue <span className="required">*</span></label>
                  <input id="venue" name="venue" type="text" className={`form-control ${errors.venue ? 'error' : ''}`}
                    value={form.venue} onChange={handleChange} placeholder="e.g. National Stadium, Mumbai" />
                  {errors.venue && <span className="field-error">{errors.venue}</span>}
                </div>

                {/* Status */}
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status <span className="required">*</span></label>
                  <select id="status" name="status" className={`form-control ${errors.status ? 'error' : ''}`}
                    value={form.status} onChange={handleChange}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.status && <span className="field-error">{errors.status}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/matches')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15}/> {saving ? 'Saving…' : isEdit ? 'Update Match' : 'Schedule Match'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
