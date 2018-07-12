'use strict';

angular.module('uiGenApp')
  .controller('NavigationController', function($scope){
    $scope.$state = $state;
    console.log($state.includes('applicants'))
  });
