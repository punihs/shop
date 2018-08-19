class RetryPayment {
  constructor($http, Page, $stateParams, $location, ViewPhotoService, toaster) {
    this.ViewPhotoService = ViewPhotoService;
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$stateParams = $stateParams;
    this.packages = [];
    this.shipment = [];
    this.shipmentMeta = [];
    this.payment = [];
    this.wallet = false;
    this.$order_code = this.$location.search().order_code;
    this.status = '';
    this.message = '';
    this.promoStatus = '';
    this.couponAmount = '';
    this.standard_photo_check = 'yes';
    this.advc_photo_check = 0;
    this.paymentGateway = [];
    this.data = {};
    this.$onInit();
    this.walletClicked();
  }
  $onInit() {
    this.Page.setTitle('Retry Payment');
    this.getList();
  }

  openPhoto(id) {
    this.ViewPhotoService.open(id);
  }

  getList(params) {
    let url = '';
    if (params) {
      url = this.$http.put(`/shipments/retryPayment?order_code=1000${params}`);
    } else {
      url = this.$http.put('/shipments/retryPayment?order_code=1000');
    }
    url
      .then(({
        data: {
          shipment, packages, payment, promoStatus, couponAmount, paymentGateway,
        },
      }) => {
        this.packages = [];
        this.packages.push(packages);
        this.paymentGateway = paymentGateway;
        this.shipment = shipment;
        const shipmentMeta = [];
        shipmentMeta.push(shipment);
        this.shipmentMeta = shipmentMeta[0].ShipmentMetum;
        this.payment = payment;
        this.promoStatus = promoStatus;
        this.couponAmount = couponAmount;
        this.data.default_payment_gateway = payment.paymentGatewayName;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
  walletClicked() {
    if (this.status !== 'disabled') {
      this.selectedGateway();
      this.wallet = !this.wallet;
    } else {
      this.wallet = true;
    }
  }
  selectedGateway() {
    this.sendData = {
      shipment_id: 116, // - this.shipment.id,
      wallet: this.wallet ? 1 : 0,
      payment_gateway_name: this.data.default_payment_gateway,
    };
    const params =
      `&payment_gateway_name=${this.data.default_payment_gateway}&wallet=${this.sendData.wallet}`;
    this.getList(params);
  }

  submitPayment() {
    if (this.submitting) return null;
    this.sendData = {
      shipment_id: 116, // - this.shipment.id,
      wallet: this.wallet ? 1 : 0,
      payment_gateway_name: this.data.default_payment_gateway,
    };
    const method = 'put';

    return this
      .$http[method]('/shipments/payRetrySubmit', this.sendData)
      .then(({ data: url }) => {
        window.location = url;
        this.submitting = false;
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
  .controller('RetryPayment', RetryPayment);
