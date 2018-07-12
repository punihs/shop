
angular.module('uiGenApp')
  .factory('QCONFIG', () => ({
    PACKAGE_STATES: ['PROCESSING', 'VALUES', 'REVIEW', 'DELIVERED', 'INREVIEW', 'ALL'],
    USER_GROUPS: [{ id: 1, name: 'ADMINS' }, { id: 2, name: 'CUSTOMERS' }],
    MANAGE_JD_STATES: ['New', 'Accepted', 'Hidden', 'Rejected', 'ALL'],
  }))
  .factory('CONFIG', () => ({
    PACKAGE_STATES: ['Ready to Send', 'In Review', 'Actions Required', 'View All'],
    USER_GROUPS: [{ id: 1, name: 'ADMINS' }, { id: 2, name: 'CUSTOMERS' }],
    MANAGE_JD_STATES: ['New', 'Accepted', 'Hidden', 'Rejected', 'ALL'],
  }));

