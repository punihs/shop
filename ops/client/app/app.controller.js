class AppController {
  constructor($window, $uibModal, $state, $rootScope, URLS, $http, $stateParams, Session,
    Page, socket, ONESIGNAL) {
    this.Page = Page;
    this.socket = socket;
    this.$stateParams = $stateParams;
    this.Session = Session;

    this.adminUserinfo = this.Session.read('adminUserinfo');
    this.states = this.Session.read('adminStates');
    this.shipmentStates = this.Session.read('adminShipment-states');

    this.Math = Math;
    this.URLS = URLS;
    // config
    this.app = {
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
      },
    };

    const env = URLS.DOMAIN.endsWith('.com') ? 'production' : 'development';
    const ENV = URLS.PREFIX.includes('staging') ? 'staging' : env;
    const credentials = ONESIGNAL[ENV];

    if (this.Session.isAuthenticated() && !URLS.DOMAIN.includes('test')) {
      const OneSignal = window.OneSignal || [];
      OneSignal.push(() => {
        OneSignal.sendTag('key', this.adminUserinfo.id);
        OneSignal.init({
          appId: credentials,
          allowLocalhostAsSecureOrigin: true,
          autoRegister: true,
          notifyButton: {
            enable: false,
          },
        });

        if (!this.Session.read('oneSignalPlayerId')) {
          OneSignal.getUserId((pid) => {
            this
              .$http
              .post('#/notificationSubscriptions', {
                player_id: pid,
              })
              .then(() => this.Session
                .create('oneSignalPlayerId', pid));
          });
        }
      });
    }

    this.updateNavigationBar = (currentState, stateParams) => {
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
    };

    // keeps track of state change and hides sidebar view for mobile
    /* eslint angular/on-watch: 0 */
    $rootScope.$on('$stateChangeStart', (ev, to, toParams, from) => {
      Object.assign($rootScope, {
        previousState: from.name,
        currentState: to.name,
      });
      this.app.settings.offScreen = false;
      this.app.settings.mobileHeader = false;
      this.updateNavigationBar($rootScope.currentState, toParams);
    });

    this.Page = Page; // Set Page title
    this.$state = $state;

    this.showCustomerSideBar = function showNavJobs() {
      return [
        'packages.index',
        'orders.index',
        'customer.view',
        'customer.packages.index',
        'customer.orders.index',
        'customer.packages.create',
        'customer.packages.bulk',
        'customer.package.update',
        'shipments.index',
        'shipment.packages.index',
        'customer.shipment.update',
        'customer.shipments.index',
        'packages.bulk',
      ].includes($state.current.name);
    };
  }
}

angular.module('uiGenApp')
  .controller('AppController', AppController);
