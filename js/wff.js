var variableKey = 'var';
var unaries = [
    {symbol: '~',    key: 'not',   precedence: 4},
];
var binaries = [
    {symbol: '&',    key: 'and',   precedence: 3, associativity: 'right'},
    {symbol: '|',    key: 'or',    precedence: 2, associativity: 'right'},
    {symbol: '->',   key: 'impl',  precedence: 1, associativity: 'right'},
    {symbol: '<->',  key: 'equi',  precedence: 0, associativity: 'right'},
];
var variableRegexp = /^[A-Z][^\)]*\)/;
var TarskiPropositionalFormulaParser = new FormulaParser(variableKey, unaries, binaries, variableRegexp);


function ascii2unicode(ascii) {
    return ascii.replace(/~/g,    '\u00ac')
                .replace(/&/g,    '\u2227')
                .replace(/\|/g,   '\u2228')
                .replace(/->/g,   '\u2192')
                .replace(/<->/g,  '\u2194');
}


// Tarski propositional well-formed formula class
function WFF(ascii){
    this.update(ascii);
}
WFF.prototype.update = function(ascii) {
    // First parse the ASCII, and raise error if it isn't valid.
    this.ast = TarskiPropositionalFormulaParser.parse(ascii);

    this.ascii = ascii;
    this.unicode = ascii2unicode(this.ascii);
};
