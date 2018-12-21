class TransactionCreateController {
  constructor(
    $http, Page, $stateParams, $location, toaster, $uibModal, URLS,
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
    this.URLS = URLS;
    this.couponFirstTime = 'FRST50';
    this.$onInit();
  }

  $onInit() {
    this.data = {};
    this.paymentGateways = [];
    this.couponApplied = false;
    this.couponCodeApplied = null;
    this.shipment = {};
    this.submitting = true;
    this.loyaltyAmount = null;
    this.Page.setTitle('ShoppRe Pay');
    this.getWallet();
    this.getPaymentGateways();
    this.data.payAmount = Math.round(this.$stateParams.amount);
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

  getWallet() {
    this.$http.get(`$/api/phpApi/getWalletAndLoyalty?customer_id=${this.$stateParams.customer_id}`)
      .then(({ data: { walletAmount, loyaltyAmount } }) => {
        this.walletBalanceAmount = Number(walletAmount);
        console.log({ loyaltyAmount, walletAmount })
        this.data.loyaltyAmount = loyaltyAmount;
        this.showWallet = true;
        // if (Number(amount)) {
        //   // this.isWalletChecked = true;
        //   // this.calculateFinalAmount();
        // }
        if (Number(this.walletBalanceAmount) < 0) {
          this.amount = Number(this.amount) + Math.abs(Number(this.walletBalanceAmount));
          console.log('abs', Math.abs(Number(this.walletBalanceAmount)));
          console.log('abs amount', this.amount);
        }

        if (this.data.loyaltyAmount > 0) {
          this.data.payAmount = this.amount - this.data.loyaltyAmount;
        }
      });
  }

  walletClicked() {
    this.calculateFinalAmount();
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
    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.WALLET)) {
      this.isWalletChecked = false;
      this.showWallet = false;
      this.data.walletUsed = this.data.payAmount;
      this.data.remainingWallet = this.walletBalanceAmount - this.data.payAmount;
      this.data.payAmount = 0;
    } else {
      if (this.amount < this.walletBalanceAmount) {
        this.isWalletChecked = false;
        this.showWallet = false;
      }
      this.data.remainingWallet = 0;
      this.calculateFinalAmount();
    }
  }

  applyPromoCode() {
    if (this.couponApplied) {
      this.couponCode = this.couponCodeApplied;
      return this.success = `Coupon Code ${this.couponCodeApplied} already Applied`;
    }

    if (this.couponCode) {
      this.showWallet = true;
      const customerid = this.$stateParams.customer_id;

      if (this.couponFirstTime === this.couponCode.toString().toUpperCase()) {
        this.$http
          .get(`/users/${customerid}/shipments/count`)
          .then(({ data: count }) => {
            if (count > 0) {
              return this
                .toaster
                .pop('error', 'This Coupon is applicable only for First time shipment ');
            } else {
              return this.promoCode();
            }
          });
      } else {
        return this.promoCode();
      }
    } else {
      this.message = 'Enter Coupon Code';
    }
  }

  promoCode() {
    const querystring = `amount=${this.amount}&coupon_code=${this.couponCode}`;
    this.$http
      .put(`$/api/campaigns?${querystring}`)
      .then(({ data: { IS_DISCOUNT,
        discountAmount,
        cashbackAmount,
      } }) => {
        this.data.discountAmount = discountAmount;
        this.data.cashbackAmount = cashbackAmount;
        this.data.isDiscount = IS_DISCOUNT;
        this.couponApplied = true;


        this.selectedGateway();
        this.couponCodeApplied = this.couponCode.toString().toUpperCase();

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
  }

  submitPayment() {
    if (Number(this.data.payAmount) === 0) {
      this.data.paymentGateway = Number(this.PAYMENT_GATEWAY.WALLET);
    }

    if (!this.data.paymentGateway) {
      return this
        .toaster
        .pop('error', 'Select payment Gateway');
    }

    if (!this.submitting) return null;
    let walletAmount = 0;

    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.WALLET)) {
      walletAmount = this.walletBalanceAmount > this.amount ?
        this.data.walletUsed : this.walletBalanceAmount;
    } else if (this.isWalletChecked) {
      walletAmount = this.walletBalanceAmount;
    }

    this.params = {
      payAmount: this.data.payAmount,
      object_id: this.data.object_id,
      uid: this.data.customer_id,
      is_wallet: this.isWalletChecked,
      wallet_amount: walletAmount,
      payment_gateway_id: this.data.paymentGateway,
      paymentGatewayFeeAmount: this.data.paymentGatewayFeeAmount,
      coupon_code: this.couponApplied ? this.couponCodeApplied : 0,
      discount_amount: this.couponApplied ? this.data.discountAmount : 0,
      cashback_amount: this.couponApplied ? this.data.cashbackAmount : 0,
      loyaltyAmount: this.data.loyaltyAmount,
      is_discount: this.data.isDiscount,
    };

    // console.log(this.params);
    // return;

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

  calculatePaymentGatewayfee(amountForPaymentGateway) {
    if (amountForPaymentGateway > 0) {
      const pgFee = this.paymentGateways
        .filter(x => x.id === Number(this.data.paymentGateway))
        .reduce((y) => {
          if (y) {
            return y;
          }
          return 0;
        });

      if (pgFee) {
        return (amountForPaymentGateway * (pgFee.fee / 100));
      }
      return 0;
    }
    return 0;
  }


  calculateFinalAmount() {
    const amount = Number(this.amount);
    let amountForPaymentGateway = 0;

    if (this.isWalletChecked) {
      if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.CASH) ||
        Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.WIRE)) {
        this.data.paymentGatewayFeeAmount = 0;
        this.showWallet = false;
        this.isWalletChecked = false;
      } else if (this.data.paymentGateway) {
        this.showWallet = true;

        amountForPaymentGateway = this.amount;
        const pgFeeAmount = this.calculatePaymentGatewayfee(amountForPaymentGateway);
        this.data.paymentGatewayFeeAmount = pgFeeAmount;
      } else {
        this.data.paymentGatewayFeeAmount = 0;
      }

      this.data.payAmount = Math.round(amount +
        Number(this.data.paymentGatewayFeeAmount || 0) - Number(this.data.loyaltyAmount || 0)
        - Number(this.data.discountAmount || 0) - Number(this.walletBalanceAmount || 0));
    } else {
      this.showWallet = true;

      if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.CASH) ||
        Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAY.WIRE)) {
        this.isWalletChecked = false;
        this.showWallet = false;
        this.data.paymentGatewayFeeAmount = 0;
      } else if (this.data.paymentGateway) {
        this.showWallet = true;

        amountForPaymentGateway = this.amount;

        const pgFeeAmount = this.calculatePaymentGatewayfee(amountForPaymentGateway);
        this.data.paymentGatewayFeeAmount = pgFeeAmount;
      } else {
        this.data.paymentGatewayFeeAmount = 0;
      }

      this.data.payAmount = Math.round(amount +
        Number(this.data.paymentGatewayFeeAmount || 0) - Number(this.data.loyaltyAmount || 0)
        - Number(this.data.discountAmount || 0));
    }
  }
}

angular
  .module('uiGenApp')
  .controller('TransactionCreateController', TransactionCreateController);
