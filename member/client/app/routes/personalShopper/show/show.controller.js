class ShowController {
  constructor($http, Page, toaster, $stateParams) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;
    this.$stateParams = $stateParams;

    return this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Order History');
    this.packageItems = [];
    this.getList();
  }

  getList() {
    this.$http
      .get(`/packages/${this.$stateParams.id}?type=ps`)
      .then(({ data: pkg }) => {
        this.packages = pkg;
      });

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/items?type=ps`)
      .then(({ data: packageItems }) => {
        this.packageItems = packageItems;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
}

angular
  .module('uiGenApp')
  .controller('ShowController', ShowController);
