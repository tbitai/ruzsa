import {parse} from '../lib/tarskiFOL.jison';
import isEqual from 'lodash/isEqual';
import traverseObject from './traverseObject.js';


/** Tarski first-order well-formed formula pseudo-class */
function WFF(unicode){
    if (unicode !== undefined) {
        this.edit(unicode);
    }
}
WFF.prototype.edit = function(unicode) {
    // First parse the Unicode, and raise error if it isn't valid.
    this.ast = parse(unicode);

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
WFF.prototype.hasBlockConst = function (constName) {
  let ret = false;
  this.traverseBlockConsts(function (subobj, prop, val) {
      if (val === constName) {
          ret = true;
      }
  });
  return ret;
};
WFF.compare = function(formula, ref) {
    return isEqual(formula.ast, ref.ast);
};
WFF.blockConsts = 'abcdefghijklmnopqrst'.split('');
WFF.blockVars = 'uvwxyz'.split('');
WFF.prototype.substituteConstInAst = function(c, v) {  // Use this with caution, it makes `ast` inconsistent with `unicode`!
  if (WFF.blockConsts.indexOf(c) === -1) {
    throw new Error('Invalid block constant name ' + c);
  }
  this.traverseBlockVars(function(subobj, prop, val) {
    if (val === v) {
      delete subobj[prop];
      subobj['blockConst'] = c;
    }
  });
};
WFF.prototype.changeConstInAst = function(cNew, cOld) {  // Use this with caution, it makes `ast` inconsistent with `unicode`!
    if (WFF.blockConsts.indexOf(cNew) === -1) {
        throw new Error('Invalid block constant name ' + cNew);
    }
    this.traverseBlockConsts(function (subobj, prop, val) {
        if (val === cOld) {
            subobj[prop] = cNew;
        }
    });
};

export {
	WFF
};
