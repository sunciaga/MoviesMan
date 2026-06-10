import { renderShell } from "../components/sidebar";
import { getSession, isAdmin } from "../auth/session";
import { getAllReservations, getReservationByUser } from "../api/reservations.js";
import { statusBadge, formatDate } from "../utils/dom.js";
import { navigate } from "../router/router.js";

export async function renderDashboard(container) {
    const main = renderShell(container, '/home');
    const user = getSession();

    main.innerHTML = /*html*/`
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Welcome back, ${user.name}. Here's your overview.</div>
      </div>
    </div>
    <div class="page-body" id="dashboard-body">
      <div style="color:var(--text-muted);font-size:14px">Loading...</div>
    </div>
    `
    try {
        const reservations = isAdmin()
        ? await getAllReservations()
        : await getReservationByUser(user.id);

        renderDashboardContent(main.querySelector('#dashboard-body'), reservations, user);
        
    } catch (err) {
        console.log(err)
        main.querySelector('#dashboard-body').innerHTML = `<p style="color:var(--danger)">Error loading data. Is json-server running?</p>`;
    };
};

function renderDashboardContent(body, reservations, user) {
    if (isAdmin()) {
        renderAdminDashboard(body, reservations);
    } else {
        renderUserDashboard(body, reservations, user);
    };
};

function renderAdminDashboard(body, functions) {
    const total = functions.length;
    const confirmed = functions.filter(f => f.status === 'confirmed').length;
    const pending = functions.filter(f => f.status === 'pending').length;
    const canceled = functions.filter(f => f.status === 'cancelled').length;

    const recentReservations = [...functions]
        .sort((a, b) => (b.createadAt || '').localeCompare(a.createadAt || ''))
        .slice(0, 5);
    
    body.innerHTML = /*html*/`
        <div class="stats-grid">
        <div class="stat-card stat-total">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total Reservations</div>
        </div>
        <div class="stat-card stat-active">
            <div class="stat-value">${canceled}</div>
            <div class="stat-label">Canceled</div>
        </div>
        <div class="stat-card stat-done">
            <div class="stat-value">${confirmed}</div>
            <div class="stat-label">Confirmed</div>
        </div>
        <div class="stat-card stat-pending">
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Pending</div>
        </div>
        </div>

        <div class="section-title">
        Recent Reservations
        <button class="btn btn-ghost btn-sm" id="view-all-btn">View all →</button>
        </div>

        ${recentReservations.length === 0
        ? `<div class="empty-state"><div class="empty-icon">◫</div><h3>No reservations yet</h3><p>Create your first reservation to get started.</p></div>`
        : `<div class="projects-grid" id="recent-projects"></div>`
        }
    `;

    if (recentReservations.length > 0) {
        const grid = body.querySelector('#recent-projects');
        recentReservations.forEach(r => {
        const card = buildReservationCard(r);
        grid.appendChild(card);
        });
    };

    body.querySelector('#view-all-btn')?.addEventListener('click', () => navigate('/reservations'));
};

function renderUserDashboard(body, reservations, user) {
    const reserved = reservations.length;
    const canceled = reservations.filter(r => r.status === 'canceled').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const pending = reservations.filter(r => r.status === 'pending').length;

    body.innerHTML = /*html*/`
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-value">${reserved}</div>
        <div class="stat-label">Reserved by me</div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-value">${confirmed}</div>
        <div class="stat-label">Confirmed</div>
      </div>
      <div class="stat-card stat-done">
        <div class="stat-value">${canceled}</div>
        <div class="stat-label">Canceled</div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-value">${pending}</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>

    <div class="section-title">
      My reservations
      <button class="btn btn-ghost btn-sm" id="view-all-btn">View all →</button>
    </div>

    ${reservations.length === 0
      ? `<div class="empty-state"><div class="empty-icon">◫</div><h3>No reservations assigned</h3><p>You have no reservations assigned yet.</p></div>`
      : `<div class="projects-grid" id="my-projects"></div>`
    }
  `;

    if (reservations.length > 0) {
        const grid = body.querySelector('#my-projects');
        reservations.forEach(p => {
        const card = buildReservationCard(p);
        grid.appendChild(card);
        });
    }

    body.querySelector('#view-all-btn')?.addEventListener('click', () => navigate('/reservations'));
};

function buildReservationCard(reservation) {
    const card = document.createElement('div');
    card.className = 'project-card card-hover';
    card.innerHTML = /*html*/`
    <div class="project-card-header">
      <div class="project-name">${reservation.workspace}</div>
      ${statusBadge(reservation.status)}
    </div>
    <div class="project-desc">${reservation.reason}</div>
    <div class="project-meta">
      <span>📅 ${formatDate(reservation.date)} ${reservation.startHour} - ${reservation.endHour}</span>
    </div>
  `;
  card.addEventListener('click', () => navigate(`/reservations/${reservation.id}`));
  return card;
}