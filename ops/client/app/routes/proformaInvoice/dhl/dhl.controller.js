class dhlController {
  constructor($http, Page, toaster, ADDRESS, moment, $stateParams) {
    this.$http = $http;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.address = ADDRESS;
    this.moment = moment;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Proforma Invoice Create');
    this.orderCode = this.$stateParams.orderCode;
    this.shipments = [];
    this.Packages = [];
    this.PackageItems = [];
    this.PackItems = [];
    this.Charges = {
      total_amount: 0,
    };
    this.amountWords = '';
    this.getList();
  }

  getList() {
    this.$http
      .get(`/shipments/${this.orderCode}/proformaInvoice`)
      .then(({ data: { shipment, words, totalAmount } }) => {
        this.shipments = shipment;
        this.Packages = shipment.Packages;
        this.Packages.forEach((pack) => {
          this.Packages = pack;
          this.PackageItems = this.Packages.PackageItems;
          this.PackageItems.forEach((items) => {
            this.PackItems.push(items);
          });
        });
        this.Charges.total_amount = totalAmount;
        this.amountWords = `${words} only`;
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
  .controller('dhlController', dhlController);
