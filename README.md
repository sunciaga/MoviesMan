# ReservationsMan — Internal Reservation Manager

A Single Page Application (SPA) for managing internal workspace reservations, built with Vanilla JS + Vite and a mock REST API powered by json-server.

---

## Description

ReservationsMan allows a team to manage workspace reservations through role-based access:

- **Admins** have full CRUD over all reservations.
- **Users** can view their own reservations and update their statuses.

---

## Technologies

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | Vanilla JS (ES Modules) |
| Bundler     | Vite 5                  |
| Styles      | Custom CSS (CSS Variables, dark mode) |
| Mock API    | json-server 0.17        |
| Storage     | localStorage (session + theme) |

---

## Installation

bash
cd reservations-manager
npm install


---

## Running the Project

Only 1 terminal required for this project:

### Terminal 1 — Dev run
bash
npm run dev
# json-server starts on http://localhost:3001
# vite server starts simultaneously

---

## Test Users

| Role  | Email            | Password |
|-------|------------------|----------|
| Admin | admin@test.com   | A123456  |
| User  | user@test.com    | A123456  |
| User  | user2@test.com   | A123456  |

---

## Project Structure

src/
├── main.js
├── api/
│   ├── config.js          ← base fetch wrapper
│   ├── reservations.js    ← CRUD API calls
│   └── users.js
├── auth/
│   ├── auth.js            ← login / logout
│   └── session.js         ← localStorage session
├── router/
│   └── router.js          ← hash router + guards
├── components/
│   ├── sidebar.js         ← app shell
│   ├── reservationModal.js
│   ├── confirmDialog.js
│   └── pagination.js
├── views/
│   ├── loginView.js
│   ├── homeView.js
│   ├── reservations.js
│   └── reservationDetail.js
├── utils/
│   ├── toast.js
│   ├── validators.js
│   └── dom.js
└── styles/
    └── main.css

---

## Role Permissions

| Action                  | Admin | User             |
|-------------------------|-------|------------------|
| View all reservations   | ✅    | ❌               |
| View own reservations   | ✅    | ✅               |
| Create reservation      | ✅    | ❌               |
| Edit reservation        | ✅    | ❌               |
| Delete reservation      | ✅    | ❌               |
| Update own status       | ✅    | ✅               |
| Access other's detail   | ✅    | ❌ (redirected)  |

---

## Technical Decisions

- **Hash routing**: `window.location.hash` never triggers a page reload. `hashchange` event handles all navigation.
- **ES Modules + Vite**: native `import/export` with `defer` behavior — no `DOMContentLoaded` needed.
- **localStorage session**: persists across refreshes. Password is stripped before storing.
- **CSS custom properties**: dark mode toggled via `data-theme` on `<html>` — no JS logic per component.
- **Centralized API layer**: all `fetch` calls live in `src/api/`. Views never call `fetch` directly.
- **`Promise.all`**: parallel requests where multiple resources are needed simultaneously.
