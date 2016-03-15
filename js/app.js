angular.module('ruzsa', ['sf.treeRepeat', 'ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    })
    .controller('treeController', function($scope){
        
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
        $scope.submit = function(node) {
            try {
                node.error = {};
                var newFormula = new WFF(node.input);
                traverse($scope.treeData, function (n) {
                    if (n.connectId == node.connectId) {
                        n.formula = newFormula;
                        n.underEdit = false;
                        n.input = node.input;
                    }
                });

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
        $scope.greatestConnectId = 0;
        $scope.addLeaves = function() {
            var id = ++$scope.greatestConnectId;
            var emptyNode = {formula: null,
                             editable: true,
                             underEdit: true,
                             input: '',
                             connectId: id};
            if (!$scope.treeData) {
                $scope.treeData = emptyNode;
            } else {
                traverse($scope.treeData, function(node) {
                    if (!('children' in node) &&
                        node.formula  // exclude newly added leaves
                    ) {
                        var emptyNodeClone = Object.assign({}, emptyNode);
                        node.children = [emptyNodeClone];
                    }
                });
            }
        };
    });
