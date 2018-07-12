'use strict';

describe('Service: QuarcService', function () {

  // load the service's module
  beforeEach(module('uiGenApp'));

  // instantiate service
  var QuarcService;
  beforeEach(inject(function (_QuarcService_) {
    QuarcService = _QuarcService_;
  }));

  it('should do something', function () {
    !!QuarcService.should.be.true;
  });

});
