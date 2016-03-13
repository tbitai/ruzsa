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
