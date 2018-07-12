angular.module('uiGenApp')
  .directive('navbar', () => ({
    templateUrl: 'components/navbar/navbar.html',
    replace: false,
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: '$ctrl',
  }));
