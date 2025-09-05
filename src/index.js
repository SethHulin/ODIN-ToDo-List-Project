import "./styles/main.css";
import {
    renderList,
    displayError,
    clearProjectEntry,
    clearElement,
    renderTodoListHeader,
    toggleNotesInput,
    toggleNotes,
    renderApp, renderProjects, renderTasks
} from "./ui/UI.js";
import {
    addItem , removeItem, setActiveProject, submitNotes, changePriority, checkOffTask, getCurrentItem
} from "./domain/todo-list-logic";
import {loadState, saveState} from "./services/storage";
import {canUndo, pushState, undo} from "./domain/undo-stack";

const adderButtons = document.querySelectorAll(".adder-button");
const projectListElement = document.querySelector("#project-list");
const todoListElement = document.querySelector("#todo-list");
const todoListHeader = document.querySelector("#todo-list-header");
const listElements = document.querySelectorAll(".list");
const clearCompletedButton = document.getElementById("clear-completed-tasks");
const todoListInput = document.getElementById("todo-list-input");
const projectInput = document.getElementById("project-input");
const undoButton = document.getElementById("undo-button");

let masterList = loadState();
renderApp(masterList , projectListElement , todoListElement);

adderButtons.forEach (button => button.addEventListener ("click" , event => {
    event.preventDefault();
    const type = event.target.dataset.type;
    const input = document.querySelector(`input[data-type="${type}"]`);
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
        handleNewActiveProject(masterList.projects.find(item => item.name === newItem))
    }



}))

clearCompletedButton.addEventListener("click" , event =>{
    event.preventDefault();
    masterList["tasks"] = clearCompletedTasks(masterList["tasks"]);
    clearElement(todoListElement);
    renderList(todoListElement , masterList["tasks"]);
    saveState(masterList);
})

undoButton.addEventListener("click" , event => {
    if (!canUndo()) return;

    masterList = undo();
    saveState(masterList);
    clearElement(projectListElement);
    clearElement(todoListElement);
    renderApp(masterList, projectListElement, todoListElement);

})

listElements.forEach(container => container.addEventListener("click" , event =>{
    const deleteButton = event.target.closest(".delete-button");
    const type = event.target.dataset.type;
    const itemEntry = event.target.closest(".item-entry");
    const submitNotesButton = event.target.closest(".submit-notes-button");
    const addNotesButton = event.target.closest(".add-notes");
    const priorityOption = event.target.closest(".priority-option");
    const checkOffButton = event.target.closest(".check-off-button");
    const cancelNotesButton = event.target.closest(".cancel-notes-button");
    const currentListElement = document.querySelector(`ul[data-type="${type}"]`);

    if (deleteButton) {
        pushState(masterList);
        const id = deleteButton.dataset.id;
        const removedProject = masterList.projects.find(item => item.id == id);
        if (type === "projects") {
            if (removedProject.active === true && masterList.projects.length > 1){
                if (removedProject === masterList.projects[0]) {
                    handleNewActiveProject(masterList.projects[1]);
                } else {
                    handleNewActiveProject(masterList.projects[0]);
                }
            }
            removedProject.tasks = [];
        }
        masterList[type] = removeItem(masterList[type], id);
        clearElement(currentListElement);
        renderList(currentListElement, masterList[type]);
        saveState(masterList);

    }

    if (itemEntry) {
        switch (type) {
            case "projects": handleNewActiveProject(event.target);
            break;
            case "tasks": toggleNotes (event.target.id);
        }
    }

    if (addNotesButton) {
        const currentTask = getCurrentItem (masterList.tasks , event.target.dataset.id);
        toggleNotesInput(currentTask);

    }

    if (submitNotesButton) {
        const taskId = event.target.dataset.id;
        const notesInput = document.querySelector(`textarea[data-id="${taskId}"]`);
        const notesText = notesInput.value;
        masterList.tasks = submitNotes (taskId, masterList.tasks , notesText);
        clearElement(todoListElement);
        renderTasks(masterList.tasks);
        todoListInput.focus();
        saveState(masterList);

    }

    if (priorityOption) {
        masterList.tasks = changePriority(event.target.dataset.id , event.target.value , masterList.tasks);
        saveState(masterList);

    }

    if (checkOffButton) {
        masterList["tasks"] = checkOffTask(event.target.dataset.id , true , masterList.tasks);
        toggleNotes(event.target.dataset.id);
        document.getElementById(event.target.dataset.id).classList.toggle("completed-task");
        const checkButton = document.querySelector(`button.check-off-button[data-id="${event.target.dataset.id}"]`);
        checkButton.textContent = getButtonContent(checkButton);
        saveState(masterList);
    }


    if (cancelNotesButton) {
        const currentTask = getCurrentItem (masterList.tasks , event.target.dataset.id);
        toggleNotesInput(currentTask);
    }


}))
// renderProjects(projectListElement , projectList);

function handleNewActiveProject (project) {
    const newActiveId = project.id;
    const newActiveProject = masterList.projects.find(item => item.id === newActiveId);
    masterList = setActiveProject(newActiveId , masterList.projects , masterList.tasks);
    clearElement(projectListElement);
    clearElement(todoListElement);
    clearElement(todoListHeader);
    renderTodoListHeader(newActiveProject.name);
    renderProjects(masterList.projects);
    renderTasks(masterList.tasks);
    document.getElementById("todo-list-input").focus();
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
