import { version } from '../package.json';
import 'angular';
import 'angular-tree-repeat';
import 'angular-animate';
import 'angular-aria';
import 'angular-sanitize';
import 'angular-material';
import 'angular-messages';
import $ from 'jquery';
import 'angular-translate';
import 'angular-cookies';
import 'angular-translate-storage-cookie';
import './lib/jquery.input-autoresize.js';
import download from 'downloadjs';
import semver from 'semver';
import compareObjects from './lib/compareObjects.js';
import cloneDeep from 'lodash/cloneDeep';
import union from 'lodash/union';
import difference from 'lodash/difference';
import forEach from 'lodash/forEach';
import { WFF } from './lib/tarskiFirstOrderWFF.js';
import { traverse, traverseBF, treePath } from './lib/treeUtils.js';
import compareFormulaTrees from './lib/compareFormulaTrees.js';


window.makeActive = function (el) {
    $('.active_input').removeClass('active_input');
    $(el).addClass('active_input');
};

// Virtual keyboard
function setCursorPosition(el, pos) {
    el.setSelectionRange(pos, pos);
}
window.fireVirtualKey = function (keyStr, cursorPos) {
    var i = document.getElementsByClassName('active_input')[0];
    if (i !== undefined) {
        var p = i.selectionStart;
        var v = i.value;
        var before = v.slice(0, p);
        var after =  v.slice(p);
        i.value = before + keyStr + after;

        // Trigger input event for inputAutoresize
        $(i).trigger('input');

        var l = i.value.length;
        var defaultPos = l - after.length;
        setCursorPosition(i, defaultPos);
        i.focus();
        if (cursorPos !== undefined) {
            setCursorPosition(i, defaultPos + cursorPos);
        }
    }
};
window.checkCommaAndParenthesis = function (el) {
    var p = el.selectionStart;
    var c = el.value[p];
    if (c == ',') {
        setCursorPosition(el, p + 2);
    } else if (c == ')') {
        setCursorPosition(el, p + 1);
    }
};

angular.module('ruzsa', [
    'sf.treeRepeat',
    'ngMaterial',
    'ngMessages',
    'ngSanitize',
    'pascalprecht.translate',
    'ngCookies'
])
    .config(['$mdThemingProvider', function($mdThemingProvider) {
        $mdThemingProvider.definePalette('materialGreyWithLightAccents', {
            // Material grey: https://material.google.com/style/color.html#color-color-palette
            '50': 'FAFAFA',
            '100': 'F5F5F5',
            '200': 'EEEEEE',
            '300': 'E0E0E0',
            '400': 'BDBDBD',
            '500': '9E9E9E',
            '600': '757575',
            '700': '616161',
            '800': '424242',
            '900': '212121',
            'A100': 'F5F5F5',
            'A200': 'EEEEEE',
            'A400': 'E0E0E0',
            'A700': 'BDBDBD',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': ['600', '700', '800', '900']
        });
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('materialGreyWithLightAccents');
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en', {
            'OTHER_LANGUAGE': 'Magyar',
            'OTHER_LANGUAGE_ABBR': 'HU',

            // Toolbar buttons
            'OPEN': 'Open',
            'SAVE': 'Save',
            'CHECK_STEP': 'Check step',
            'UNDO': 'Undo',
            'ISSUES': 'Issues',
            'CODE': 'Code',

            // Action buttons
            'ADD': 'Add',
            'BRANCH': 'Branch',
            'ADD_TWO_NODES': 'Add two nodes',
            'BRANCH_ETC': 'Branch and add two nodes for each branch',
            'ADD_ONE_NODE': 'Add one node',

            // Virtual keyboard buttons
            'OR': 'or',
            'AND': 'and',
            'NOT': 'not',
            'IMPLIES': 'implies',
            'EQUIVALENT': 'equivalent',
            'FOR_ALL': 'for all',
            'EXISTS': 'exists',
            'EQUALS': 'equals',
            'NOT_EQUALS': 'not equals',
            'FALSE': 'false',

            'INPUT': 'input',

            // Alerts and confirms
            'LOAD_FILE_ERROR_ALERT_TITLE': 'Couldn\'t load file',
            'LOAD_FILE_ERROR_ALERT_TEXT': 'Double check that you selected a Ruzsa file.',
            'STEP_IN_PROGRESS_ALERT_TITLE': 'Cannot do this step now',
            'STEP_IN_PROGRESS_ALERT_TEXT': 'First you have to finish or undo the step in progress.',
            'INCORRECT_STEP_ALERT_TITLE': 'Step is incorrect',
            'INCORRECT_STEP_ALERT_TEXT': 'You can edit the sentence candidates and check again, or undo the step and start another one.',
            'LOAD_FILE_CONFIRM_UNSAVED_TITLE': 'You have unsaved changes',
            'LOAD_FILE_CONFIRM_UNSAVED_TEXT': 'If you continue, your current tree will be lost.',
            'CONFIRM_CANCEL': 'Cancel',
            'CONFIRM_CONTINUE': 'Continue',
            'WINDOW_UNLOAD_CONFIRM_UNSAVED': 'There are unsaved changes in your Ruzsa tree. These will be lost.',
            'TEST_VERSION_ALERT_TITLE': 'This is a test version of Ruzsa',
            'TEST_VERSION_ALERT_TEXT': 'Files saved here won\'t work in stable versions.'
        });
        $translateProvider.translations('hu', {
            'OTHER_LANGUAGE': 'English',
            'OTHER_LANGUAGE_ABBR': 'EN',

            // Toolbar buttons
            'OPEN': 'Megnyitás',
            'SAVE': 'Mentés',
            'CHECK_STEP': 'Lépés ellenőrzése',
            'UNDO': 'Visszavonás',
            'ISSUES': 'Észrevételek',
            'CODE': 'Kód',

            // Action buttons
            'ADD': 'Hozzáadás',
            'BRANCH': 'Elágazás',
            'ADD_TWO_NODES': 'Két csúcs hozzáadása',
            'BRANCH_ETC': 'Elágazás és két csúcs hozzáadása mindkét ághoz',
            'ADD_ONE_NODE': 'Egy csúcs hozzáadása',

            // Virtual keyboard buttons
            'OR': 'vagy',
            'AND': 'és',
            'NOT': 'nem',
            'IMPLIES': 'következik',
            'EQUIVALENT': 'ekvivalens',
            'FOR_ALL': 'minden',
            'EXISTS': 'létezik',
            'EQUALS': 'egyenlő',
            'NOT_EQUALS': 'nem egyenlő',
            'FALSE': 'hamis',

            'INPUT': 'beviteli mező',

            // Alerts and confirms
            'LOAD_FILE_ERROR_ALERT_TITLE': 'Nem sikerült betölteni a fájlt',
            'LOAD_FILE_ERROR_ALERT_TEXT': 'Ellenőrizd, hogy Ruzsa-fájlt választottál-e ki.',
            'STEP_IN_PROGRESS_ALERT_TITLE': 'Ezt a lépést most nem lehet megtenni',
            'STEP_IN_PROGRESS_ALERT_TEXT': 'Először fejezd be vagy vond vissza a folyamatban lévő lépést.',
            'INCORRECT_STEP_ALERT_TITLE': 'Helytelen lépés',
            'INCORRECT_STEP_ALERT_TEXT': 'Átírhatod a mondatjelölteket és újra ellenőrizheted, vagy visszavonhatod a lépést és másikat kezdhetsz.',
            'LOAD_FILE_CONFIRM_UNSAVED_TITLE': 'Mentetlen változtatásaid vannak',
            'LOAD_FILE_CONFIRM_UNSAVED_TEXT': 'Ha folytatod, a jelenlegi fád el fog veszni.',
            'CONFIRM_CANCEL': 'Mégsem',
            'CONFIRM_CONTINUE': 'Folytatás',
            'WINDOW_UNLOAD_CONFIRM_UNSAVED': 'Mentetlen változtatások vannak a Ruzsa-fádban. Ezek el fognak veszni.',
            'TEST_VERSION_ALERT_TITLE': 'Ez a Ruzsa teszt verziója',
            'TEST_VERSION_ALERT_TEXT': 'Az itt mentett fájlok nem fognak működni a stabil verziókban.'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escape');
    }])
    .controller('treeController', [
        '$scope', '$rootScope', '$mdDialog', '$timeout', '$translate', '$window',
        function(
            $scope, $rootScope, $mdDialog, $timeout, $translate, $window
        ){
        $scope.generateTranslationsForScope = function() {
            $translate([
                // Alerts and confirms
                'LOAD_FILE_ERROR_ALERT_TITLE',
                'LOAD_FILE_ERROR_ALERT_TEXT',
                'STEP_IN_PROGRESS_ALERT_TITLE',
                'STEP_IN_PROGRESS_ALERT_TEXT',
                'INCORRECT_STEP_ALERT_TITLE',
                'INCORRECT_STEP_ALERT_TEXT',
                'LOAD_FILE_CONFIRM_UNSAVED_TITLE',
                'LOAD_FILE_CONFIRM_UNSAVED_TEXT',
                'CONFIRM_CANCEL',
                'CONFIRM_CONTINUE',
                'WINDOW_UNLOAD_CONFIRM_UNSAVED'
            ]).then(function(tr) {
                // Alerts and confirms
                $scope.loadFileErrorAlertTitle = tr.LOAD_FILE_ERROR_ALERT_TITLE;
                $scope.loadFileErrorAlertText = tr.LOAD_FILE_ERROR_ALERT_TEXT;
                $scope.stepInProgressAlertTitle = tr.STEP_IN_PROGRESS_ALERT_TITLE;
                $scope.stepInProgressAlertText = tr.STEP_IN_PROGRESS_ALERT_TEXT;
                $scope.incorrectStepAlertTitle = tr.INCORRECT_STEP_ALERT_TITLE;
                $scope.incorrectStepAlertText = tr.INCORRECT_STEP_ALERT_TEXT;
                $scope.loadFileConfirmUnsavedTitle = tr.LOAD_FILE_CONFIRM_UNSAVED_TITLE;
                $scope.loadFileConfirmUnsavedText = tr.LOAD_FILE_CONFIRM_UNSAVED_TEXT;
                $scope.confirmCancel = tr.CONFIRM_CANCEL;
                $scope.confirmContinue = tr.CONFIRM_CONTINUE;
                $scope.windowUnloadConfirmUnsaved = tr.WINDOW_UNLOAD_CONFIRM_UNSAVED;
            });
        };
        $scope.generateTranslationsForScope();
        $rootScope.$on('$translateChangeSuccess', function() {
            $scope.generateTranslationsForScope();
        });
        $scope.swapLanguage = function() {
            $translate.use(
                $translate.use() === 'en' ? 'hu' : 'en'
            );
        };

        // Settings
        $scope.dialogFocusOnOpen = false;

        $scope.getState = function() {
            return {
                treeData:               $scope.treeData,
                greatestId:             $scope.greatestId,
                greatestConnectId:      $scope.greatestConnectId,
                undoStepPossible:       $scope.undoStepPossible,
                cancelNewNodesPossible: $scope.cancelNewNodesPossible,
                BDStepInProgress:       $scope.BDStepInProgress,
                unsavedDataPresent:     $scope.unsavedDataPresent,
                filename:               $scope.filename
            };
        };
        $scope.setState = function(state, withDigest) {
            $scope.treeData =               state.treeData;
            $scope.greatestId =             state.greatestId;
            $scope.greatestConnectId =      state.greatestConnectId;
            $scope.undoStepPossible =       state.undoStepPossible;
            $scope.cancelNewNodesPossible = state.cancelNewNodesPossible;
            $scope.BDStepInProgress =       state.BDStepInProgress;
            $scope.unsavedDataPresent =     state.unsavedDataPresent;
            $scope.filename =               state.filename;
            if (withDigest) {
                $scope.$digest();
            }
        };

        // Initial state
        $scope.setInitialState = function() {$scope.setState({
            treeData: {
                id: 1,
                formula: null,
                editable: true,
                breakable: true,
                underEdit: true,
                input: '',
                inFocusQ: true,
                focusOrder: 0
            },
            greatestId: 1,
            greatestConnectId: 0,
            undoStepPossible: false,
            cancelNewNodesPossible: false,
            BDStepInProgress: false,
            unsavedDataPresent: false,
            filename: 'Untitled.tree'
        });};
        $scope.setInitialState();

        // Show alert in test versions
        $scope.isVersionTesting = function (v) {
            return v.indexOf('-') >= 0;
        };
        $scope.isRunningVersionTesting = $scope.isVersionTesting(version);
        if ($scope.isRunningVersionTesting) {
            $translate([
                'TEST_VERSION_ALERT_TITLE',
                'TEST_VERSION_ALERT_TEXT'
            ]).then(function(tr) {
                $timeout(function() {
                    $mdDialog.show($mdDialog.alert({
                        title: tr.TEST_VERSION_ALERT_TITLE,
                        textContent: tr.TEST_VERSION_ALERT_TEXT,
                        ok: 'OK',
                        focusOnOpen: $scope.dialogFocusOnOpen
                    }));
                }, 0, false);
            });
        }

        $scope.getLoadFileConfirmUnsaved = function() {
            return $mdDialog.confirm({
                title: $scope.loadFileConfirmUnsavedTitle,
                htmlContent: $scope.loadFileConfirmUnsavedText,
                ok: $scope.confirmContinue,
                cancel: $scope.confirmCancel,
                focusOnOpen: $scope.dialogFocusOnOpen
            });
        };
        $scope.setInitialStateWithConfirm = function() {
            if ($scope.unsavedDataPresent) {
                $mdDialog.show($scope.getLoadFileConfirmUnsaved()).then(function() {
                    $scope.setInitialState();
                });
            } else {
                $scope.setInitialState();
            }
        };

        $scope.encode = function(str) {
            return btoa(escape(str));
        };
        $scope.decode = function(str) {
            return unescape(atob(str));
        };
        $scope.save = function() {
            $scope.unsavedDataPresent = false;
            var state = $scope.getState();
            var dataJSON = {
                version: version,
                state: state
            };
            var dataStr = angular.toJson(dataJSON);  // Properties with leading $$ characters will be stripped
            var dataStrEncoded = $scope.encode(dataStr);
            var downloadStr = 'Ruzsa v' + version + ' ' + dataStrEncoded;
            download(downloadStr, $scope.filename, 'application/octet-stream');
        };
        $scope.loadFile = function(files) {
            function resetInput() {  // We need this to allow to select the same file again later
                document.getElementById('file_input').value = '';
            }
            function core() {
                var file = files[0];
                var reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        var text = event.target.result;

                        // Remove program and version info
                        text = text.replace(/^Ruzsa \S+\s/, '');

                        var dataStr = $scope.decode(text);
                        var dataJSON = JSON.parse(dataStr);

                        // Below we will change treeData, but in this case we don't want
                        // this to cause $scope.unsavedDataPresent to be true.
                        $scope.savedDataJustLoaded = true;

                        var loadedVersion = dataJSON.version;
                        if ($scope.isVersionTesting(loadedVersion) && !($scope.isRunningVersionTesting)) {
                            throw new Error('File saved in testing version: v' + loadedVersion);
                        }
                        var state = dataJSON.state;
                        state.filename = file.name;
                        $scope.setState(state, true);
                        if (semver.lt(loadedVersion, '0.2.0')) {
                            // Add missing `brokenDown`s
                            traverse($scope.treeData, function(node) {
                                if (!node.breakable) {
                                    node.brokenDown = true;
                                }
                            });
                        }
                        if (semver.lt(loadedVersion, '0.3.0')) {
                            // Add id's
                            $scope.greatestId = 0;
                            traverse($scope.treeData, function(node) {
                                $scope.setId(node);
                            });

                            // Fix false positive `breakable` properties
                            traverse($scope.treeData, function(node) {
                                node.breakable = node.breakable && $scope.isOnceBreakable(node);
                            });
                        }
                    } catch (ex) {
                        var alert = $mdDialog.alert({
                            title: $scope.loadFileErrorAlertTitle,
                            textContent: $scope.loadFileErrorAlertText,
                            ok: 'OK',
                            focusOnOpen: $scope.dialogFocusOnOpen
                        });
                        $mdDialog.show(alert);
                        throw ex;  // For debugging.
                    }
                    resetInput();
                };
                reader.readAsText(file);
            }
            if ($scope.unsavedDataPresent) {
                $mdDialog.show($scope.getLoadFileConfirmUnsaved()).then(function() {
                    core();
                }, function() {
                    resetInput();
                });
            } else {
                core();
            }
        };
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

        $scope.$watch('treeData', function (newTreeData, oldTreeData) {
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

                if (newTreeData !== oldTreeData &&  // Exclude initialization
                    !$scope.savedDataJustLoaded) {
                        $scope.unsavedDataPresent = true;
                }
                $scope.savedDataJustLoaded = false;
            }, 0, false);
        }, true);

        // Have to update title in a watch, see comment in the HTML.
        $scope.updateTitle = function(filename, unsavedDataPresent) {
            filename = filename === undefined ? $scope.filename : filename;
            unsavedDataPresent = unsavedDataPresent === undefined ? $scope.unsavedDataPresent : unsavedDataPresent;
            $('title').text(filename + (unsavedDataPresent ? '*' : '') + ' – Ruzsa');
        };
        $scope.$watch('filename', function(newFilename, oldFilename) {
            $scope.updateTitle(newFilename);
        });
        $scope.$watch('unsavedDataPresent', function(newUnsavedDataPresent, oldUnsavedDataPresent) {
            $scope.updateTitle(undefined, newUnsavedDataPresent);
        });

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
        $scope.closesBranch = function(node) {
            var ast = node.formula.ast;
            var path = treePath($scope.treeData,
                function(n) { return n.id === node.id; },
                function(n) { return n.formula.ast; }
            );
            return path.find(function(pathAst) {
                return 'not' in pathAst && compareObjects(pathAst.not, ast) ||
                       'not' in ast && compareObjects(pathAst, ast.not);
            });
        };
        $scope.isLiteral = function(formula) {
            var ast = formula.ast;
            var maybeAtomic = 'not' in ast ? ast.not : ast;
            if (maybeAtomic.hasOwnProperty('sentenceVar') || maybeAtomic.hasOwnProperty('sentenceConst')) {
                return true;
            }
            if (maybeAtomic.hasOwnProperty('forAll') || maybeAtomic.hasOwnProperty('exists')) {
                return false;
            }
            var v;
            for (var p in maybeAtomic) {
                if (maybeAtomic.hasOwnProperty(p)) {
                    v = maybeAtomic[p];
                    if (v.hasOwnProperty('blockVar') || (Array.isArray(v) && v[0].hasOwnProperty('blockVar')) ||
                        v.hasOwnProperty('blockConst') || (Array.isArray(v) && v[0].hasOwnProperty('blockConst'))) {
                        return true;
                    }
                }
            }
            return false;
        };
        $scope.isOnceBreakable = function(node) {
            return !$scope.isLiteral(node.formula) || $scope.closesBranch(node);
        };
        $scope.submit = function (node) {
            try {
                node.error = {};
                var newFormula = new WFF(node.input);
                $scope.doForConnected(node, function (n) {
                    $scope.setFormula(n, newFormula);
                    n.breakable = $scope.isOnceBreakable(n);  // TODO: Remove `breakable` from nodes.
                });
                $scope.focusNext();
            } catch (ex) {
                if (ex.message.substr(0, 13) === 'Lexical error' ||
                    ex.message.substr(0, 11) === 'Parse error')
                {
                    node.error = {other: true};
                } else {
                    throw ex;
                }
            }
        };
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
        $scope.showStepInProgressAlert = function () {
            var alert = $mdDialog.alert({
                title: $scope.stepInProgressAlertTitle,
                textContent: $scope.stepInProgressAlertText,
                ok: 'OK',
                focusOnOpen: $scope.dialogFocusOnOpen
            });
            $mdDialog.show(alert);
        };
        $scope.removeBDStepMemory = function() {
            traverse($scope.treeData, function(node) {
                if (node.lastBrokenDown) {
                    delete node.lastBrokenDown;
                    traverse(node, function(n) {
                        if (n.lastContinued) {
                            delete n.lastContinued;
                        }
                    });
                    return true;
                }
            });
        };
        $scope.setId = function(node) {
            node.id = ++$scope.greatestId;
            return node;
        };
        $scope.addLeaves = function () {
            if ($scope.BDStepInProgress || $scope.checkForEmptyNodes()) {
                $scope.showStepInProgressAlert();
                return;
            }

            $scope.removeBDStepMemory();
            var connectId = ++$scope.greatestConnectId;
            var emptyNode = {formula: null,
                             editable: true,
                             breakable: true,
                             underEdit: true,
                             input: '',
                             connectId: connectId,
                             inFocusQ: true};
            if (!$scope.treeData) {
                emptyNode.focusOrder = 0;
                $scope.setId(emptyNode);
                $scope.treeData = emptyNode;
            } else {
                var focusOrderSet = false;
                traverse($scope.treeData, function (node) {
                    if (!('children' in node) &&
                        node.formula &&  // Exclude newly added leaves
                        !compareObjects(node.formula.ast, {sentenceConst: '*'})  // Exclude closed branches
                    ) {
                        var emptyNodeClone = cloneDeep(emptyNode);
                        $scope.setId(emptyNodeClone);
                        if (!focusOrderSet) {
                            emptyNodeClone.focusOrder = 0;
                            focusOrderSet = true;
                        }
                        node.children = [emptyNodeClone];
                    }
                });
            }
            $scope.undoStepPossible = true;
            $scope.cancelNewNodesPossible = true;
        };
        $scope.addCandidates = function (type, node) {
            if ($scope.BDStepInProgress || $scope.checkForEmptyNodes()) {
                $scope.showStepInProgressAlert();
                return;
            }

            $scope.removeBDStepMemory();
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
                return $scope.setId(setFocusOrder(cloneDeep(candidate), o));
            }
            function makeDoubleCandidateClone(oTop, oBtm) {
                var doubleCandidateClone = $scope.setId(setFocusOrder(cloneDeep(candidate), oTop));
                doubleCandidateClone.children = [$scope.setId(setFocusOrder(cloneDeep(candidate), oBtm))];
                return doubleCandidateClone;
            }
            var o = 0;
            traverse(node, function (n) {
                if (!('children' in n) &&
                    n.formula &&  // Exclude newly added nodes
                    !compareObjects(n.formula.ast, {sentenceConst: '*'})  // Exclude closed branches
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
            $scope.undoStepPossible = true;
            $scope.BDStepInProgress = true;
            $scope.cancelNewNodesPossible = false;
        };
        $scope.undoStep = function () {
            if ($scope.cancelNewNodesPossible) {
                // Delete leaves from their parents
                traverseBF($scope.treeData, function(node) {
                    if ('children' in node) {
                        for (var i = node.children.length - 1; i > -1; i--) {
                            var child = node.children[i];
                            if (!(child.children) &&
                                (!(child.formula) || !compareObjects(child.formula.ast, {sentenceConst: '*'}))) {
                                    node.children.splice(i, 1);
                            }
                        }
                        if (node.children.length === 0) {  // No child remained
                            delete node.children;
                        }
                    }
                });
                $scope.cancelNewNodesPossible = false;
            } else if ($scope.BDStepInProgress) {
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
            } else {  // Last step was a BD step, or there was no step before
                traverse($scope.treeData, function(node) {
                    if (node.lastBrokenDown) {
                        delete node.brokenDown;
                        delete node.lastBrokenDown;
                        node.breakable = true;
                        // Maybe the node was also editable before breaking down,
                        // but it would be complicated to track this,
                        // and probably no one wants to edit a formula after
                        // undoing its breaking-down.
                        traverse(node, function(n) {
                            if (n.lastContinued) {
                                delete n.lastContinued;
                                delete n.children;
                            }
                        });
                        return true;
                    }
                });
            }
            $scope.undoStepPossible = false;
        };
        $scope.showIncorrectStepAlert = function () {
            var alert = $mdDialog.alert({
                title: $scope.incorrectStepAlertTitle,
                htmlContent: $scope.incorrectStepAlertText,
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
                    var formula = node.formula;
                    var ast = formula.ast;
                    var correctContinuationGroups = [];
                    var permutationsOfTwo = [[0, 1], [1, 0]],
                        i, j, p, pOuter, pInner, group;
                    if ('or' in ast) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            group.push({
                                formula: null,
                                children: [{formula: {ast: ast.or[p[0]]}},
                                           {formula: {ast: ast.or[p[1]]}}]
                            });
                        }
                        correctContinuationGroups.push(group);
                    } else if ('impl' in ast) {
                        correctContinuationGroups.push([
                            {
                                formula: null,
                                children: [{formula: {ast: {not: ast.impl[0]}}},
                                           {formula: {ast: ast.impl[1]}}]
                            },
                            {
                                formula: null,
                                children: [{formula: {ast: ast.impl[1]}},
                                           {formula: {ast: {not: ast.impl[0]}}}]
                            }
                        ]);
                    } else if ('and' in ast) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            group.push({
                                formula: null,
                                children: [{formula: {ast: ast.and[p[0]]},
                                            children: [{formula: {ast: ast.and[p[1]]}}]}]
                            });
                        }
                        correctContinuationGroups.push(group);
                    } else if ('equi' in ast) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            pOuter = permutationsOfTwo[i];
                            for (j in permutationsOfTwo) {
                                pInner = permutationsOfTwo[j];
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.equi[pOuter[0]]},
                                                children: [{formula: {ast: ast.equi[pOuter[1]]}}]},
                                               {formula: {ast: {not: ast.equi[pInner[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pInner[1]]}}}]}]
                                });
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.equi[pOuter[0]]}},
                                                children: [{formula: {ast: {not: ast.equi[pOuter[1]]}}}]},
                                               {formula: {ast: ast.equi[pInner[0]]},
                                                children: [{formula: {ast: ast.equi[pInner[1]]}}]}]
                                });
                            }
                        }
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'not' in ast.not) {
                        correctContinuationGroups.push([{
                            formula: null,
                            children: [{formula: {ast: ast.not.not}}]
                        }]);
                    } else if ('not' in ast && 'or' in ast.not) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            group.push({
                                formula: null,
                                children: [{formula: {ast: {not: ast.not.or[p[0]]}},
                                            children: [{formula: {ast: {not: ast.not.or[p[1]]}}}]}]
                            });
                        }
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'impl' in ast.not) {
                        group = [];
                        group.push({
                            formula: null,
                            children: [{formula: {ast: ast.not.impl[0]},
                                        children: [{formula: {ast: {not: ast.not.impl[1]}}}]}]
                        });
                        group.push({
                            formula: null,
                            children: [{formula: {ast: {not: ast.not.impl[1]}},
                                        children: [{formula: {ast: ast.not.impl[0]}}]}]
                        });
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'and' in ast.not) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            p = permutationsOfTwo[i];
                            group.push({
                                formula: null,
                                children: [{formula: {ast: {not: ast.not.and[p[0]]}}},
                                           {formula: {ast: {not: ast.not.and[p[1]]}}}]
                            });
                        }
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'equi' in ast.not) {
                        group = [];
                        for (i in permutationsOfTwo) {
                            pOuter = permutationsOfTwo[i];
                            for (j in permutationsOfTwo) {
                                pInner = permutationsOfTwo[j];
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.equi[pOuter[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pOuter[1]]}}]},
                                               {formula: {ast: {not: ast.not.equi[pInner[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pInner[1]]}}]}]
                                });
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.not.equi[pOuter[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pOuter[1]]}}}]},
                                               {formula: {ast: ast.not.equi[pInner[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pInner[1]]}}}]}]
                                });
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.equi[pOuter[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pOuter[1]]}}]},
                                               {formula: {ast: ast.not.equi[pInner[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pInner[1]]}}}]}]
                                });
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.not.equi[pOuter[0]]},
                                                children: [{formula: {ast: {not: ast.not.equi[pOuter[1]]}}}]},
                                               {formula: {ast: {not: ast.not.equi[pInner[0]]}},
                                                children: [{formula: {ast: ast.not.equi[pInner[1]]}}]}]
                                });
                            }
                        }
                        correctContinuationGroups.push(group);
                    }

                    if ($scope.closesBranch(node)) {
                        correctContinuationGroups.push([{
                            formula: null,
                            children: [{formula: {ast: {sentenceConst: '*'}}}]
                        }]);
                    }

                    if (ast.hasOwnProperty('forAll') || ast.hasOwnProperty('not') && ast.not.hasOwnProperty('exists')) {
                        var v, scope;
                        if (ast.hasOwnProperty('forAll')) {
                            v = ast.forAll[0].blockVar;
                            scope = ast.forAll[1];
                        } else {
                            v = ast.not.exists[0].blockVar;
                            scope = {not: ast.not.exists[1]};
                        }
                        var c, substitutedScope;
                        for (var i = 0; i < WFF.blockConsts.length; i++) {
                            c = WFF.blockConsts[i];
                            substitutedScope = new WFF('A');  // We will only use the AST of this formula.
                            substitutedScope.ast = cloneDeep(scope);
                            substitutedScope.substituteConstInAst(c, v);
                            correctContinuationGroups.push([{
                                formula: 'continuedWithQuantifierInference',  // Hack to recognize this continuation.
                                children: [{formula: {ast: substitutedScope.ast}}]
                            }]);
                        }
                    }

                    if (ast.hasOwnProperty('exists') || ast.hasOwnProperty('not') && ast.not.hasOwnProperty('forAll')) {
                        var v, scope;
                        if (ast.hasOwnProperty('exists')){
                            v = ast.exists[0].blockVar;
                            scope = ast.exists[1];
                        } else {
                            v = ast.not.forAll[0].blockVar;
                            scope = {not: ast.not.forAll[1]};
                        }
                        var usedBlockConsts = [];
                        traverse($scope.treeData, function (n) {
                            if (!n.candidate) {
                                n.formula.traverseBlockConsts(function (subobj, prop, val) {
                                    usedBlockConsts = union(usedBlockConsts, [val]);
                                });
                            }
                        });
                        var unusedBlockConsts = difference(WFF.blockConsts, usedBlockConsts);
                        var c, substitutedScope;
                        for (var i = 0; i < unusedBlockConsts.length; i++) {
                            c = unusedBlockConsts[i];
                            substitutedScope = new WFF('A');  // We will only use the AST of this formula.
                            substitutedScope.ast = cloneDeep(scope);
                            substitutedScope.substituteConstInAst(c, v);
                            correctContinuationGroups.push([{
                                formula: 'continuedWithQuantifierInference',  // Hack to recognize this continuation.
                                children: [{formula: {ast: substitutedScope.ast}}]
                            }]);
                        }
                    }

                    var eqs = [];
                    var path = treePath($scope.treeData,
                        function(n) { return n.id === node.id; },
                        function(n) { return n.formula; }
                    );
                    forEach(path, function(pathFormula) {
                        if (pathFormula.ast.hasOwnProperty('equa')) {
                            eqs.push([
                                pathFormula.ast.equa[0].blockConst,
                                pathFormula.ast.equa[1].blockConst
                            ]);
                        }
                    });
                    var changedFormula;
                    forEach(eqs, function (eq) {
                        forEach(permutationsOfTwo, function (p) {
                            forEach(path, function (pathFormula) {
                                if (!pathFormula.ast.hasOwnProperty('equa') && pathFormula.hasBlockConst(eq[p[0]])) {
                                    changedFormula = new WFF('A');  // We will only use the AST of this formula.
                                    changedFormula.ast = cloneDeep(pathFormula.ast);
                                    changedFormula.changeConstInAst(eq[p[1]], eq[p[0]]);
                                    correctContinuationGroups.push([{
                                        formula: 'continuedWithEqInference',  // Hack to recognize this continuation.
                                        children: [{formula: {ast: changedFormula.ast}}]
                                    }]);
                                }
                            });
                        });
                    });

                    if (ast.hasOwnProperty('not') && ast.not.hasOwnProperty('equa') &&
                        ast.not.equa[0].blockVar ===
                        ast.not.equa[1].blockVar) {
                            correctContinuationGroups.push([{
                                formula: null,
                                children: [{formula: {ast: {sentenceConst: '*'}}}]
                            }]);
                    }

                    var continuedWithClosing = false;
                    var continuedWithQuantifierInference = false;
                    var continuedWithEqInference = false;

                    traverse(node, function (n) {
                        if (n.underContinuation) {
                            // Update allCandidatesAreEmpty
                            if (allCandidatesAreEmpty) {
                                traverse(n, function (c) {
                                    if (c !== n && c.formula) {
                                        allCandidatesAreEmpty = false;
                                        return true;
                                    }
                                });
                            }

                            // Update continuedWithClosing
                            continuedWithClosing = compareObjects(
                                n.children[0].formula.ast,
                                {sentenceConst: '*'}
                            );  // If only this update was in the traverse, we could break here.

                            // Update stepIsCorrect, continuedWithEqInference and continuedWithQuantifierInference
                            var continuationIsCorrect = false;
                            var group, cont;
                            outerCCGLoop:
                            for (var i in correctContinuationGroups) {
                                group = correctContinuationGroups[i];
                                innerCCGLoop:
                                for (var j in group) {
                                    cont = group[j];
                                    if (cont.formula === 'continuedWithEqInference') {  // Use hack which was done in
                                                                                        // this continuation.
                                        continuedWithEqInference = true;
                                    }
                                    if (cont.formula === 'continuedWithQuantifierInference') {  // Use hack which was
                                                                                                // done in this
                                                                                                // continuation.
                                        continuedWithQuantifierInference = true;
                                    }
                                    cont.formula = n.formula;
                                    if (compareFormulaTrees(n, cont)) {
                                        continuationIsCorrect = true;

                                        // From now on, allow only this continuation group.
                                        // (Continuations from multiple groups are correct for
                                        // ¬¬A if ¬A or ¬¬¬A is among its ancestors,
                                        // and potentially we will have similar possible
                                        // mixings of the breaking-down rules in the
                                        // future.)
                                        correctContinuationGroups = [group];

                                        break outerCCGLoop;
                                    }
                                }
                            }
                            if (!continuationIsCorrect) {
                                stepIsCorrect = false;  // If only this update was in the traverse, we could break here.
                            }
                        }
                    });
                    if (allCandidatesAreEmpty) {
                        // TODO: automatic check step
                    }
                    if (stepIsCorrect) {
                        $scope.BDStepInProgress = false;
                        node.underBreakingDown = false;
                        if (!continuedWithQuantifierInference && !continuedWithEqInference) {
                            node.breakable = false;
                        }
                        if (!continuedWithClosing && !continuedWithQuantifierInference && !continuedWithEqInference) {
                            node.brokenDown = true;
                        }
                        node.lastBrokenDown = true;
                        traverse(node, function (n) {
                            if (n.underContinuation) {
                                n.underContinuation = false;
                                n.lastContinued = true;
                                traverse(n, function (c) {
                                    if (c !== n) {
                                        c.editable = false;
                                        c.breakable = $scope.isOnceBreakable(c);
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
    }]);
