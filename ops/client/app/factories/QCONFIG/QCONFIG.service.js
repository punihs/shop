
angular.module('uiGenApp')
  .factory('QCONFIG', () => ({
    PACKAGE_STATES: ['TASKS', 'FEEDBACK', 'COMPLETED', 'ALL'],
    USER_GROUPS: [{ id: 1, name: 'ADMINS' }, { id: 2, name: 'CUSTOMERS' }],
    MANAGE_JD_STATES: ['New', 'Accepted', 'Hidden', 'Rejected', 'ALL'],
    SHIPMENT_STATES: ['INREVIEW', 'INQUEUE', 'SENT', 'ALL'],
  }));

