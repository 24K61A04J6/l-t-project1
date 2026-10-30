import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import {
  getResultById, createResult, updateResult,
  getMatches, getTeams, updateMatch, getResults,
} from '../services/api';
import { validateResult, isValid } from '../utils/validation';
import Loading from '../components/Loading';
import '../styles/forms.css';

const EMPTY = {
  matchId: '', teamAScore: '', teamBScore: '', winnerTeamId: '', remarks: '',
};

export default function ResultForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [searchParams] = useSearchParams();
  const isEdit   = Boolean(id);

  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [matches,    setMatches]    = useState([]);
  const [allTeams,   setAllTeams]   = useState([]);
  const [allResults, setAllResults] = useState([]);

  // Derived from selected match
  const [matchTeamA, setMatchTeamA] = useState(null);
  const [matchTeamB, setMatchTeamB] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [ms, ts, rs] = await Promise.all([getMatches(), getTeams(), getResults()]);
        setMatches(ms);
        setAllTeams(ts);
        setAllResults(rs);

        if (isEdit) {
          const r = await getResultById(id);
          const match = ms.find(m => m.id === r.matchId) || {};
          setMatchTeamA(ts.find(t => t.id === match.teamAId) || null);
          setMatchTeamB(ts.find(t => t.id === match.teamBId) || null);
          setForm({
            matchId: r.matchId,
            teamAScore: String(r.teamAScore),
            teamBScore: String(r.teamBScore),
            winnerTeamId: r.winnerTeamId || '',
            remarks: r.remarks || '',
          });
        } else {
          const queryMatchId = searchParams.get('matchId');
          if (queryMatchId) {
            const match = ms.find(m => m.id === queryMatchId);
            if (match) {
              setMatchTeamA(ts.find(t => t.id === match.teamAId) || null);
              setMatchTeamB(ts.find(t => t.id === match.teamBId) || null);
              setForm(prev => ({ ...prev, matchId: queryMatchId }));
            }
          }
        }
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, searchParams]);

  function handleMatchChange(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setMatchTeamA(allTeams.find(t => t.id === match.teamAId) || null);
      setMatchTeamB(allTeams.find(t => t.id === match.teamBId) || null);
    } else {
      setMatchTeamA(null);
      setMatchTeamB(null);
    }
    setForm(prev => ({ ...prev, matchId, teamAScore: '', teamBScore: '', winnerTeamId: '' }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // Auto-determine winner when scores change
      if (name === 'teamAScore' || name === 'teamBScore') {
        const valA = name === 'teamAScore' ? value : prev.teamAScore;
        const valB = name === 'teamBScore' ? value : prev.teamBScore;
        if (valA !== '' && valB !== '' && !isNaN(Number(valA)) && !isNaN(Number(valB))) {
          const a = Number(valA);
          const b = Number(valB);
          if (a > b)      next.winnerTeamId = matchTeamA?.id || '';
          else if (b > a) next.winnerTeamId = matchTeamB?.id || '';
          else            next.winnerTeamId = '';
        } else {
          next.winnerTeamId = '';
        }
      }
      return next;
    });
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Prevent duplicate for same match (on create)
    if (!isEdit) {
      const duplicate = allResults.find(r => r.matchId === form.matchId);
      if (duplicate) {
        setErrors({ matchId: 'A result already exists for this match. Edit or delete it first.' });
        return;
      }
    }

    const errs = validateResult(form);
    if (!isValid(errs)) { setErrors(errs); return; }

    setSaving(true);
    setApiError(null);
    try {
      const payload = {
        matchId: form.matchId,
        teamAScore: Number(form.teamAScore),
        teamBScore: Number(form.teamBScore),
        winnerTeamId: form.winnerTeamId || null,
        remarks: form.remarks,
        recordedAt: new Date().toISOString(),
      };

      if (isEdit) {
        await updateResult(id, payload);
      } else {
        await createResult(payload);
        // Mark the match as Completed
        const match = matches.find(m => m.id === form.matchId);
        if (match) {
          await updateMatch(form.matchId, { ...match, status: 'Completed' });
        }
      }
      navigate('/results');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  // Exclude matches that already have a result (on create mode, unless editing)
  const eligibleMatches = isEdit
    ? matches
    : matches.filter(m => !allResults.some(r => r.matchId === m.id) || m.id === form.matchId);

  const teamMap = Object.fromEntries(allTeams.map(t => [t.id, t.name]));
  const scoreA  = Number(form.teamAScore);
  const scoreB  = Number(form.teamBScore);
  const canShowWinner = form.teamAScore !== '' && form.teamBScore !== '' &&
    !isNaN(scoreA) && !isNaN(scoreB) && matchTeamA && matchTeamB;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Result' : 'Record Result'}</h1>
          <p>{isEdit ? 'Update match result' : 'Record the result of a completed match'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/results')}>
          <ArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h2>{isEdit ? 'Edit Match Result' : 'Match Result Entry'}</h2>
            <p>Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {apiError && <div className="alert alert-error">{apiError}</div>}

              <div className="form-grid">
                {/* Match */}
                <div className="form-group full-width">
                  <label htmlFor="matchId" className="form-label">Match <span className="required">*</span></label>
                  <select id="matchId" name="matchId" className={`form-control ${errors.matchId ? 'error' : ''}`}
                    value={form.matchId}
                    onChange={e => { handleMatchChange(e.target.value); if (errors.matchId) setErrors(p => { const n={...p}; delete n.matchId; return n; }); }}
                    disabled={isEdit}>
                    <option value="">-- Select Match --</option>
                    {eligibleMatches.map(m => (
                      <option key={m.id} value={m.id}>
                        {teamMap[m.teamAId] || 'TBD'} vs {teamMap[m.teamBId] || 'TBD'} ({m.matchDate})
                      </option>
                    ))}
                  </select>
                  {errors.matchId && <span className="field-error">{errors.matchId}</span>}
                  {!isEdit && eligibleMatches.length === 0 && (
                    <span className="field-hint">⚠ All matches already have results recorded.</span>
                  )}
                </div>

                {/* Team labels & scores */}
                {matchTeamA && matchTeamB && (
                  <>
                    <div className="form-group">
                      <label htmlFor="teamAScore" className="form-label">
                        {matchTeamA.name} Score <span className="required">*</span>
                      </label>
                      <input id="teamAScore" name="teamAScore" type="number" min="0"
                        className={`form-control ${errors.teamAScore ? 'error' : ''}`}
                        value={form.teamAScore} onChange={handleChange} placeholder="0" />
                      {errors.teamAScore && <span className="field-error">{errors.teamAScore}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="teamBScore" className="form-label">
                        {matchTeamB.name} Score <span className="required">*</span>
                      </label>
                      <input id="teamBScore" name="teamBScore" type="number" min="0"
                        className={`form-control ${errors.teamBScore ? 'error' : ''}`}
                        value={form.teamBScore} onChange={handleChange} placeholder="0" />
                      {errors.teamBScore && <span className="field-error">{errors.teamBScore}</span>}
                    </div>
                  </>
                )}

                {/* Winner preview */}
                {canShowWinner && (
                  <div className="form-group full-width">
                    <div className="alert alert-info" style={{ margin: 0 }}>
                      {scoreA > scoreB
                        ? `🏆 Winner: ${matchTeamA.name}`
                        : scoreB > scoreA
                        ? `🏆 Winner: ${matchTeamB.name}`
                        : `🤝 Result: Draw`
                      }
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="remarks" className="form-label">Remarks</label>
                  <textarea id="remarks" name="remarks" className="form-control"
                    value={form.remarks} onChange={handleChange} rows={3}
                    placeholder="Any additional notes about the match…" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/results')}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={saving}>
                <Save size={15}/> {saving ? 'Saving…' : isEdit ? 'Update Result' : 'Record Result'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
