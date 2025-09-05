let undoStack = [];

export function pushState (masterList) {
    const stateClone = JSON.parse(JSON.stringify(masterList));
    undoStack.push(stateClone);
}

export function undo () {
    if (!undoStack.length) return null;
    return undoStack.pop();
}

export function canUndo () {
    return undoStack.length > 0;
}