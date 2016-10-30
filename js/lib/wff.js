import {parser} from '../lib/tarskiPL';
import compareObjects from './compareObjects.js';
import traverseObject from './traverseObject.js';


/** Tarski propositional well-formed formula class */
function WFF(unicode){
    this.edit(unicode);
}
WFF.prototype.edit = function(unicode) {
    // First parse the Unicode, and raise error if it isn't valid.
    this.ast = parser.parse(unicode);

    this.unicode = unicode;
};
WFF.prototype.traverseBlockVars = function(callback) {
    traverseObject(this.ast, function (p, v) {
       if (p === 'blockVar') {
           callback(v);
       }
    });
};
WFF.compare = function(formula, ref) {
    return compareObjects(formula.ast, ref.ast);
};

export {
	WFF
};
