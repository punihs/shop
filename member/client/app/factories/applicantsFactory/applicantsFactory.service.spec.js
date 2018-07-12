'use strict';

describe('Service: applicantsFactory', function () {

  // load the service's module
  beforeEach(module('uiGenApp'));

  // instantiate service
  var applicantsFactory;
  beforeEach(inject(function (_applicantsFactory_) {
    applicantsFactory = _applicantsFactory_;
  }));

  it('should do something', function () {
    !!applicantsFactory.should.be.true;
  });

});
