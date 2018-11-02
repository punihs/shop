class ShipRequestConfirmController {
  constructor(
    $http, Page, $stateParams, $location, toaster, $state, $uibModal,
    $window, CONFIG
  ) {
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIG = CONFIG;
    this.PAYMENT_GATEWAY = {
      WIRE: 1,
      CASH: 2,
      CARD: 3,
      PAYTM: 4,
      PAYPAL: 5,
      WALLET: 6,
    };
    this.$onInit();
  }

  $onInit() {
    this.packages = [];
    this.shipment = [];
    this.shipmentMeta = [];
    this.payment = [];
    this.isWalletChecked = false;
    this.orderCode = this.$stateParams.orderCode;
    this.status = '';
    this.message = '';
    this.promoStatus = '';
    this.couponAmount = '';
    this.couponCode = '';
    this.totalpackagePriceAmount = 0;
    this.paymentGateways = [];
    this.data = {
      storage_amount: 0,
      photo_amount: 0,
      pickup_amount: 0,
      split_package_amount: 0,
      special_handling_amount: 0,
      receive_mail_amount: 0,
      scan_document_amount: 0,
      wrong_address_amount: 0,
    };
    this.Page.setTitle('Shipment confirmation');
    this.getList();
  }

  viewPhotos(packageDetail) {
    this.$uibModal.open({
      templateUrl: 'app/directives/viewPhotos/viewPhotos.html',
      controller: 'ViewPhotosController',
      controllerAs: '$ctrl',
      size: 'lg',
      resolve: {
        packageDetail() {
          return packageDetail;
        },
      },
    });
  }

  getList(params) {
    let url = '';
    if (params) {
      url = this.$http.get(`/shipments/${this.orderCode}/confirmShipment?${params}`);
    } else {
      url = this.$http.get(`/shipments/${this.orderCode}/confirmShipment`);
    }
    url
      .then(({
        data: {
          shipment, packages, payment, promoStatus, couponAmount,
        },
      }) => {
        this.packages = [];
        this.packages = packages;

        this.shipment = shipment;
        const shipmentMeta = [];
        shipmentMeta.push(shipment);
        this.shipmentMeta = shipmentMeta[0].ShipmentMetum;
        this.packageCharges = packages;
        this.payment = payment;
        this.promoStatus = promoStatus;
        this.couponAmount = couponAmount;
        this.data.paymentGateway = payment.payment_gateway_id;
        this.totalpackagePriceAmount = 0;
        this.data = {
          storage_amount: 0,
          photo_amount: 0,
          pickup_amount: 0,
          split_package_amount: 0,
          special_handling_amount: 0,
          receive_mail_amount: 0,
          scan_document_amount: 0,
          wrong_address_amount: 0,
        };

        packages.forEach((x) => {
          this.totalpackagePriceAmount += x.price_amount;
          this.data.photo_amount += (x.PackageCharge.advanced_photo_amount || 0) +
            (x.PackageCharge.standard_photo_amount || 0);

          this.data.storage_amount += x.PackageCharge.storage_amount || 0;
          this.data.pickup_amount += x.PackageCharge.pickup_amount || 0;
          this.data.split_package_amount += x.PackageCharge.split_package_amount || 0;
          this.data.special_handling_amount += x.PackageCharge.special_handling_amount || 0;
          this.data.receive_mail_amount += x.PackageCharge.receive_mail_amount || 0;
          this.data.scan_document_amount += x.PackageCharge.scan_document_amount || 0;
          this.data.wrong_address_amount += x.PackageCharge.wrong_address_amount || 0;
        });
        this.GetPaymentGateways();
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  walletClicked() {
    this.selectedGateway();
  }

  GetPaymentGateways() {
    this.$http['get']('http://pay.shoppre.test/api/paymentGateways')
      .then(({ data: { gateWay } }) => {
        this.paymentGateways = gateWay;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  applyPromoCode() {
    if (this.couponCode) {
      const querystring = `order_code=${this.shipment.order_code}&coupon_code=${this.couponCode}`;
      this.$http
        .put(`/redemptions/apply?${querystring}`)
        .then(({ data: { message } }) => {
          this.message = message;
          const params =
            `&payment_gateway_id=${this.data.paymentGateway}&wallet=${this.params.wallet}`;
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
    if (!this.data.paymentGateway) {
      return this
        .toaster
        .pop('error', 'Select payment Gateway');
    }
    if (this.submitting) return null;
    this.params = {
      estimated: this.payment.amount,
      object_id: this.shipment.id,
      uid: this.shipment.customer_id,
      is_wallet: 0,
      payment_gateway_id: this.data.paymentGateway,
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
          // this.$state.go('transaction.response', { id: this.shipment.id, amount: url.amount  });
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
  .controller('ShipRequestConfirmController', ShipRequestConfirmController);
