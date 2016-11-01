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
WFF.prototype.traversePropsWithName = function(propName, callback) {
    traverseObject(this.ast, function (s, p, v) {
       if (p === propName) {
           callback(s, p, v);
       }
    });
};
WFF.prototype.traverseBlockVars = function(callback) {
  this.traversePropsWithName('blockVar', callback);
};
WFF.prototype.traverseBlockConsts = function(callback) {
  this.traversePropsWithName('blockConst', callback);
};
WFF.compare = function(formula, ref) {
    return compareObjects(formula.ast, ref.ast);
};
WFF.blockConsts = 'abcdefghijklmnopqrst'.split('');
WFF.blockVars = 'uvwxyz'.split('');
WFF.prototype.substituteConstInAst = function(c, v) {  // Use this with caution, it makes `ast` inconsistent with `unicode`!
  if (WFF.blockConsts.indexOf(c) === -1) {
    throw new Error('Invalid block constant name ' + c);
  }
  if (WFF.blockVars.indexOf(v) === -1) {
    throw new Error('Invalid block variable name ' + v);
  }
  this.traverseBlockVars(function(subobj, prop, val) {
    if (val === v) {
      delete subobj[prop];
      subobj['blockConst'] = c;
    }
  })
};

export {
	WFF
};
