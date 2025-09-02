export function renderProjects(container , list, type) {
    const fullList = document.createDocumentFragment();
    list.forEach(item => {
        const row = document.createElement("li");
        row.classList.add("project-list-item");

        const name = document.createElement("h3");
        name.innerText = item.name;
        name.classList.add("item-entry");
        name.dataset.type = type;
        name.id = item.id;
        if (item.active === true) name.classList.add("active-project")

        if (type === "todo") {
            const notesInput = document.createElement("input");
            notesInput.classList.add("notes-input");
            notesInput.placeholder = "Task Notes";
            notesInput.addEventListener("keydown" , (event) =>{
                if (event.key === "Enter") {
                    event.preventDefault();
                    submitNotes(item.id , event.target ,  event.target.value);
                }
            })
            name.appendChild(notesInput);
        }



        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.id = item.id;
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