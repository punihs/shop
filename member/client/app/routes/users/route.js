
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('users', {
        abstract: true,
        url: '/users',
        template: '<div ui-view=""></div>',
      })
      .state('users.profile', {
        url: '/profile',
        templateUrl: 'app/routes/users/profile/profile.html',
        controller: 'ProfileController',
        controllerAs: '$ctrl',
      })
      .state('users.address-index', {
        url: '/address',
        templateUrl: 'app/routes/users/address/address-index.html',
        controller: 'AddressesIndexController',
        controllerAs: '$ctrl',
      })
      .state('users.address-create', {
        url: '/address-create',
        templateUrl: 'app/routes/users/address/address-create.html',
        controller: 'AddressesCreateController',
        controllerAs: '$ctrl',
      })
      .state('users.address-edit', {
        url: '/address/:id/edit',
        templateUrl: 'app/routes/users/address/address-create.html',
        controller: 'AddressesCreateController',
        controllerAs: '$ctrl',
        resolve: {
          address($http, $stateParams) {
            const EDITING = $stateParams.id;
            if (!EDITING) return {};

            return $http
              .get(`/addresses/${$stateParams.id}`)
              .then(({ data: address }) => address);
          },
        },
      })
      .state('users.documents', {
        url: '/documents',
        templateUrl: 'app/routes/users/documents/documents.html',
        controller: 'DocumentController',
        controllerAs: '$ctrl',
      })
      .state('users.preferences', {
        url: '/preferences',
        templateUrl: 'app/routes/users/preferences/preferences.html',
        controller: 'PreferencesController',
        controllerAs: '$ctrl',
      })
      .state('users.password', {
        url: '/password',
        templateUrl: 'app/routes/users/password/password.html',
        controller: 'PasswordController',
        controllerAs: '$ctrl',
      });
  });
