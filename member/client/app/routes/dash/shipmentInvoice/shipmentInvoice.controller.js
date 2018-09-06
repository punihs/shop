class ShipmentInvoice {
  constructor($http, Page, $uibModal, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.shipmentId = 115;
    this.shipment = [];
    this.Packages = [];
    this.ShipmentMetum = [];
    this.PackageCharge = {};
    this.Charges = {
      storage_amount: 0,
      photo_amount: 0,
      pickup_amount: 0,
      handling_amount: 0,
      scan_doc_amount: 0,
      wrong_address_amount: 0,
      split_amount: 0,
    };
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.shipmentId}/invoice`)
      .then(({ data: { shipment } }) => {
        this.shipment = shipment;
        this.Packages = shipment.Packages;
        this.Packages.forEach((item) => {
          this.Charges.storage_amount += item.PackageCharge.storage_amount;
          this.Charges.photo_amount +=
            item.PackageCharge.basic_photo_amount + item.PackageCharge.advanced_photo_amount;
          this.Charges.pickup_amount += item.PackageCharge.pickup_amount;
          this.Charges.handling_amount += item.PackageCharge.special_handling_amount;
          this.Charges.scan_doc_amount += item.PackageCharge.scan_document_amount;
          this.Charges.wrong_address_amount += item.PackageCharge.wrong_address_amount;
          this.Charges.split_amount += item.PackageCharge.split_package_amount;
        });
      })
      .catch(err => {
        this
          .toaster
          .pop('danger', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('ShipmentInvoice', ShipmentInvoice);