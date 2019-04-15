class loyaltyPointsController {
  constructor(Page, $state, $stateParams, $http, toaster, URLS) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.URLS = URLS;

    return this.onInit();
  }

  onInit() {
    this.Page.setTitle('Loyalty Points');
    this.rewards = true;
    this.history = false;
    this.redeem = false;
    this.loyaltyHistory = [];
    this.redeemHistory = [];
    this.loyaltyPoints = {};
    this.getLayalty();
  }

  getLayalty() {
    this.$http.get(`$/phpApi/loyalty?customer_id=${this.$stateParams.customer_id}`)
      .then(({ data: { loyalty: loyaltyPoints,
        history: redeemHistory, points: loyaltyHistory } }) => {
        this.loyaltyHistory = loyaltyHistory;
        this.redeemHistory = redeemHistory;
        this.loyaltyPoints = loyaltyPoints;
      });
  }


  loyalty(list) {
    if (list === 'Rewards') {
      this.rewards = true;
      this.history = false;
      this.redeem = false;
    } else if (list === 'Points History') {
      this.rewards = false;
      this.history = true;
      this.redeem = false;
    } else if (list === 'Redeem History') {
      this.rewards = false;
      this.history = false;
      this.redeem = true;
    }
  }
}

angular.module('uiGenApp')
  .controller('loyaltyPointsController', loyaltyPointsController);

