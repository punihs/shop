angular.module('qui.core')
  .factory('User', (Session) => ({
    get userinfo() { return Session.read('userinfo'); },
    get states() { return Session.read('states'); },
    get shipmentStates() { return Session.read('shipment-states'); },
    get shipmentTypes() { return Session.read('shipment-types'); },
  }));
