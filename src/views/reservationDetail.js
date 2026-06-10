import { renderShell } from '../components/sidebar.js';
import { getSession, isAdmin } from '../auth/session.js';
import { getReservationById, updateReservation, deleteReservation } from '../api/reservations.js';
import { apiFetch } from '../api/config.js';
import { statusBadge, formatDate } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { navigate } from '../router/router.js';
import { openReservationModal } from '../components/reservationModal.js';
import { openConfirmDialog } from '../components/confirmDialog.js';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

export async function renderReservationDetail(container, { id }) {
  const main = renderShell(container, '/reservations');
  const user = getSession();
  const admin = isAdmin();

  main.innerHTML = `<div class="page-body"><p style="color:var(--text-muted)">Loading...</p></div>`;

  let reservation, users;

  try {
    [reservation, users] = await Promise.all([getReservationById(id), apiFetch('/users')]);
  } catch {
    showToast('Reservation not found.', 'error');
    main.innerHTML = `
      <div class="page-body">
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Reservation not found</h3>
          <p>This reservation may have been deleted.</p>
          <button class="btn btn-ghost" style="margin-top:16px" id="back-btn">← Back</button>
        </div>
      </div>`;
    main.querySelector('#back-btn')?.addEventListener('click', () => navigate('/reservations'));
    return;
  }

  if (!admin && reservation.userId != user.id) {
    showToast('Access denied.', 'error');
    navigate('/reservations');
    return;
  }

  const getUser = (uid) => users.find(u => u.id == uid);
  const assigned = getUser(reservation.userId);

  function render() {
    main.innerHTML = `
      <div class="page-header">
        <div>
          <button class="btn btn-ghost btn-sm" id="back-btn" style="margin-bottom:10px">← Back</button>
          <div class="page-title">${reservation.workspace}</div>
          <div class="page-subtitle" style="margin-top:6px">${statusBadge(reservation.status)}</div>
        </div>
        ${admin ? `
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-ghost" id="edit-btn">Edit</button>
            <button class="btn btn-danger" id="delete-btn">Delete</button>
          </div>
        ` : ''}
      </div>

      <div class="page-body">
        <div class="detail-grid">
          <div>
            <div class="detail-field">
              <div class="detail-field-label">Reason</div>
              <div class="detail-field-value">${reservation.reason}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Status</div>
              <div class="detail-field-value">${statusBadge(reservation.status)}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Date & Time</div>
              <div class="detail-field-value">${formatDate(reservation.date)} — ${reservation.startHour || '—'} to ${reservation.endHour || '—'}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Created</div>
              <div class="detail-field-value">${formatDate(reservation.createdAt)}</div>
            </div>

            ${!admin ? renderUserStatusUpdate() : ''}
          </div>

          <div>
            <div class="info-card">
              <div class="info-card-title">Reservation Info</div>
              <div class="detail-field">
                <div class="detail-field-label">Reserved by</div>
                <div class="detail-field-value" style="display:flex;align-items:center;gap:8px">
                  <div style="width:28px;height:28px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border-radius:6px;flex-shrink:0">
                    ${assigned?.name?.[0] || '?'}
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:500">${assigned?.name || 'Unknown'}</div>
                    <div style="font-size:12px;color:var(--text-muted)">${assigned?.role || ''}</div>
                  </div>
                </div>
              </div>
              <div class="detail-field" style="margin-bottom:0">
                <div class="detail-field-label">Reservation ID</div>
                <div class="detail-field-value" style="font-family:monospace;font-size:13px">#${reservation.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    main.querySelector('#back-btn').addEventListener('click', () => navigate('/reservations'));

    if (admin) {
      main.querySelector('#edit-btn').addEventListener('click', () => {
        openReservationModal(reservation, users, async (data) => {
          reservation = await updateReservation(reservation.id, data);
          showToast('Reservation updated.', 'success');
          render();
        });
      });

      main.querySelector('#delete-btn').addEventListener('click', () => {
        openConfirmDialog(
          `Delete reservation for "${reservation.workspace}"?`,
          'This action cannot be undone.',
          async () => {
            await deleteReservation(reservation.id);
            showToast('Reservation deleted.', 'success');
            navigate('/reservations');
          }
        );
      });
    }

    if (!admin) {
      const saveBtn = main.querySelector('#save-status-btn');
      const select  = main.querySelector('#status-select');

      saveBtn?.addEventListener('click', async () => {
        const newStatus = select.value;
        if (!newStatus || newStatus === reservation.status) {
          showToast('No changes to save.', 'info');
          return;
        }
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        try {
          reservation = await updateReservation(reservation.id, { status: newStatus });
          showToast('Status updated.', 'success');
          render();
        } catch {
          showToast('Failed to update status.', 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Status';
        }
      });
    }
  }

  function renderUserStatusUpdate() {
    const options = STATUSES.map(s =>
      `<option value="${s}" ${s === reservation.status ? 'selected' : ''}>${s}</option>`
    ).join('');

    return `
      <div class="status-update-box">
        <h4>Update Status</h4>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <select class="form-select" id="status-select" style="flex:1;min-width:160px">
            ${options}
          </select>
          <button class="btn btn-accent" id="save-status-btn">Save Status</button>
        </div>
      </div>
    `;
  }

  render();
}