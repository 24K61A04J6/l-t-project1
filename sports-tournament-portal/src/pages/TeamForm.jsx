import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getTeamById, createTeam, updateTeam, getTournaments } from '../services/api';
import { validateTeam, isValid } from '../utils/validation';
import Loading from '../components/Loading';
import '../styles/forms.css';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Hockey', 'Badminton', 'Athletics', 'Other'];

const EMPTY = {
  name: '', sport: '', coach: '', captain: '',
  tournamentId: '', city: '', registrationDate: '',
};

export default function TeamForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [form,         setForm]         = useState(EMPTY);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(isEdit);
  const [saving,       setSaving]       = useState(false);
  const [apiError,     setApiError]     = useState(null);
  const [tournaments,  setTournaments]  = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const tours = await getTournaments();
        setTournaments(tours);
        if (isEdit) {
          const t = await getTeamById(id);
          setForm({ name: t.name, sport: t.sport, coach: t.coach, captain: t.captain,
            tournamentId: t.tournamentId, city: t.city, registrationDate: t.registrationDate });
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
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateTeam(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setSaving(true);
    setApiError(null);
    try {
      if (isEdit) await updateTeam(id, form);
      else await createTeam(form);
      navigate('/teams');
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
          <h1>{isEdit ? 'Edit Team' : 'Register Team'}</h1>
          <p>{isEdit ? 'Update team information' : 'Register a new team for a tournament'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/teams')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h2>{isEdit ? 'Edit Team' : 'Team Registration'}</h2>
            <p>Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {apiError && <div className="alert alert-error">{apiError}</div>}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name" className="form-label">Team Name <span className="required">*</span></label>
                  <input id="name" name="name" type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                    value={form.name} onChange={handleChange} placeholder="e.g. Mumbai Strikers" />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="sport" className="form-label">Sport <span className="required">*</span></label>
                  <select id="sport" name="sport" className={`form-control ${errors.sport ? 'error' : ''}`}
                    value={form.sport} onChange={handleChange}>
                    <option value="">-- Select Sport --</option>
                    {SPORTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.sport && <span className="field-error">{errors.sport}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="tournamentId" className="form-label">Tournament <span className="required">*</span></label>
                  <select id="tournamentId" name="tournamentId" className={`form-control ${errors.tournamentId ? 'error' : ''}`}
                    value={form.tournamentId} onChange={handleChange}>
                    <option value="">-- Select Tournament --</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.tournamentId && <span className="field-error">{errors.tournamentId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="coach" className="form-label">Coach <span className="required">*</span></label>
                  <input id="coach" name="coach" type="text" className={`form-control ${errors.coach ? 'error' : ''}`}
                    value={form.coach} onChange={handleChange} placeholder="e.g. Ravi Shankar" />
                  {errors.coach && <span className="field-error">{errors.coach}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="captain" className="form-label">Captain <span className="required">*</span></label>
                  <input id="captain" name="captain" type="text" className={`form-control ${errors.captain ? 'error' : ''}`}
                    value={form.captain} onChange={handleChange} placeholder="e.g. Arjun Mehta" />
                  {errors.captain && <span className="field-error">{errors.captain}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">City <span className="required">*</span></label>
                  <input id="city" name="city" type="text" className={`form-control ${errors.city ? 'error' : ''}`}
                    value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="registrationDate" className="form-label">Registration Date <span className="required">*</span></label>
                  <input id="registrationDate" name="registrationDate" type="date"
                    className={`form-control ${errors.registrationDate ? 'error' : ''}`}
                    value={form.registrationDate} onChange={handleChange} />
                  {errors.registrationDate && <span className="field-error">{errors.registrationDate}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/teams')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : isEdit ? 'Update Team' : 'Register Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
