class DashboardIndexController {
  constructor(Page, Session, URLS) {
    this.Page = Page;
    this.Session = Session;
    this.URLS = URLS;

    return this.$onInit();
  }

  $onInit() {
    this.store = 'Amazon';
    this.user = this.Session.read('userinfo');

    this.Page.setTitle('Dashboard');
  }
}

angular
  .module('uiGenApp')
  .controller('DashboardIndexController', DashboardIndexController);
