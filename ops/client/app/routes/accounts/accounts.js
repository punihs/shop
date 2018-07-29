
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
      .state('billing', {
        url: '/billing',
        controller($state) {
          return $state.go('accounts.billing');
        },
      })
      .state('accounts.billing', {
        url: '/billing',
        templateUrl: 'app/routes/accounts/billing/billing.html',
        controller: 'BillingController',
        controllerAs: '$ctrl',
      })
      .state('accounts.transaction', {
        url: '/transaction',
        templateUrl: 'app/routes/accounts/transaction/transaction.html',
        controller: 'TransactionController',
        controllerAs: '$ctrl',
      })
      .state('accounts.preferences', {
        url: '/preferences',
        template: '<preferences></preferences>',
        resolve: {
          title: Page => Page.setTitle('Preferences'),
        },
      })
      .state('accounts.badge', {
        url: '/badge',
        templateUrl: 'app/routes/accounts/badge/badge.html',
        controller: 'BadgeController',
        controllerAs: '$ctrl',
      })
      .state('accounts.set-preferences', {
        url: '/set-preferences',
        templateUrl: 'app/routes/accounts/preferences/set-preferences.html',
      })
      .state('accounts.terminated-message', {
        url: '/terminated-message',
        templateUrl: 'app/routes/accounts/terminated-message/terminated-message.html',
        controller: 'TerminatedMessageCtrl',
      })
      .state('accounts.profile-detail', {
        url: '/profile-detail',
        templateUrl: 'app/routes/accounts/profile-detail/profile-detail.html',
        controller: 'ProfileDetailController',
        controllerAs: '$ctrl',
      })
      .state('accounts.empanelment', {
        url: '/empanelment',
        templateUrl: 'app/routes/accounts/empanelment/empanelment.html',
        controller: 'EmpanelmentController',
        controllerAs: '$ctrl',
      })
      .state('accounts.download-extension', {
        url: '/downloadExtension',
        templateUrl: 'app/routes/accounts/download-extension/download-extension.html',
        controller: 'DownloadExtensionController',
        controllerAs: '$ctrl',
      });
  });
