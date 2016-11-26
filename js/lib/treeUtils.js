import forEach from 'lodash/forEach';

function traverseBF(root, func){
    var q = [root];
    while (q.length > 0) {
        var node = q.shift();
        var breakCondition = func(node);
        if (breakCondition){
            break;
        }
        if ('children' in node){
            forEach(node.children, function (child) {
                q.push(child);
            });
        }
    }
}

var traverse = traverseBF;

function treePath(root, isDest, repr) {
    if (isDest(root)) {
        return [repr(root)];
    }
    if (!('children' in root)) {
        return false;
    }
    for (var i = 0; i < root.children.length; i++) {
        var child = root.children[i];
        var pathFromChild = treePath(child, isDest, repr);
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

