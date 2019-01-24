class TransactionCreateController {
  constructor(
    $http, Page, $stateParams, $location, toaster, $uibModal, URLS, Session,
    $window, CONFIG,
  ) {
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.Session = Session;
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
    this.walletUsed = '';
    this.loyaltyAmount = null;
    this.Page.setTitle('ShoppRe Pay');
    this.getPaymentGateways();
    this.getWallet();
    this.data.payAmount = Math.round(this.$stateParams.amount);
    this.amount = this.$stateParams.amount;
    this.shippingCharge = this.$stateParams.amount;
    this.data.object_id = this.$stateParams.object_id;
    this.data.customer_id = this.$stateParams.customer_id;
    this.data.axis_banned = this.$stateParams.axis_banned;
    this.data.type = this.$stateParams.type;
    this.PAYMENT_GATEWAYS = this.CONFIG.PAYMENT_GATEWAY;
  }

  getWallet() {
    this.$http.get(`$/api/phpApi/getWalletAndLoyalty?customer_id=${this.$stateParams.customer_id}`)
      .then(({ data: { walletAmount, loyaltyAmount } }) => {
        this.walletBalanceAmount = Number(walletAmount);
        if (this.data.type === 'shipment') {
          this.data.loyaltyAmount = loyaltyAmount;
        } else {
          this.data.loyaltyAmount = 0;
        }
        this.showWallet = true;

        if (Number(this.walletBalanceAmount) < 0) {
          this.amount = Number(this.amount) + Math.abs(Number(this.walletBalanceAmount));
        }

        this.calculateFinalAmount();
      });
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

  walletClicked() {
    this.paymentGateways.forEach((x) => {
      if (x.id === this.data.paymentGateway) {
        if (this.showWallet) {
          x.status = 0;
        }
      }
    });
    this.calculateFinalAmount();
  }

  selectedGateway() {
    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WALLET)) {
      this.isWalletChecked = false;
      this.showWallet = false;
      this.data.walletUsed = this.data.payAmount;
      this.calculateFinalAmount();
    } else {
      if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.CASH ||
        Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WIRE))) {
        this.isWalletChecked = false;
        this.showWallet = false;
      }

      if (this.amount < this.walletBalanceAmount) {
        this.isWalletChecked = false;
        this.showWallet = false;
      }
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

      if (this.data.type === 'shipment') {
        if (this.couponFirstTime === this.couponCode.toString().toUpperCase()) {
          this.$http
            .get(`/users/${customerid}/shipments/count`)
            .then(({data: count}) => {
              if (count > 0) {
                return this
                  .toaster
                  .pop('error', 'This Coupon is applicable only for First time shipment ');
              }
            });
        }
      }
      return this.promoCode();

    } else {
      this.message = 'Enter Coupon Code';
    }
  }

  promoCode() {
    const querystring = `amount=${this.amount}&coupon_code=${this.couponCode}&type=${this.data.type}`;
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

        this.couponCodeApplied = this.couponCode.toString().toUpperCase();

        this.message = '';
        this.success = `Coupon Code  ${this.couponCodeApplied} Applied `;
        this.calculateFinalAmount();
      })
      .catch((err) => {
        if (err.status === 406) {
          if (this.couponApplied) {
            this.couponCode = this.couponCodeApplied;
            this.success = `Coupon Code ${this.couponCodeApplied} already Applied`;
          } else {
            this.message = err.data.message;
            this.success = '';
          }
          this
            .toaster
            .pop('error', err.data.message);
        } else {
          this
            .toaster
            .pop('error', err.data.message);
          this.message = err.data.message;
          this.success = '';
        }
        this.calculateFinalAmount();
      });
  }

  getFinalWalletUsed() {
    let walletAmount = 0;
    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WALLET)) {
      walletAmount = Number(this.walletBalanceAmount) > Number(this.data.payAmount) ?
        this.data.walletUsed : this.walletBalanceAmount;
      if (this.data.payAmount == 0) {
        walletAmount = this.walletBalanceAmount -
          (Number(this.amount || 0) - Number(this.data.loyaltyAmount || 0));
      }
    } else if (this.isWalletChecked) {
      walletAmount = this.walletBalanceAmount;
    }
    this.walletUsed = walletAmount;
    this.data.walletUsed = walletAmount;
  }

  submitPayment(e) {
    if (Number(this.data.payAmount) === 0) {
      this.data.paymentGateway = Number(this.PAYMENT_GATEWAYS.WALLET);
    }

    if (!this.data.paymentGateway) {
      return this
        .toaster
        .pop('error', 'Select payment Gateway');
    }

    if (!this.submitting) return null;
    let walletAmount = 0;
    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WALLET)) {
      walletAmount = Number(this.walletBalanceAmount) > Number(this.data.payAmount) ?
        this.data.walletUsed : this.walletBalanceAmount;
      if (this.data.payAmount == 0) {
        if (this.showWallet) {
          walletAmount = this.data.walletUsed;
        } else {
          walletAmount = this.walletBalanceAmount -
            (Number(this.amount || 0) - Number(this.data.loyaltyAmount || 0));
        }
      }
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
      type: this.data.type,
    };
    let razorPayId = '';

    if (this.data.paymentGateway == this.PAYMENT_GATEWAYS.RAZOR) {
      razorPayId  = this.razorPayClick(e, this.params);
    }

    const method = 'get';
    return this
      .$http[method]('$/api/transactions/create', { params: this.params })
      .then(({ data: url }) => {
        const gateWaySeleted = Number(this.params.payment_gateway_id);
        this.submitting = false;
        if (gateWaySeleted === this.PAYMENT_GATEWAYS.CARD) {
          this.$window.location = url;
        } else if (gateWaySeleted === this.PAYMENT_GATEWAYS.PAYPAL) {
          this.$window.location = url.url;
        } else if (gateWaySeleted === this.PAYMENT_GATEWAYS.CASH
          || gateWaySeleted === this.PAYMENT_GATEWAYS.WALLET
          || gateWaySeleted === this.PAYMENT_GATEWAYS.WIRE) {
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

  razorPayClick(e, parmas) {
    this.paymentid = '';
    const options = {
      // key: 'rzp_live_M6Qsxy6ugbs8u4',
      key: 'rzp_test_wCWbs0SkDqq9ht',
      amount: this.data.payAmount * 100,  // 2000 paise = INR 20
      name: 'Merchant Name',
      description: 'Shoppre Payment',
      image: 'https://www.shoppre.com/img/images/logo@2x.png',
      http: this.$http,
      window: this.$window,
      params: this.params,
      handler: function payReponse(response) {
        this.paymentid = response.razorpay_payment_id;
        Object.assign(options.params, { razorPayId: this.paymentid });
        options.http
          .get('$/api/transactions/create', { params : options.params })
          .then(({ data: url }) => {
            options.window.location = url;
          })
          .catch((err) => {
            this
              .toaster
              .pop('error', err.data.message);
          });
      },
      prefill: {
        name: this.Session.read('userinfo').name,
        email: this.Session.read('userinfo').email,
      },
      notes: {
        address: 'Shoppre Payment',
      },
      theme: {
        color: '#F37254',
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
  }

  calculateFinalAmount() {
    this.getFinalWalletUsed();
    const amount = Number(this.amount);
    let amountForPaymentGateway = 0;

    if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.CASH) ||
      Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WIRE)) {
      this.showWallet = false;
      this.isWalletChecked = false;
    }

    if (this.isWalletChecked) {
      if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.CASH) ||
        Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WIRE)) {
        this.data.paymentGatewayFeeAmount = 0;
        this.showWallet = false;
        this.isWalletChecked = false;
      } else if (this.data.paymentGateway) {
        this.showWallet = true;
      } else {
        this.data.paymentGatewayFeeAmount = 0;
      }

      this.data.payAmount = Math.round(amount - Number(this.data.loyaltyAmount || 0)
        - Number(this.data.discountAmount || 0));

      if (Number(this.walletBalanceAmount > 0)) {
        this.data.payAmount += -Number(this.walletBalanceAmount || 0);
      }

      amountForPaymentGateway = this.data.payAmount;
      const pgFeeAmount = this.calculatePaymentGatewayfee(amountForPaymentGateway);

      this.data.paymentGatewayFeeAmount = pgFeeAmount;
      this.data.payAmount += Math.round(Number(this.data.paymentGatewayFeeAmount || 0));
    } else {
      this.showWallet = true;

      if (Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.CASH) ||
        Number(this.data.paymentGateway) === Number(this.PAYMENT_GATEWAYS.WIRE)) {
        this.isWalletChecked = false;
        this.showWallet = false;
        this.data.paymentGatewayFeeAmount = 0;
      } else if (this.data.paymentGateway) {
        this.showWallet = true;
      } else {
        this.data.paymentGatewayFeeAmount = 0;
      }

      this.data.payAmount = Math.round(amount - Number(this.data.loyaltyAmount || 0)
        - Number(this.data.discountAmount || 0));

      amountForPaymentGateway = this.data.payAmount;
      const pgFeeAmount = this.calculatePaymentGatewayfee(amountForPaymentGateway);
      this.data.paymentGatewayFeeAmount = pgFeeAmount;
      this.data.payAmount += Math.round(Number(this.data.paymentGatewayFeeAmount || 0));
    }

    if (this.walletBalanceAmount < 0) {
      this.showWallet = true;
      this.isWalletChecked = true;
    }

    if (Number(this.data.loyaltyAmount) > Number(this.amount)) {
      this.data.payAmount = 0;
      this.data.loyaltyAmount = this.amount;
    }

    if (Number(this.data.payAmount) == 0) {
      this.paymentGateways.forEach((x) => {
        if (x.id === this.data.paymentGateway) {
          x.status = 0;
          this.showWallet = false;
          this.isWalletChecked = false;
        }
      });
    }
  }

  calculatePaymentGatewayfee(amountForPaymentGateway) {
    if (amountForPaymentGateway > 0) {
      const pgFee = this.paymentGateways
        .filter(x => x.id === Number(this.data.paymentGateway))
        .reduce((y) => {
          if (y) {
            return y;
          }
          return null;
        });

      if (pgFee) {
        return (amountForPaymentGateway * (pgFee.fee / 100));
      }
      return null;
    }
    return null;
  }
}

angular
  .module('uiGenApp')
  .controller('TransactionCreateController', TransactionCreateController);
