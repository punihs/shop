angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /customers/:customerId/packages/new
      .state('customer.packages', {
        abstract: true,
        url: '/packages',
        template: '<div ui-view></div>',
      })
      .state('customer.packages.index', {
        url: '?bucket&sid&uid&create',
        templateUrl: 'app/routes/customers/packages/index/index.html',
        controller: 'CustomersPackagesIndexController',
        controllerAs: '$ctrl',
        resolve: {
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('customer.packages.create', {
        url: '/create?create',
        templateUrl: 'app/routes/customers/packages/create/create.html',
        controller: 'PackageCreateController',
        controllerAs: '$ctrl',
        resolve: {
          pkg: () => null,
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('customer.packages.bulk', {
        url: '/bulk?bulk',
        templateUrl: 'app/routes/customers/packages/bulk/bulk.html',
        controller: 'PackageBulkController',
        controllerAs: '$ctrl',
        resolve: {
          pkg: () => null,
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('customer.package', {
        abstract: true,
        url: '/packages/:packageId',
        template: '<div ui-view></div>',
      })
      .state('customer.package.update', {
        url: '/update',
        templateUrl: 'app/routes/customers/packages/create/create.html',
        controller: 'PackageCreateController',
        controllerAs: '$ctrl',
        resolve: {
          customer: ($http, $stateParams, toaster) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data)
            .catch(() => toaster.pop('error', 'Error loading customer')),
          pkg: ($http, $stateParams, toaster) => {
            const fl = [
              'id', 'customer_id', 'invoice_code', 'created_at',
              'weight', 'is_doc', 'price_amount', 'content_type', 'is_restricted_item',
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
