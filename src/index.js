import "./styles/main.css";
import {
    renderList,
    displayError,
    clearProjectEntry,
    clearElement,
    renderTodoListHeader,
    toggleNotesInput,
    toggleNotes,
    renderApp, renderProjects, renderTasks, clearApp, toggleEdit, domMap, getActiveEventTarget
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
    editItem, chooseNextActiveId
} from "./domain/todo-list-logic";
import {loadState, saveState} from "./services/storage";
import {canUndo, pushState, undo} from "./domain/undo-stack";




let masterList = loadState();
masterList = normalizeList(masterList);
renderApp(masterList , domMap.listContainers.projects , domMap.listContainers.tasks);

domMap.buttons.adders.forEach (button => button.addEventListener ("click" , event => {
    event.preventDefault();
    const type = event.target.dataset.type;
    const input = document.querySelector(`.main-input[data-type="${type}"]`);
    const currentListElement = document.querySelector(`ul[data-type="${type}"]`);
    const newItem = input.value;
    if (newItem) {
        let currentList = masterList[type];
        const newList = addItem(currentList , newItem, type);
        if (newList === currentList) {
            displayError("Project names should be unique");
            clearProjectEntry(input);
        } else {
            masterList[type] = newList;
            clearElement(currentListElement);
            renderList(currentListElement , masterList[type]);
            clearProjectEntry(input);
            saveState(masterList)
        }
    } else {displayError("Project names cannot be blank");}
    if (type === "projects") {
        renderTodoListHeader(newItem);
        const newActiveProject = masterList.projects.find(item => item.name === newItem);
        handleNewActiveProject(newActiveProject.id);
    }



}))

domMap.buttons.clearCompleted.addEventListener("click" , event =>{
    event.preventDefault();
    masterList["tasks"] = clearCompletedTasks(masterList["tasks"]);
    clearElement(domMap.listContainers.tasks);
    renderList(domMap.listContainers.tasks , masterList["tasks"]);
    saveState(masterList);
})

domMap.buttons.undo.addEventListener("click" , ()=> {
    if (!canUndo()) return;

    masterList = undo();
    renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
    saveState(masterList);

})



    domMap.listContainers.allLists.forEach(container =>
        container.addEventListener("click", event => {
            const type = event.target.dataset.type;
            const action = getActiveEventTarget(event);

            switch (action) {
                case "delete": {
                    pushState(masterList);
                    const id = event.target.dataset.id;
                    const removed = masterList.projects.find(p => p.id === id);

                    if (type === "projects") {
                        const remaining = masterList.projects.filter(p => p.id !== id);

                        if (removed?.active) {
                            const nextId = chooseNextActiveId(masterList.projects, id);
                            if (nextId) handleNewActiveProject(nextId);
                        }
                        if (removed) removed.tasks = [];
                    }

                    masterList[type] = removeItem(masterList[type], id);
                    masterList = normalizeList(masterList);

                    clearApp(domMap.listContainers.projects, domMap.listContainers.tasks);
                    renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
                    saveState(masterList);
                    break;
                }

                case "item":
                    switch (type) {

                        case "projects":
                            handleNewActiveProject(event.target.dataset.id);
                            break;

                        case "tasks":
                            toggleNotes(event.target.dataset.id);
                            break;
                    }

                case "add notes": {
                    const currentItem = getCurrentItem(masterList.tasks, event.target.dataset.id);
                    toggleNotesInput(currentItem);
                    break;
                }

                case "submit notes": {
                    const taskId = event.target.dataset.id;
                    const notesInput = document.querySelector(`textarea[data-id="${taskId}"]`);
                    const notesText = notesInput.value;
                    masterList.tasks = submitNotes(taskId, masterList.tasks, notesText);
                    clearElement(domMap.listContainers.tasks);
                    renderTasks(masterList.tasks);
                    domMap.inputs.tasks.focus();
                    saveState(masterList);
                    break;
                }

                case "change priority":
                    masterList.tasks = changePriority(
                        event.target.dataset.id,
                        event.target.value,
                        masterList.tasks
                    );
                    saveState(masterList);
                    break;

                case "check off": {
                    masterList.tasks = checkOffTask(event.target.dataset.id, true, masterList.tasks);
                    toggleNotes(event.target.dataset.id);
                    document
                        .querySelector(`[data-id="${event.target.dataset.id}"]`)
                        .classList.toggle("completed-task");
                    const checkButton = document.querySelector(
                        `button.check-off-button[data-id="${event.target.dataset.id}"]`
                    );
                    checkButton.textContent = getButtonContent(checkButton);
                    saveState(masterList);
                    break;
                }

                case "cancel notes": {
                    const currentTask = getCurrentItem(masterList.tasks, event.target.dataset.id);
                    toggleNotesInput(currentTask);
                    break;
                }

                case "rename": {
                    const currentItem = getCurrentItem(masterList[type], event.target.dataset.id);
                    toggleEdit(currentItem);
                    const editField = document.querySelector(
                        `.edit-item[data-id="${event.target.dataset.id}"]`
                    );
                    editField.focus();
                    editField.select();
                    break;
                }

                case "save rename": {
                    pushState(masterList);
                    const currentItem = getCurrentItem(masterList[type], event.target.dataset.id);
                    const editField = document.querySelector(
                        `.edit-item[data-id="${event.target.dataset.id}"]`
                    );
                    const newName = editField.value;
                    masterList[type] = editItem(masterList[type], currentItem, newName);
                    clearApp(domMap.listContainers.projects, domMap.listContainers.tasks);
                    renderApp(masterList, domMap.listContainers.projects, domMap.listContainers.tasks);
                    break;
                }

                case "cancel rename":
                    const currentItem = getCurrentItem(masterList[type], event.target.dataset.id);
                    toggleEdit(currentItem);

                default:
                    return; // guard: ignore clicks we don’t care about
            }
        })
    );


function handleNewActiveProject (newActiveId) {
    const newActiveProject = masterList.projects.find(item => item.id === newActiveId);
    masterList = setActiveProject(newActiveId , masterList.projects , masterList.tasks);
    clearElement(domMap.listContainers.projects);
    clearElement(domMap.listContainers.tasks);
    renderTodoListHeader(newActiveProject.name);
    renderProjects(masterList.projects);
    renderTasks(masterList.tasks);
    document.getElementById("todo-list-input").focus();
    pushState(masterList);
    saveState(masterList);
}

function getButtonContent (checkButton) {
    checkButton.classList.toggle("uncheck");
    if (checkButton.classList.contains("uncheck")) {return "Uncheck"}
    else return "Check Off";
}

function clearCompletedTasks (list) {
    return list.filter(item => item.complete === false);
}
