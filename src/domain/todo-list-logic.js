export function addProject(list , name) {
    if (!name) return list;

    const project = makeProject (name);
    const nameStrings = list.map(item => item.name);
    const normalizedProjectName = normalize(project.name);
    const normalizedList = nameStrings.map(normalize);

    if (normalizedList.includes(normalizedProjectName)) return list;

    project.name = project.name.trim();
    return [...list,project];
}

export function makeProject (name) {
    return {
        name: name,
        id: Date.now().toString(),
        tasks: []
    };
}

export function removeProject(list , buttonId) {
    return list.filter(item => item.id !== buttonId);
}

function normalize (string) {
    return string.trim().toLowerCase();
}

