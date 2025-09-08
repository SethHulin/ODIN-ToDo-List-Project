// src/ui/UI.js

// -----------------------------
// DOM MAP
// -----------------------------
export const domMap = {
    listContainers: {
        allLists: document.querySelectorAll(".list"),
        projects: document.querySelector("#project-list"),
        tasks: document.querySelector("#todo-list"),
    },
    inputs: {
        projects: document.querySelector('.main-input[data-type="projects"]'),
        tasks: document.querySelector('.main-input[data-type="tasks"]'),
    },
    buttons: {
        adders: document.querySelectorAll(".adder-button"),
        undo: document.querySelector("#undo-button"),
        clearCompleted: document.querySelector("#clear-completed-tasks"),
    },
    header: document.querySelector("#todo-list-header"),
};

// -----------------------------
// RENDERERS
// -----------------------------
export const renderProjects = (list) => renderList(domMap.listContainers.projects, list);
export const renderTasks    = (list) => renderList(domMap.listContainers.tasks, list);

export const clearApp = (projectEl, taskEl) => {
    clearElement(projectEl);
    clearElement(taskEl);
};

export function renderApp(masterList, projectEl, taskEl) {
    if (!masterList?.projects?.length) return; // normalized state guarantees Inbox, so this is just a guard

    clearApp(projectEl, taskEl);
    renderProjects(masterList.projects);
    renderTasks(masterList.tasks);

    const active = masterList.projects.find(p => p.active);
    if (active) renderTodoListHeader(active.name);
}

export function renderList(container, list) {
    const type = container.dataset.type; // "projects" | "tasks"
    const frag = document.createDocumentFragment();

    for (const item of list) {
        const row = document.createElement("li");
        row.classList.add("list-item");

        // title + edit block (hidden by default)
        const title = buildTitle(item, type);
        row.appendChild(title);
        row.appendChild(buildEditTitle(item, type));
        row.appendChild(buildRenameButton(item, type));

        if (type === "tasks") {
            // core task controls
            row.appendChild(buildPrioritySelect(item));

            // notes preview container (always render container so toggle works, hide if empty)
            const preview = buildNotesPreview(item);
            title.appendChild(preview);

            // notes input + its buttons (hidden initially)
            title.appendChild(buildNotesInput(item));
            for (const btn of buildNotesInputButtons(item)) title.appendChild(btn);

            // per-task actions
            row.appendChild(buildAddNotesButton(item));
            row.appendChild(buildCompleteToggle(item));

            // Hide the Add Notes button if task is complete
            if (item.complete) {
                const addBtn = row.querySelector(`.add-notes[data-id="${item.id}"]`);
                if (addBtn) addBtn.classList.add("hidden");
                // Also hide notes preview if complete
                const container = row.querySelector(`.notes-container[data-id="${item.id}"]`);
                if (container) container.classList.add("hidden");
            }
        }

        // delete at the end for both types
        row.appendChild(buildDeleteButton(item, type));
        frag.appendChild(row);
    }

    container.appendChild(frag);
}

// -----------------------------
// DISPLAY HELPERS
// -----------------------------
export function renderTodoListHeader(projectName) {
    domMap.header.innerText = projectName;
}

export function displayError(msg) {
    window.alert(msg);
}

export function clearProjectEntry(input) {
    input.value = "";
}

export function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

// -----------------------------
// ACTION ROUTER (EVENT TARGET NORMALIZER)
// -----------------------------
export function getActiveEventTarget(event) {
    if (event.target.closest(".delete-button"))       return "delete";
    if (event.target.closest(".rename-button"))       return "rename";
    if (event.target.closest(".save-edit"))           return "save rename";
    if (event.target.closest(".cancel-edit"))         return "cancel rename";
    if (event.target.closest(".submit-notes-button")) return "submit notes";
    if (event.target.closest(".cancel-notes-button")) return "cancel notes";
    if (event.target.closest(".add-notes"))           return "add notes";
    if (event.target.closest(".priority-option"))     return "change priority";
    if (event.target.closest(".check-off-button"))    return "check off";
    if (event.target.closest(".item-entry"))          return "item";
    return null;
}

// -----------------------------
// TOGGLERS (NOTES / EDIT MODES)
// -----------------------------
export function toggleNotesInput(task) {
    // Hide the Add/Edit Notes button while editing
    const addBtn = document.querySelector(`.add-notes[data-id="${task.id}"]`);
    if (addBtn) addBtn.classList.toggle("hidden");

    // Toggle all notes elements (textarea + submit + cancel)
    const noteEls = document.querySelectorAll(`.notes-element[data-id="${task.id}"]`);
    noteEls.forEach(el => el.classList.toggle("hidden"));

    // While editing, hide the notes preview and other row actions that can interfere
    const row = findRowForItem(task.id);
    if (row) {
        const preview = row.querySelector(`.notes-container[data-id="${task.id}"]`);
        if (preview) preview.classList.toggle("hidden");

        // Optionally hide/disable other controls to prevent conflicts
        toggleRowInterferingActions(row, task.id);
    }

    const input = document.querySelector(`.notes-input[data-id="${task.id}"]`);
    if (input && !input.classList.contains("hidden")) {
        input.focus();
        input.select();
    }
}

export function toggleNotes(taskId) {
    const container = document.querySelector(`.notes-container[data-id="${taskId}"]`);
    if (container) container.classList.toggle("hidden");
}

export function toggleEdit(item) {
    const edit = document.querySelector(`.edit-container[data-id="${item.id}"]`);
    const title = document.querySelector(`.item-entry[data-id="${item.id}"]`);
    if (!edit || !title) return;

    edit.classList.toggle("hidden");
    title.classList.toggle("hidden");

    // While renaming, hide/disable row actions to avoid collisions
    const row = findRowForItem(item.id);
    if (row) toggleRowInterferingActions(row, item.id);

    if (!edit.classList.contains("hidden")) {
        const input = edit.querySelector(".edit-item");
        if (input) {
            input.focus();
            input.select();
        }
    }
}

// -----------------------------
// DOM BUILDERS
// -----------------------------
function buildTitle(item, type) {
    const header = document.createElement("h3");
    header.textContent = item.name;
    header.dataset.id = item.id;
    header.dataset.type = type;
    header.classList.add("item-entry", type === "projects" ? "project-item" : "todo-item");
    if (item.active)   header.classList.add("active-project");
    if (item.complete) header.classList.add("completed-task");
    return header;
}

function buildEditTitle(item, type) {
    const editContainer = document.createElement("div");
    editContainer.classList.add("hidden", "edit-container");
    editContainer.dataset.id = item.id;
    editContainer.dataset.type = type;

    const input = document.createElement("input");
    input.value = item.name;
    input.dataset.id = item.id;
    input.dataset.type = type;
    input.classList.add("edit-item");

    const saveButton = document.createElement("button");
    saveButton.classList.add("save-edit");
    saveButton.textContent = "Save";
    saveButton.dataset.id = item.id;
    saveButton.dataset.type = type;

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-edit");
    cancelButton.textContent = "Cancel";
    cancelButton.dataset.id = item.id;
    cancelButton.dataset.type = type;

    editContainer.appendChild(input);
    editContainer.appendChild(saveButton);
    editContainer.appendChild(cancelButton);

    return editContainer;
}

function buildPrioritySelect(item) {
    const select = document.createElement("select");
    select.classList.add("priority");
    select.dataset.id = item.id;
    select.value = String(item.priority);

    [1, 2, 3, 4].forEach(v => {
        const opt = document.createElement("option");
        opt.classList.add("priority-option");
        opt.dataset.id = item.id;
        opt.value = String(v);
        opt.textContent = String(v);
        if (String(v) === String(item.priority)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

function buildNotesPreview(task) {
    const notesContainer = document.createElement("div");
    notesContainer.classList.add("notes-container");
    notesContainer.dataset.id = task.id;

    // Always render container; hide if empty so toggling is stable
    if (!task.notes) {
        notesContainer.classList.add("hidden");
        return notesContainer;
    }

    const p = document.createElement("p");
    p.classList.add("task-notes", "notes-element");
    p.dataset.id = task.id;
    p.textContent = task.notes;
    notesContainer.appendChild(p);
    return notesContainer;
}

function buildNotesInput(item) {
    const notesInput = document.createElement("textarea");
    notesInput.classList.add("notes-input", "notes-element", "hidden");
    notesInput.dataset.id = item.id;
    notesInput.value = item.notes || "";
    return notesInput;
}

function buildNotesInputButtons(item) {
    const submit = document.createElement("button");
    submit.classList.add("submit-notes-button", "notes-element", "hidden");
    submit.dataset.id = item.id;
    submit.textContent = item.notes ? "Update Notes" : "Submit Notes";

    const cancel = document.createElement("button");
    cancel.classList.add("cancel-notes-button", "notes-element", "hidden");
    cancel.dataset.id = item.id;
    cancel.textContent = "Cancel";

    return [submit, cancel];
}

function buildAddNotesButton(item) {
    const btn = document.createElement("button");
    btn.classList.add("add-notes");
    btn.dataset.id = item.id;
    btn.textContent = item.notes ? "Edit Notes" : "Add Notes";
    return btn;
}

function buildCompleteToggle(item) {
    const btn = document.createElement("button");
    btn.dataset.id = item.id;
    btn.classList.add("check-off-button");
    if (item.complete) btn.classList.add("uncheck");
    btn.textContent = item.complete ? "Uncheck" : "Check Off";
    return btn;
}

function buildDeleteButton(item, type) {
    const btn = document.createElement("button");
    btn.classList.add("delete-button");
    btn.dataset.id = item.id;
    btn.dataset.type = type;
    btn.textContent = "X";
    return btn;
}

function buildRenameButton(item, type) {
    const btn = document.createElement("button");
    btn.classList.add("rename-button");
    btn.dataset.id = item.id;
    btn.dataset.type = type;
    btn.textContent = "Rename";
    return btn;
}

// -----------------------------
// ROW-SCOPED UTILS
// -----------------------------
function findRowForItem(id) {
    // Any element with this data-id lives inside the li row; climb to li
    const any = document.querySelector(`[data-id="${id}"]`);
    return any ? any.closest("li") : null;
}

function toggleRowInterferingActions(row, id) {
    // Hide/disable actions while an edit/notes session is active; reveal otherwise.
    // We'll base it on whether either edit-container or notes-input is visible.
    const editVisible  = row.querySelector(`.edit-container[data-id="${id}"]:not(.hidden)`);
    const notesVisible = row.querySelector(`.notes-input[data-id="${id}"]:not(.hidden)`);

    const shouldHide = Boolean(editVisible || notesVisible);

    [
        `.rename-button[data-id="${id}"]`,
        `.delete-button[data-id="${id}"]`,
        `.check-off-button[data-id="${id}"]`,
    ].forEach(sel => {
        const el = row.querySelector(sel);
        if (!el) return;
        if (shouldHide) el.classList.add("hidden");
        else el.classList.remove("hidden");
    });

    // The Add Notes button is handled inside toggleNotesInput, but we can also
    // ensure consistency here:
    const addNotes = row.querySelector(`.add-notes[data-id="${id}"]`);
    if (addNotes && !row.querySelector(`.check-off-button[data-id="${id}"]`)?.classList.contains("uncheck")) {
        // only show add-notes if not complete & not in edit
        if (shouldHide) addNotes.classList.add("hidden");
        else if (!row.querySelector(`[data-id="${id}"]`)?.classList.contains("completed-task")) {
            addNotes.classList.remove("hidden");
        }
    }
}