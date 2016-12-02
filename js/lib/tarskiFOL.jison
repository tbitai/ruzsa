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


%start s

%%

s
    : sentence EOF    {return $1;}
    ;

sentence
    : '*'                                                                          {$$ = {sentenceConst: '*'};}
    | conjunctions
    | disjunctions
    | parenthesized_or_unary_sentence[l] '→' parenthesized_or_unary_sentence[r]    {$$ = {impl: [$l, $r]};}
    | equivalences
    | parenthesized_or_unary_sentence
    ;

conjunctions
    : parenthesized_or_unary_sentence[l] '∧' parenthesized_or_unary_sentence[r]    {$$ = {and: [$l, $r]};}
    | conjunctions[l] '∧' parenthesized_or_unary_sentence[r]                       {$$ = {and: [$l, $r]};}
    ;
    
disjunctions
    : parenthesized_or_unary_sentence[l] '∨' parenthesized_or_unary_sentence[r]    {$$ = {or: [$l, $r]};}
    | disjunctions[l] '∨' parenthesized_or_unary_sentence[r]                       {$$ = {or: [$l, $r]};}
    ;

equivalences
    : parenthesized_or_unary_sentence[l] '↔' parenthesized_or_unary_sentence[r]    {$$ = {equi: [$l, $r]};}
    | equivalences[l] '↔' parenthesized_or_unary_sentence[r]                       {$$ = {equi: [$l, $r]};}
    ;

parenthesized_or_unary_sentence
    : atomic_sentence
    | '¬' parenthesized_or_unary_sentence[s]                                               {$$ = {not: $s};}
    | '(' conjunctions[c] ')'                                                              {$$ = $c;}
    | '(' disjunctions[d] ')'                                                              {$$ = $d;}
    | '(' parenthesized_or_unary_sentence[l] '→' parenthesized_or_unary_sentence[r] ')'    {$$ = {impl: [$l, $r]};}
    | '(' equivalences[e] ')'                                                              {$$ = $e;}
    | '∀' block_var[v] parenthesized_or_unary_sentence[s]                                  {$$ = {forAll: [$v, $s]};}
    | '∃' block_var[v] parenthesized_or_unary_sentence[s]                                  {$$ = {exists: [$v, $s]};}
    | '(' parenthesized_or_unary_sentence[s] ')'                                           {$$ = $s;}
    ;

atomic_sentence  /* Without extra parentheses */
    /* Tarski predicates */
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

    | block_term[s] '=' block_term[t]                         {$$ = {equa: [$s, $t]};}
    | block_term[s] '≠' block_term[t]                         {$$ = {not: {equa: [$s, $t]}};}

    | SENTENCE_VAR                                            {$$ = {sentenceVar: yytext};}
    ;

block_term
    : block_const
    | block_var
    ;

block_var
    : BLOCK_VAR      {$$ = {blockVar: yytext};}
    ;

block_const
    : BLOCK_CONST    {$$ = {blockConst: yytext};}
    ;
