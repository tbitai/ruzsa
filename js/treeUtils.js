function traverse(root, func){
    var q = [root];
    while (q.length > 0) {
        var node = q.shift();
        var breakCondition = func(node);
        if (breakCondition){
            break;
        }
        if ('children' in node){
            for (var i in node.children){
                var child = node.children[i];
                q.push(child);
            }
        }
    }
}

function treePath(root, isDest, repr) {
    if (isDest(root)) {
        return [repr(root)];
    }
    if (!('children' in root)) {
        return false;
    }
    for (var i in root.children) {
        var child = root.children[i];
        var pathFromChild = treePath(child, isDest, repr);
        if (pathFromChild) {
            return [repr(root)].concat(pathFromChild);
        }
    }
    return false;
}
