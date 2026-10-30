// ─────────────────────────────────────────────
//  API Service Layer — JSON Server with Local Fallback
// ─────────────────────────────────────────────
import initialData from '../../db.json';

const BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'sports_tournament_portal_db_v1';

let backendAvailable = true;

function getLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tournaments) && Array.isArray(parsed.teams)) {
        return parsed;
      }
    }
  } catch (_) { /* ignore */ }

  const clone = JSON.parse(JSON.stringify(initialData));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clone));
  } catch (_) { /* ignore */ }
  return clone;
}

function saveLocalDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) { /* ignore */ }
}

function handleLocalRequest(method, path, body) {
  const parts = path.replace(/^\//, '').split('/');
  const resource = parts[0];
  const id = parts[1];

  const db = getLocalDB();
  const list = db[resource] || [];

  if (method === 'GET') {
    if (id) {
      const item = list.find(x => String(x.id) === String(id));
      if (!item) throw new Error(`Not found: ${resource}/${id}`);
      return item;
    }
    return list;
  }

  if (method === 'POST') {
    const newId = body.id || `${resource.slice(0, 2)}_${Date.now()}`;
    const newItem = { ...body, id: newId };
    db[resource] = [...list, newItem];
    saveLocalDB(db);
    return newItem;
  }

  if (method === 'PUT') {
    const updated = { ...body, id: id || body.id };
    db[resource] = list.map(x => String(x.id) === String(id) ? updated : x);
    saveLocalDB(db);
    return updated;
  }

  if (method === 'DELETE') {
    db[resource] = list.filter(x => String(x.id) !== String(id));
    saveLocalDB(db);
    return null;
  }

  return null;
}

/**
 * Generic fetch helper with automatic local fallback when backend is offline.
 */
async function request(method, path, body) {
  if (backendAvailable) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      };
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${path}`, options);
      clearTimeout(timeoutId);

      if (response.ok) {
        if (response.status === 204) return null;
        return await response.json();
      }
    } catch (err) {
      backendAvailable = false;
      console.warn('JSON Server (port 3000) unreachable, switched to local storage mode.');
    }
  }

  // Fallback to local storage seamlessly
  return handleLocalRequest(method, path, body);
}

// ── Generic CRUD helpers ──────────────────────

export const getAll   = (resource)         => request('GET',    `/${resource}`);
export const getById  = (resource, id)     => request('GET',    `/${resource}/${id}`);
export const create   = (resource, data)   => request('POST',   `/${resource}`, data);
export const update   = (resource, id, data) => request('PUT',  `/${resource}/${id}`, data);
export const remove   = (resource, id)     => request('DELETE', `/${resource}/${id}`);

// ── Tournaments ───────────────────────────────

export const getTournaments    = ()       => getAll('tournaments');
export const getTournamentById = (id)     => getById('tournaments', id);
export const createTournament  = (data)   => create('tournaments', data);
export const updateTournament  = (id, d)  => update('tournaments', id, d);
export const deleteTournament  = (id)     => remove('tournaments', id);

// ── Teams ─────────────────────────────────────

export const getTeams    = ()     => getAll('teams');
export const getTeamById = (id)   => getById('teams', id);
export const createTeam  = (data) => create('teams', data);
export const updateTeam  = (id, d) => update('teams', id, d);
export const deleteTeam  = (id)   => remove('teams', id);

// ── Players ───────────────────────────────────

export const getPlayers    = ()     => getAll('players');
export const getPlayerById = (id)   => getById('players', id);
export const createPlayer  = (data) => create('players', data);
export const updatePlayer  = (id, d) => update('players', id, d);
export const deletePlayer  = (id)   => remove('players', id);

// ── Matches ───────────────────────────────────

export const getMatches    = ()     => getAll('matches');
export const getMatchById  = (id)   => getById('matches', id);
export const createMatch   = (data) => create('matches', data);
export const updateMatch   = (id, d) => update('matches', id, d);
export const deleteMatch   = (id)   => remove('matches', id);

// ── Results ───────────────────────────────────

export const getResults    = ()     => getAll('results');
export const getResultById = (id)   => getById('results', id);
export const createResult  = (data) => create('results', data);
export const updateResult  = (id, d) => update('results', id, d);
export const deleteResult  = (id)   => remove('results', id);
