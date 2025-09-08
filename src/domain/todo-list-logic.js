// domain/todo-list-logic.js

// ————— Item Factories —————
function makeProjectItem(name, isActive) {
    return {
        name: name.trim(),
        id: Date.now().toString(),
        tasks: [],
        active: !!isActive,
    };
}

function makeTodoItem(name) {
    return {
        name: name.trim(),
        id: Date.now().toString(),
        priority: 1,
        notes: "",
        complete: false,
    };
}

// ————— Normalization / Defaults —————
export function normalizeList(master) {
    if (!master || !Array.isArray(master.projects)) return { projects: [makeProjectItem("Inbox", true)], tasks: [] };
    if (master.projects.length === 0) return { projects: [makeProjectItem("Inbox", true)], tasks: [] };
    // ensure exactly one active (first wins if none)
    const anyActive = master.projects.some(p => p.active);
    if (!anyActive) master.projects[0].active = true;
    return { ...master };
}

// ————— Project Active / Switching —————
export function setActiveProject(newActiveId, projectList, currentTaskList) {
    const oldActive = projectList.find(p => p.active);
    if (oldActive) oldActive.tasks = currentTaskList;

    projectList.forEach(p => { p.active = (p.id === newActiveId); });

    const next = projectList.find(p => p.active) || projectList[0];
    return { projects: projectList, tasks: next ? next.tasks : [] };
}

export function chooseNextActiveId(projects, removedId) {
    const idx = projects.findIndex(p => p.id === removedId);
    if (idx === -1) return null;
    const neighbor = projects[idx + 1] || projects[idx - 1] || null;
    return neighbor ? neighbor.id : null;
}

// ————— CRUD helpers —————
export function addItem(list, name, type) {
    if (!name || !list) return list || [];

    const normalizedName = normalize(name);
    const names = list.map(i => normalize(i.name));
    if (names.includes(normalizedName)) return list; // reject duplicates (case/trim-insensitive)

    const isProject = type === "projects";
    const isFirstProject = isProject && list.length === 0;
    const newItem = isProject ? makeProjectItem(name, isFirstProject) : makeTodoItem(name);
    return [...list, newItem];
}

export function editItem(list, item, newName) {
    if (!list || !item) return list || [];
    const name = (newName ?? "").trim();
    if (!name) return list; // ignore empty rename
    return list.map(el => (el.id === item.id ? { ...el, name } : el));
}

export function removeItem(list, id) {
    if (!list) return [];
    return list.filter(i => i.id !== id);
}

export function submitNotes(taskId, taskList, notesText) {
    return taskList.map(t => (t.id === taskId ? { ...t, notes: notesText } : t));
}

export function changePriority(taskId, newPriority, list) {
    return list.map(t => (t.id === taskId ? { ...t, priority: Number(newPriority) } : t));
}

export function checkOffTask(taskId, completeFlag, list) {
    return list.map(t => (t.id === taskId ? { ...t, complete: !!completeFlag } : t));
}

export function getCurrentItem(list, id) {
    return (list || []).find(i => i.id === id);
}

// ————— Utils —————
function normalize(s) {
    return (s || "").trim().toLowerCase();
}