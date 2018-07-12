'use strict';

describe('Service: QCONFIG', function () {

  // load the service's module
  beforeEach(module('uiGenApp'));

  // instantiate service
  var QCONFIG;
  beforeEach(inject(function (_QCONFIG_) {
    QCONFIG = _QCONFIG_;
  }));

  it('should do something', function () {
    !!QCONFIG.should.be.true;
  });

});
