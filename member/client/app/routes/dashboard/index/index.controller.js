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
      .get(`$/api/phpApi/getWalletAndLoyalty?customer_id=${this.user.id}`)
      .then(({ data: { walletAmount } }) => {
        if (walletAmount) {
          this.walletBalanceAmount = walletAmount;
        } else {
          this.walletBalanceAmount = 0.00;
        }
      }).catch = () => {
        this.walletBalanceAmount = 0.00;
      };

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
