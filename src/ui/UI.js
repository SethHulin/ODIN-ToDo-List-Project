// --- PUBLIC API ---
export const domMap = {
    listContainers: {
        allLists: document.querySelectorAll(".list"),
        projects: document.querySelector("#project-list"),
        tasks: document.querySelector("#todo-list")
    },
    inputs: {
        projects: document.querySelector('.main-input[data-type="projects"]'),
        tasks: document.querySelector('.main-input[data-type="tasks"]')
    },
    buttons: {
        adders: document.querySelectorAll(".adder-button"),
        undo: document.querySelector("#undo-button"),
        clearCompleted: document.querySelector("#clear-completed-tasks")
    },
    header: document.querySelector("#todo-list-header"),

};

export const renderProjects = (list) => renderList(domMap.listContainers.projects , list);
export const renderTasks = (list) => renderList(domMap.listContainers.tasks , list);
export const clearApp = (projectElement , taskElement) => {clearElement(projectElement); clearElement(taskElement);}

export function renderList(container, list) {
    const type = container.dataset.type;
    const frag = document.createDocumentFragment();
    for (const item of list) {
        const row = document.createElement("li");
        row.classList.add("list-item");

        const itemEntry = buildTitle(item, type);
        row.appendChild(itemEntry);
        row.appendChild(buildEditTitle(item , type));
        row.appendChild(buildRenameButton(item , type));


        if (type === "tasks") {
            row.appendChild(buildPrioritySelect(item));
            itemEntry.appendChild(buildNotesPreview(item));
            itemEntry.appendChild(buildNotesInput(item));
            const notesInputButtons = Array.from(buildNotesInputButtons(item));
            notesInputButtons.forEach(button => itemEntry.appendChild(button));
            row.appendChild(buildAddNotesButton(item));
            row.appendChild(buildCompleteToggle(item));
        }
        row.appendChild(buildDeleteButton(item, type));

        frag.appendChild(row);
    }
    container.appendChild(frag);
}

export function renderApp (masterList , projectElement , taskElement) {
    switch (masterList.projects.length) {
        case 0: return; break;
        default:
            clearApp(projectElement , taskElement);
            renderProjects(masterList.projects);
            renderTasks(masterList.tasks);
            renderTodoListHeader(masterList.projects.find(project => project.active == true).name);
            break;
    }
}

export function renderTodoListHeader (projectName) {
    domMap.header.innerText = projectName;

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
    if (event.target.closest(".rename-button")) return "rename";
    if (event.target.closest(".save-edit")) return "save rename";
    if (event.target.closest(".cancel-edit")) return "cancel rename";
    if (event.target.closest(".item-entry")) return "item";
    if (event.target.closest(".submit-notes-button")) return "submit notes";
    if (event.target.closest(".add-notes")) return "add notes";
    if (event.target.closest(".priority-option")) return "change priority";
    if (event.target.closest(".check-off-button")) return "check off";
    if (event.target.closest(".cancel-notes-button")) return "cancel notes";
    return null;
}


export function toggleNotesInput (task) {
    document.querySelector(`.add-notes[data-id="${task.id}"]`).classList.toggle("hidden");
    const notesContainer = document.querySelector(`.notes-container[data-id="${task.id}"]`);
    const notesElements = document.querySelectorAll(`.notes-element[data-id="${task.id}"]`)
    notesElements.forEach(el => el.classList.toggle("hidden"));
    document.querySelector(`.notes-input[data-id="${task.id}"]`).focus();
    document.querySelector(`.notes-input[data-id="${task.id}"]`).select();

}

export function toggleNotes (taskId) {
    document.querySelector(`.notes-container[data-id="${taskId}"]`).classList.toggle("hidden");
}

export function toggleEdit (task) {
    document.querySelector(`.edit-container[data-id="${task.id}"]`).classList.toggle("hidden");
    document.querySelector(`.item-entry[data-id="${task.id}"]`).classList.toggle("hidden");

}


function buildTitle(item, type) {
    const header = document.createElement("h3");
    header.textContent = item.name;
    header.dataset.id = item.id;
    header.dataset.type = type;
    header.classList.add("item-entry", type === "projects" ? "project-item" : "todo-item");
    if (item.active === true) header.classList.add("active-project");
    if (item.complete === true) header.classList.add("completed-task");
    return header;
}

function buildEditTitle(item, type) {
    const editContainer = document.createElement("div");

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

    editContainer.classList.add("hidden" , "edit-container");
    editContainer.dataset.id = item.id;
    editContainer.dataset.type = type;
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

function buildRenameButton(item, type) {
    const renameButton = document.createElement("button");
    renameButton.classList.add("rename-button");
    renameButton.dataset.id = item.id;
    renameButton.dataset.type = type;
    renameButton.textContent = "Rename";
    return renameButton;
}


// TODO: Render Empty List Logic