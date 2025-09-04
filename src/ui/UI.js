// --- PUBLIC API ---
export function renderList(container, list, type) {
    const frag = document.createDocumentFragment();
    for (const item of list) {
        const row = document.createElement("li");
        row.classList.add("list-item");

        const listItem = buildTitle(item, type);
        row.appendChild(listItem);

        if (type === "todo") {
            row.appendChild(buildPrioritySelect(item));
            listItem.appendChild(buildNotesPreview(item));
            row.appendChild(buildAddNotesButton(item));
            row.appendChild(buildCompleteToggle(item));
        }

        row.appendChild(buildDeleteButton(item, type));

        frag.appendChild(row);
    }
    container.appendChild(frag);
}

export function renderTodoListHeader (projectName) {
    const todoListHeader = document.querySelector("#todo-list-header")
    todoListHeader.innerText = projectName;

}

export function displayError (errorMessage) {
    window.alert(errorMessage);
}

export function clearProjectEntry (input) {
    input.value = "";
}

export function clearElement (element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


export function getActiveEventTarget (event) {
    if (event.target.closest(".delete-button")) return "delete";
    if (event.target.closest(".submit-notes-button")) return "submitNotes";
    if (event.target.closest(".priority-option")) return "changePriority";
    if (event.target.closest(".item-entry")) {
        const type = event.target.dataset.type;
        return type === "project" ? "activateProject" : "expandTodo";
    }
    return;
}

export function addNotesInput (task) {
    document.querySelector(`.add-notes[data-id="${task.id}"]`).style.display = "none";
    const notesContainer = document.querySelector(`.notes-container[data-id="${task.id}"]`);
    notesContainer.replaceChildren(
        buildNotesInput(task),
        buildNotesSubmit(task)
    );
}

export function toggleNotes (task) {
    document.querySelector(`.notes-container[data-id="${task.id}"]`).classList.toggle("hidden");
}
function buildTitle(item, type) {
    const header = document.createElement("h3");
    header.textContent = item.name;
    header.id = item.id;
    header.dataset.type = type;
    header.classList.add("item-entry", type === "project" ? "project-item" : "todo-item");
    if (item.active === true) header.classList.add("active-project");
    if (item.complete === true) header.classList.add("completed-task");
    return header;
}

function buildPrioritySelect(item) {
    const select = document.createElement("select");
    select.classList.add("priority");
    select.dataset.id = item.id;
    select.value = String(item.priority);     // keep DOM value as string

    [1,2,3,4].forEach(v => {
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

function buildNotesPreview(item) {
    const notesContainer = document.createElement("div");
    notesContainer.classList.add("notes-container");
    notesContainer.dataset.id = item.id;
    if (item.notes) {
        const taskNotes = document.createElement("p");
        taskNotes.classList.add("task-notes");
        taskNotes.textContent = item.notes;
        notesContainer.appendChild(taskNotes);
    }
    return notesContainer;
}

function buildNotesInput(item) {
    const notesInput = document.createElement("textarea");
    notesInput.classList.add("notes-input");
    notesInput.dataset.id = item.id;
    notesInput.value = item.notes;
    return notesInput;
}

function buildNotesSubmit(item) {
    const submitNotesButton = document.createElement("button");
    submitNotesButton.classList.add("submit-notes-button");
    submitNotesButton.dataset.id = item.id;
    submitNotesButton.textContent = item.notes === "" ? "Submit Notes" : "Update Notes";
    return submitNotesButton;
}

function buildAddNotesButton (item) {
    const addNotesButton = document.createElement("button");
    addNotesButton.classList.add("add-notes");
    addNotesButton.dataset.id = item.id;
    addNotesButton.textContent = item.notes == "" ? "Add Notes" : "Edit Notes"
    return addNotesButton;
}

function buildCompleteToggle(item) {
    const btn = document.createElement("button");
    btn.dataset.id = item.id;
    btn.classList.add(item.complete ? "uncheck-button" : "check-off-button");
    btn.textContent = item.complete ? "Uncheck" : "Check Off";
    return btn;
}

function buildDeleteButton(item, type) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.dataset.id = item.id;
    deleteButton.dataset.type = type;
    deleteButton.textContent = "X";
    return deleteButton;
}


// TODO: Render Empty List Logic