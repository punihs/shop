class AppController {
  constructor($window, $state, $rootScope, URLS,
              $http, $stateParams, Session, Page) {
    this.$window = $window;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.URLS = URLS;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
    this.Page = Page;

    this.$onInit();
  }

  $onInit() {
    this.userinfo = this.Session.read('userinfo');
    this.states = this.Session.read('states');
    this.app = {
      name: 'MEMBER',
      version: '0.0.1',
      settings: {
        themeID: 1,
        navbarHeaderColor: 'bg-primary dk',
        navbarCollapseColor: 'bg-info',
        asideColor: 'bg-info bg-gd-dk',
        headerFixed: true,
        asideFixed: true,
        asideFolded: true,
        asideDock: true,
        container: false,
        offScreen: false, // flag for show of sidebar for mobile view
        mobileHeader: false, // flag to show header Nav and Search in mobile view
      },
    };

    // keeps track of state change and hides sidebar view for mobile
    this.$rootScope.$on('$stateChangeStart', (ev, to, toParams, from) => {
      Object.assign(this.$rootScope, {
        previousState: from.name,
        currentState: to.name,
      });
      this.app.settings.offScreen = false;
      this.app.settings.mobileHeader = false;
      this.updateNavigationBar(this.$rootScope.currentState, toParams);
    });

    this.interviewUI = {
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
  }

  showShipmentSideBar() {
    return [
      'packages.index',
      'shipment.packages.index',
    ].includes(this.$state.current.name);
  }

  updateNavigationBar(currentState, stateParams) {
    let navbarHeaderColor = 'bg-primary';
    let navbarCollapseColor = 'bg-info';
    let asideColor = 'bg-info bg-gd-dk';
    if (currentState.startsWith('candidates.') || currentState.startsWith('candidate.')) {
      navbarHeaderColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
      navbarCollapseColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
      asideColor = stateParams.source === '0' ? 'bg-black bg-gd-dk' : 'bg-sea-green bg-gd-dk';
    }
    this.app.settings.navbarHeaderColor = navbarHeaderColor;
    this.app.settings.navbarCollapseColor = navbarCollapseColor;
    this.app.settings.asideColor = asideColor;
  }

  hideExt() {
    return this.$window.parent.postMessage({ type: 'RESET' }, '*');
  }
}

angular.module('uiGenApp')
  .controller('AppController', AppController);
