export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateReservationForm({ workspace, reason, status, userId }) {
  const errors = {};
  if (!workspace || workspace.trim().length < 3)
    errors.workspace = 'Workspace must be at least 3 characters.';
  if (workspace && workspace.trim().length > 80)
    errors.workspace = 'Workspace must be under 80 characters.';
  if (!reason || reason.trim().length < 3)
    errors.reason = 'reason must be at least 3 characters.';
  if (!status)
    errors.status = 'Please select a status.';
  if (!userId)
    errors.userId = 'Please select a reserver user.';
  console.log(errors)
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}