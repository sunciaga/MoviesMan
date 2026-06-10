import { apiFetch } from "./config";

export async function getAllReservations() {
    return apiFetch('/reservations');
};

export async function getReservationById(id) {
    return apiFetch(`/reservations/${id}`)
};

export async function getReservationByUser(userId) {
    return apiFetch(`/reservations?userId=${userId}`)
};

export async function createReservation(data) {
    return apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export async function updateReservation(id, data) {
    return apiFetch(`/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteReservation(id) {
    return apiFetch(`/reservations/${id}`, { method: 'DELETE' });
}