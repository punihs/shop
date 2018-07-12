'use strict';

describe('Controller: AccessCtrl', function () {

  // load the controller's module
  beforeEach(module('uiGenApp'));

  var AccessCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AccessCtrl = $controller('AccessCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    1.should.equal(1);
  });
});
