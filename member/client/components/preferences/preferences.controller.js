class PreferencesController {
  /* @ngInject */
  constructor($state, Auth, $http) {
    this.$state = $state;
    this.Auth = Auth;
    this.$http = $http;
    this.$onInit();
  }

  $onInit() {
    this.data = {};
    this.ui = Object.assign({
      ctc: true,
      pref: true,
      industry: true,
      func: true,
      pullSave: true,
      accounts: true,
      redirect: true,
      city: true,
    }, this.uiConf || {});

    this
      .$http
      .get('/clients/preferences')
      .then(({ data }) => (this.data = data));
  }

  allSelected(field = 'functionList') {
    const list = (this.data || {})[field] || [];
    return list.every(l => l.selected);
  }

  toggleSelect(array, flag) {
    array.forEach(range => {
      const ctcRange = range;
      ctcRange.selected = flag;
    });
  }

  save() {
    this.reload = false;
    if (!this.ui.redirect) {
      delete this.data.ctcRange;
      delete this.data.industryList;
    }
    this
      .$http
      .post('/clients/updatePreferences', this.data)
      .then(() => this.Auth.setSessionData().then(() => {
        this.reload = true;
        if (this.ui.redirect) this.$state.go('jobs.list');
      }));
  }
}

angular
  .module('uiGenApp')
  .controller('PreferencesController', PreferencesController);
