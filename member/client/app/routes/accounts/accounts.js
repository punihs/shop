
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('accounts', {
        abstract: true,
        url: '/accounts',
        templateUrl: 'app/routes/accounts/accounts.html',
      })
      .state('accounts.profile', {
        url: '/profile',
        templateUrl: 'app/routes/accounts/profile/profile.html',
        controller: 'ProfileController',
        controllerAs: '$ctrl',
      })
      .state('accounts.address-list', {
        url: '/address',
        templateUrl: 'app/routes/accounts/address/address-list.html',
        controller: 'AddressListController',
        controllerAs: '$ctrl',
      })
      .state('accounts.address-new', {
        url: '/address-new',
        templateUrl: 'app/routes/accounts/address/address-new.html',
        controller: 'AddressNewController',
        controllerAs: '$ctrl',
      })
      .state('accounts.address-edit', {
        url: '/address/:id/edit',
        templateUrl: 'app/routes/accounts/address/address-new.html',
        controller: 'AddressNewController',
        controllerAs: '$ctrl',
      })
      .state('accounts.documents', {
        url: '/documents',
        templateUrl: 'app/routes/accounts/documents/documents.html',
        controller: 'DocumentController',
        controllerAs: '$ctrl',
      })
      .state('accounts.preferences', {
        url: '/preferences',
        templateUrl: 'app/routes/accounts/preferences/preferences.html',
        controller: 'preferencesController',
        controllerAs: '$ctrl',
      })
      .state('accounts.passwordChange', {
        url: '/password',
        templateUrl: 'app/routes/accounts/passwordChange/passwordChange.html',
        controller: 'PasswordChangeController',
        controllerAs: '$ctrl',
      });
  });
