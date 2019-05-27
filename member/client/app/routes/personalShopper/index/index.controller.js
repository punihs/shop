class IndexController {
  constructor($http, Page, toaster, $window, CONFIG, moment, URLS, Session, $location) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;
    this.CONFIG = CONFIG;
    this.URLS = URLS;
    this.moment = moment;
    this.$window = $window;
    this.Session = Session;
    this.$location = $location;
    this.error = this.$location.search().error;

    return this.$onInit();
  }

  $onInit() {
    this.PAYMENT_GATEWAY = {
      WIRE: 1,
      CASH: 2,
      CARD: 3,
      PAYTM: 4,
      PAYPAL: 5,
      WALLET: 6,
    };
    this.customerId = this.Session.read('userinfo').id;
    this.PACKAGE_STATE_IDS = this.CONFIG.PACKAGE_STATE_IDS;
    this.Page.setTitle('Order History');
    this.packages = [];
    this.getList('assisted_purchased');
  }

  getList(type) {
    let shopperType = '';

    if (type === 'self_purchased') {
      shopperType = 'cod';
      this.cod = true;
      this.ps = false;
      this.packageType = 'cod';
    } else if (type === 'assisted_purchased') {
      shopperType = 'ps';
      this.ps = true;
      this.cod = false;
      this.packageType = 'ps';
    }

    this.$http
      .get(`/packages/personalShopperPackage/history?shopperType=${shopperType}`)
      .then(({ data: { packages } }) => {
        this.packages = packages;

        this.packages.map((p) => {
          const pkg = p;
          const packageDate = new Date(pkg.created_at);

          // - Todo: moment().diff(moment(packageDate), 'hour')
          pkg.totalHours = moment().diff(moment(packageDate), 'hour');

          return pkg;
        });

        const transactionIds = this.packages.map(x => x.transaction_id);
        let transactionId = '';

        this.$http
          .get(`$/transactions?transactionIds=${transactionIds}`)
          .then(({ data: transactions }) => {
            this.transactions = transactions;
            transactionId = transactions.map(x => x.id);

            this.packages.forEach((pkg) => {
              if (transactionId.includes(pkg.transaction_id)) {
                this.transactions.map((trans) => {
                  if (pkg.transaction_id === trans.id) {
                    Object.assign(pkg, { payment_gate_id: trans.payment_gateway_id });
                    Object.assign(pkg, { payment_status: trans.payment_status });
                  }
                });
              }
            });
          });
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });

    if (this.error) {
      this.message = this.$location.search().message;
    }
  }

  cancel(id, index) {
    const c = confirm;
    const ok = c('Are you sure? Cancel the whole order');
    if (!ok) return null;

    return this
      .$http
      .put(`/packages/personalShopperPackage/${id}/cancelOrder`)
      .then(() => {
        this.packages.splice(index, 1);
        this
          .toaster
          .pop('success', 'Order cancelled');
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  proceed(id, index) {
    const c = confirm;
    const ok = c('Are you sure? Proceed with the complete order, never mind the price change.');
    if (!ok) return null;

    return this
      .$http
      .put(`/packages/personalShopperPackage/${id}/proceed`)
      .then(() => {
        this.packages.splice(index, 1);
        this
          .toaster
          .pop('success', 'Proceed my Order');
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  itemsProceed(id, index) {
    const c = confirm;
    const ok = c('Are you sure? Proceed with the order,but cancel the items with increased prices (or) without the Out-of-Stock item(s).');
    if (!ok) return null;

    return this
      .$http
      .put(`/packages/personalShopperPackage/${id}/itemsProceed`)
      .then(() => {
        this.packages.splice(index, 1);
        this
          .toaster
          .pop('success', 'Proceed my Other Items ');
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }

  retryPayment(pkg) {
    // const url = `${this.URLS.PAY}/access/login?id=${pkg.id}&amount=${pkg.sub_total}&object_id=${pkg.id.toString()}&customer_id=${this.customerId}&axis_banned=false&type=${this.packageType}`;
    // this.$window.location.href = url;

    this.authorise(pkg.id, this.customerId, this.packageType, pkg.sub_total);
  }

  authorise(id, customerId, shopperType, totalAmount) {
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
        const cancelUrl = `${this.URLS.PARCEL}/personalShopper/create`;
        this.$window.location.href =
          redirectUrl + `&id=${id}&amount=${totalAmount}&object_id=${id.toString()}&customer_id=${customerId}&axis_banned=false&type=${shopperType}&cancelUrl=${cancelUrl}`;
      });
  }

}

angular
  .module('uiGenApp')
  .controller('IndexController', IndexController);
