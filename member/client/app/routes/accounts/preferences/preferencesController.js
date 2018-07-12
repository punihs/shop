class preferencesController {
  constructor(Page) {
    this.Page = Page;
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Shipment Preferences');
  }
}
angular.module('uiGenApp')
.controller('preferencesController', preferencesController);
