import "./styles/main.css";
import {
    renderList , displayError , clearProjectEntry, clearElement, renderTodoListHeader, addNotesInput, toggleNotes
}from "./ui/UI.js";
import {
    addItem , removeItem, setActiveProject, submitNotes, changePriority, checkOffTask, getCurrentItem
} from "./domain/todo-list-logic";

const adderButtons = document.querySelectorAll(".adder-button");
const projectListElement = document.querySelector("#project-list")
const todoListElement = document.querySelector("#todo-list")
const todoListHeader = document.querySelector("#todo-list-header")
const listElements = document.querySelectorAll(".list")



let currentListsByType = {
    project: [],
    todo: [],
}

adderButtons.forEach (button => button.addEventListener ("click" , event => {
    event.preventDefault();
    const type = event.target.dataset.type;
    const input = document.querySelector(`input[data-type="${type}"]`);
    const currentListElement = document.querySelector(`ul[data-type="${type}"]`)
    const newItem = input.value;
    if (newItem) {
        let currentList = currentListsByType[type];
        const newList = addItem(currentList , newItem, type);
        if (newList === currentList) {
            displayError("Project names should be unique");
            clearProjectEntry(input);
        } else {
            currentListsByType[type] = newList;
            clearElement(currentListElement);
            renderList(currentListElement , currentListsByType[type], type);
            clearProjectEntry(input);
        }
    } else {displayError("Project names cannot be blank");}
    if (type === "project") {
        renderTodoListHeader(newItem);
        handleNewActiveProject(currentListsByType["project"].find(item => item.name === newItem))
    }


}))

listElements.forEach(container => container.addEventListener("click" , event =>{
    const deleteButton = event.target.closest(".delete-button");
    const type = event.target.dataset.type;
    const itemEntry = event.target.closest(".item-entry");
    const submitNotesButton = event.target.closest(".submit-notes-button");
    const addNotesButton = event.target.closest(".add-notes");
    const priorityOption = event.target.closest(".priority-option");
    const checkOffButton = event.target.closest(".check-off-button");
    const uncheckButton = event.target.closest (".uncheck-button");
    const currentListElement = document.querySelector(`ul[data-type="${type}"]`);

    if (deleteButton) {
        const id = deleteButton.dataset.id;
        const removedProject = currentListsByType["project"].find(item => item.id == id)
        if (type === "project") {
            if (removedProject.active === true && currentListsByType["project"].length > 1){
                if (removedProject === currentListsByType["project"][0]) {
                    handleNewActiveProject(currentListsByType["project"][1]);
                } else {
                    handleNewActiveProject(currentListsByType["project"][0]);
                }
            }
        }
        currentListsByType[type] = removeItem(currentListsByType[type], id);
        clearElement(currentListElement);
        renderList(currentListElement, currentListsByType[type] , type);
    }

    if (itemEntry) {
        switch (type) {
            case "project": handleNewActiveProject(event.target);
            break;
            case "todo": toggleNotes (event.target);
        }
    }

    if (addNotesButton) {
        const currentTask = getCurrentItem (currentListsByType["todo"] , event.target.dataset.id)
        addNotesInput(currentTask);

    }

    if (submitNotesButton) {
        const taskId = event.target.dataset.id;
        const notesInput = document.querySelector(`textarea[data-id="${taskId}"]`);
        const notesText = notesInput.value;
        currentListsByType["todo"] = submitNotes (taskId, currentListsByType["todo"] , notesText);
        clearElement(todoListElement);
        renderList(todoListElement , currentListsByType["todo"] , "todo");
    }

    if (priorityOption) {
        currentListsByType["todo"] = changePriority(event.target.dataset.id , event.target.value , currentListsByType["todo"]);

    }

    if (checkOffButton) {
        currentListsByType["todo"] = checkOffTask(event.target.dataset.id , true , currentListsByType["todo"]);
        clearElement(todoListElement);
        renderList(todoListElement , currentListsByType["todo"] , "todo");
    }

    if (uncheckButton) {
        currentListsByType["todo"] = checkOffTask (event.target.dataset.id , false , currentListsByType["todo"]);
        clearElement(todoListElement);
        renderList(todoListElement , currentListsByType["todo"] , "todo");

    }


}))
// renderProjects(projectListElement , projectList);

function handleNewActiveProject (project) {
    const newActiveId = project.id;
    const newActiveProject = currentListsByType["project"].find(item => item.id === newActiveId);
    currentListsByType = setActiveProject(newActiveId , currentListsByType["project"] , currentListsByType["todo"]);
    clearElement(projectListElement);
    clearElement(todoListElement);
    clearElement(todoListHeader);
    renderTodoListHeader(newActiveProject.name);
    renderList(projectListElement , currentListsByType["project"], "project");
    renderList(todoListElement , currentListsByType["todo"], "todo");
}

