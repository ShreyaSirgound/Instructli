import { TOKEN_KEY } from "./constants";
import api from "./api";

export function getTokens() {
    try {
        return JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
    } catch {
        return null;
    }
}

export function getAccessToken() {
    return getTokens()?.access || null;
}

export function getRefreshToken() {
    return getTokens()?.refresh || null;
}

export function setTokens(tokens: { access: string; refresh: string }) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const res = await api.post("/api/token/refresh/", { refresh });
        const data = res.data;
        const newTokens = { access: data.access, refresh };
        setTokens(newTokens);
        return data.access;
    } catch (error) {
        console.error("Failed to refresh access token:", error);
        return null;
    }
}
