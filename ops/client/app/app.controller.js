class AppController {
  constructor(
    $window, $uibModal, $state, $rootScope, URLS,
    $http, $stateParams, Session, Page, socket
  ) {
    const vm = this;
    this.Page = Page;
    this.socket = socket;
    vm.$stateParams = $stateParams;
    vm.Session = Session;

    vm.userinfo = this.Session.read('userinfo');
    vm.states = this.Session.read('states');
    vm.shipmentStates = this.Session.read('shipment-states');

    vm.Math = Math;
    vm.URLS = URLS;
    // config
    vm.app = {
      name: 'OPS',
      version: '0.0.1',
      settings: {
        themeID: 1,
        // navbarHeaderColor: 'bg-primary dk',
        navbarCollapseColor: 'bg-info',
        asideColor: 'bg-info bg-gd-dk',
        headerFixed: true,
        asideFixed: true,
        asideFolded: true,
        asideDock: true,
        container: false,
        offScreen: false, // flag for show of sidebar for mobile view
        mobileHeader: false, // flag to show header Nav and Search in mobile view
        isAdmin: vm.Session.read('ROLE_ADMIN'),
      },
    };

    vm.updateNavigationBar = (currentState, stateParams) => {
      let navbarHeaderColor = 'bg-primary';
      let navbarCollapseColor = 'bg-info';
      let asideColor = 'bg-info bg-gd-dk';
      if (currentState.startsWith('candidates.') || currentState.startsWith('candidate.')) {
        navbarHeaderColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
        navbarCollapseColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
        asideColor = stateParams.source === '0' ? 'bg-black bg-gd-dk' : 'bg-sea-green bg-gd-dk';
      }
      vm.app.settings.navbarHeaderColor = navbarHeaderColor;
      vm.app.settings.navbarCollapseColor = navbarCollapseColor;
      vm.app.settings.asideColor = asideColor;
    };

    // keeps track of state change and hides sidebar view for mobile
    /* eslint angular/on-watch: 0 */
    $rootScope.$on('$stateChangeStart', (ev, to, toParams, from) => {
      Object.assign($rootScope, {
        previousState: from.name,
        currentState: to.name,
      });
      vm.app.settings.offScreen = false;
      vm.app.settings.mobileHeader = false;
      vm.updateNavigationBar($rootScope.currentState, toParams);
    });

    vm.Page = Page; // Set Page title
    vm.$state = $state;

    // Applicant search related Functions
    vm.Applicants = {
      select: ($item) => {
        vm.Applicants.searchText = '';
        $state.go('applicant.view', { applicantId: $item.id });
      },

      get: (searchText) => $http
        .get('/search', {
          params: {
            type: 'applicants',
            q: searchText,
            offset: 0,
            limit: 15,
            fl: 'id,name',
          },
        }),

      noResults: false,
      loadingRegions: false,
    };

    vm.interviewUI = {
      5: {
        icon: 'phone',
        color: 'success',
      },
      8: {
        icon: 'user',
        color: 'warning',
      },
      17: {
        icon: 'skype',
        color: 'info',
      },
    };

    vm.showCustomerSideBar = function showNavJobs() {
      return [
        'packages.index',
        'customer.view',
        'customer.packages.index',
        'customer.packages.create',
        'customer.package.update',
        'shipments.index',
        'shipment.packages.index',
        'customer.shipment.update',
        'customer.shipments.index',
      ].includes($state.current.name);
    };

    vm.hideExt = () => $window.parent.postMessage({ type: 'RESET' }, '*');
  }
}

angular.module('uiGenApp')
  .controller('AppController', AppController);
