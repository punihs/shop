'use strict';

describe('Directive: reauth', () => {

  // load the directive's module and view
  beforeEach(module('uiGenApp'));
  beforeEach(module('app/directives/reauth/reauth.html'));

  var element, scope;

  beforeEach(inject($rootScope => {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject($compile => {
    element = angular.element('<reauth></reauth>');
    element = $compile(element)(scope);
    scope.$apply();
    element.text().should.equal('this is the reauth directive');
  }));
});
