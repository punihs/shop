'use strict';

angular.module('uiGenApp')
  .factory('applicantsFactory', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      },
    };
  });
