const API_BASE = "http://localhost:3001";

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };

    const res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(errorText || `Request failed: ${res.status}`);
    };

    if (res.status === 204) return null;

    return res.json();
};