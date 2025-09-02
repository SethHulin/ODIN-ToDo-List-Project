import "./styles/main.css";
import {renderProjects , displayError , clearProjectEntry, clearElement, renderTodoListHeader}from "./ui/UI.js";
import {addItem , removeItem, setActiveProject} from "./domain/todo-list-logic";

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
            renderProjects(currentListElement , currentListsByType[type], type);
            console.log(currentListsByType[type])
            clearProjectEntry(input);
        }
    } else {displayError("Project names cannot be blank");}
    if (type === "project") {
        renderTodoListHeader(newItem);
    }


}))

listElements.forEach(container => container.addEventListener("click" , event =>{
    const deleteButton = event.target.closest(".delete-button");
    const type = event.target.dataset.type;
    const itemEntry = event.target.closest(".item-entry");
    const currentListElement = document.querySelector(`ul[data-type="${type}"]`)

    if (deleteButton) {
        const id = deleteButton.id;
        clearElement(currentListElement);
        currentListsByType[type] = removeItem(currentListsByType[type], id);
        renderProjects(currentListElement, currentListsByType[type] , type);
    }

    if (itemEntry) {
        if (type === "project") {
            handleNewActiveProject(itemEntry);
        } else if (type === "todo") {
            expandTodo(itemEntry);
        }

    }
}))
// renderProjects(projectListElement , projectList);

function handleNewActiveProject (button) {
    const newActiveId = button.id;
    const newActiveProject = currentListsByType["project"].find(item => item.id === newActiveId);
    currentListsByType = setActiveProject(newActiveId , currentListsByType["project"] , currentListsByType["todo"]);
    clearElement(projectListElement);
    clearElement(todoListElement);
    clearElement(todoListHeader);
    renderTodoListHeader(newActiveProject.name);
    renderProjects(projectListElement , currentListsByType["project"], "project");
    renderProjects(todoListElement , currentListsByType["todo"], "todo");
}

function expandTodo (button) {

}