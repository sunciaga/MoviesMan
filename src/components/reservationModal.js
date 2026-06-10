import { validateReservationForm, hasErrors } from '../utils/validators.js';
import { qs } from '../utils/dom.js';

const STATUSES = ['Pending', 'Cancelled', 'Confirmed'];

export function openReservationModal(reservation, users, onSubmit) {
  const isEdit = !!reservation;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const statusOptions = STATUSES.map(s =>
    `<option value="${s}" ${reservation?.status === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  const userOptions = users.map(u =>
    `<option value="${u.id}" ${reservation?.userId == u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`
  ).join('');

  overlay.innerHTML = /*html*/`
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Edit Reservation' : 'New Reservation'}</h2>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Reservation Name</label>
          <input class="form-input" id="proj-name" type="text" 
            placeholder="e.g. Sala A" 
            value="${reservation?.workspace || ''}" maxlength="80" />
          <span class="form-error" id="err-workspace"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Reason</label>
          <textarea class="form-textarea" id="proj-desc" 
            placeholder="Reservation reason...">${reservation?.reason || ''}</textarea>
          <span class="form-error" id="err-reason"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="proj-status">
            <option value="">— Select status —</option>
            ${statusOptions}
          </select>
          <span class="form-error" id="err-status"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Responsible</label>
          <select class="form-select" id="proj-assigned">
            <option value="">— Select user —</option>
            ${userOptions}
          </select>
          <span class="form-error" id="err-assigned"></span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-accent" id="modal-submit-btn">
          ${isEdit ? 'Save Changes' : 'Create Reservation'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  qs('#modal-close-btn', overlay).addEventListener('click', close);
  qs('#modal-cancel-btn', overlay).addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  qs('#modal-submit-btn', overlay).addEventListener('click', async () => {
    const data = {
      workspace:        qs('#proj-name', overlay).value.trim(),
      reason: qs('#proj-desc', overlay).value.trim(),
      status:      qs('#proj-status', overlay).value,
      userId:  Number(qs('#proj-assigned', overlay).value),
    };

    const errors = validateReservationForm(data);

    // Clear previous errors
    ['workspace', 'reason', 'status', 'userId'].forEach(field => {
      const el = qs(`#err-${field === 'userId' ? 'assigned' : field}`, overlay);
      const input = qs(`#proj-${field === 'assignedTo' ? 'assigned' : field}`, overlay);
      if (el) el.textContent = '';
      input?.classList.remove('error');
    });

    if (hasErrors(errors)) {
      Object.entries(errors).forEach(([field, msg]) => {
        const errEl = qs(`#err-${field}`, overlay);
        const inputKey = field === 'assignedTo' ? 'assigned' : field;
        const inputEl = qs(`#proj-${inputKey}`, overlay);
        if (errEl) errEl.textContent = msg;
        inputEl?.classList.add('error');
      });
      return;
    }

    const btn = qs('#modal-submit-btn', overlay);
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {

      const completeData = {
        ...data,
        date: new Date().toISOString().split('T')[0], // Guarda "2026-06-05" de forma automática
        startHour: "08:00",                          // Horas estándar por defecto
        endHour: "09:00"
      }
      await onSubmit(completeData);
      close();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Create Reservation';
    }
  });
}