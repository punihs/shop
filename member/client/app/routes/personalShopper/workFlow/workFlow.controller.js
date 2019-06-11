class WorkFlowController {
  constructor($http, Page) {
    this.$http = $http;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Request Create');
  }
}

angular
  .module('uiGenApp')
  .controller('WorkFlowController', WorkFlowController);
