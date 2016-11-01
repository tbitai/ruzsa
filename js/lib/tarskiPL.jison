%lex

%%

\s+          /* Skip whitespace */
[a-t]        return 'BLOCK_CONST';
[u-z]        return 'BLOCK_VAR';
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
"≠"          return '≠';
[A-Z]        return 'SENTENCE_VAR';
"¬"          return '¬';
"∧"          return '∧';
"∨"          return '∨';
"→"          return '→';
"↔"          return '↔';
"*"          return '*';
"∀"          return '∀';
"∃"          return '∃';
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

    | '*'                                             {$$ = {sentenceConst: '*'};}

    /* ∀ */
    | '∀' block_var[v] literal[l]                     {$$ = {forAll: [$v, $l]};}
    | '∀' block_var[v] '(' sentence[s] ')'            {$$ = {forAll: [$v, $s]};}

    | '(' sentence[s] ')' %prec SENTENCE              {$$ = $s;}
    ;

literal
    : atomic_sentence[a]                  {$$ = $a;}
    | '¬' atomic_sentence[a]              {$$ = {not: $a};}
    | '(' literal[l] ')' %prec LITERAL    {$$ = $l;}
    ;

atomic_sentence
    : 'Tet' '(' block_term[t] ')'                             {$$ = {tet: $t};}
    | 'Cube' '(' block_term[t] ')'                            {$$ = {cube: $t};}
    | 'Dodec' '(' block_term[t] ')'                           {$$ = {dodec: $t};}
    | 'Small' '(' block_term[t] ')'                           {$$ = {small: $t};}
    | 'Medium' '(' block_term[t] ')'                          {$$ = {medium: $t};}
    | 'Large' '(' block_term[t] ')'                           {$$ = {large: $t};}
    | 'Smaller' '(' block_term[s] ',' block_term[t] ')'       {$$ = {smaller: [$s, $t]};}
    | 'SameSize' '(' block_term[s] ',' block_term[t] ')'      {$$ = {sameSize: [$s, $t]};}
    | 'Larger' '(' block_term[s] ',' block_term[t] ')'        {$$ = {larger: [$s, $t]};}
    | 'Adjoins' '(' block_term[s] ',' block_term[t] ')'       {$$ = {adjoins: [$s, $t]};}
    | 'LeftOf' '(' block_term[s] ',' block_term[t] ')'        {$$ = {leftOf: [$s, $t]};}
    | 'SameCol' '(' block_term[s] ',' block_term[t] ')'       {$$ = {sameCol: [$s, $t]};}
    | 'BackOf' '(' block_term[s] ',' block_term[t] ')'        {$$ = {backOf: [$s, $t]};}
    | 'Between' '(' block_term[r] ',' block_term[s] ',' block_term[t] ')'         {$$ = {between: [$r, $s, $t]};}
    | 'FrontOf' '(' block_term[s] ',' block_term[t] ')'       {$$ = {frontOf: [$s, $t]};}
    | 'SameShape' '(' block_term[s] ',' block_term[t] ')'     {$$ = {sameShape: [$s, $t]};}
    | 'RightOf' '(' block_term[s] ',' block_term[t] ')'       {$$ = {rightOf: [$s, $t]};}
    | 'SameRow' '(' block_term[s] ',' block_term[t] ')'       {$$ = {sameRow: [$s, $t]};}
    | SENTENCE_VAR                                            {$$ = {sentenceVar: yytext};}
    | '(' atomic_sentence[a] ')' %prec ATOMIC_SENTENCE        {$$ = $a;}
    ;

block_term
    : block_const[c] {$$ = $c;}
    | block_var[v]   {$$ = $v;}
    ;

block_var
    : BLOCK_VAR      {$$ = {blockVar: yytext};}
    ;

block_const
    : BLOCK_CONST    {$$ = {blockConst: yytext};}
    ;
