export function addItem(list , name, type) {
    if (!name) return list;

    if (type === "projects") {
       var activeFlag = list.length === 0 ? true : false;
    }
    const item = type === "projects" ? makeProjectItem(name , activeFlag) : makeTodoItem(name);
    const nameStrings = list.map(item => item.name);
    const normalizedItemName = normalize(item.name);
    const normalizedList = nameStrings.map(normalize);

    if (normalizedList.includes(normalizedItemName)) return list;

    item.name = item.name.trim();
    return [...list,item];
}

export function normalizeList (masterList) {
    if (masterList.projects.length === 0) return {projects: [makeProjectItem("Inbox" , true)] , tasks: []};
    return {...masterList};
}

export function chooseNextActiveId(projects, removedId) {
    const idx = projects.findIndex(p => p.id === removedId);
    if (idx === -1) return null;
    // Prefer next neighbor, else previous
    const next = projects[idx + 1] || projects[idx - 1];
    return next ? next.id : null;
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
        complete: false,
    }
}

export function setActiveProject(newActiveId, projectList, todoList) {
    const oldActive = projectList.find(p => p.active);
    if (oldActive) oldActive.tasks = todoList;

    projectList.forEach(p => { p.active = (p.id === newActiveId); });

    const newActive = projectList.find(p => p.active) || projectList[0];
    return { projects: projectList, tasks: newActive ? newActive.tasks : [] };
}

export function editItem (list , item , newName) {
    const currentItem = list.find(el => el.id === item.id);
    currentItem.name = newName;
    return list;
}



export function removeItem(list , buttonId) {
    if (!list) return;
    return list.filter(item => item.id !== buttonId);
}

export function submitNotes (taskId , taskList , notesText) {
    return taskList.map (task => (task.id === taskId) ? {...task,notes: notesText} : task);

}

export function changePriority (taskId , newPriority , list) {
    return list.map (task => task.id === taskId ? {...task,priority: newPriority} : task);
}

export function checkOffTask (taskId , completeFlag , list) {
    return list.map (task => task.id == taskId ? {...task , complete: completeFlag} : task);
}

export function getCurrentItem(list , id) {
    return list.find(item => item.id === id);
}

function normalize (string) {
    return string.trim().toLowerCase();
}

