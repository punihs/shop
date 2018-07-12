class ClientTncController {
  /* @ngInject */
  constructor(
    $http, $timeout, $window, $state, $sce, Auth, URLS, Session,
    currentClient
  ) {
    this.$http = $http;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$state = $state;
    this.$sce = $sce;
    this.Auth = Auth;
    this.URLS = URLS;
    this.Session = Session;
    this.currentClient = currentClient;
    this.$onInit();
  }

  $onInit() {
    this.ui = {
      loading: false,
    };
    this.data = this.currentClient;
    this.AGREEMENT_URL =
      `${this.URLS.API}/clients/agreement?access_token=${this.Session.getAccessToken()}`;
  }

  trustSrc(src) {
    return this.$sce.trustAsResourceUrl(src);
  }


  continue() {
    this
      .$http
      .post('/clients/termsUpdate', this.data)
      .then(() => (this.flag = true));
  }

  accept() {
    this.ui.loading = true;
    this
      .$http
      .post('/clients/acceptAgreement', this.data)
      .then(() => {
        this.Auth.setSessionData().then(() => {
          this.ui.loading = false;
          this.$state.go('jobs.list', { status: 'New' });
        });
      })
      .catch(() => (this.ui.loading = false));
  }
}

angular.module('uiGenApp')
  .controller('ClientTncController', ClientTncController);
