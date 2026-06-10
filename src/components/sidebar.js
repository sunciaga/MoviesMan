import { getSession } from "../auth/session";
import { logout } from "../auth/auth";
import { navigate } from "../router/router";
import { isAdmin } from "../auth/session";

export function renderShell(container, activeRoute) {
    const user = getSession();
    const initial = user?.name?.[0]?.toUpperCase() || '?';

    const managerLinks = isAdmin()
        ? /*html*/`<div class="nav-item ${activeRoute === '/reservations' ? 'active' : ''}" data-route="/reservations">
            <span class="nav-icon">◫</span> Reservations
        </div>`
        : /*html*/`<div class="nav-item ${activeRoute === '/reservations' ? 'active' : ''}" data-route="/reservations">
            <span class="nav-icon">◫</span> My Reservations
        </div>`;

    container.innerHTML = /*html*/`
        <div class="app-layout">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-logo">
            <div class="logo-mark">Movies<span>Man</span></div>
            <div class="logo-sub">Cinema manager</div>
            </div>

            <div class="sidebar-user">
            <div class="user-avatar">${initial}</div>
            <div>
                <div class="user-name">${user?.name || 'User'}</div>
                <div class="user-role">${user?.role || ''}</div>
            </div>
            </div>

            <nav class="sidebar-nav">
            <div class="nav-label">Menu</div>
            <div class="nav-item ${activeRoute === '/dashboard' ? 'active' : ''}" data-route="/dashboard">
                <span class="nav-icon">⬡</span> Dashboard
            </div>
            ${managerLinks}
            </nav>

            <div class="sidebar-footer">
            <button class="btn-theme-toggle" id="theme-toggle">
                <span id="theme-icon">☀</span> Toggle theme
            </button>
            <button class="btn-logout" id="logout-btn">
                <span>⏻</span> Log out
            </button>
            </div>
        </aside>

        <main class="main-content" id="main-content"></main>
        </div>
    `;

    // Nav item click
    container.querySelectorAll('.nav-item[data-route]').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.route));
    });

    // Logout
    container.querySelector('#logout-btn').addEventListener('click', logout);

    // Theme toggle
    const themeToggle = container.querySelector('#theme-toggle');
    const themeIcon   = container.querySelector('#theme-icon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('pf_theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☽';

    themeToggle.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('pf_theme', next);
        themeIcon.textContent = next === 'dark' ? '☀' : '☽';
    });

    return container.querySelector('#main-content');
}