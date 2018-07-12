angular.module('uiGenApp')
  .directive('regionSuggest', () => ({
    templateUrl: 'components/region-suggest/region-suggest.html',
    scope: {
      regionId: '=',
      regionName: '=',
      isRequired: '=?',
      placeholder: '@?',
      field: '=?',
    },
    restrict: 'E',
    controller: 'RegionSuggestController',
    bindToController: true,
    controllerAs: '$ctrl',
  }));
