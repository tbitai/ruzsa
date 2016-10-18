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

    /* TODO: other binary logical connectives */

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
    /* TODO: other predicates */
    | SENTENCE_VAR                                        {$$ = {sentenceVar: yytext};}
    | '(' atomic_sentence[a] ')' %prec ATOMIC_SENTENCE    {$$ = $a;}
    ;

block_var
    : BLOCK_VAR    {$$ = {blockVar: yytext};}
    ;
