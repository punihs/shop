'use strict';

angular.module('uiGenApp')
  .directive('aside', () => ({
    templateUrl: 'components/aside/aside.html',
    restrict: 'E',
    controller: 'AsideController',
    controllerAs: 'Aside'
  }));
