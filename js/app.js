angular.module('ruzsa', ['sf.treeRepeat', 'ngMaterial', 'ngMessages', 'ngSanitize'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    })
    .controller('treeController', function($scope, $mdDialog, $timeout){
        $scope.treeData = {formula: null,
                          editable: true,
                          breakable: true,
                          underEdit: true,
                          input: '',
                          inFocusQ: true,
                          focusOrder: 0};
        $scope.cancelNewNodesPossible = false;
        $scope.focusNext = function () {
            var focusQ = $('.in_focus_q').sort(function (el1, el2) {
                function o(el) {
                    return parseInt(el.dataset.ruzsaFocusOrder);
                }
                return o(el1) - o(el2);
            });
            var elToFocus = $(focusQ[0]);
            elToFocus.focus();
            elToFocus.removeClass('in_focus_q');
        };
        $scope.$watch('treeData', function () {
            $timeout(function () {
                // Fix superfluous lines from leaves -- JS part
                $('ul').removeClass('empty_ul');
                $('ul').filter(function () {
                    return $(this).children().length === 0;
                }).addClass('empty_ul');

                $('.formula_input').inputAutoresize({
                    padding: 20,
                    minWidth: 160  // .formula_input width
                });

                var elToFocusFirst = $('.in_focus_q[data-ruzsa-focus-order=0]');
                elToFocusFirst.focus();
                elToFocusFirst.removeClass('in_focus_q');
            }, 0, false);
        }, true);
        $scope.setUnderEdit = function (node) {
            node.underEdit = true;

            // Also trigger an input event on the newly created input
            // (this is necessary because it already contains the value
            // because of which the input possibly needs autoresize).
            $timeout(
                function () {
                    $('.formula_input')  // Triggering on all formula inputs does no harm
                        .trigger('input');
                },

                // Wait until autoresize input handler gets attached to the input
                10,

                false
            );
        };
        $scope.setFormula = function (node, formula) {
            node.formula = formula;
            node.underEdit = false;
            node.input = formula.unicode;
        };
        $scope.greatestConnectId = 0;
        $scope.doForConnected = function (node, f) {
            f(node);
            if ('connectId' in node) {
                traverse($scope.treeData, function (n) {
                    if (n.connectId == node.connectId) {
                        f(n);
                    }
                });
            }
        };
        $scope.submit = function (node) {
            try {
                node.error = {};
                var newFormula = new WFF(node.input);
                $scope.doForConnected(node, function (n) {
                    $scope.setFormula(n, newFormula);
                });
                $scope.focusNext();
            } catch (ex) {
                if (ex instanceof SyntaxError){
                    var msg = ex.message;
                    if (msg == 'Invalid formula! Found unmatched parenthesis.'){
                        node.error = {unmatchedParenthesis: true};
                    } else {
                        node.error = {other: true};
                    }
                } else {
                    throw ex;
                }
            }
        };
        $scope.dialogFocusOnOpen = false;
        $scope.checkForEmptyNodes = function () {
            var emptyNodesPresent = false;
            if ($scope.treeData) {
                traverse($scope.treeData, function (node) {
                    if (!(node.formula)) {
                        emptyNodesPresent = true;

                        // Break traverse
                        return true;
                    }
                });
            }
            return emptyNodesPresent;
        };
        $scope.showBDStepInProgressAlert = function () {
            var alert = $mdDialog.alert({
                title: 'Cannot do this step now',
                textContent: 'First you have to finish or cancel the step in progress.',
                ok: 'OK',
                focusOnOpen: $scope.dialogFocusOnOpen
            });
            $mdDialog.show(alert);
        };
        $scope.addLeaves = function () {
            if ($scope.BDStepInProgress || $scope.checkForEmptyNodes()) {
                $scope.showBDStepInProgressAlert();
                return;
            }

            var id = ++$scope.greatestConnectId;
            var emptyNode = {formula: null,
                             editable: true,
                             breakable: true,
                             underEdit: true,
                             input: '',
                             connectId: id,
                             inFocusQ: true};
            if (!$scope.treeData) {
                emptyNode.focusOrder = 0;
                $scope.treeData = emptyNode;
            } else {
                var focusOrderSet = false;
                traverse($scope.treeData, function (node) {
                    if (!('children' in node) &&
                        node.formula &&  // Exclude newly added leaves
                        !compareObjects(node.formula.ast, {var: '*'})  // Exclude closed branches
                    ) {
                        var emptyNodeClone = clone(emptyNode);
                        if (!focusOrderSet) {
                            emptyNodeClone.focusOrder = 0;
                            focusOrderSet = true;
                        }
                        node.children = [emptyNodeClone];
                    }
                });
            }
            $scope.cancelNewNodesPossible = true;
        };
        $scope.addCandidates = function (type, node) {
            if ($scope.BDStepInProgress || $scope.checkForEmptyNodes()) {
                $scope.showBDStepInProgressAlert();
                return;
            }

            function setFocusOrder(node, o) {
                node.focusOrder = o;
                return node;
            }
            var candidate = {formula: null,
                             editable: true,
                             breakable: true,
                             underEdit: true,
                             input: '',
                             candidate: true,
                             inFocusQ: true};
            function makeCandidateClone(o) {
                return setFocusOrder(clone(candidate), o);
            }
            function makeDoubleCandidateClone(oTop, oBtm) {
                var doubleCandidateClone = setFocusOrder(clone(candidate), oTop);
                doubleCandidateClone.children = [setFocusOrder(clone(candidate), oBtm)];
                return doubleCandidateClone;
            }
            var o = 0;
            traverse(node, function (n) {
                if (!('children' in n) &&
                    n.formula &&  // Exclude newly added nodes
                    !compareObjects(n.formula.ast, {var: '*'})  // Exclude closed branches
                ) {
                    if (type == 'or') {
                        n.children = [
                            makeCandidateClone(o++),
                            makeCandidateClone(o++)
                        ];
                    } else if (type == 'and') {
                        n.children = [
                            makeDoubleCandidateClone(o, o + 1)
                        ];
                        o += 2;
                    } else if (type == 'equi') {
                        n.children = [
                            makeDoubleCandidateClone(o, o + 1),
                            makeDoubleCandidateClone(o + 2, o + 3)
                        ];
                        o += 4;
                    } else if (type == 'double_not') {
                        n.children = [
                            makeCandidateClone(o++)
                        ];
                    } else {
                        throw new Error("Invalid type! " +
                                        "Valid types are: 'or', 'and', 'equi' and 'double_not'.");
                    }
                    n.underContinuation = true;
                }
            });
            $scope.doForConnected(node, function (n) {
                n.editable = false;
            });
            node.underBreakingDown = true;
            $scope.BDStepInProgress = true;
            $scope.cancelNewNodesPossible = false;
        };
        $scope.cancelStep = function () {
            if ($scope.cancelNewNodesPossible) {
                // Delete leaves from their parents
                traverseBF($scope.treeData, function(node) {
                    if ('children' in node) {
                        for (var i = node.children.length - 1; i > -1; i--) {
                            var child = node.children[i];
                            if (!(child.children) &&
                                (!(child.formula) || !compareObjects(child.formula.ast, {var: '*'}))) {
                                    node.children.splice(i, 1);
                            }
                        }
                        if (node.children.length === 0) {  // No child remained
                            delete node.children;
                        }
                    }
                });
                $scope.cancelNewNodesPossible = false;
                return;
            }
            traverse($scope.treeData, function (node) {
                if (node.underBreakingDown) {
                    traverse(node, function (n) {
                        if (n.underContinuation) {
                            delete n.children;
                            delete n.underContinuation;
                        }
                    });
                    $scope.doForConnected(node, function (n) {
                        n.editable = true;
                    });
                    node.underBreakingDown = false;
                    $scope.BDStepInProgress = false;

                    // Break traverse
                    return true;
                }
            });
        };
        $scope.showIncorrectStepAlert = function () {
            var alert = $mdDialog.alert({
                title: 'Step is incorrect',
                htmlContent: 'You can edit the sentence candidates and check again, or cancel the step and start another one.',
                ok: 'OK',
                focusOnOpen: $scope.dialogFocusOnOpen
            });
            $mdDialog.show(alert);
        };
        $scope.checkStep = function () {
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
                $scope.showIncorrectStepAlert();
                return;
            }
            traverse($scope.treeData, function (node) {
                if (node.underBreakingDown) {
                    var allCandidatesAreEmpty = true;
                    var stepIsCorrect = true;
                    var ast = node.formula.ast;
                    var correctContinuations = [];
                    var permutationsOfTwo = [[0, 1], [1, 0]],
                        i, j, p, pOuter, pInner;
                    if ('or' in ast) {
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            correctContinuations.push({
                                formula: null,
                                children: [{formula: {ast: ast.or[p[0]]}},
                                           {formula: {ast: ast.or[p[1]]}}]
                            });
                        }
                    } else if ('impl' in ast) {
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: {not: ast.impl[0]}}},
                                       {formula: {ast: ast.impl[1]}}]
                        });
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: ast.impl[1]}},
                                       {formula: {ast: {not: ast.impl[0]}}}]
                        });
                    } else if ('and' in ast) {
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            correctContinuations.push({
                                formula: null,
                                children: [{formula: {ast: ast.and[p[0]]},
                                            children: [{formula: {ast: ast.and[p[1]]}}]}]
                            });
                        }
                    } else if ('equi' in ast) {
                        for (i in permutationsOfTwo) {
                            pOuter = permutationsOfTwo[i];
                            for (j in permutationsOfTwo) {
                                pInner = permutationsOfTwo[j];
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.equi[pOuter[0]]},
                                                children: [{formula: {ast: ast.equi[pOuter[1]]}}]},
                                               {formula: {ast: {not: ast.equi[pInner[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pInner[1]]}}}]}]
                                });
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.equi[pOuter[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pOuter[1]]}}}]},
                                               {formula: {ast: ast.equi[pInner[0]]},
                                                children: [{formula: {ast: ast.equi[pInner[1]]}}]}]
                                });
                            }
                        }
                    } else if ('not' in ast && 'not' in ast.not) {
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: ast.not.not}}]
                        });
                    } else if ('not' in ast && 'or' in ast.not) {
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            correctContinuations.push({
                                formula: null,
                                children: [{formula: {ast: {not: ast.not.or[p[0]]}},
                                            children: [{formula: {ast: {not: ast.not.or[p[1]]}}}]}]
                            });
                        }
                    } else if ('not' in ast && 'impl' in ast.not) {
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: ast.not.impl[0]},
                                        children: [{formula: {ast: {not: ast.not.impl[1]}}}]}]
                        });
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: {not: ast.not.impl[1]}},
                                        children: [{formula: {ast: ast.not.impl[0]}}]}]
                        });
                    } else if ('not' in ast && 'and' in ast.not) {
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            correctContinuations.push({
                                formula: null,
                                children: [{formula: {ast: {not: ast.not.and[p[0]]}}},
                                           {formula: {ast: {not: ast.not.and[p[1]]}}}]
                            });
                        }
                    } else if ('not' in ast && 'equi' in ast.not) {
                        for (i in permutationsOfTwo) {
                            pOuter = permutationsOfTwo[i];
                            for (j in permutationsOfTwo) {
                                pInner = permutationsOfTwo[j];
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.equi[pOuter[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pOuter[1]]}}]},
                                               {formula: {ast: {not: ast.not.equi[pInner[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pInner[1]]}}]}]
                                });
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.not.equi[pOuter[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pOuter[1]]}}}]},
                                               {formula: {ast: ast.not.equi[pInner[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pInner[1]]}}}]}]
                                });
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.equi[pOuter[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pOuter[1]]}}]},
                                               {formula: {ast: ast.not.equi[pInner[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pInner[1]]}}}]}]
                                });
                                correctContinuations.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.not.equi[pOuter[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pOuter[1]]}}}]},
                                               {formula: {ast: {not: ast.not.equi[pInner[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pInner[1]]}}]}]
                                });
                            }
                        }
                    }

                    // Check if the node makes the branch closed
                    // by being the negation of or being negated by
                    // one of its ancestors
                    var path = treePath($scope.treeData,
                        function (n) {return n.underBreakingDown;},
                        function (n) {return n.formula.ast;}
                    );
                    if (
                        path.find(function (pathAst) {
                            return 'not' in pathAst && compareObjects(pathAst.not, ast) ||
                                   'not' in ast && compareObjects(pathAst, ast.not);
                        })
                    ) {
                        correctContinuations.push({
                            formula: null,
                            children: [{formula: {ast: {var: '*'}}}]
                        });
                    }

                    traverse(node, function (n) {
                        if (n.underContinuation) {
                            if (allCandidatesAreEmpty) {
                                traverse(n, function (c) {
                                    if (c !== n && c.formula) {
                                        allCandidatesAreEmpty = false;
                                        return true;
                                    }
                                });
                            }
                            var continuationIsCorrect = false;
                            var cont;
                            for (var i in correctContinuations) {
                                cont = correctContinuations[i];
                                cont.formula = n.formula;
                                if (compareFormulaTrees(n, cont)) {
                                    continuationIsCorrect = true;
                                    break;
                                }
                            }
                            if (!continuationIsCorrect) {
                                stepIsCorrect = false;
                            }
                        }
                    });
                    if (allCandidatesAreEmpty) {
                        // TODO: automatic check step
                    }
                    if (stepIsCorrect) {
                        $scope.BDStepInProgress = false;
                        node.underBreakingDown = false;
                        node.breakable = false;
                        traverse(node, function (n) {
                            if (n.underContinuation) {
                                n.underContinuation = false;
                                traverse(n, function (c) {
                                    if (c !== n) {
                                        c.editable = false;
                                    }
                                    c.candidate = false;
                                });
                            }
                        });
                    } else {
                        $scope.showIncorrectStepAlert();
                    }

                    // Break traverse
                    return true;
                }
            });
        };
    });
