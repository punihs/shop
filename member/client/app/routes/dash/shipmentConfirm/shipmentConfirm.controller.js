class ShipmentConfirmController {
  constructor(
    $http, Page, $stateParams, $location, ViewPhotoService, toaster, $state, $uibModal,
    $window, CONFIG
  ) {
    this.ViewPhotoService = ViewPhotoService;
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIG = CONFIG;
    this.PAYMENT_GATEWAY = this.CONFIG.PAYMENT_GATEWAY;
    this.$onInit();
  }

  $onInit() {
    this.packages = [];
    this.shipment = [];
    this.shipmentMeta = [];
    this.payment = [];
    this.isWalletChecked = false;
    this.$order_code = this.$stateParams.order_code;
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

  uploadPhotos(packageDetail) {
    this.$uibModal.open({
      templateUrl: 'app/directives/request-photos/request-photos.html',
      controller: 'RequestPhotosController',
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
      url = this.$http.get(`/shipments/confirmShipment?order_code=${this.$order_code}${params}`);
    } else {
      url = this.$http.get(`/shipments/confirmShipment?order_code=${this.$order_code}`);
    }
    url
      .then(({
        data: {
          shipment, packages, payment, promoStatus, couponAmount, paymentGateways,
        },
      }) => {
        this.packages = [];
        this.packages = packages;

        this.paymentGateways = paymentGateways;
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
        packages.map((x) => {
          this.totalpackagePriceAmount += x.price_amount;
          this.data.photo_amount += x.PackageCharge.advanced_photo_amount || 0 + x.PackageCharge.standard_photo_amount ||0;
          this.data.storage_amount += x.PackageCharge.storage_amount || 0;
          this.data.pickup_amount += x.PackageCharge.pickup_amount || 0;
          this.data.split_package_amount += x.PackageCharge.split_package_amount || 0;
          this.data.special_handling_amount += x.PackageCharge.special_handling_amount || 0;
          this.data.receive_mail_amount += x.PackageCharge.receive_mail_amount || 0;
          this.data.scan_document_amount += x.PackageCharge.scan_document_amount || 0;
          this.data.wrong_address_amount += x.PackageCharge.wrong_address_amount || 0;
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
  }

  selectedGateway() {
    this.params = {
      shipment_id: this.shipment.id,
      wallet: this.isWalletChecked ? 1 : 0,
      payment_gateway_id: this.data.paymentGateway,
    };
    const params =
      `&payment_gateway_id=${this.data.paymentGateway}&wallet=${this.params.wallet}`;
    this.getList(params);
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
      this
        .toaster
        .pop('error', 'Select payment Gateway');
    }
    if (this.submitting) return null;
    this.params = {
      shipment_id: this.shipment.id,
      is_wallet: this.isWalletChecked ? 1 : 0,
      payment_gateway_id: this.data.paymentGateway,
    };
    const method = 'put';
    return this
      .$http[method]('/shipments/finalShip', this.params)
      .then(({ data: encryptedData }) => {
        this.submitting = false;
        if (this.data.paymentGateway === this.PAYMENT_GATEWAY.CARD) {
          this.$window.location = encryptedData;
        } else if (this.data.payment_gateway_id === this.PAYMENT_GATEWAY.PAYTM) {
          this.$state.go('dash.paytm', { encryptedData });
        } else if (this.data.paymentGateway === this.PAYMENT_GATEWAY.PAYPAL) {
          this.$window.location = encryptedData.url;
        } else if (this.data.paymentGateway === this.PAYMENT_GATEWAY.CASH
          || this.data.paymentGateway === this.PAYMENT_GATEWAY.WIRE
          || this.data.paymentGateway === this.PAYMENT_GATEWAY.WALLET) {
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
  .controller('ShipmentConfirmController', ShipmentConfirmController);
