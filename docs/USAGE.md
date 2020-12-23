# How to use Ruzsa

## Entering sentences

Enter the first sentence in the input:

![Input](img/input.png)

Press <kbd>Enter</kbd>, and Ruzsa will check if the sentence is syntactically correct:

![Syntax error](img/syntax_error.png)

Once you enter a correct sentence, it will turn into a node of the tree representing the analytic tableau:

![Node](img/node.png)

Next, you can add further sentences with the Add button:

![Add floating action button](img/add_FAB.png)

On smaller desktops and mobile devices, you can find the Add button in the top toolbar:

![Add toolbar button](img/add_tool.png)

New sentences are added as leaves to the tree:

![Tree with a leaf](img/tree_with_leaf.png)

## Breaking down sentences

If you hover your cursor over (or on touchscreen devices, long tap) a sentence, the breakdown menu will appear:

![Breakdown menu](img/breakdown_menu.png)

Select the breakdown rule you want to use, and enter the derived sentences:

![Breaking down A or B](img/breaking_down_A_or_B.png)

When you're ready, click on the Check Step button, and Ruzsa will check if your breakdown step is correct.

![Check Step button](img/check_step_button.png)

![A or B broken down](img/A_or_B_broken_down.png)

The complete set of breakdown rules is described in detail on the 
[Method of analytic tableaux](https://en.wikipedia.org/wiki/Method_of_analytic_tableaux) Wikipedia page. The first-order 
rules of Ruzsa are the ones contained in the 
[First-order tableau without unification](https://en.wikipedia.org/wiki/Method_of_analytic_tableaux#First-order_tableau_without_unification) 
subsection. [Closure](https://en.wikipedia.org/wiki/Method_of_analytic_tableaux#Closure) is denoted by `*` derived from 
the lower closing node:

![Closure](img/closure.png)
