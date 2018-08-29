class shipmentConfirm {
  constructor($http, Page, $stateParams, $location, ViewPhotoService, toaster, $state, $window) {
    this.ViewPhotoService = ViewPhotoService;
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.packages = [];
    this.shipment = [];
    this.shipmentMeta = [];
    this.payment = [];
    this.isWalletChecked = false;
    this.$order_code = this.$location.search().order_code;
    this.status = '';
    this.message = '';
    this.promoStatus = '';
    this.couponAmount = '';
    this.couponCode = '';
    this.standard_photo_check = 'yes';
    this.totalpackagePriceAmount = 0;
    this.advc_photo_check = 0;
    this.paymentGateway = [];
    this.data = {};
    this.$state = $state;
    this.$onInit();
    // this.walletClicked();
  }
  $onInit() {
    this.Page.setTitle('Shipment confirmation');
    this.getList();
  }

  openPhoto(id) {
    this.ViewPhotoService.open(id);
  }

  getList(params) {
    let url = '';
    if (params) {
      url = this.$http.get(`/shipments/confirmShipment?order_code=${this.$order_code}${params}`);
    } else {
      url = this.$http.get(`/shipments/confirmShipment?order_code=${this.$order_code}`);
    }
    url
      .then(({
        data: {
          shipment, packages, payment, promoStatus, couponAmount, paymentGateway,
        },
      }) => {
        this.packages = [];
        this.packages = packages;
        // this.packages.push(packages);
        this.paymentGateway = paymentGateway;
        this.shipment = shipment;
        const shipmentMeta = [];
        shipmentMeta.push(shipment);
        this.shipmentMeta = shipmentMeta[0].ShipmentMetum;
        this.packageChrages = packages[0].PackageCharge;
        this.payment = payment;
        this.promoStatus = promoStatus;
        this.couponAmount = couponAmount;
        this.data.pg = payment.payment_gateway_name;
        packages.forEach((x) => {
          this.totalpackagePriceAmount += x.price_amount;
        });
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  walletClicked() {
    this.selectedGateway();
    // if (this.status !== 'disabled') {
    //   this.selectedGateway();
    // } else {
    //   this.wallet = true;
    // }
  }

  selectedGateway() {
    this.sendData = {
      shipment_id: this.shipment.id,
      wallet: this.isWalletChecked ? 1 : 0,
      payment_gateway_name: this.data.pg,
    };
    const params =
      `&payment_gateway_name=${this.data.pg}&wallet=${this.sendData.wallet}`;
    this.getList(params);
  }

  applyPromoCode() {
    if (this.couponCode) {
      this.$http
// eslint-disable-next-line max-len
        .put(`/redemptions/apply?order_code=${this.shipment.order_code}&coupon_code=${this.couponCode}`)
        .then(({ data: { message } }) => {
          this.message = message;
          const params =
            `&payment_gateway_name=${this.data.pg}&wallet=${this.sendData.wallet}`;
          this.getList(params);
        })
        .catch((err) => {
          this
            .toaster
            .pop('error', err.data.message);
        });
    } else {
      this.message = 'Enter Promocode';
    }
  }
  submitPayment() {
    if (this.submitting) return null;
    this.sendData = {
      shipment_id: this.shipment.id,
      wallet: this.isWalletChecked ? 1 : 0,
      payment_gateway_name: this.data.pg,
    };
    console.log('sendData', this.sendData);
    const method = 'put';
    return this
      .$http[method]('/shipments/finalShip', this.sendData)
      .then(({ data: encryptedData }) => {
        console.log({encryptedData});
        this.submitting = false;
        if (this.data.pg === 'card') {
          this.$window.location = encryptedData;
        } else if (this.data.payment_gateway_name === 'paytm') {
          this.$state.go('dash.paytm', { encryptedData });
        } else if (this.data.pg === 'paypal') {
          this.$window.location = encryptedData.url;
        } else if (this.data.pg === 'cash'
          || this.data.pg === 'wire'
          || this.data.pg === 'wallet') {
          this.$state.go('dash.response', { shipmentId: this.shipment.id });
        }
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
  .controller('shipmentConfirm', shipmentConfirm);
