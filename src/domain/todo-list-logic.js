export function addItem(list , name, type) {
    if (!name) return list;

    if (type === "project") {
       var activeFlag = list.length === 0 ? true : false;
    }
    const item = type === "project" ? makeProjectItem(name , activeFlag) : makeTodoItem(name);
    const nameStrings = list.map(item => item.name);
    const normalizedItemName = normalize(item.name);
    const normalizedList = nameStrings.map(normalize);

    if (normalizedList.includes(normalizedItemName)) return list;

    item.name = item.name.trim();
    return [...list,item];
}

function makeProjectItem (name , flag) {
    return {
        name: name,
        id: Date.now().toString(),
        tasks: [],
        active: flag
    };
}

function makeTodoItem (name) {
    return {
        name: name,
        id: Date.now().toString(),
        priority: 1,
        notes: "",
    }
}

export function setActiveProject (newActiveId , projectList, todoList) {
    const oldActiveProject = projectList.find(project => project.active === true)
    const oldId = oldActiveProject.id;
    projectList.forEach(project => {
        if (project.id === oldId) {
            project.tasks = todoList
        }
        project.active = project.id === newActiveId;
    })
    const newActiveProject = projectList.find (project => project.active === true)
    return {
        project: projectList,
        todo: newActiveProject.tasks
    }

}



export function removeItem(list , buttonId) {
    if (!list) return;
    return list.filter(item => item.id !== buttonId);
}

function normalize (string) {
    return string.trim().toLowerCase();
}

