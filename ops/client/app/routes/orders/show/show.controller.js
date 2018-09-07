
class OrderShowController {
  constructor(currentOrder) {
    this.order = currentOrder;
    this.$onInit();
  }

  $onInit() {

  }
}

angular.module('uiGenApp')
  .controller('OrderShowController', OrderShowController);
