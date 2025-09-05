// --- PUBLIC API ---
const listContainers = {
    projects: document.querySelector("#project-list"),
    tasks: document.querySelector("#todo-list")
}

export const renderProjects = (list) => renderList(listContainers.projects , list);
export const renderTasks = (list) => renderList(listContainers.tasks , list);

export function renderList(container, list) {
    const type = container.dataset.type;
    const frag = document.createDocumentFragment();
    for (const item of list) {
        const row = document.createElement("li");
        row.classList.add("list-item");

        const listItem = buildTitle(item, type);
        row.appendChild(listItem);

        if (type === "tasks") {
            row.appendChild(buildPrioritySelect(item));
            listItem.appendChild(buildNotesPreview(item));
            listItem.appendChild(buildNotesInput(item));
            const notesInputButtons = Array.from(buildNotesInputButtons(item));
            notesInputButtons.forEach(button => listItem.appendChild(button));
            row.appendChild(buildAddNotesButton(item));
            row.appendChild(buildCompleteToggle(item));
        }

        row.appendChild(buildDeleteButton(item, type));

        frag.appendChild(row);
    }
    container.appendChild(frag);
}

export function renderApp (masterList , projectContainer , todoContainer) {
    switch (masterList.projects.length) {
        case 0: return; break;
        default:
            renderProjects(masterList.projects);
            renderTasks(masterList.tasks);
            renderTodoListHeader(masterList.projects.find(project => project.active == true).name);
            break;
    }
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
        return type === "projects" ? "activateProject" : "expandTodo";
    }
    return;
}


export function toggleNotesInput (task) {
    document.querySelector(`.add-notes[data-id="${task.id}"]`).classList.toggle("hidden");
    const notesContainer = document.querySelector(`.notes-container[data-id="${task.id}"]`);
    const notesElements = document.querySelectorAll(`.notes-element[data-id="${task.id}"]`)
    notesElements.forEach(el => el.classList.toggle("hidden"));
    document.querySelector(`.notes-input[data-id="${task.id}"]`).focus();

}

export function toggleNotes (taskId) {

    document.querySelector(`.notes-container[data-id="${taskId}"]`).classList.toggle("hidden");
}


function buildTitle(item, type) {
    const header = document.createElement("h3");
    header.textContent = item.name;
    header.id = item.id;
    header.dataset.type = type;
    header.classList.add("item-entry", type === "projects" ? "project-item" : "todo-item");
    if (item.active === true) header.classList.add("active-project");
    if (item.complete === true) header.classList.add("completed-task");
    return header;
}

function buildPrioritySelect(item) {
    const select = document.createElement("select");
    select.classList.add("priority");
    select.dataset.id = item.id;
    select.value = String(item.priority);

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

function buildNotesPreview(task) {
    const notesContainer = document.createElement("div");
    notesContainer.classList.add("notes-container");
    notesContainer.dataset.id = task.id;
    if (task.notes) {
        const taskNotes = document.createElement("p");
        taskNotes.classList.add("task-notes" , "notes-element");
        taskNotes.textContent = task.notes;
        taskNotes.dataset.id = task.id;
        notesContainer.appendChild(taskNotes);
    }
    return notesContainer;
}

function buildNotesInput(item) {
    const notesInput = document.createElement("textarea");
    notesInput.classList.add("notes-input" , "notes-element" , "hidden");
    notesInput.dataset.id = item.id;
    notesInput.value = item.notes;
    return notesInput;
}

function buildNotesInputButtons(item) {
    const submitNotesButton = document.createElement("button");
    submitNotesButton.classList.add("submit-notes-button" , "notes-element" , "hidden");
    submitNotesButton.dataset.id = item.id;
    submitNotesButton.textContent = item.notes === "" ? "Submit Notes" : "Update Notes";

    const cancelNotesButton = document.createElement("button");
    cancelNotesButton.classList.add("cancel-notes-button" , "notes-element" , "hidden");
    cancelNotesButton.dataset.id = item.id;
    cancelNotesButton.textContent = "Cancel";



    return [submitNotesButton , cancelNotesButton];
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
    btn.classList.add("check-off-button");
    if (item.complete) btn.classList.add("uncheck");
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