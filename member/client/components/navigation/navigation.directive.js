'use strict';

angular.module('uiGenApp')
  .directive('navigation', () => ({
    templateUrl: 'components/navigation/navigation.html',
    restrict: 'E',
    controller: 'NavigationController',
    controllerAs: 'Navigation'
  }));
