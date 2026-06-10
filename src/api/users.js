import { apiFetch } from "../api/config";

export async function findUserByCredentials(email, password) {
    const users = await apiFetch(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    return users.length > 0 ? users[0] : null;
};