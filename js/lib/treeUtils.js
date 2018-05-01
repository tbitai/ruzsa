function traverseBF(root, func){
    let q = [root];
    while (q.length > 0) {
        let node = q.shift();
        let breakCondition = func(node);
        if (breakCondition){
            break;
        }
        if ('children' in node){
            for (let child of node.children) {
                q.push(child);
            }
        }
    }
}

const traverse = traverseBF;

function treePath(root, isDest, repr) {
    if (isDest(root)) {
        return [repr(root)];
    }
    if (!('children' in root)) {
        return false;
    }
    for (let child of root.children) {
        let pathFromChild = treePath(child, isDest, repr);
        if (pathFromChild) {
            return [repr(root)].concat(pathFromChild);
        }
    }
    return false;
}

export {
	traverse,
	traverseBF,
	treePath
};

