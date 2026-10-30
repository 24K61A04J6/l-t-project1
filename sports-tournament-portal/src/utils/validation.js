// ─────────────────────────────────────────────
//  Validation helpers
// ─────────────────────────────────────────────

export function validateTournament(data) {
  const errors = {};
  if (!data.name?.trim())        errors.name        = 'Tournament name is required.';
  if (!data.sport?.trim())       errors.sport       = 'Sport is required.';
  if (!data.startDate)           errors.startDate   = 'Start date is required.';
  if (!data.endDate)             errors.endDate     = 'End date is required.';
  if (data.startDate && data.endDate && data.endDate < data.startDate)
    errors.endDate = 'End date must be after start date.';
  if (!data.venue?.trim())       errors.venue       = 'Venue is required.';
  if (!data.status)              errors.status      = 'Status is required.';
  return errors;
}

export function validateTeam(data) {
  const errors = {};
  if (!data.name?.trim())           errors.name             = 'Team name is required.';
  if (!data.sport?.trim())          errors.sport            = 'Sport is required.';
  if (!data.coach?.trim())          errors.coach            = 'Coach name is required.';
  if (!data.captain?.trim())        errors.captain          = 'Captain name is required.';
  if (!data.tournamentId?.trim())   errors.tournamentId     = 'Please select a tournament.';
  if (!data.city?.trim())           errors.city             = 'City is required.';
  if (!data.registrationDate)       errors.registrationDate = 'Registration date is required.';
  return errors;
}

export function validatePlayer(data) {
  const errors = {};
  if (!data.name?.trim())       errors.name         = 'Player name is required.';
  if (!data.age)                errors.age          = 'Age is required.';
  else if (isNaN(Number(data.age)) || Number(data.age) < 5 || Number(data.age) > 80)
    errors.age = 'Please enter a valid age (5-80).';
  if (!data.gender)             errors.gender       = 'Gender is required.';
  if (!data.sport?.trim())      errors.sport        = 'Sport is required.';
  if (!data.position?.trim())   errors.position     = 'Position is required.';
  if (!data.jerseyNumber && data.jerseyNumber !== 0)
    errors.jerseyNumber = 'Jersey number is required.';
  else if (isNaN(Number(data.jerseyNumber)) || Number(data.jerseyNumber) < 0)
    errors.jerseyNumber = 'Jersey number must be a non-negative number.';
  if (!data.teamId?.trim())     errors.teamId       = 'Please select a team.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Enter a valid email address.';
  return errors;
}

export function validateMatch(data, teams) {
  const errors = {};
  if (!data.tournamentId?.trim()) errors.tournamentId = 'Please select a tournament.';
  if (!data.teamAId?.trim())      errors.teamAId      = 'Please select Team A.';
  if (!data.teamBId?.trim())      errors.teamBId      = 'Please select Team B.';
  if (data.teamAId && data.teamBId && data.teamAId === data.teamBId)
    errors.teamBId = 'Team A and Team B must be different.';
  if (!data.matchDate)            errors.matchDate    = 'Match date is required.';
  if (!data.matchTime)            errors.matchTime    = 'Match time is required.';
  if (!data.venue?.trim())        errors.venue        = 'Venue is required.';
  if (!data.status)               errors.status       = 'Status is required.';
  return errors;
}

export function validateResult(data) {
  const errors = {};
  if (!data.matchId?.trim()) errors.matchId = 'Please select a match.';
  if (data.teamAScore === '' || data.teamAScore === undefined || data.teamAScore === null)
    errors.teamAScore = 'Score A is required.';
  else if (isNaN(Number(data.teamAScore)) || Number(data.teamAScore) < 0)
    errors.teamAScore = 'Score must be a non-negative number.';
  if (data.teamBScore === '' || data.teamBScore === undefined || data.teamBScore === null)
    errors.teamBScore = 'Score B is required.';
  else if (isNaN(Number(data.teamBScore)) || Number(data.teamBScore) < 0)
    errors.teamBScore = 'Score must be a non-negative number.';
  return errors;
}

/** Returns true only if the errors object has no keys */
export const isValid = (errors) => Object.keys(errors).length === 0;
