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
    if (!masterList?.projects?.length) return;

    clearApp(projectEl, taskEl);
    renderProjects(masterList.projects);
    renderTasks(masterList.tasks);

    const active = masterList.projects.find((p) => p.active);
    if (active) renderTodoListHeader(active.name);
}

export function renderList(container, list) {
    const type = container.dataset.type; // "projects" | "tasks"
    const frag = document.createDocumentFragment();

    for (const item of list) {
        const row = document.createElement("li");
        row.classList.add("list-item");

        const title = buildTitle(item, type);
        row.appendChild(title);
        row.appendChild(buildEditTitle(item, type));

        const left = document.createElement("div");
        left.classList.add("row-left");
        const right = document.createElement("div");
        right.classList.add("row-right");
        right.appendChild(buildRenameButton(item, type));
        right.appendChild(buildDeleteButton(item, type));
        row.appendChild(right);


        if (type === "tasks") {
            row.appendChild(buildPriorityFlags(item));

            const preview = buildNotesPreview(item);
            title.appendChild(preview);

            title.appendChild(buildNotesInput(item));
            for (const btn of buildNotesInputButtons(item)) title.appendChild(btn);
            const expansionIcon = document.createElement("i");
            expansionIcon.classList.add("fas" , "fa-chevron-right" , "expansion-arrow");
            expansionIcon.dataset.id = item.id;
            left.appendChild(expansionIcon);
            row.appendChild(left);
            right.appendChild(buildAddNotesButton(item));
            right.appendChild(buildCompleteToggle(item));


            // Hide elements if complete
            if (item.complete) {
                const addBtn = right.querySelector(`.add-notes[data-id="${item.id}"]`);
                if (addBtn) addBtn.classList.add("hidden");
                const container = row.querySelector(`.notes-container[data-id="${item.id}"]`);
                if (container) container.classList.add("hidden");
            }
        }


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
    if (event.target.closest(".delete-button"))         return "delete";
    if (event.target.closest(".rename-button"))         return "rename";
    if (event.target.closest(".save-edit"))             return "save rename";
    if (event.target.closest(".cancel-edit"))           return "cancel rename";
    if (event.target.closest(".submit-notes-button"))   return "submit notes";
    if (event.target.closest(".cancel-notes-button"))   return "cancel notes";
    if (event.target.closest(".add-notes"))             return "add notes";
    if (event.target.closest(".check-off-button"))      return "check off";
    if (event.target.closest(".priority-button"))       return "toggle priority";
    if (event.target.closest(".priority-option"))       return "change priority";
    if (event.target.closest(".item-entry"))            return "item";
    if (event.target.closest(".expansion-arrow"))       return "expand";
    return null;
}

// -----------------------------
// TOGGLERS (NOTES / EDIT MODES)
// -----------------------------
export function toggleNotesInput(task) {
    const addBtn = document.querySelector(`.add-notes[data-id="${task.id}"]`);
    if (addBtn) addBtn.classList.toggle("hidden");

    const noteEls = document.querySelectorAll(`.notes-element[data-id="${task.id}"]`);
    noteEls.forEach((el) => el.classList.toggle("hidden"));

    const row = findRowForItem(task.id);
    if (row) {
        const preview = row.querySelector(`.notes-container[data-id="${task.id}"]`);
        if (preview) preview.classList.toggle("hidden");
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
    switch (item.priority) {
        case 1: header.style.color = "#000000"; break;
        case 2: header.style.color = "#3B82F6"; break;
        case 3: header.style.color = "#F59E0B"; break;
        case 4: header.style.color = "#EF4444"; break;
    }
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
    saveButton.classList.add("save-edit", "non-icon-button");
    saveButton.textContent = "Save";
    saveButton.dataset.id = item.id;
    saveButton.dataset.type = type;

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-edit", "non-icon-button");
    cancelButton.textContent = "Cancel";
    cancelButton.dataset.id = item.id;
    cancelButton.dataset.type = type;

    editContainer.appendChild(input);
    editContainer.appendChild(saveButton);
    editContainer.appendChild(cancelButton);

    return editContainer;
}

// --- Priority Flags (custom dropdown) ---
function buildPriorityFlags(item) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("priority-wrapper");
    wrapper.dataset.id = item.id;

    const button = document.createElement("button");
    button.classList.add("priority-button");
    button.dataset.id = item.id;
    button.dataset.type = "tasks";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = flagIcon(item.priority);
    wrapper.appendChild(button);

    const menu = document.createElement("ul");
    menu.classList.add("priority-menu");
    menu.setAttribute("role", "listbox");
    [1, 2, 3, 4].forEach((v) => {
        const li = document.createElement("li");
        li.classList.add("priority-option");
        li.dataset.id = item.id;
        li.dataset.value = String(v);
        li.setAttribute("role", "option");
        li.innerHTML = flagIcon(v) + `<span class="priority-label">Priority ${v}</span>`;
        menu.appendChild(li);
    });
    wrapper.appendChild(menu);

    return wrapper;
}

function flagIcon(level) {
    // Use different colors/heights per level with Font Awesome flag
    // Level 1 (low) -> light/short; Level 4 (high) -> bold/tall look via classes
    const colorClass =
        level === 4 ? "flag-high" :
            level === 3 ? "flag-medhigh" :
                level === 2 ? "flag-med" :
                    "flag-low";
    return `<i class="fas fa-flag ${colorClass}"></i>`;
}

function buildNotesPreview(task) {
    const notesContainer = document.createElement("div");
    notesContainer.classList.add("notes-container");
    notesContainer.dataset.id = task.id;

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
    submit.classList.add("submit-notes-button", "notes-element", "hidden", "non-icon-button");
    submit.dataset.id = item.id;
    submit.textContent = item.notes ? "Update Notes" : "Submit Notes";

    const cancel = document.createElement("button");
    cancel.classList.add("cancel-notes-button", "notes-element", "hidden", "non-icon-button");
    cancel.dataset.id = item.id;
    cancel.textContent = "Cancel";

    return [submit, cancel];
}

function buildAddNotesButton(item) {
    const btn = document.createElement("button");
    btn.classList.add("add-notes");
    btn.dataset.id = item.id;

    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-pen-to-square");
    icon.dataset.id = item.id;

    btn.appendChild(icon);
    return btn;
}

function buildCompleteToggle(item) {
    const btn = document.createElement("button");
    btn.dataset.id = item.id;
    btn.classList.add("check-off-button");
    if (item.complete) btn.classList.add("uncheck");

    const icon = document.createElement("i");
    (item.complete ? icon.classList.add("fas", "fa-x") : icon.classList.add("fas", "fa-check"));
    icon.dataset.id = item.id;

    btn.appendChild(icon);
    return btn;
}

function buildDeleteButton(item, type) {
    const btn = document.createElement("button");
    btn.classList.add("delete-button");
    btn.dataset.id = item.id;
    btn.dataset.type = type;

    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-trash");
    icon.dataset.id = item.id;
    icon.dataset.type = type;

    btn.appendChild(icon);
    return btn;
}

function buildRenameButton(item, type) {
    const btn = document.createElement("button");
    btn.classList.add("rename-button");
    btn.dataset.id = item.id;
    btn.dataset.type = type;

    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-pencil");
    icon.dataset.id = item.id;
    icon.dataset.type = type;

    btn.appendChild(icon);
    return btn;
}

export function updateCheckButton(btn, complete) {
    const icon = btn.querySelector("i");
    if (!icon) return;
    btn.classList.toggle("uncheck", complete);
    icon.className = "fas";
    icon.classList.add(complete ? "fa-x" : "fa-check");
}

// -----------------------------
// ROW-SCOPED UTILS
// -----------------------------
function findRowForItem(id) {
    const any = document.querySelector(`[data-id="${id}"]`);
    return any ? any.closest("li") : null;
}

function toggleRowInterferingActions(row, id) {
    const editVisible  = row.querySelector(`.edit-container[data-id="${id}"]:not(.hidden)`);
    const notesVisible = row.querySelector(`.notes-input[data-id="${id}"]:not(.hidden)`);
    const shouldHide = Boolean(editVisible || notesVisible);

    [
        `.rename-button[data-id="${id}"]`,
        `.delete-button[data-id="${id}"]`,
        `.check-off-button[data-id="${id}"]`,
    ].forEach((sel) => {
        const el = row.querySelector(sel);
        if (!el) return;
        if (shouldHide) el.classList.add("hidden");
        else el.classList.remove("hidden");
    });

    const addNotes = row.querySelector(`.add-notes[data-id="${id}"]`);
    if (addNotes && !row.querySelector(`.check-off-button[data-id="${id}"]`)?.classList.contains("uncheck")) {
        if (shouldHide) addNotes.classList.add("hidden");
        else if (!row.querySelector(`[data-id="${id}"]`)?.classList.contains("completed-task")) {
            addNotes.classList.remove("hidden");
        }
    }
}