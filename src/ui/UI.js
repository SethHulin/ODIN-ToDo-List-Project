export function renderProjects(container , list) {
    const fullList = document.createDocumentFragment();
    list.forEach(project => {
        const row = document.createElement("li");
        row.classList.add("project-list-item");

        const name = document.createElement("h3");
        name.innerText = project.name;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("project-delete-button");
        deleteButton.dataset.projectId = project.id;
        deleteButton.innerText = "X";

        row.appendChild(name);
        row.appendChild(deleteButton);

        fullList.appendChild(row);
    });
    container.appendChild(fullList);
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