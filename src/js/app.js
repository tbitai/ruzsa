import { version } from '../../package.json';
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
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import union from 'lodash/union';
import difference from 'lodash/difference';
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
    let i = document.getElementsByClassName('active_input')[0];
    if (i !== undefined) {
        let p = i.selectionStart;
        let v = i.value;
        let before = v.slice(0, p);
        let after =  v.slice(p);
        i.value = before + keyStr + after;

        // Trigger input event for inputAutoresize
        $(i).trigger('input');

        // Propagate value change to Angular
        angular.element(i).controller('ngModel').$setViewValue(i.value);

        let l = i.value.length;
        let defaultPos = l - after.length;
        setCursorPosition(i, defaultPos);
        i.focus();
        if (cursorPos !== undefined) {
            setCursorPosition(i, defaultPos + cursorPos);
        }
    }
};
window.checkCommaAndParenthesis = function (el) {
    const p = el.selectionStart;
    const c = el.value[p];
    const cPrev = p > 0 ? el.value[p - 1] : '';
    if (c == ',') {
        setCursorPosition(el, p + 2);
    } else if (cPrev.match(/[a-z]/) && c == ')') {
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
        const blueWithLegacyContrastMap = $mdThemingProvider.extendPalette('blue', {
            'contrastDarkColors': '50 100 200 300 400 A100',
        });
        $mdThemingProvider.definePalette('blueWithLegacyContrast', blueWithLegacyContrastMap);
        $mdThemingProvider.theme('default')  // Base for all themes.
            .primaryPalette('blueWithLegacyContrast')
            .accentPalette('grey', {
                'default': '400'
            });
        $mdThemingProvider.theme('light');
        $mdThemingProvider.theme('dark')
            .accentPalette('grey', {
                'hue-1': 'A400'
            })
            .dark();
        $mdThemingProvider.setDefaultTheme('light');
        $mdThemingProvider.alwaysWatchTheme(true);
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en', {
            'OTHER_LANGUAGE': 'Magyar',
            'OTHER_LANGUAGE_ABBR': 'HU',

            // Toolbar buttons
            'NEW_TABLEAU': 'New tableau',
            'OPEN': 'Open',
            'SAVE': 'Save',
            'CHECK_STEP': 'Check step',
            'UNDO': 'Undo',
            'HELP': 'Help',
            'THEME': 'Theme',
            'CODE': 'Code',
            'MORE': 'More',

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
            'TEST_VERSION_ALERT_TEXT': 'Files saved here won\'t work in stable versions.',
            "LOAD_FILE_DEPR_READONLY_ALERT_TITLE": 'Read-only file',
            "LOAD_FILE_DEPR_READONLY_ALERT_TEXT": 'This file was created with a deprecated version of Ruzsa. We can load it, ' +
                'but you won\'t be able to edit it.'
        });
        $translateProvider.translations('hu', {
            'OTHER_LANGUAGE': 'English',
            'OTHER_LANGUAGE_ABBR': 'EN',

            // Toolbar buttons
            'NEW_TABLEAU': 'Új fa',
            'OPEN': 'Megnyitás',
            'SAVE': 'Mentés',
            'CHECK_STEP': 'Lépés ellenőrzése',
            'UNDO': 'Visszavonás',
            'HELP': 'Segítség',
            'THEME': 'Téma',
            'CODE': 'Kód',
            'MORE': 'Több',

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
            'TEST_VERSION_ALERT_TEXT': 'Az itt mentett fájlok nem fognak működni a stabil verziókban.',
            "LOAD_FILE_DEPR_READONLY_ALERT_TITLE": 'Csak olvasható fájl',
            "LOAD_FILE_DEPR_READONLY_ALERT_TEXT": 'Ez a fájl a Ruzsa egy már nem támogatott verziójával készült. Be tudjuk tölteni, ' +
                'de szerkeszteni nem lehet.'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escape');
    }])
    .config(['$cookiesProvider', function($cookiesProvider) {
        $cookiesProvider.defaults.samesite = 'strict';
    }])
    .controller('treeController', [
           '$scope', '$rootScope', '$mdDialog', '$timeout', '$translate', '$cookies',
        function(
            $scope,   $rootScope,   $mdDialog,   $timeout,   $translate,   $cookies
        ){
        $scope.themes = {
            list: ['light', 'dark'],
            defaultIndex: 0,
            cookieKey: 'theme'
        };
        $scope.theme = $cookies.get($scope.themes.cookieKey) || $scope.themes.list[$scope.themes.defaultIndex];
        $scope.toggleTheme = function() {
            const currentIndex = $scope.themes.list.indexOf($scope.theme);
            const otherIndex = 1 - currentIndex;
            const other = $scope.themes.list[otherIndex];
            $scope.theme = other;
            $cookies.put($scope.themes.cookieKey, other);
        };
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
                'WINDOW_UNLOAD_CONFIRM_UNSAVED',
                'LOAD_FILE_DEPR_READONLY_ALERT_TITLE',
                'LOAD_FILE_DEPR_READONLY_ALERT_TEXT'
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
                $scope.loadFileDeprReadonlyAlertTitle = tr.LOAD_FILE_DEPR_READONLY_ALERT_TITLE;
                $scope.loadFileDeprReadonlyAlertText = tr.LOAD_FILE_DEPR_READONLY_ALERT_TEXT;
            });
        };
        $scope.generateTranslationsForScope();
        $rootScope.$on('$translateChangeSuccess', function() {
            $scope.generateTranslationsForScope();
        });
        $scope.translationLangs = ['en', 'hu'];
        $scope.toggleLanguage = function() {
            $translate.use(
                $scope.translationLangs[1 - $scope.translationLangs.indexOf($translate.use())]
            );
        };

        $scope.getCommonDialogOptions = function () { return {
            ok: 'OK',
            focusOnOpen: false,
            theme: $scope.theme  // Workaround https://github.com/angular/material/issues/11229
        }};

        $scope.getState = function() {
            return {
                treeData:               $scope.treeData,
                greatestId:             $scope.greatestId,
                greatestConnectId:      $scope.greatestConnectId,
                undoStepPossible:       $scope.undoStepPossible,
                cancelNewNodesPossible: $scope.cancelNewNodesPossible,
                BDStepInProgress:       $scope.BDStepInProgress,
                unsavedDataPresent:     $scope.unsavedDataPresent,
                filename:               $scope.filename,
                readonly:               $scope.readonly
            };
        };

        /**
         * Set `$scope`'s state.
         * @param state - Object representing the new state. `WFF` prototype will be added to the formulas.
         * @param withDigest - If `true`, `$scope.$digest()` will be called as a last step.
         */
        $scope.setState = function(state, withDigest) {
            $scope.treeData =               state.treeData;

            // Add `WFF` prototype to the tree's formulas
            traverse($scope.treeData, function (node) {
                let wff = new WFF();
                Object.assign(wff, node.formula);
                node.formula = wff;
            });

            $scope.greatestId =             state.greatestId;
            $scope.greatestConnectId =      state.greatestConnectId;
            $scope.undoStepPossible =       state.undoStepPossible;
            $scope.cancelNewNodesPossible = state.cancelNewNodesPossible;
            $scope.BDStepInProgress =       state.BDStepInProgress;
            $scope.unsavedDataPresent =     state.unsavedDataPresent;
            $scope.filename =               state.filename;
            $scope.readonly =               state.readonly;

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
            filename: 'Untitled.tree',
            readonly: false
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
                    $mdDialog.show($mdDialog.alert(Object.assign($scope.getCommonDialogOptions(), {
                        title: tr.TEST_VERSION_ALERT_TITLE,
                        textContent: tr.TEST_VERSION_ALERT_TEXT,
                    })));
                }, 0, false);
            });
        }

        $scope.getLoadFileConfirmUnsaved = function() {
            return $mdDialog.confirm(Object.assign($scope.getCommonDialogOptions(), {
                title: $scope.loadFileConfirmUnsavedTitle,
                htmlContent: $scope.loadFileConfirmUnsavedText,
                ok: $scope.confirmContinue,
                cancel: $scope.confirmCancel,
            }));
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
            let state = $scope.getState();
            let data = {
                version: version,
                state: state
            };
            let dataStr = angular.toJson(data);  // Properties with leading $$ characters will be stripped
            let dataStrEncoded = $scope.encode(dataStr);
            let downloadStr = 'Ruzsa v' + version + ' ' + dataStrEncoded;
            download(downloadStr, $scope.filename, 'application/octet-stream');
        };
        $scope.loadFile = function(files) {
            function resetInput() {  // We need this to allow to select the same file again later
                document.getElementById('file_input').value = '';
            }
            function core() {
                let file = files[0];
                let reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        let text = event.target.result;

                        // Remove program and version info
                        text = text.replace(/^Ruzsa \S+\s/, '');

                        let dataStr = $scope.decode(text);
                        let dataJSON = JSON.parse(dataStr);

                        // Below we will change treeData, but in this case we don't want
                        // this to cause $scope.unsavedDataPresent to be true.
                        $scope.savedDataJustLoaded = true;

                        let loadedVersion = dataJSON.version;
                        if ($scope.isVersionTesting(loadedVersion) && !($scope.isRunningVersionTesting)) {
                            //noinspection ExceptionCaughtLocallyJS
                            throw new Error('File saved in testing version: v' + loadedVersion);
                        }
                        let state = dataJSON.state;
                        state.filename = file.name;
                        let readonly = semver.lt(loadedVersion, '1.0.0');
                        state.readonly = readonly;
                        if (readonly) {
                            $mdDialog.show(
                                $mdDialog.alert(Object.assign($scope.getCommonDialogOptions(), {
                                    title: $scope.loadFileDeprReadonlyAlertTitle,
                                    textContent: $scope.loadFileDeprReadonlyAlertText,
                                }))
                            );
                        }
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
                        let alert = $mdDialog.alert(Object.assign($scope.getCommonDialogOptions(), {
                            title: $scope.loadFileErrorAlertTitle,
                            textContent: $scope.loadFileErrorAlertText,
                        }));
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
            let focusQ = $('.in_focus_q').sort(function (el1, el2) {
                function o(el) {
                    //noinspection JSUnresolvedVariable
                    return parseFloat(el.dataset.ruzsaFocusOrder);
                }
                return o(el1) - o(el2);
            });
            if (focusQ.length > 0) {
                let elToFocus = focusQ[0];
                elToFocus.focus();
                $(elToFocus).removeClass('in_focus_q');
            }
        };

        $scope.$watch('treeData', function (newTreeData, oldTreeData) {
            $timeout(function () {
                // Fix superfluous lines from leaves -- JS part
                let uls = $('ul');
                uls.removeClass('empty_ul');
                uls.filter(function () {
                    return $(this).children().length === 0;
                }).addClass('empty_ul');

                $('.formula_input').inputAutoresize({
                    padding: 20,
                    minWidth: 160  // .formula_input width
                });

                if (newTreeData !== oldTreeData &&  // Exclude initialization
                    !$scope.savedDataJustLoaded) {
                        $scope.unsavedDataPresent = true;
                }
                $scope.savedDataJustLoaded = false;
            }, 0, false);
        }, true);
        $scope.$watch(function (scope) {
            let treeNodesLength = 0;
            traverse(scope.treeData, function (_node) {
                treeNodesLength++;
            });
            return treeNodesLength;
        }, function (_newVal, _oldVal) {
            $timeout(function () {
                $scope.focusNext();
            }, 0, false);
        });

        // Have to update title in a watch, see comment in the HTML.
        $scope.updateTitle = function(filename, unsavedDataPresent) {
            filename = filename === undefined ? $scope.filename : filename;
            unsavedDataPresent = unsavedDataPresent === undefined ? $scope.unsavedDataPresent : unsavedDataPresent;
            $('title').text(filename + (unsavedDataPresent ? '*' : '') + ' – Ruzsa');
        };
        $scope.$watch('filename', function(newFilename, _oldFilename) {
            $scope.updateTitle(newFilename);
        });
        $scope.$watch('unsavedDataPresent', function(newUnsavedDataPresent, _oldUnsavedDataPresent) {
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
            let ast = node.formula.ast;
            let path = treePath($scope.treeData,
                function(n) { return n.id === node.id; },
                function(n) { return n.formula.ast; }
            );
            return path.find(function(pathAst) {
                return 'not' in pathAst && isEqual(pathAst.not, ast) ||
                       'not' in ast && isEqual(pathAst, ast.not);
            });
        };
        $scope.isLiteral = function(formula) {
            let ast = formula.ast;
            let maybeAtomic = 'not' in ast ? ast.not : ast;
            if (maybeAtomic.hasOwnProperty('sentenceVar') || maybeAtomic.hasOwnProperty('sentenceConst')) {
                return true;
            }
            if (maybeAtomic.hasOwnProperty('forAll') || maybeAtomic.hasOwnProperty('exists')) {
                return false;
            }
            for (let p in maybeAtomic) {
                if (maybeAtomic.hasOwnProperty(p)) {
                    let v = maybeAtomic[p];
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
                let newFormula = new WFF(node.input);
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
        $scope.submitTree = function (root) {
            let isTreeValid = true;
            traverse(root, function (node) {
                if (node.underEdit) {
                    $scope.submit(node);
                    isTreeValid = isTreeValid && isEqual(node.error, {});
                }
            });
            return isTreeValid;
        };
        $scope.checkForEmptyNodes = function () {
            let emptyNodesPresent = false;
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
            let alert = $mdDialog.alert(Object.assign($scope.getCommonDialogOptions(), {
                title: $scope.stepInProgressAlertTitle,
                textContent: $scope.stepInProgressAlertText,
            }));
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
            let connectId = ++$scope.greatestConnectId;
            let emptyNode = {formula: null,
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
                let focusOrderSet = false;
                traverse($scope.treeData, function (node) {
                    if (!('children' in node) &&
                        node.formula &&  // Exclude newly added leaves
                        !isEqual(node.formula.ast, {sentenceConst: '*'})  // Exclude closed branches
                    ) {
                        let emptyNodeClone = cloneDeep(emptyNode);
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
        $scope.setFocusOrder = function(node, o) {
            node.focusOrder = o;
            return node;
        };
        $scope.candidate = {
            formula: null,
            editable: true,
            breakable: true,
            underEdit: true,
            input: '',
            candidate: true,
            inFocusQ: true
        };
        $scope.makeCandidateClone = function(o, lastOfType) {
            let lastOfTypeObject = {};
            let capitalize = s => s[0].toUpperCase() + s.slice(1);
            if (lastOfType) {
                lastOfTypeObject[`last${capitalize(lastOfType)}Candidate`] = true;
            }
            return $scope.setId($scope.setFocusOrder(Object.assign(cloneDeep($scope.candidate), lastOfTypeObject), o));
        };
        $scope.makeDoubleCandidateClone = function(oTop, oBtm, lastOfTypeTop, lastOfTypeBtm) {
            let doubleCandidateClone = $scope.makeCandidateClone(oTop, lastOfTypeTop);
            doubleCandidateClone.children = [$scope.makeCandidateClone(oBtm, lastOfTypeBtm)];
            return doubleCandidateClone;
        };
        $scope.addCandidates = function (type, node) {
            if ($scope.BDStepInProgress || $scope.checkForEmptyNodes()) {
                $scope.showStepInProgressAlert();
                return;
            }

            $scope.removeBDStepMemory();
            let o = 0;
            traverse(node, function (n) {
                if (!('children' in n) &&
                    n.formula &&  // Exclude newly added nodes
                    !isEqual(n.formula.ast, {sentenceConst: '*'})  // Exclude closed branches
                ) {
                    if (type == 'or') {
                        n.children = [
                            $scope.makeCandidateClone(o++),
                            $scope.makeCandidateClone(o++, 'or')
                        ];
                    } else if (type == 'and') {
                        n.children = [
                           $scope.makeDoubleCandidateClone(o, o + 1, undefined, 'and')
                        ];
                        o += 2;
                    } else if (type == 'equi') {
                        n.children = [
                            $scope.makeDoubleCandidateClone(o, o + 1),
                            $scope.makeDoubleCandidateClone(o + 2, o + 3)
                        ];
                        o += 4;
                    } else if (type == 'double_not') {
                        n.children = [
                            $scope.makeCandidateClone(o++)
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

        /** Return last integer order + .5^n. */
        $scope.calculateNextFractionalFocusOrder = function(o) {
            if (Math.ceil(o) === o) {
                return o + .5;
            }
            return o + (Math.ceil(o) - o) / 2;
        };

        $scope.addOrCandidate = function(node) {
            let path = treePath($scope.treeData, n => n.id === node.id, n => n);
            let parent = path[path.length - 2];
            let o = $scope.calculateNextFractionalFocusOrder(node.focusOrder);
            delete node.lastOrCandidate;
            parent.children.push($scope.makeCandidateClone(o, 'or'));
        };
        $scope.addAndCandidate = function(node) {
            let o = $scope.calculateNextFractionalFocusOrder(node.focusOrder);
            delete node.lastAndCandidate;
            node.children = [
                $scope.makeCandidateClone(o, 'and')
            ];
        };
        $scope.undoStep = function () {
            if ($scope.cancelNewNodesPossible) {
                // Delete leaves from their parents
                traverseBF($scope.treeData, function(node) {
                    if ('children' in node) {
                        for (let i = node.children.length - 1; i > -1; i--) {
                            let child = node.children[i];
                            if (!(child.children) &&
                                (!(child.formula) || !isEqual(child.formula.ast, {sentenceConst: '*'}))) {
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
            let alert = $mdDialog.alert(Object.assign($scope.getCommonDialogOptions(), {
                title: $scope.incorrectStepAlertTitle,
                htmlContent: $scope.incorrectStepAlertText,
            }));
            $mdDialog.show(alert);
        };
        $scope.checkStep = function () {
            traverse($scope.treeData, function (node) {
                if (node.underBreakingDown) {
                    if (!$scope.submitTree(node)) {
                        $scope.showIncorrectStepAlert();
                        return;
                    }
                    let allCandidatesAreEmpty = true;
                    let stepIsCorrect = true;
                    let formula = node.formula;
                    let ast = formula.ast;
                    let correctContinuationGroups = [];
                    let permutationsOfTwo = [[0, 1], [1, 0]];
                    if ('or' in ast) {
                        let group = [];
                        if (ast.or.length < 3) {
                            for (let p of permutationsOfTwo) {
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.or[p[0]]}},
                                               {formula: {ast: ast.or[p[1]]}}]
                                });
                            }
                        } else {
                            group.push({
                                formula: null,
                                children: ast.or.map(a => ({formula: {ast: a}}))
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
                        let group = [];
                        if (ast.and.length < 3) {
                            for (let p of permutationsOfTwo) {
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: ast.and[p[0]]},
                                                children: [{formula: {ast: ast.and[p[1]]}}]}]
                                });
                            }
                        } else {
                            let cont = {formula: null};
                            let contDeepestPart = cont;
                            for (let a of ast.and) {
                                contDeepestPart.children = [{
                                    formula: {ast: a}
                                }];
                                contDeepestPart = contDeepestPart.children[0];
                            }
                            group.push(cont);
                        }
                        correctContinuationGroups.push(group);
                    } else if ('equi' in ast) {
                        let group = [];
                        for (let pOuter of permutationsOfTwo) {
                            for (let pInner of permutationsOfTwo) {
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
                        let group = [];
                        if (ast.not.or.length < 3) {
                            for (let p of permutationsOfTwo) {
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.or[p[0]]}},
                                                children: [{formula: {ast: {not: ast.not.or[p[1]]}}}]}]
                                });
                            }
                        } else {
                            let cont = {formula: null};
                            let contDeepestPart = cont;
                            for (let a of ast.not.or) {
                                contDeepestPart.children = [{
                                    formula: {ast: {not: a}}
                                }];
                                contDeepestPart = contDeepestPart.children[0];
                            }
                            group.push(cont);
                        }
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'impl' in ast.not) {
                        let group = [];
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
                        let group = [];
                        if (ast.not.and.length < 3) {
                            for (let p of permutationsOfTwo) {
                                group.push({
                                    formula: null,
                                    children: [{formula: {ast: {not: ast.not.and[p[0]]}}},
                                               {formula: {ast: {not: ast.not.and[p[1]]}}}]
                                });
                            }
                        } else {
                            group.push({
                                formula: null,
                                children: ast.not.and.map(a => ({formula: {ast: {not: a}}}))
                            });
                        }
                        correctContinuationGroups.push(group);
                    } else if ('not' in ast && 'equi' in ast.not) {
                        let group = [];
                        for (let pOuter of permutationsOfTwo) {
                            for (let pInner of permutationsOfTwo) {
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
                        let v, scope;
                        if (ast.hasOwnProperty('forAll')) {
                            v = ast.forAll[0].blockVar;
                            scope = ast.forAll[1];
                        } else {
                            v = ast.not.exists[0].blockVar;
                            scope = {not: ast.not.exists[1]};
                        }
                        for (let c of WFF.blockConsts) {
                            let substitutedScope = new WFF();
                            substitutedScope.ast = cloneDeep(scope);
                            substitutedScope.substituteConstInAst(c, v);
                            correctContinuationGroups.push([{
                                formula: 'continuedWithUniversalLikeQInference',  // Hack to recognize this continuation.
                                children: [{formula: {ast: substitutedScope.ast}}]
                            }]);
                        }
                    }

                    if (ast.hasOwnProperty('exists') || ast.hasOwnProperty('not') && ast.not.hasOwnProperty('forAll')) {
                        let v, scope;
                        if (ast.hasOwnProperty('exists')){
                            v = ast.exists[0].blockVar;
                            scope = ast.exists[1];
                        } else {
                            v = ast.not.forAll[0].blockVar;
                            scope = {not: ast.not.forAll[1]};
                        }
                        let usedBlockConsts = [];
                        traverse($scope.treeData, function (n) {
                            if (!n.candidate) {
                                n.formula.traverseBlockConsts(function (subobj, prop, val) {
                                    usedBlockConsts = union(usedBlockConsts, [val]);
                                });
                            }
                        });
                        let unusedBlockConsts = difference(WFF.blockConsts, usedBlockConsts);
                        for (let c of unusedBlockConsts) {
                            let substitutedScope = new WFF();
                            substitutedScope.ast = cloneDeep(scope);
                            substitutedScope.substituteConstInAst(c, v);
                            correctContinuationGroups.push([{
                                formula: null,
                                children: [{formula: {ast: substitutedScope.ast}}]
                            }]);
                        }
                    }

                    let eqs = [];
                    let path = treePath($scope.treeData,
                        function(n) { return n.id === node.id; },
                        function(n) { return n.formula; }
                    );
                    for (let pathFormula of path) {
                        if (pathFormula.ast.hasOwnProperty('equa')) {
                            eqs.push([
                                pathFormula.ast.equa[0].blockConst,
                                pathFormula.ast.equa[1].blockConst
                            ]);
                        }
                    }
                    for (let eq of eqs) {
                        for (let p of permutationsOfTwo) {
                            for (let pathFormula of path) {
                                if (pathFormula.hasBlockConst(eq[p[0]])) {
                                    let changedFormula = new WFF();
                                    changedFormula.ast = cloneDeep(pathFormula.ast);
                                    changedFormula.changeConstInAst(eq[p[1]], eq[p[0]]);
                                    correctContinuationGroups.push([{
                                        formula: 'continuedWithEqInference',  // Hack to recognize this continuation.
                                        children: [{formula: {ast: changedFormula.ast}}]
                                    }]);
                                }
                            }
                        }
                    }

                    if (ast.hasOwnProperty('not') && ast.not.hasOwnProperty('equa') &&
                        ast.not.equa[0].blockVar ===
                        ast.not.equa[1].blockVar) {
                            correctContinuationGroups.push([{
                                formula: null,
                                children: [{formula: {ast: {sentenceConst: '*'}}}]
                            }]);
                    }

                    let continuedWithClosing = false;
                    let continuedWithUniversalLikeQInference = false;
                    let continuedWithEqInference = false;

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
                            continuedWithClosing = isEqual(
                                n.children[0].formula.ast,
                                {sentenceConst: '*'}
                            );  // If only this update was in the traverse, we could break here.

                            // Update stepIsCorrect, continuedWithEqInference and continuedWithUniversalLikeQInference
                            let continuationIsCorrect = false;
                            outerCCGLoop:
                            for (let group of correctContinuationGroups) {
                                for (let cont of group) {
                                    if (cont.formula === 'continuedWithEqInference') {  // Use hack which was done in
                                                                                        // this continuation.
                                        continuedWithEqInference = true;
                                    }
                                    if (cont.formula === 'continuedWithUniversalLikeQInference') {  // Use hack which
                                                                                                    // was done in this
                                                                                                    // continuation.
                                        continuedWithUniversalLikeQInference = true;
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
                        if (!continuedWithUniversalLikeQInference && !continuedWithEqInference) {
                            node.breakable = false;
                        }
                        if (!continuedWithClosing && !continuedWithUniversalLikeQInference && !continuedWithEqInference) {
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
                                    delete c.lastOrCandidate;
                                    delete c.lastAndCandidate;
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
