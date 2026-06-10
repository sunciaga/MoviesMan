const SESSION_KEY = 'mm_session';

export function saveSession(user) {
    const { password: _omit, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
};

export function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null
    };
};

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
};

export function isAuthenticated() {
    return getSession() !== null;
};

export function isAdmin() {
    const s = getSession();
    return s?.role === 'admin';
}

export function isUser() {
    const s = getSession();
    return s?.role === 'user';
};