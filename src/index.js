import "./styles/main.css";
import {renderProjects , displayError , clearProjectEntry, clearElement}from "./ui/UI.js";
import {addProject , makeProject , removeProject} from "./domain/todo-list-logic";

const projectInput = document.querySelector("#project-input");
const newProjectButton = document.querySelector("#project-adder-button");
const projectListContainer = document.querySelector("#project-list-container");
const wrapdown = makeProject("Wrapdown");
const website = makeProject("Website");
let projectList = [wrapdown , website];

newProjectButton.addEventListener ("click" , event => {
    event.preventDefault();
    const newProject = projectInput.value;
    if (newProject) {
        const newProjectList = addProject(projectList , newProject);
        if (newProjectList === projectList) {
            displayError("Project names should be unique");
            clearProjectEntry(projectInput);
        } else {
            projectList = newProjectList;
            clearElement(projectListContainer);
            renderProjects(projectListContainer , projectList);
            clearProjectEntry(projectInput);
        }
    } else {displayError("Project names cannot be blank");}

})

projectListContainer.addEventListener("click" , event =>{
    const deleteButton = event.target.closest(".project-delete-button");

    if (deleteButton) {
        const id = deleteButton.dataset.projectId;
        clearElement(projectListContainer);
        projectList = removeProject(projectList, id);
        renderProjects(projectListContainer, projectList);
    }
})
renderProjects(projectListContainer , projectList);