function compareFormulaTrees(tree, ref) {
    if (!compareFormulas(tree.formula, ref.formula)) {
        return false;
    }
    if (!equi('children' in tree, 'children' in ref)) {
        return false;
    }
    if (!('children' in tree)) {
        return true;
    } else {
        if (tree.children.length != ref.children.length) {
            return false;
        }
        for (var i in tree.children) {
            if (!compareFormulaTrees(tree.children[i], ref.children[i])) {
                return false;
            }
        }
        return true;
    }
}

export default compareFormulaTrees;

