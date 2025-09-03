export function renderList(container , list, type) {
    const fullList = document.createDocumentFragment();
    list.forEach(item => {
        const row = document.createElement("li");
        row.classList.add("list-item");

        const name = document.createElement("h3");
        name.innerText = item.name;
        const itemClass = type === "project" ? "project-item" : "todo-item";
        name.classList.add(itemClass);
        name.classList.add("item-entry");
        name.dataset.type = type;
        name.id = item.id;
        if (item.active === true) name.classList.add("active-project")

        if (type === "todo") {
            const currentTask = list.find(task => task.id === item.id)

            const notes = document.createElement("p");
            notes.innerText = currentTask.notes;
            notes.classList.add("task-notes");

            const notesInput = document.createElement("textarea");
            notesInput.dataset.id = item.id;
            notesInput.classList.add("notes-input");
            notesInput.placeholder = currentTask.notes === "" ? "Task Notes" : "Update Notes";

            const submitNotes = document.createElement("button");
            submitNotes.textContent = currentTask.notes === "" ? "Submit Notes" : "Update Notes";
            submitNotes.classList.add("submit-notes-button");
            submitNotes.dataset.id = item.id;

            const priority = document.createElement("select");
            priority.value = item.priority;
            [1,2,3,4].forEach(value => {
                const priorityOption = document.createElement("option")
                priorityOption.innerText = value;
                if (value == item.priority) priorityOption.selected = true;
                priorityOption.classList.add("priority-option");
                priorityOption.dataset.id = item.id;
                priority.appendChild(priorityOption);
            })
            priority.classList.add("priority");
            priority.dataset.id = item.id;



            name.appendChild(notes);
            name.appendChild(notesInput);
            name.appendChild(submitNotes);
            row.appendChild(priority);
        }



        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.dataset.id = item.id;
        deleteButton.dataset.type = type;
        deleteButton.innerText = "X";

        row.appendChild(name);
        row.appendChild(deleteButton);

        fullList.appendChild(row);
    });
    container.appendChild(fullList);
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

function submitNotes (taskId , noteInput , noteText) {
    noteInput.value = "";
    console.log("Notes added");
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