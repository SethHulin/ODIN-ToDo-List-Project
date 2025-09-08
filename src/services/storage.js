// services/storage.js
const STORAGE_KEY = "todoAppState";

export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        // non-fatal; you might show a toast later
        console.error("saveState failed", e);
    }
}

export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { projects: [], tasks: [] };
    } catch (e) {
        console.error("loadState failed", e);
        return { projects: [], tasks: [] };
    }
}