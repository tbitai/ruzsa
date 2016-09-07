import FormulaParser from '../../node_modules/formula-parser/formulaParser.js';
import compareObjects from './compareObjects.js';


var tarskiUnaryOperators = [
    {symbol: 'Tet',       key: 'tet',       precedence: 5},
    {symbol: 'Small',     key: 'small',     precedence: 5},
    {symbol: 'Smaller',   key: 'smaller',   precedence: 5},
    {symbol: 'Cube',      key: 'cube',      precedence: 5},
    {symbol: 'Medium',    key: 'medium',    precedence: 5},
    {symbol: 'SameSize',  key: 'samesize',  precedence: 5},
    {symbol: 'Dodec',     key: 'dodec',     precedence: 5},
    {symbol: 'Large',     key: 'large',     precedence: 5},
    {symbol: 'Larger',    key: 'larger',    precedence: 5},
    {symbol: 'Adjoins',   key: 'adjoins',   precedence: 5},
    {symbol: 'BackOf',    key: 'backof',    precedence: 5},
    {symbol: 'SameShape', key: 'sameshape', precedence: 5},
    {symbol: 'LeftOf',    key: 'leftof',    precedence: 5},
    {symbol: 'Between',   key: 'between',   precedence: 5},
    {symbol: 'RightOf',   key: 'rightof',   precedence: 5},
    {symbol: 'SameCol',   key: 'samecol',   precedence: 5},
    {symbol: 'FrontOf',   key: 'frontof',   precedence: 5},
    {symbol: 'SameRow',   key: 'samerow',   precedence: 5}
];

var tarskiBinaryOperators = [
    {symbol: '=',         key: 'equa',      precedence: 4, associativity: 'right'}
];

var TarskiPropositionalFormulaParser = new FormulaParser(
    // variableKey
    'var',

    // unaries
    [
        // Logical symbols
        {symbol: '¬',         key: 'not',       precedence: 5},
    ].concat(tarskiUnaryOperators),

    // binaries
    [
        // Logical symbols
        {symbol: '∧',         key: 'and',       precedence: 3, associativity: 'right'},
        {symbol: '∨',         key: 'or',        precedence: 2, associativity: 'right'},
        {symbol: '→',         key: 'impl',      precedence: 1, associativity: 'right'},
        {symbol: '↔',         key: 'equi',      precedence: 0, associativity: 'right'},

        // Smart way to parse argument lists of Tarski predicates.
        // Suggested by Ross Kirsling: https://github.com/rkirsling/formula-parser/pull/1
        {symbol: ',',         key: 'comma',     precedence: 4, associativity: 'right'},
    ].concat(tarskiBinaryOperators)
);


// Tarski propositional well-formed formula class
function WFF(unicode){
    this.edit(unicode);
}
WFF.prototype.edit = function(unicode) {
    // First parse the Unicode, and raise error if it isn't valid.
    this.ast = TarskiPropositionalFormulaParser.parse(unicode);

    this.unicode = unicode;
};


function compareFormulas(formula, ref) {
    return compareObjects(formula.ast, ref.ast);
}

export {
	tarskiUnaryOperators,
	tarskiBinaryOperators,
	TarskiPropositionalFormulaParser,
	WFF,
	compareFormulas
};
