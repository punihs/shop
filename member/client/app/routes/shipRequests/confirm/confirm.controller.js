class ShipRequestConfirmController {
  constructor(
    $http, Page, $stateParams, $location, toaster, $state, $uibModal, URLS, Session,
    $window, CONFIG,
  ) {
    this.$http = $http;
    this.Page = Page;
    this.$location = $location;
    this.toaster = toaster;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.URLS = URLS;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.CONFIG = CONFIG;
    this.Session = Session;
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
          shipment, packages, payment,
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
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  submitPayment() {
    // this.$state.go('transaction.create', {
    //   id: this.shipment.id,
    //   amount: this.payment.amount,
    //   object_id: this.shipment.order_code,
    //   customer_id: this.shipment.customer_id,
    //   axis_banned: this.shipment.is_axis_banned_item,
    //   type: 'shipment',
    // });
    // const url = `${this.URLS.PAY}/access/login?id=${this.shipment.id}&amount=${this.shipment.estimated_amount}&object_id=${this.shipment.order_code}&customer_id=${this.shipment.customer_id}&axis_banned=${this.shipment.is_axis_banned_item}&type=shipment`;
    // const url = `${this.URLS.PAY}/access/login?id=${this.shipment.id}&amount=${this.shipment.estimated_amount}&object_id=${this.shipment.order_code}&customer_id=${this.shipment.customer_id}&axis_banned=${this.shipment.is_axis_banned_item}&type=shipment`;
    // this.$window.location.href = url;
    this.authorise();
  }

  authorise() {
    this.user = this.Session.read('userinfo');
    const paymentClient = 9;
    const data = {
      grant_type: 'loginAs',
      username: this.user.email,
      app_id: paymentClient,
    };
    const method = 'post';
    return this
      .$http[method]('~~/api/authorise', data)
      .then(({ data: redirectUrl }) => {
        const cancelUrl = `${this.URLS.PARCEL}/shipRequests`;
        this.$window.location.href = redirectUrl + `&id=${this.shipment.id}&amount=${this.shipment.estimated_amount}&object_id=${this.shipment.order_code}&customer_id=${this.shipment.customer_id}&axis_banned=${this.shipment.is_axis_banned_item}&type=shipment&cancelUrl=${cancelUrl}`;
      });
  }
}

angular
  .module('uiGenApp')
  .controller('ShipRequestConfirmController', ShipRequestConfirmController);
