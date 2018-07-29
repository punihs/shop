class ReportListController {
  /* @ngInject */
  constructor($timeout, $http, moment, Session, Page, $stateParams, $sce) {
    this.$timeout = $timeout;
    this.$http = $http;
    this.moment = moment;
    this.Session = Session;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.$sce = $sce;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Reports');
    this.reset();

    this
      .$http
      .get('/reports')
      .then(({ data }) => (this.menu = Object
        .keys(data)
        .map(p => Object
          .assign(data[p], { name: p, items: data[p] }))));
  }

  reset() {
    const date = new Date();
    const reportData = this.Session.read('REPORT_DATA') || {};
    this.user = this.Session.read('userinfo');
    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this.userIds = this.isAdmin && this.Session.read('VIEW_AS_IDS') || `${this.user.id}`;

    this.ui = {
      updatedOn: (reportData.updatedOn) || '',
      head: 0,
      loading: true,
      dateOptions: { maxDate: new Date() },
    };

    this.params = {
      user_id: this.userIds,
      start_date: new Date(reportData.start_date) || '',
      end_date: new Date(reportData.end_date || date),
    };

    this.$http
      .get(`/reports/${this.$stateParams.id}`, { params: this.params })
      .then(({ data }) => (this.link = data));
  }

  trustSrc(src) {
    return this.$sce.trustAsResourceUrl(src);
  }

  navigate(value, l) {
    this.len = (+l - 1);
    const left = this.ui.head - 5;
    const right = this.ui.head + 5;
    switch (value) {
      case 0: this.ui.head = (left <= 0 ? 0 : left); break;
      case 1: this.ui.head = (right >= this.len ? this.len : right); break;
      default: this.ui.head = 0;
    }
  }

  refreshReport() {
    this.ui.updatedOn = new Date();
    this.getReport();
  }

  getReport() {
    const params = {
      user_id: this.isAdmin && this.Session.read('VIEW_AS_IDS') || `${this.user.id}`,
      start_date: `${this.moment(this.params.start_date || 0).format('YYYY-MM-DD')} 00:00:00`,
      end_date: this.moment(this.params.end_date).endOf('day').format('YYYY-MM-DD hh:mm:ss'),
    };

    return this
      .$http
      .get(`/reports/${this.$stateParams.id}`, { params })
      .then(({ data }) => (this.link = data));
  }
}

angular.module('uiGenApp')
  .controller('ReportListController', ReportListController);
