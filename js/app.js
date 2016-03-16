angular.module('ruzsa', ['sf.treeRepeat', 'ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    })
    .controller('treeController', function($scope, $mdDialog){
        $scope.treeData = {
            formula: new WFF('Tet(a) ∧ Tet(b) ∨ Dodec(a) ∨ Tet(b)'),
            editable: false,
            underEdit: false,
            input: 'Tet(a) ∧ Tet(b) ∨ Dodec(a) ∨ Tet(b)',
            children: [
                {formula: new WFF('Tet(a) ∧ Tet(b)'),
                 editable: false,
                 underEdit: false,
                 input: 'Tet(a) ∧ Tet(b)',
                 children: [
                    {formula: new WFF('Tet(a)'),
                     editable: false,
                     underEdit: false,
                     input: 'Tet(a)',
                     children: [
                         {formula: new WFF('Tet(b)'),
                          editable: false,
                          underEdit: false,
                          input: 'Tet(b)'}]}]},
                {formula: new WFF('Dodec(a) ∨ Tet(b)'),
                 editable: false,
                 underEdit: false,
                 input:'Dodec(a) ∨ Tet(b)',
                 children: [
                     {formula: new WFF('Dodec(a)'),
                      editable: false,
                      underEdit: false,
                      input: 'Dodec(a)'},
                     {formula: new WFF('Tet(b)'),
                      editable: false,
                      underEdit: false,
                      input: 'Tet(b)'}]}]
        };
        /*
        $scope.treeData = null; */
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
                textContent: 'Fill out empty sentence inputs first!',
                ok: 'OK'
            });
            $mdDialog.show(alert);
        };
        $scope.checkForEmptyNodes = function () {
            var emptyNodesPresent = false;
            traverse($scope.treeData, function (node) {
                if (!(node.formula)) {
                    $scope.showEmptyNodeAlert();
                    emptyNodesPresent = true;

                    // Break traverse
                    return true;
                }
            });
            return emptyNodesPresent;
        };
        $scope.greatestConnectId = 0;
        $scope.addLeaves = function () {
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
                return;
            }
            var id = ++$scope.greatestConnectId;
            var emptyNode = {formula: null,
                             editable: true,
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
            var emptyNodesPresent = $scope.checkForEmptyNodes();
            if (emptyNodesPresent) {
                return;
            }
            var candidate = {formula: null,
                             editable: true,
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
                    } else {
                        throw new Error("Invalid type! " +
                                        "Valid types are: 'or', 'and' and 'equi'.");
                    }
                }
            });
        };
    });
