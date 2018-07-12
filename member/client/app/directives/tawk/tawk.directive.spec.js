'use strict';

describe('Directive: tawk', function () {

  // load the directive's module and view
  beforeEach(module('uiGenApp'));
  beforeEach(module('app/directives/tawk/tawk.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tawk></tawk>');
    element = $compile(element)(scope);
    scope.$apply();
    element.text().should.equal('this is the tawk directive');
  }));
});
