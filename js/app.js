angular.module('ruzsa', ['sf.treeRepeat', 'ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('grey');
    })
    .controller('treeController', function($scope){
        $scope.treeData = {
            formula: new WFF('Tet(a) & Tet(b) | Dodec(a) | Tet(b)'),
            editable: true,
            underEdit: false,
            input: 'Tet(a) & Tet(b) | Dodec(a) | Tet(b)',
            children: [
                {formula: new WFF('Tet(a) & Tet(b)'),
                 editable: true,
                 underEdit: false,
                 input: 'Tet(a) & Tet(b)',
                 children: [
                    {formula: new WFF('Tet(a)'),
                     editable: true,
                     underEdit: false,
                     input: 'Tet(a)',
                     children: [
                         {formula: new WFF('Tet(b)'),
                          editable: true,
                          underEdit: false,
                          input: 'Tet(b)'}]}]},
                {formula: new WFF('Dodec(a) | Tet(b)'),
                 editable: true,
                 underEdit: false,
                 input:'Dodec(a) | Tet(b)',
                 children: [
                     {formula: new WFF('Dodec(a)'),
                      editable: true,
                      underEdit: false,
                      input: 'Dodec(a)'},
                     {formula: new WFF('Tet(b)'),
                      editable: true,
                      underEdit: false,
                      input: 'Tet(b)'}]}]
        };
        $scope.submit = function(node) {
            try {
                var newFormula = new WFF(node.input);
                node.formula = newFormula;
                node.underEdit = false;
            } catch (ex) {
                alert(ex);  // TODO: show this below the input
            }
        };
    });
