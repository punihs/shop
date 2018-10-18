/**
 * LIST    /packages             ->  PackagesCtrl
 * NEW     /packages/new         ->  PackageNewController
 * VIEW    /packages/:id         ->  PackageViewController
 */

angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('packages', {
        abstract: true,
        url: '/packages',
        template: '<div ui-view></div>',
      })
      .state('packages.index', {
        url: '?bucket&sid&uid',
        templateUrl: 'app/routes/packages/index/index.html',
        controller: 'PackagesIndexController',
        controllerAs: '$ctrl',
      })
      .state('package', {
        abstract: true,
        url: '/packages/:id',
        template: '<div ui-view></div>',
      })
      .state('package.show', {
        url: '?{activeTab:int}&:profilePhotoUrl',
        templateUrl: 'app/routes/packages/show/show.html',
        controller: 'PackageShowController',
        controllerAs: '$ctrl',
        resolve: {
          pkg($http, $stateParams, $state) {
            const fl = [
              'id', 'customer_id', 'invoice_code', 'created_at', 'weight', 'price_amount',
              'is_doc', 'content_type', 'splitting_directions', 'return_send', 'comments',
              'invoice', 'store_name',
            ];

            const params = {
              fl: fl.join(','),
            };

            return $http
              .get(`/packages/${$stateParams.id}`, { params })
              .then(({ data: pkg }) => pkg)
              .catch(() => $state.go('access.404'));
          },
        },
      })
      .state('package.charges', {
        url: '/charges',
        templateUrl: 'app/routes/packages/charges/charges.html',
        controller: 'PackageChargesController',
        controllerAs: '$ctrl',
        resolve: {
          charges: ($http, $stateParams, toaster) => $http
            .get(`/packages/${$stateParams.id}/charges`)
            .then(({ data }) => data)
            .catch(() => toaster.pop('error', 'Error loading package')),
        },
      })
      .state('package.items', {
        url: '/items',
        templateUrl: 'app/routes/packages/items/items.html',
        controller: 'PackageItemsController',
        controllerAs: '$ctrl',
        resolve: {
          pkg: $stateParams => ({ id: $stateParams.id }),
          item: () => null,
        },
      })
      .state('package.item', {
        abstract: true,
        url: '/items/:packageItemId',
        template: '<div ui-view></div>',
      })
      .state('package.item.edit', {
        url: '/edit',
        templateUrl: 'app/routes/packages/items/items.html',
        controller: 'PackageItemsController',
        controllerAs: '$ctrl',
        resolve: {
          pkg: $stateParams => ({ id: $stateParams.id }),
          item: ($http, $stateParams, toaster) => $http
            .get(`/packageItems/${$stateParams.packageItemId}`)
            .then(({ data }) => data)
            .catch(() => toaster.pop('error', 'Error loading package item')),
        },
      });
  });
