/**
 * CREATE    /campaign             ->  campaignController
 */

angular.module('uiGenApp')
  .config($stateProvider => {
    $stateProvider
      .state('campaigns', {
        abstract: true,
        url: '/campaigns',
        template: '<div ui-view></div>',
      })
      .state('campaigns.index', {
        url: '?bucket',
        templateUrl: 'app/routes/campaigns/index/index.html',
        controller: 'CampaignIndexController',
        controllerAs: '$ctrl',
      })
      .state('campaigns.create', {
        url: '/create?id',
        templateUrl: 'app/routes/campaigns/create/create.html',
        controller: 'CampaignCreateController',
        controllerAs: '$ctrl',
        resolve: {
          campaign($http, $stateParams, $state) {
            return $http
              .get(`$/campaigns/${$stateParams.id}`)
              .then(({ data: campaign }) => campaign)
              .catch(() => $state.go('access.404'));
          },
        },
      })
  });
