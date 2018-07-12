class loyaltyController {
  constructor(Page) {
    this.Page = Page;
    this.$onInit();
  }
  $onInit() {
    this.loyaltyList = ['Rewards', 'Points History', 'Redeem History'];
  }
}
angular.module('uiGenApp')
  .controller('loyaltyController', loyaltyController);
