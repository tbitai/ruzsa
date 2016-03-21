angular.module('ruzsa', ['sf.treeRepeat', 'ngMaterial', 'ngMessages', 'ngSanitize'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    })
    .controller('treeController', function($scope, $mdDialog){
        $scope.treeData = null;
        $scope.setFormula = function (node, formula) {
            node.formula = formula;
            node.underEdit = false;
            node.input = formula.unicode;
        };
        $scope.submit = function (node) {
            try {
                node.error = {};
                var newFormula = new WFF(node.input);
                $scope.setFormula(node, newFormula);
                if ('connectId' in node) {
                    traverse($scope.treeData, function (n) {
                        if (n.connectId == node.connectId) {
                            $scope.setFormula(n, newFormula);
                        }
                    });
                }
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
        $scope.showEmptyNodeAlert = function () {
            var alert = $mdDialog.alert({
                title: 'This operation is not possible now',
                textContent: 'You have to fill out empty sentence inputs first.',
                ok: 'OK'
            });
            $mdDialog.show(alert);
        };
        $scope.checkForEmptyNodes = function () {
            var emptyNodesPresent = false;
            if ($scope.treeData) {
                traverse($scope.treeData, function (node) {
                    if (!(node.formula)) {
                        $scope.showEmptyNodeAlert();
                        emptyNodesPresent = true;

                        // Break traverse
                        return true;
                    }
                });
            }
            return emptyNodesPresent;
        };
        $scope.showStepInProgressAlert = function () {
            var alert = $mdDialog.alert({
                title: 'This operation is not possible now',
                textContent: 'You have to finish or cancel step first.',
                ok: 'OK'
            });
            $mdDialog.show(alert);
        };
        $scope.greatestConnectId = 0;
        $scope.addLeaves = function () {
            if ($scope.stepInProgress) {
                $scope.showStepInProgressAlert();
                return;
            }
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
                return;
            }
            var id = ++$scope.greatestConnectId;
            var emptyNode = {formula: null,
                             editable: true,
                             breakable: true,
                             underEdit: true,
                             input: '',
                             connectId: id};
            if (!$scope.treeData) {
                $scope.treeData = emptyNode;
            } else {
                traverse($scope.treeData, function (node) {
                    if (!('children' in node) &&
                        // Exclude newly added leaves
                        node.formula
                    ) {
                        var emptyNodeClone = clone(emptyNode);
                        node.children = [emptyNodeClone];
                    }
                });
            }
        };
        $scope.addCandidates = function (type, node) {
            if ($scope.stepInProgress) {
                $scope.showStepInProgressAlert();
                return;
            }
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
                return;
            }
            var candidate = {formula: null,
                             editable: true,
                             breakable: true,
                             underEdit: true,
                             input: '',
                             candidate: true};
            function makeDoubleCandidateClone() {
                var doubleCandidateClone = clone(candidate);
                doubleCandidateClone.children = [clone(candidate)];
                return doubleCandidateClone;
            }
            traverse(node, function (n) {
                if (!('children' in n) &&
                    // Exclude newly added nodes
                    n.formula
                ) {
                    if (type == 'or') {
                        n.children = [
                            clone(candidate),
                            clone(candidate)
                        ];
                    } else if (type == 'and') {
                        n.children = [
                            makeDoubleCandidateClone()
                        ];
                    } else if (type == 'equi') {
                        n.children = [
                            makeDoubleCandidateClone(),
                            makeDoubleCandidateClone()
                        ];
                    } else if (type == 'double_not') {
                        n.children = [
                            clone(candidate)
                        ];
                    } else {
                        throw new Error("Invalid type! " +
                                        "Valid types are: 'or', 'and', 'equi' and 'double_not'.");
                    }
                    n.underContinuation = true;
                }
            });
            node.underBreakingDown = true;
            $scope.stepInProgress = true;
        };
        $scope.cancelStep = function () {
            traverse($scope.treeData, function (node) {
                if (node.underBreakingDown) {
                    traverse(node, function (n) {
                        if (n.underContinuation) {
                            delete n.children;
                        }
                    });
                    node.underBreakingDown = false;
                    $scope.stepInProgress = false;

                    // Break traverse
                    return true;
                }
            });
        };
        $scope.showIncorrectStepAlert = function () {
            var alert = $mdDialog.alert({
                title: 'Step is incorrect',
                htmlContent: 'You can edit the sentence candidates and check again, <br>or cancel the step and initiate another operation.',
                ok: 'OK'
            });
            $mdDialog.show(alert);
        };
        $scope.checkStep = function () {
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
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
                                formula: node.formula,
                                children: [{formula: {ast: ast.or[p[0]]}},
                                           {formula: {ast: ast.or[p[1]]}}]
                            });
                        }
                    } else if ('impl' in ast) {
                        correctContinuations.push({
                            formula: node.formula,
                            children: [{formula: {ast: {not: ast.impl[0]}}},
                                       {formula: {ast: ast.impl[1]}}]
                        });
                        correctContinuations.push({
                            formula: node.formula,
                            children: [{formula: {ast: ast.impl[1]}},
                                       {formula: {ast: {not: ast.impl[0]}}}]
                        });
                    } else if ('and' in ast) {
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            correctContinuations.push({
                                formula: node.formula,
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
                                    formula: node.formula,
                                    children: [{formula: {ast: ast.equi[pOuter[0]]},
                                                children: [{formula: {ast: ast.equi[pOuter[1]]}}]},
                                               {formula: {ast: {not: ast.equi[pInner[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pInner[1]]}}}]}]
                                });
                                correctContinuations.push({
                                    formula: node.formula,
                                    children: [{formula: {ast: {not: ast.equi[pOuter[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pOuter[1]]}}}]},
                                               {formula: {ast: ast.equi[pInner[0]]},
                                                children: [{formula: {ast: ast.equi[pInner[1]]}}]}]
                                });
                            }
                        }
                    } else if ('not' in ast && 'not' in ast.not) {
                        correctContinuations.push({
                            formula: node.formula,
                            children: [{formula: {ast: ast.not.not}}]
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
                            for (var i in correctContinuations) {
                                if (compareFormulaTrees(n, correctContinuations[i])) {
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
                        $scope.stepInProgress = false;
                        node.underBreakingDown = false;
                        node.editable = false;
                        if ('connectId' in node) {
                            traverse($scope.treeData, function (n) {
                                if (n.connectId == node.connectId) {
                                    n.editable = false;
                                }
                            });
                        }
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
