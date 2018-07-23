angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipment.packages', {
        abstract: true,
        url: '/packages',
        template: '<div ui-view></div>',
      })
      .state('shipment.packages.index', {
        url: '?status&sid&uid',
        templateUrl: 'app/routes/shipments/packages/index/index.html',
        controller: 'ShipmentsPackagesIndexController',
        controllerAs: '$ctrl',
        resolve: {
          shipment: ($http, $stateParams) => $http
            .get(`/shipments/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('shipment.package', {
        abstract: true,
        url: '/packages/:packageId',
        template: '<div ui-view></div>',
      })
      .state('shipment.package.update', {
        url: '/update',
        templateUrl: 'app/routes/shipments/packages/create/create.html',
        controller: 'PackageCreateController',
        controllerAs: '$ctrl',
        resolve: {
          shipment: ($http, $stateParams, toaster) => $http
              .get(`/shipments/${$stateParams.id}`)
              .then(({ data }) => data)
              .catch(() => toaster.pop('error', 'Error loading shipment')),
          pkg: ($http, $stateParams, toaster) => {
            const fl = [
              'id', 'shipment_id', 'reference_code', 'created_at',
              'weight', 'is_doc', 'price_amount', 'content_type',
            ].join(',');

            return $http
              .get(`/packages/${$stateParams.packageId}?fl=${fl}`)
              .then(({ data }) => data)
              .catch(() => toaster.pop('error', 'Error loading package'));
          },
          charges: ($http, $stateParams, toaster) => $http
            .get(`/packages/${$stateParams.packageId}/charges`)
            .then(({ data }) => data)
            .catch(() => toaster.pop('error', 'Error loading package')),
        },
      });
  });
