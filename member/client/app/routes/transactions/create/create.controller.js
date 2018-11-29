class TransactionCreateController {
  constructor(
    $http, Page, $stateParams, $location, toaster, $uibModal,
    $window, CONFIG
  ) {
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.CONFIG = CONFIG;
    this.$onInit();
  }

  $onInit() {
    this.data = {};
    this.paymentGateways = [];
    this.couponApplied = false;
    this.couponCodeApplied = null;
    this.shipment = {};
    this.Page.setTitle('ShoppRe Pay');
    this.getPaymentGateways();
    this.data.amount = this.$stateParams.amount;
    this.amount = this.$stateParams.amount;
    this.data.object_id = this.$stateParams.object_id;
    this.data.customer_id = this.$stateParams.customer_id;
    this.data.axis_banned = this.$stateParams.axis_banned;
    this.PAYMENT_GATEWAY = {
      WIRE: 1,
      CASH: 2,
      CARD: 3,
      PAYTM: 4,
      PAYPAL: 5,
      WALLET: 6,
    };
  }

  getPaymentGateways() {
    this.$http.get('$/api/paymentGateways')
      .then(({ data: { gateWay } }) => {
        this.paymentGateways = gateWay;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  selectedGateway() {
    const finalAmountWithoutPGFee = Number(this.amount);
    this.paymentGateways.forEach((x) => {
      if (Number(x.id) === Number(this.data.paymentGateway)) {
        if (x.fee) {
          const paymentGatewayFeeAmount = (finalAmountWithoutPGFee * (x.fee / 100));
          this.data.amount = finalAmountWithoutPGFee + paymentGatewayFeeAmount;
          this.data.paymentGatewayFeeAmount = paymentGatewayFeeAmount;
        } else {
          this.data.amount = finalAmountWithoutPGFee;
          this.data.paymentGatewayFeeAmount = 0;
        }
      }
    });
  }

  applyPromoCode() {
    if (this.couponApplied) {
      this.couponCode = this.couponCodeApplied;
      return this.success = `Coupon Code ${this.couponCodeApplied} already Applied`;
    }
    if (this.couponCode) {
      this.couponCodeApplied = this.couponCode.toString().toUpperCase();
      const querystring = `amount=${this.amount}&coupon_code=${this.couponCode}`;
      this.$http
        .put(`$/api/coupon?${querystring}`)
        .then(({ data: { finalAmountAfterDiscount, discountAmount } }) => {
          this.amount = finalAmountAfterDiscount;
          this.data.amount = finalAmountAfterDiscount;
          this.data.discountAmount = discountAmount;
          this.couponApplied = true;
          this.selectedGateway();
          console.log('after amount', this.amount);
          this.message = '';
          this.success = `Coupon Code  ${this.couponCodeApplied} Applied `;
        })
        .catch((err) => {
          this
            .toaster
            .pop('error', err.data.message);
          this.message = err.data.message;
          this.success = '';
        });
    } else {
      this.message = 'Enter Coupon Code';
    }
  }

  submitPayment() {
    if (!this.data.paymentGateway) {
      return this
        .toaster
        .pop('error', 'Select payment Gateway');
    }
    if (this.submitting) return null;
    this.params = {
      estimated: this.data.amount,
      object_id: this.data.object_id,
      uid: this.data.customer_id,
      is_wallet: 0,
      payment_gateway_id: this.data.paymentGateway,
      paymentGatewayFeeAmount: this.data.paymentGatewayFeeAmount,
      coupon_code: this.couponCodeApplied,
      coupon_amount: this.data.discountAmount,
    };
    const method = 'get';
    return this
      .$http[method]('$/api/transactions/create', { params: this.params })
      .then(({ data: url }) => {
        const gateWaySeleted = Number(this.params.payment_gateway_id);
        this.submitting = false;
        if (gateWaySeleted === this.PAYMENT_GATEWAY.CARD) {
          this.$window.location = url;
        } else if (gateWaySeleted === this.PAYMENT_GATEWAY.PAYTM) {
          this.$state.go('transactions.paytm', { url });
        } else if (gateWaySeleted === this.PAYMENT_GATEWAY.PAYPAL) {
          this.$window.location = url.url;
        } else if (gateWaySeleted === this.PAYMENT_GATEWAY.CASH
          || gateWaySeleted === this.PAYMENT_GATEWAY.WALLET
          || gateWaySeleted === this.PAYMENT_GATEWAY.WIRE) {
          this.$window.location = url;
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
  .controller('TransactionCreateController', TransactionCreateController);
