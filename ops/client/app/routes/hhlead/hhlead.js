angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('hhlead', {
        abstract: true,
        url: '/hhleads',
        template: '<div ui-view=""></div>',
      })
      .state('hhlead.new', {
        url: '/new',
        controller: 'HHLeadController',
        controllerAs: '$ctrl',
        templateUrl: 'app/routes/hhlead/hhlead-new/hhlead-new.html',
      });
  });
