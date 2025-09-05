const STORAGE_KEY = "todoAppState";

export function saveState (state) {
    localStorage.setItem(STORAGE_KEY , JSON.stringify(state));
}

export function loadState () {
    const load = localStorage.getItem (STORAGE_KEY);
    return load ? JSON.parse(load) : {projects: [] , tasks: []};
}