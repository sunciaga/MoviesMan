import { renderShell } from '../components/sidebar.js';
import { getSession, isAdmin } from '../auth/session.js';
import { getAllReservations, getReservationByUser, createReservation, updateReservation, deleteReservation } from '../api/reservations.js';
import { apiFetch } from '../api/config.js';
import { statusBadge, formatDate } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { navigate } from '../router/router.js';
import { openReservationModal } from '../components/reservationModal.js';
import { openConfirmDialog } from '../components/confirmDialog.js';
import { renderPagination } from '../components/pagination.js';

const PER_PAGE = 6;

export async function renderReservations(container) {
  const main = renderShell(container, '/Reservations');
  const user = getSession();
  const admin = isAdmin();

  main.innerHTML = /*html*/`
    <div class="page-header">
      <div>
        <div class="page-title">${admin ? 'All Reservations' : 'My Reservations'}</div>
        <div class="page-subtitle">${admin ? 'Manage and track all company Reservations.' : 'Reservations assigned to you.'}</div>
      </div>
      ${admin ? `<button class="btn btn-accent" id="new-project-btn">+ New Reservation</button>` : ''}
    </div>
    <div class="page-body">
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input type="text" id="search-input" placeholder="Search Reservations..." />
        </div>
        <select class="filter-select" id="status-filter">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div id="projects-grid" class="projects-grid">
        <p style="color:var(--text-muted);font-size:14px">Loading...</p>
      </div>
      <div id="pagination-container"></div>
    </div>
  `;

  // State
  let allReservations = [];
  let allUsers    = [];
  let currentPage = 1;
  let searchQuery = '';
  let statusFilter = '';

  // Load data
  try {
    [allReservations, allUsers] =
      await Promise.all([
        admin ? getAllReservations() : getReservationByUser(user.id),
        apiFetch('/users'),
      ]);
  } catch (err){
    console.log(err)
    showToast('Failed to load reservations.', 'error');
    main.querySelector('#projects-grid').innerHTML = `<p style="color:var(--danger)">Error. Is json-server running?</p>`;
    return;
  }

  function getUserName(id) {
    return allUsers.find(u => u.id == id)?.name || 'Unknown';
  }

  function getFiltered() {
    return allReservations.filter(p => {
      const name = p.workspace || p.name || '';
      const desc = p.reason || p.description || '';

      const matchSearch = !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !statusFilter || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }

  function render() {
    const filtered = getFiltered();
    const start = (currentPage - 1) * PER_PAGE;
    const page  = filtered.slice(start, start + PER_PAGE);

    const grid = main.querySelector('#projects-grid');
    const pagContainer = main.querySelector('#pagination-container');

    if (filtered.length === 0) {
      grid.innerHTML = /*html*/`
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">◫</div>
          <h3>No reservations found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>`;
      pagContainer.innerHTML = '';
      return;
    }

    grid.innerHTML = '';
    page.forEach(p => {
      const card = buildCard(p);
      grid.appendChild(card);
    });

    renderPagination(pagContainer, filtered.length, currentPage, PER_PAGE, (pg) => {
      currentPage = pg;
      render();
      main.querySelector('.page-body')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function buildCard(reservation) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = /*html*/`
      <div class="project-card-header">
        <div class="project-name">${reservation.workspace}</div>
        ${statusBadge(reservation.status)}
      </div>
      <div class="project-desc">${reservation.reason}</div>
      <div class="project-meta">
        <span>👤 ${getUserName(reservation.userId)}</span>
        <span>📅 ${formatDate(reservation.date)} / ${reservation.startHour} ${reservation.endHour}</span>
      </div>
      <div class="project-card-actions">
        <button class="btn btn-ghost btn-sm btn-detail">View</button>
        ${admin ? `
          <button class="btn btn-ghost btn-sm btn-edit">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete">Delete</button>
        ` : ''}
      </div>
    `;

    card.querySelector('.btn-detail').addEventListener('click', e => {
      e.stopPropagation();
      navigate(`/reservations/${reservation.id}`);
    });

    if (admin) {
      card.querySelector('.btn-edit').addEventListener('click', e => {
        e.stopPropagation();
        openReservationModal(reservation, allUsers, async (data) => {
          const updated = await updateReservation(reservation.id, data);
          const idx = allReservations.findIndex(p => p.id === reservation.id);
          if (idx !== -1) allReservations[idx] = { ...allReservations[idx], ...updated };
          showToast('Reservation updated.', 'success');
          render();
        });
      });

      card.querySelector('.btn-delete').addEventListener('click', e => {
        e.stopPropagation();
        openConfirmDialog(
          `Delete "${reservation.workspace}"?`,
          'This action cannot be undone.',
          async () => {
            await deleteReservation(reservation.id);
            allReservations = allReservations.filter(p => p.id !== reservation.id);
            showToast('Reservation deleted.', 'success');
            if (currentPage > 1 && getFiltered().slice((currentPage - 1) * PER_PAGE).length === 0) {
              currentPage--;
            }
            render();
          }
        );
      });
    }

    return card;
  }

  // Events
  main.querySelector('#search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    currentPage = 1;
    render();
  });

  main.querySelector('#status-filter').addEventListener('change', e => {
    statusFilter = e.target.value;
    currentPage = 1;
    render();
  });

  if (admin) {
    main.querySelector('#new-project-btn').addEventListener('click', () => {
      openReservationModal(null, allUsers, async (data) => {
        try {
          const newReservation = await createReservation({ ...data, createdAt: new Date().toISOString().split('T')[0] })
          allReservations.unshift(newReservation);
          showToast('Reservation created!', 'success');
          currentPage = 1;
          render();
        } catch (error) {
          console.error("API error creating reservation:", error);
          showToast('Failed to create reservation.', 'error');
        }
        
      });
    });
  }

  render();
}