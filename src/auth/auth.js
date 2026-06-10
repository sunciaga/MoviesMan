import { findUserByCredentials } from "../api/users";
import { saveSession, getSession, clearSession } from "./session";
import { navigate } from "../router/router";

export async function login(email, password) {
    if (!email || !password) throw new Error('Please fill in all the fields.');

    const user = await findUserByCredentials(email, password);
    if (!user) throw new Error('Invalid email or password.');

    saveSession(user);
    return user;
};

export function logout() {
    clearSession();
    navigate('/login');
};

export { getSession };