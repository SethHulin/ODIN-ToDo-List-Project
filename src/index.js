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
    updateCheckButton,
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
    chooseNextActiveId,
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

        const type = event.target.dataset.type;
        console.log(type)
        const input = document.querySelector(`.main-input[data-type="${type}"]`);
        const listEl = document.querySelector(`ul[data-type="${type}"]`);
        const newName = input.value;
        console.log(newName)

        if (!newName) {
            displayError(`${type === "projects" ? "Project" : "Task"} name cannot be blank`);
            return;
        }

        pushState(masterList);
        const current = masterList[type];
        const updated = addItem(current, newName, type);

        if (updated === current) {
            displayError("Names must be unique.");
            clearProjectEntry(input);
            return;
        }

        masterList[type] = updated;
        clearElement(listEl);
        renderList(listEl, masterList[type]);
        clearProjectEntry(input);

        if (type === "projects") {
            const newProj = masterList.projects.find((p) => p.name === newName);
            if (newProj) handleNewActiveProject(newProj.id);
        }

        saveState(masterList);
    })
);

domMap.forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const type = form.dataset.type; // "projects" or "tasks"
        const data = new FormData(form);
        const newName = data.get(type); // because we set name="projects" or "tasks"

        const listEl = document.querySelector(`ul[data-type="${type}"]`);
        const input = domMap.inputs[type];

        if (!newName) {
            displayError(`${type === "projects" ? "Project" : "Task"} name cannot be blank`);
            return;
        }

        pushState(masterList);
        const current = masterList[type];
        const updated = addItem(current, newName, type);

        if (updated === current) {
            displayError("Names must be unique.");
            clearProjectEntry(input);
            return;
        }

        masterList[type] = updated;
        clearElement(listEl);
        renderList(listEl, masterList[type]);
        clearProjectEntry(input);

        if (type === "projects") {
            const newProj = masterList.projects.find((p) => p.name === newName);
            if (newProj) handleNewActiveProject(newProj.id);
        }

        saveState(masterList);
    });
});

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
        const type = event.target.dataset.type;
        const action = getActiveEventTarget(event);
        if (!action) return;

        switch (action) {
            case "delete": {
                const id = event.target.dataset.id || event.target.closest("[data-id]")?.dataset.id;
                if (!id) return;

                pushState(masterList);

                const removed = type === "projects" ? masterList.projects.find((p) => p.id === id) : null;
                if (removed && removed.active && masterList.projects.length > 1) {
                    const nextId = chooseNextActiveId(masterList.projects, id);
                    if (nextId) handleNewActiveProject(nextId);
                }

                if (removed) removed.tasks = [];

                masterList[type] = removeItem(masterList[type], id);
                masterList = normalizeList(masterList);

                clearApp(domMap.listContainers.projects, domMap.listContainers.tasks);
                renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
                saveState(masterList);
                break;
            }

            case "item": {
                const id = event.target.dataset.id;
                if (!id) return;

                if (type === "projects") {
                    handleNewActiveProject(id);
                } else if (type === "tasks") {
                    toggleNotes(id);
                }
                break;
            }

            case "expand":
                const id = event.target.dataset.id;
                if (!id) return;
                const expansionArrow = document.querySelector(`i[data-id="${id}"]`);
                expansionArrow.classList.toggle("fa-chevron-right");
                expansionArrow.classList.toggle("fa-chevron-down");
                toggleNotes(id);
                break;

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
                const expansionArrow = document.querySelector(`i[data-id="${id}"]`);
                expansionArrow.classList.toggle("fa-chevron-right");
                expansionArrow.classList.toggle("fa-chevron-down");

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

            case "toggle priority": {
                const btn = event.target.closest(".priority-button");
                if (!btn) return;
                const wrapper = btn.closest(".priority-wrapper");
                const open = wrapper.classList.toggle("open");
                btn.setAttribute("aria-expanded", String(open));
                break;
            }

            case "change priority": {
                const opt = event.target.closest(".priority-option");
                if (!opt) return;
                const id = opt.dataset.id;
                const newPriority = opt.dataset.value;
                if (!id || !newPriority) return;

                pushState(masterList);
                masterList.tasks = changePriority(id, newPriority, masterList.tasks);

                // Update just the button icon & close menu
                const wrapper = document.querySelector(`.priority-wrapper[data-id="${id}"]`);
                const btn = wrapper?.querySelector(".priority-button");
                if (btn) btn.innerHTML = opt.innerHTML.replace(/<span class="priority-label">.*<\/span>/, "");
                wrapper?.classList.remove("open");
                btn?.setAttribute("aria-expanded", "false");

                saveState(masterList);
                clearApp(masterList, domMap.listContainers.projects , domMap.listContainers.tasks);
                renderApp(masterList, domMap.listContainers.projects , domMap.listContainers.tasks);
                break;
            }

            case "check off": {
                const btn = event.target.closest(".check-off-button");
                const id  = btn?.dataset.id;
                if (!id) return;

                const current = getCurrentItem(masterList.tasks, id);
                const nextComplete = !current.complete;
                masterList.tasks = checkOffTask(id, nextComplete, masterList.tasks);

                updateCheckButton(btn, nextComplete);

                const notesContainer = document.querySelector(`.notes-container[data-id="${id}"]`);
                const addNotesBtn    = document.querySelector(`.add-notes[data-id="${id}"]`);
                if (notesContainer) notesContainer.classList.toggle("hidden", nextComplete);
                if (addNotesBtn)    addNotesBtn.classList.toggle("hidden", nextComplete);

                const title = document.querySelector(`.item-entry[data-id="${id}"]`);
                if (title) title.classList.toggle("completed-task", nextComplete);

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
                return;
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