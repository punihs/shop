class NavbarController {
  constructor($rootScope, $http, $state, $timeout, $q, Auth, URLS, Session) {
    this.$http = $http;
    this.$timeout = $timeout;
    this.Auth = Auth;
    this.URLS = URLS;
    this.$state = $state;
    this.$q = $q;
    this.Session = Session;
    this.$rootScope = $rootScope;
    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    if (!this.user) return;
    this.userInitial = this.user.name.substr(0, 1);
    this.ui = { count: 0 };

    this
      .$http
      .get(`/users/${this.user.id}/features/2`)
      .then(({ data } = {}) => {
        if (data) this.ui.qdeskDownload = true;
      });

    this
      .$http
      .get('/jobSuggestions/myClients', {
        params: { fl: 'count' },
      })
      .then(({ data: [count] }) => (this.ui.count = count || 0))
      .catch(() => (this.ui.count = 0));

    if (this.user.flag_database === 1) return (this.ui.displaySearch = true);

    return this
      .$http
      .put('/clients/databaseFlag')
      .then(({ data }) => (data
        ? this.Auth.setSessionData().then(() => (this.ui.displaySearch = true))
        : ''));
  }

  getPositionState() {
    const state = this.$state.current.name;
    return ['jobs.suggestions', 'jobs.manage-list', 'jobs.qlist'].includes(state);
  }
}

angular.module('uiGenApp')
  .controller('NavbarController', NavbarController);
