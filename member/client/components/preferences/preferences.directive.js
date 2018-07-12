'use strict';

angular.module('uiGenApp')
  .directive('preferences', () => ({
    templateUrl: 'components/preferences/preferences.html',
    scope: {
      uiConf: '=',
      reload: '=?',
    },
    restrict: 'E',
    controller: 'PreferencesController',
    bindToController: true,
    controllerAs: '$ctrl',
  }));
