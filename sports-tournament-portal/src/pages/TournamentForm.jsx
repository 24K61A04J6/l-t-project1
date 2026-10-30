import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getTournamentById, createTournament, updateTournament } from '../services/api';
import { validateTournament, isValid } from '../utils/validation';
import Loading from '../components/Loading';
import '../styles/forms.css';

const SPORTS   = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Hockey', 'Badminton', 'Athletics', 'Other'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed'];

const EMPTY = {
  name: '', sport: '', description: '', startDate: '',
  endDate: '', venue: '', status: 'Upcoming',
};

export default function TournamentForm() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEdit      = Boolean(id);

  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchErr, setFetchErr] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const t = await getTournamentById(id);
        setForm({ name: t.name, sport: t.sport, description: t.description || '',
          startDate: t.startDate, endDate: t.endDate, venue: t.venue, status: t.status });
      } catch (err) {
        setFetchErr(err.message);
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
    const errs = validateTournament(form);
    if (!isValid(errs)) { setErrors(errs); return; }

    setSaving(true);
    setApiError(null);
    try {
      if (isEdit) {
        await updateTournament(id, form);
      } else {
        await createTournament(form);
      }
      navigate('/tournaments');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;
  if (fetchErr) return (
    <div className="page-content">
      <div className="alert alert-error">{fetchErr}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>← Back</button>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Tournament' : 'New Tournament'}</h1>
          <p>{isEdit ? 'Update tournament information' : 'Create a new sports tournament'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h2>{isEdit ? 'Edit Tournament Details' : 'Tournament Details'}</h2>
            <p>All fields marked with * are required</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {apiError && <div className="alert alert-error">{apiError}</div>}

              <div className="form-grid">
                {/* Name */}
                <div className="form-group full-width">
                  <label htmlFor="name" className="form-label">
                    Tournament Name <span className="required">*</span>
                  </label>
                  <input id="name" name="name" type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                    value={form.name} onChange={handleChange} placeholder="e.g. National Cricket Championship" />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                {/* Sport */}
                <div className="form-group">
                  <label htmlFor="sport" className="form-label">Sport <span className="required">*</span></label>
                  <select id="sport" name="sport" className={`form-control ${errors.sport ? 'error' : ''}`}
                    value={form.sport} onChange={handleChange}>
                    <option value="">-- Select Sport --</option>
                    {SPORTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.sport && <span className="field-error">{errors.sport}</span>}
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

                {/* Start Date */}
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">Start Date <span className="required">*</span></label>
                  <input id="startDate" name="startDate" type="date" className={`form-control ${errors.startDate ? 'error' : ''}`}
                    value={form.startDate} onChange={handleChange} />
                  {errors.startDate && <span className="field-error">{errors.startDate}</span>}
                </div>

                {/* End Date */}
                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">End Date <span className="required">*</span></label>
                  <input id="endDate" name="endDate" type="date" className={`form-control ${errors.endDate ? 'error' : ''}`}
                    value={form.endDate} onChange={handleChange} />
                  {errors.endDate && <span className="field-error">{errors.endDate}</span>}
                </div>

                {/* Venue */}
                <div className="form-group full-width">
                  <label htmlFor="venue" className="form-label">Venue <span className="required">*</span></label>
                  <input id="venue" name="venue" type="text" className={`form-control ${errors.venue ? 'error' : ''}`}
                    value={form.venue} onChange={handleChange} placeholder="e.g. National Cricket Stadium, Mumbai" />
                  {errors.venue && <span className="field-error">{errors.venue}</span>}
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea id="description" name="description" className="form-control"
                    value={form.description} onChange={handleChange} rows={3}
                    placeholder="Brief tournament description…" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : isEdit ? 'Update Tournament' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
