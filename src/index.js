// src/index.js

import "./styles/main.css";

import {
    domMap,
    renderApp,
    renderProjects,
    renderTasks,
    renderList,
    renderTodoListHeader,
    clearApp,
    clearElement,
    displayError,
    clearProjectEntry,
    toggleNotes,
    toggleNotesInput,
    toggleEdit,
    getActiveEventTarget,
} from "./ui/UI.js";

import {
    addItem,
    removeItem,
    setActiveProject,
    submitNotes,
    changePriority,
    checkOffTask,
    getCurrentItem,
    normalizeList,
    editItem,
    chooseNextActiveId, // make sure this is exported from your domain file
} from "./domain/todo-list-logic";

import { loadState, saveState } from "./services/storage";
import { canUndo, pushState, undo } from "./domain/undo-stack";

// -----------------------------
// BOOT
// -----------------------------
let masterList = normalizeList(loadState());
renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);

// -----------------------------
// ADDERS
// -----------------------------
domMap.buttons.adders.forEach((button) =>
    button.addEventListener("click", (event) => {
        event.preventDefault();

        const type = event.target.dataset.type; // "projects" | "tasks"
        const input = document.querySelector(`.main-input[data-type="${type}"]`);
        const listEl = document.querySelector(`ul[data-type="${type}"]`);
        const newName = input.value;

        if (!newName) {
            displayError(`${type === "projects" ? "Project" : "Task"} name cannot be blank`);
            return;
        }

        pushState(masterList);
        const current = masterList[type];
        const updated = addItem(current, newName, type);

        if (updated === current) {
            // name collision / no change
            displayError("Names must be unique.");
            clearProjectEntry(input);
            return;
        }

        masterList[type] = updated;
        clearElement(listEl);
        renderList(listEl, masterList[type]);
        clearProjectEntry(input);

        // If a project was added, make it active and focus tasks input
        if (type === "projects") {
            const newProj = masterList.projects.find((p) => p.name === newName);
            if (newProj) handleNewActiveProject(newProj.id);
        }

        saveState(masterList);
    })
);

// -----------------------------
// GLOBAL BUTTONS
// -----------------------------
domMap.buttons.clearCompleted.addEventListener("click", (e) => {
    e.preventDefault();
    pushState(masterList);
    masterList.tasks = masterList.tasks.filter((t) => !t.complete);
    clearElement(domMap.listContainers.tasks);
    renderTasks(masterList.tasks);
    saveState(masterList);
});

domMap.buttons.undo.addEventListener("click", () => {
    if (!canUndo()) return;
    masterList = normalizeList(undo());
    renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
    saveState(masterList);
});

// -----------------------------
// DELEGATED LIST CLICK HANDLER
// -----------------------------
domMap.listContainers.allLists.forEach((container) =>
    container.addEventListener("click", (event) => {
        const type = event.target.dataset.type; // projects | tasks (present on many controls)
        const action = getActiveEventTarget(event);
        if (!action) return;

        switch (action) {
            case "delete": {
                const id = event.target.dataset.id;
                if (!id) return;

                pushState(masterList);

                // If deleting a project, decide next active BEFORE mutating array
                const removed = type === "projects" ? masterList.projects.find((p) => p.id === id) : null;
                if (removed && removed.active && masterList.projects.length > 1) {
                    const nextId = chooseNextActiveId(masterList.projects, id);
                    if (nextId) handleNewActiveProject(nextId);
                }

                // Optional: clear removed tasks (if you store them)
                if (removed) removed.tasks = [];

                masterList[type] = removeItem(masterList[type], id);
                masterList = normalizeList(masterList);

                clearApp(domMap.listContainers.projects, domMap.listContainers.tasks);
                renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
                saveState(masterList);
                break;
            }

            case "item": {
                // Clicked the item title
                const id = event.target.dataset.id;
                if (!id) return;

                if (type === "projects") {
                    handleNewActiveProject(id);
                } else if (type === "tasks") {
                    toggleNotes(id);
                }
                break;
            }

            case "add notes": {
                const id = event.target.dataset.id;
                if (!id) return;
                const item = getCurrentItem(masterList.tasks, id);
                if (!item) return;
                toggleNotesInput(item);
                break;
            }

            case "submit notes": {
                const id = event.target.dataset.id;
                if (!id) return;

                const input = document.querySelector(`textarea[data-id="${id}"]`);
                const text = input ? input.value : "";

                pushState(masterList);
                masterList.tasks = submitNotes(id, masterList.tasks, text);

                clearElement(domMap.listContainers.tasks);
                renderTasks(masterList.tasks);
                domMap.inputs.tasks?.focus();
                saveState(masterList);
                break;
            }

            case "cancel notes": {
                const id = event.target.dataset.id;
                if (!id) return;
                const item = getCurrentItem(masterList.tasks, id);
                if (!item) return;
                toggleNotesInput(item);
                break;
            }

            case "change priority": {
                const id = event.target.dataset.id;
                if (!id) return;
                const newPriority = event.target.value;
                pushState(masterList);
                masterList.tasks = changePriority(id, newPriority, masterList.tasks);
                saveState(masterList);
                break;
            }

            case "check off": {
                const id = event.target.dataset.id;
                if (!id) return;

                pushState(masterList);
                masterList.tasks = checkOffTask(id, true, masterList.tasks);

                // Hide notes preview and Add Notes when checked
                toggleNotes(id); // ensures preview is hidden if it was visible

                const title = document.querySelector(`.item-entry[data-id="${id}"]`);
                if (title) title.classList.toggle("completed-task");

                const btn = document.querySelector(`button.check-off-button[data-id="${id}"]`);
                if (btn) {
                    btn.classList.toggle("uncheck");
                    btn.textContent = btn.classList.contains("uncheck") ? "Uncheck" : "Check Off";
                }

                // Hide Add Notes button on completed
                const addBtn = document.querySelector(`.add-notes[data-id="${id}"]`);
                if (addBtn) addBtn.classList.add("hidden");

                saveState(masterList);
                break;
            }

            case "rename": {
                const id = event.target.dataset.id;
                if (!id) return;
                const item = getCurrentItem(masterList[type], id);
                if (!item) return;

                toggleEdit(item);
                const field = document.querySelector(`.edit-item[data-id="${id}"]`);
                field?.focus();
                field?.select();
                break;
            }

            case "save rename": {
                const id = event.target.dataset.id;
                if (!id) return;

                const field = document.querySelector(`.edit-item[data-id="${id}"]`);
                const newName = field ? field.value : "";

                if (!newName) {
                    displayError("Name cannot be blank");
                    return;
                }

                pushState(masterList);
                const current = getCurrentItem(masterList[type], id);
                masterList[type] = editItem(masterList[type], current, newName);

                clearApp(domMap.listContainers.projects, domMap.listContainers.tasks);
                renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
                saveState(masterList);
                break;
            }

            case "cancel rename": {
                const id = event.target.dataset.id;
                if (!id) return;
                const item = getCurrentItem(masterList[type], id);
                if (item) toggleEdit(item);
                break;
            }

            default:
                return; // ignore anything else
        }
    })
);

// -----------------------------
// HELPERS
// -----------------------------
function handleNewActiveProject(newActiveId) {
    const newActive = masterList.projects.find((p) => p.id === newActiveId);
    if (!newActive) return;

    pushState(masterList);
    masterList = setActiveProject(newActiveId, masterList.projects, masterList.tasks);

    clearElement(domMap.listContainers.projects);
    clearElement(domMap.listContainers.tasks);

    renderTodoListHeader(newActive.name);
    renderProjects(masterList.projects);
    renderTasks(masterList.tasks);

    document.getElementById("todo-list-input")?.focus();
    saveState(masterList);
}