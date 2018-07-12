class membershipController {
  constructor(Page) {
    this.Page = Page;
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Membership');
  }
}
angular.module('uiGenApp')
  .controller('membershipController', membershipController);

