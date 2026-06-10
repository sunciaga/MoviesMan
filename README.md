# Reservation Dashboard Manager

A dynamic, role-based JavaScript dashboard component for managing and viewing workspace reservations. It automatically adapts its layout, metrics, and data retrieval based on whether the logged-in user is an administrator or a regular client.

---

## 🚀 Features

* **Role-Based Views**: Automatically detects user permissions to serve an **Admin Dashboard** (global overview) or a **User Dashboard** (personal overview).
* **Real-time Metrics**: Displays dynamic stat cards tracking total, confirmed, pending, and canceled reservations.
* **Recent Activity**: Admins can view the top 5 most recently created reservations sorted chronologically.
* **Interactive Navigation**: Features clickable cards that link directly to detailed reservation views, plus a global "View all" shortcut.
* **Robust Error Handling**: Displays visual error feedback if the API backend (`json-server`) fails to respond.

---

## 📁 Architecture & Flow

The dashboard workflow relies on three sequential steps to render the data safely:

[renderDashboard] ──> Fetch Data (Admin vs User) ──> [renderDashboardContent] ──> Split Layout (Admin/User UI)

### Component Breakdown

1. **Main Entry Point (`renderDashboard`)**: Initializes the main outer shell, displays a loading state, reads the user's active session, and handles conditional API queries.
2. **View Splitter (`renderDashboardContent`)**: Acts as a router that switches layouts between Admin and User UIs using internal session validation.
3. **Dynamic Card Builder (`buildReservationCard`)**: Generates individual workspace reservation nodes dynamically, appending state badges and localized date-time wrappers.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
This module is built using vanilla JavaScript (ES6+) and requires a localized development server environment. Ensure your backend API is up and running.

### 2. Run the Backend API
The dashboard fetches data from an internal API. If you are using `json-server` as indicated by the error logs, run it using:
```bash
json-server --watch db.json --port 3000
```

### 3. Dependencies & File Paths
This component imports internal modules. Ensure the following paths exist in your project:
* **Authentication**: `../auth/session` (`getSession`, `isAdmin`)
* **API Layer**: `../api/reservations.js` (`getAllReservations`, `getReservationByUser`)
* **Routing**: `../router/router.js` (`navigate`)
* **UI Utilities**: `../utils/dom.js` (`statusBadge`, `formatDate`)
* **Global Layout**: `../components/sidebar` (`renderShell`)

---
## 📦 Tech Stack & Dependencies

The main dependencies configured in `package.json` are:

* **Frontend Build**: `vite` (^8.0.12) & `@tailwindcss/vite` (^4.3.0)
* **Styling**: `tailwindcss` (^4.3.0)
* **Mock Database**: `json-server` (^1.0.0-beta.15) on port 3001
* **Process Manager**: `concurrently` (^10.0.3) for single-command execution
---

## 📊 Data Schema Expected

The API endpoints must return reservation objects matching the following structure:


| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | String \| Number | Unique identifier used for routing |
| `workspace` | String | Name of the reserved room or space |
| `status` | String | Must be `'confirmed'`, `'pending'`, or `'canceled'` |
| `reason` | String | Brief note about the reservation purpose |
| `date` | String | Day format processed by DOM utilities |
| `startHour` | String | Start time (e.g., `"09:00"`) |
| `endHour` | String | End time (e.g., `"11:00"`) |
| `createadAt` | String | ISO Timestamp used for Admin chronological sorting |