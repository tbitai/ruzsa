%lex

%%

\s+          /* Skip whitespace */
[a-z]        return 'BLOCK_VAR';
"("          return '(';
")"          return ')';
","          return ',';
"Tet"        return 'Tet';
"Small"      return 'Small';
"Smaller"    return 'Smaller';
"Cube"       return 'Cube';
"Medium"     return 'Medium';
"SameSize"   return 'SameSize';
"Dodec"      return 'Dodec';
"Large"      return 'Large';
"Larger"     return 'Larger';
"Adjoins"    return 'Adjoins';
"BackOf"     return 'BackOf';
"SameShape"  return 'SameShape';
"LeftOf"     return 'LeftOf';
"Between"    return 'Between';
"RightOf"    return 'RightOf';
"SameCol"    return 'SameCol';
"FrontOf"    return 'FrontOf';
"SameRow"    return 'SameRow';
"="          return '=';
[A-Z]        return 'SENTENCE_VAR';
"¬"          return '¬';
"∧"          return '∧';
"∨"          return '∨';
"→"          return '→';
"↔"          return '↔';
"*"          return '*';
<<EOF>>      return 'EOF';

/lex


%precedence SENTENCE
%precedence LITERAL
%precedence ATOMIC_SENTENCE

%start s

%%

s
    : sentence EOF    {return $1;}
    ;

sentence
    : literal[l]                                     {$$ = $l;}
    | '¬' '(' sentence[s] ')' %prec SENTENCE         {$$ = {not: $s};}

    /* ∧ */
    | literal[l] '∧' literal[r]                      {$$ = {and: [$l, $r]};}
    | literal[l] '∧' '(' sentence[r] ')'             {$$ = {and: [$l, $r]};}
    | '(' sentence[l] ')' '∧' literal[r]             {$$ = {and: [$l, $r]};}
    | '(' sentence[l] ')' '∧' '(' sentence[r] ')'    {$$ = {and: [$l, $r]};}
    
    /* ∨ */
    | literal[l] '∨' literal[r]                      {$$ = {or: [$l, $r]};}
    | literal[l] '∨' '(' sentence[r] ')'             {$$ = {or: [$l, $r]};}
    | '(' sentence[l] ')' '∨' literal[r]             {$$ = {or: [$l, $r]};}
    | '(' sentence[l] ')' '∨' '(' sentence[r] ')'    {$$ = {or: [$l, $r]};}

    /* → */
    | literal[l] '→' literal[r]                      {$$ = {impl: [$l, $r]};}
    | literal[l] '→' '(' sentence[r] ')'             {$$ = {impl: [$l, $r]};}
    | '(' sentence[l] ')' '→' literal[r]             {$$ = {impl: [$l, $r]};}
    | '(' sentence[l] ')' '→' '(' sentence[r] ')'    {$$ = {impl: [$l, $r]};}
    
    /* ↔ */
    | literal[l] '↔' literal[r]                      {$$ = {equi: [$l, $r]};}
    | literal[l] '↔' '(' sentence[r] ')'             {$$ = {equi: [$l, $r]};}
    | '(' sentence[l] ')' '↔' literal[r]             {$$ = {equi: [$l, $r]};}
    | '(' sentence[l] ')' '↔' '(' sentence[r] ')'    {$$ = {equi: [$l, $r]};}

    | '*'                                            {$$ = {sentenceConst: '*'};}
    | '(' sentence[s] ')' %prec SENTENCE             {$$ = $s;}
    ;

literal
    : atomic_sentence[a]                  {$$ = $a;}
    | '¬' atomic_sentence[a]              {$$ = {not: $a};}
    | '(' literal[l] ')' %prec LITERAL    {$$ = $l;}
    ;

atomic_sentence
    : 'Tet' '(' block_var[v] ')'                          {$$ = {tet: $v};}
    | 'Cube' '(' block_var[v] ')'                         {$$ = {cube: $v};}
    | 'Dodec' '(' block_var[v] ')'                        {$$ = {dodec: $v};}
    | 'Small' '(' block_var[v] ')'                        {$$ = {small: $v};}
    | 'Medium' '(' block_var[v] ')'                       {$$ = {medium: $v};}
    | 'Large' '(' block_var[v] ')'                        {$$ = {large: $v};}
    | 'Smaller' '(' block_var[u] ',' block_var[v] ')'     {$$ = {smaller: [$u, $v]};}
    | 'SameSize' '(' block_var[u] ',' block_var[v] ')'    {$$ = {sameSize: [$u, $v]};}
    | 'Larger' '(' block_var[u] ',' block_var[v] ')'      {$$ = {larger: [$u, $v]};}
    | 'Adjoins' '(' block_var[u] ',' block_var[v] ')'     {$$ = {adjoins: [$u, $v]};}
    | 'LeftOf' '(' block_var[u] ',' block_var[v] ')'      {$$ = {leftOf: [$u, $v]};}
    | 'SameCol' '(' block_var[u] ',' block_var[v] ')'     {$$ = {sameCol: [$u, $v]};}
    | 'BackOf' '(' block_var[u] ',' block_var[v] ')'      {$$ = {backOf: [$u, $v]};}
    | 'Between' '(' block_var[u] ',' block_var[v] ',' block_var[w] ')'     {$$ = {between: [$u, $v, $w]};}
    | 'FrontOf' '(' block_var[u] ',' block_var[v] ')'     {$$ = {frontOf: [$u, $v]};}
    | 'SameShape' '(' block_var[u] ',' block_var[v] ')'   {$$ = {sameShape: [$u, $v]};}
    | 'RightOf' '(' block_var[u] ',' block_var[v] ')'     {$$ = {rightOf: [$u, $v]};}
    | 'SameRow' '(' block_var[u] ',' block_var[v] ')'     {$$ = {sameRow: [$u, $v]};}
    | SENTENCE_VAR                                        {$$ = {sentenceVar: yytext};}
    | '(' atomic_sentence[a] ')' %prec ATOMIC_SENTENCE    {$$ = $a;}
    ;

block_var
    : BLOCK_VAR    {$$ = {blockVar: yytext};}
    ;
