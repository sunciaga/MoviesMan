import { isAuthenticated } from "../auth/session";
import { renderLoginPage } from "../views/loginView.js";
import { renderDashboard } from "../views/homeView.js";
import { renderReservations } from "../views/reservations.js";
import { renderReservationDetail } from "../views/reservationDetail.js"

const ROUTES = {
    "/login": { render: renderLoginPage, public: true },
    "/home": { render: renderDashboard, public: false },
    "/reservations": { render: renderReservations, public: false },
    "/reservations/:id": { render: renderReservationDetail, public: false }

};

function parseHash() {
    const hash = window.location.hash.slice(1) || '/login';
    if (hash.startsWith('/reservations')) {
        const id = hash.split('/')[2];
        if (id) return { path: '/reservations/:id', params: { id } };
    }
    return { path: hash, params: {} };
};

export function navigate(path) {
    window.location.hash = path;
};

export function handleRouter() {
    const app = document.getElementById("app");
    const { path, params } = parseHash();

    const route = ROUTES[path];

    if (!route) {
        navigate(isAuthenticated() ? '/home' : '/login');
        return;
    };

    if (!route.public && !isAuthenticated()) {
        navigate('/login');
        return;
    };

    if (route.public && isAuthenticated()) {
        navigate('/home')
        return;
    };

    app.innerHTML = ''
    route.render(app, params);
};

export function initRouter() {
    window.addEventListener('hashchange', handleRouter);
    handleRouter();
};