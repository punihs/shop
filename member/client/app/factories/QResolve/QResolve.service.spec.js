'use strict';

describe('Service: QResolve', function () {

  // load the service's module
  beforeEach(module('uiGenApp'));

  // instantiate service
  var QResolve;
  beforeEach(inject(function (_QResolve_) {
    QResolve = _QResolve_;
  }));

  it('should do something', function () {
    !!QResolve.should.be.true;
  });

});
