class shipmentRequestController {
  constructor($http, Page, $stateParams, $location, AddAddress) {
    this.AddAddress = AddAddress;
    this.$http = $http;
    this.Page = Page;
    this.address = [];
    this.shipments = [];
    this.$location = $location;
    this.customer = [];
    this.charges = {};
    this.$stateParams = $stateParams;
    this.$packageIds = this.$location.search().packageIds;
    this.data = {};
    this.totalChargeAmount = 0;
    this.totalAmount_from_api = 0;
    this.operationsAmount = 0;
    this.charges = 0;
    this.totalpackagePriceAmount = 0;
    this.MoreOption = false;
    this.standard_photo_check = 'yes';
    this.advc_photo_check = '';
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Shipment Request Create');
    this.getList();
  }

  open(id) {
    const modal = this.AddAddress.open(id);
    modal
      .result
      .then((data) => {
        if (data.is_default === true) {
          this.data.address_id = data.id;
        }
        this.customer.Addresses.push(data);
      });
  }

  updateCharges() {
    const extrapackAmount = (this.data.extra_packing === true) ? 500 : 0;
    const repackAmount = (this.data.repack === true) ? 100.00 : 0;
    const stickerAmount = (this.data.sticker === 1) ? 0.00 : 0;
    const originalAmount = 0;
    const giftwrapAmount = (this.data.gift_wrap === true) ? 100.00 : 0;
    const giftnoteAmount = (this.data.gift_note === true) ? 50.00 : 0;
    this.charges = repackAmount + stickerAmount +
      extrapackAmount + originalAmount + giftwrapAmount + giftnoteAmount;
    this.totalChargeAmount = this.charges + this.totalAmount_from_api;
    this.operationsAmount = this.charges;
    console.log(this.data);
  }

  getList() {
    this.$http
      .get(`/shipments/redirectShipment?packageIds=${this.$packageIds}`)
      .then(({ data: { customer, packages, shipmentMeta, IS_LIQUID } }) => {
        this.shipments = packages;
        this.customer = customer;
        this.shipmentMeta = shipmentMeta;
        // log('customer', customer);
        // log('packages', packages);
        // log('charges', shipmentMeta);
        console.log('this.shipments', this.shipments);
        this.data = {
          repack: false,
          sticker: false,
          extra_packing: false,
          orginal_box: false,
          gift_wrap: false,
          gift_note: false,
          giftnote_txt: false,
          liquid: IS_LIQUID,
          max_weight: 0,
          invoice_taxid: false,
          mark_personal_use: false,
          invoice_include: false,
        };

        console.log(this.data);
        customer.Addresses.forEach(x => {
          if (x.is_default) this.data.address_id = x.id;
        });

        // log('data123', this.data);
        // log('$ctrl.data.liquid', this.data.IS_LIQUID);

        packages.forEach(x => {
          this.totalpackagePriceAmount += x.price_amount;
        });

        for (const key in shipmentMeta) {
          this.totalAmount_from_api += shipmentMeta[key];
        }
        this.totalChargeAmount = this.totalAmount_from_api;
      })
      .catch(err => {
        alert(err.data.message);
      });
  }

  create(newShipmentForm) {
    if (this.submitting) return null;
    this.submitting = true;

    const ids = this.$packageIds;
    // log({ ids });
    // log('data', this.data);
    // log('newShipmentForm', newShipmentForm);

    const method = 'post';

    return this
      .$http[method](`/shipments${ids ? `?package_ids=${ids}` : ''}`, this.data)
      .then(({ data: shipment }) => {
        this.pkg = shipment;
        const { id } = shipment;
        this.submitting = false;
        this
          .toaster
          .pop('success', `#${id} Shipment Created Successfully.`, '');
        return location.reload(true);
      })
      .catch((err) => {
        this.submitting = false;

        this
          .toaster
          .pop('error', 'There was problem creating Shipment. Please contact Shoppre team.');

        this.error = err.data;
      });
  }

}
angular
  .module('uiGenApp')
  .controller('shipmentRequestController', shipmentRequestController);
