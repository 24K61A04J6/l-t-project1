import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getPlayerById, createPlayer, updatePlayer, getTeams } from '../services/api';
import { validatePlayer, isValid } from '../utils/validation';
import Loading from '../components/Loading';
import '../styles/forms.css';

const SPORTS   = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Hockey', 'Badminton', 'Athletics', 'Other'];
const GENDERS  = ['Male', 'Female', 'Other'];

const EMPTY = {
  name: '', age: '', gender: '', sport: '', position: '',
  jerseyNumber: '', teamId: '', email: '', phone: '',
};

export default function PlayerForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState(null);
  const [teams,    setTeams]    = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const teamList = await getTeams();
        setTeams(teamList);
        if (isEdit) {
          const p = await getPlayerById(id);
          setForm({
            name: p.name, age: String(p.age), gender: p.gender, sport: p.sport,
            position: p.position, jerseyNumber: String(p.jerseyNumber),
            teamId: p.teamId, email: p.email || '', phone: p.phone || '',
          });
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
      if (name === 'teamId' && value) {
        const selectedTeam = teams.find(t => t.id === value);
        if (selectedTeam && selectedTeam.sport) {
          next.sport = selectedTeam.sport;
        }
      }
      if (name === 'sport' && value) {
        const currentTeam = teams.find(t => t.id === prev.teamId);
        if (currentTeam && currentTeam.sport !== value) {
          next.teamId = '';
        }
      }
      return next;
    });
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'teamId' && errors.sport) setErrors(prev => { const n = { ...prev }; delete n.sport; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePlayer(form);
    if (!isValid(errs)) { setErrors(errs); return; }
    setSaving(true);
    setApiError(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        jerseyNumber: Number(form.jerseyNumber),
      };
      if (isEdit) await updatePlayer(id, payload);
      else await createPlayer(payload);
      navigate('/players');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  const displayedTeams = form.sport
    ? teams.filter(t => t.sport === form.sport)
    : teams;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Player' : 'Add Player'}</h1>
          <p>{isEdit ? 'Update player details' : 'Add a new player to a team'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/players')}>
          <ArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h2>{isEdit ? 'Edit Player' : 'Player Registration'}</h2>
            <p>Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {apiError && <div className="alert alert-error">{apiError}</div>}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="pname" className="form-label">Full Name <span className="required">*</span></label>
                  <input id="pname" name="name" type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                    value={form.name} onChange={handleChange} placeholder="e.g. Arjun Mehta" />
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
                  <label htmlFor="teamId" className="form-label">Team <span className="required">*</span></label>
                  <select id="teamId" name="teamId" className={`form-control ${errors.teamId ? 'error' : ''}`}
                    value={form.teamId} onChange={handleChange}>
                    <option value="">-- Select Team --</option>
                    {displayedTeams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.sport})
                      </option>
                    ))}
                  </select>
                  {errors.teamId && <span className="field-error">{errors.teamId}</span>}
                  {form.sport && displayedTeams.length === 0 && (
                    <span className="field-hint">No teams registered for {form.sport} yet.</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="age" className="form-label">Age <span className="required">*</span></label>
                  <input id="age" name="age" type="number" min="5" max="80" className={`form-control ${errors.age ? 'error' : ''}`}
                    value={form.age} onChange={handleChange} placeholder="e.g. 22" />
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">Gender <span className="required">*</span></label>
                  <select id="gender" name="gender" className={`form-control ${errors.gender ? 'error' : ''}`}
                    value={form.gender} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="position" className="form-label">Position <span className="required">*</span></label>
                  <input id="position" name="position" type="text" className={`form-control ${errors.position ? 'error' : ''}`}
                    value={form.position} onChange={handleChange} placeholder="e.g. Batsman, Striker, Guard" />
                  {errors.position && <span className="field-error">{errors.position}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="jerseyNumber" className="form-label">Jersey Number <span className="required">*</span></label>
                  <input id="jerseyNumber" name="jerseyNumber" type="number" min="0" className={`form-control ${errors.jerseyNumber ? 'error' : ''}`}
                    value={form.jerseyNumber} onChange={handleChange} placeholder="e.g. 7" />
                  {errors.jerseyNumber && <span className="field-error">{errors.jerseyNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input id="email" name="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                    value={form.email} onChange={handleChange} placeholder="player@example.com" />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input id="phone" name="phone" type="tel" className="form-control"
                    value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/players')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15}/> {saving ? 'Saving…' : isEdit ? 'Update Player' : 'Add Player'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
