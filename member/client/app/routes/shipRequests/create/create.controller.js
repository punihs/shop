class ShipRequestsCreateController {
  constructor($http, Page, $stateParams, $location, AddAddress, toaster, $state) {
    this.AddAddress = AddAddress;
    this.$http = $http;
    this.Page = Page;
    this.$state = $state;
    this.$location = $location;
    this.$stateParams = $stateParams;
    this.toaster = toaster;

    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Request Create');

    this.customer = [];
    this.charges = {};
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
    this.IsShippingAddress = false;
    this.address = [];
    this.shipments = [];

    this.getList();
  }

  open() {
    const modal = this.AddAddress.open(0, 'add');
    modal
      .result
      .then((data) => {
        this.IsShippingAddress = true;
        if (data.is_default === true) {
          this.data.address_id = data.id;
        }
        this.customer.Addresses.push(data);
      });
  }

  editAddress(addressId, index) {
    const modal = this.AddAddress.open(addressId, 'edit');
    modal
      .result
      .then((data) => {
        this.IsShippingAddress = true;
        if (data.is_default === true) {
          // data.id = addressId;
          this.data.address_id = data.id;
        }
        Object.assign(this.customer.Addresses[index], data);
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
  }

  getList() {
    this.$http
      .get(`/shipments/redirectShipment?packageIds=${this.$packageIds}`)
      .then(({
        data: {
          customer, packages, shipmentMeta, IS_LIQUID, IsShippingAddress,
        },
      }) => {
        this.shipments = packages;
        this.customer = customer;
        this.shipmentMeta = shipmentMeta;
        this.data = {
          repack: false,
          sticker: false,
          extra_packing: false,
          original: false,
          gift_wrap: false,
          gift_note: false,
          gift_note_text: null,
          is_liquid: IS_LIQUID,
          max_weight: 0,
          invoice_tax_id: null,
          mark_personal_use: false,
          invoice_include: false,
        };
        this.IsShippingAddress = IsShippingAddress;
        if (!IsShippingAddress && !customer.Addresses.length) {
          this
            .toaster
            .pop('info', 'Please add the shipping address before proceed');
          this.open(customer.id);
        } else {
          this.IsShippingAddress = true;
        }

        customer.Addresses.forEach((x) => {
          if (x.is_default) this.data.address_id = x.id;
        });
        packages.forEach((x) => {
          this.totalpackagePriceAmount += x.price_amount;
        });

        // eslint-disable-next-line no-restricted-syntax,guard-for-in
        for (const key in shipmentMeta) {
          this.totalAmount_from_api += shipmentMeta[key];
        }
        this.totalChargeAmount = this.totalAmount_from_api;
      })
      .catch((err) => {
        this
          .toaster
          .pop('danger', err.data.message);
      });
  }

  deletePackage(id) {
    const { packageIds } = this.$stateParams;
    const index = packageIds.indexOf(id.toString());
    if (packageIds.length > 1) {
      this.$state
        .go('packages.index');
    }
    packageIds.splice(index, 1);
    if (packageIds.length) {
      this.$state
        .go('shipRequests.create', { packageIds });
    }
  }

  create() {
    if (!this.IsShippingAddress) {
      this
        .toaster
        .pop('info', 'Please add the shipping address before proceed');
      return this.open(this.customer.id);
    }
    if (!this.data.address_id) {
      return this
        .toaster
        .pop('error', 'Please select shipping address');
    }

    if (this.submitting) return null;
    this.submitting = true;

    const ids = this.$packageIds;
    const method = 'post';
    this.data.is_liquid = this.data.is_liquid === 'To Be Calculated';
    return this
      .$http[method](`/shipments${ids ? `?package_ids=${ids}` : ''}`, this.data)
      .then(({ data: shipment }) => {
        this.pkg = shipment;
        const { order_code: orderCode } = shipment;
        this.submitting = false;
        this
          .toaster
          .pop('success', `#${orderCode} Shipment Created Successfully.`, '');
        this.$state.go('shipRequest.response', { orderCode });
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
  .controller('ShipRequestsCreateController', ShipRequestsCreateController);
