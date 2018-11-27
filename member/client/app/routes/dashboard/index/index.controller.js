class DashboardIndexController {
  constructor(Page, Session, URLS, $http) {
    this.Page = Page;
    this.Session = Session;
    this.URLS = URLS;
    this.$http = $http;

    return this.$onInit();
  }

  $onInit() {
    this.store = 'Amazon';
    this.user = this.Session.read('userinfo');
    this.currentOffer = {};

    this.Page.setTitle('Dashboard');
    this.$http
      .get('https://cp.shoppre.com/offers/current.json/')
      .then((offer) => {
        this.currentOffer = offer.data;
      });
  }
  }

angular
  .module('uiGenApp')
  .controller('DashboardIndexController', DashboardIndexController);
