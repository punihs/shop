class shipmentConfirm {
  constructor($http, Page, $stateParams, $location, ViewPhotoService) {
    this.ViewPhotoService = ViewPhotoService;
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.$stateParams = $stateParams;
    this.packages = [];
    this.shipment = [];
    this.shipmentMeta = [];
    this.payment = [];
    this.wallet = false;
    this.message = '';
    this.promoStatus = '';
    this.couponAmount = '';
    this.couponCode = '';
    this.standard_photo_check = 'yes';
    this.advc_photo_check = 0;
    this.paymentGateway = [];
    this.data = {};
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Shipment confirmation');
    this.getList();
    console.log('pakg', this.packages);
    console.log('ship', this.shipment);
  }

  openPhoto(id) {
    const modal = this.ViewPhotoService.open(id);
    modal
      .result
      .then((data) => {
        // if (data.is_default === true) {
        //   // this.data.address_id = data.id;
        // }
      });
  }

  getList() {
    this.$http
      // .get(`/shipments/confirmShipment?order_code=${this.shipment.order_code}`)
      .get('/shipments/confirmShipment?order_code=1000')
      .then(({ data: { shipment, packages, payment, promoStatus,
        couponAmount, couponName, paymentGateway } }) => {
        console.log({ shipment, packages, payment, promoStatus,
          couponAmount, couponName, paymentGateway });
        this.packages = [];
        this.packages.push(packages);
        this.paymentGateway = paymentGateway;
        this.shipment = shipment;
        const shipmentMeta = [];
        shipmentMeta.push(shipment);
        this.shipmentMeta = shipmentMeta[0].ShipmentMetum;
        console.log('meat', this.shipmentMeta);
        console.log('ship', this.shipment);
        this.payment = payment;
        console.log('value', this.shipment.value_amount);
        console.log('pg', this.paymentGateway);
        this.promoStatus = promoStatus;
        this.couponAmount = couponAmount;
        this.data.default_payment_gateway = payment.payment_gateway_name;
      })
      .catch(err => {
        alert(err.data.message);
      });
  }
  walletClicked() {
    // if (this.couponCode) {
    if (this.wallet === true) {
      this.wallet = false;
    } else {
      this.wallet = true;
      // }
    }
  }
  selectedGateway() {
    console.log('this.s', this.data.default_payment_gateway);
  }
  applyPromoCode() {
    if (this.couponCode) {
      this.$http
        .put(`/redemptions/apply?order_code=
        ${this.shipment.order_code}&coupon_code=${this.couponCode}`)
        .then(({ data: { message } }) => {
          this.message = message;
          this.getList();
        })
        .catch(err => {
          alert(err.data.message);
        });
    } else {
      this.message = 'Enter Promocode';
    }
  }
  submitPayment() {
    if (this.submitting) return null;
    this.sendData = {
      shipment_id: 301, // - this.shipment.id,
      wallet: this.wallet ? 1 : 0,
      payment_gateway_name: this.data.default_payment_gateway,
    };
    const method = 'put';

    return this
      .$http[method]('/shipments/finalShip', this.sendData)
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
  .controller('shipmentConfirm', shipmentConfirm);
