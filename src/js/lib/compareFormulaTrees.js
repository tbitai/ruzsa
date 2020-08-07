import { WFF } from './tarskiFirstOrderWFF.js';

function compareFormulaTrees(tree, ref) {
    if (!WFF.compare(tree.formula, ref.formula)) {
        return false;
    }
    if ('children' in tree !== 'children' in ref) {
        return false;
    }
    if (!('children' in tree)) {
        return true;
    } else {
        if (tree.children.length !== ref.children.length) {
            return false;
        }
        for (let i = 0; i < tree.children.length; i++) {
            if (!compareFormulaTrees(tree.children[i], ref.children[i])) {
                return false;
            }
        }
        return true;
    }
}

export default compareFormulaTrees;
