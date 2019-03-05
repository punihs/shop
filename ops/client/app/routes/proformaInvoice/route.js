
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('proformaInvoice', {
        abstract: true,
        url: '/proformaInvoice',
        template: '<div ui-view=""></div>',
      })
      .state('proformaInvoice.dhl', {
        url: '/:orderCode/dhl',
        templateUrl: 'app/routes/proformaInvoice/dhl/dhl.html',
        controller: 'dhlController',
        controllerAs: '$ctrl',
      });
  });
