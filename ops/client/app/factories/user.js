angular.module('qui.core')
  .factory('User', (Session) => ({
    get userinfo() { return Session.read('adminUserinfo'); },
    get states() { return Session.read('states'); },
    get shipmentStates() { return Session.read('shipment-states'); },
    get shipmentTypes() { return Session.read('shipment-types'); },
    get orderStates() { return Session.read('order-types'); },
    get afterShipCarriers() { return Session.read('afterShipCarriers'); },
  }));
