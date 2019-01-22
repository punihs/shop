class IndexController {
  constructor($http, Page, toaster, CONFIG, moment, Session, $location) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;
    this.CONFIG = CONFIG;
    this.moment = moment;
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
    this.getList();
  }

  getList() {
    this.$http
      .get('/packages/personalShopperPackage/history')
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
          .get(`$/api/transactions?transactionIds=${transactionIds}`)
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
}

angular
  .module('uiGenApp')
  .controller('IndexController', IndexController);
