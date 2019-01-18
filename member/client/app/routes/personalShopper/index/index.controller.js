class IndexController {
  constructor($http, Page, toaster, CONFIG, moment) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;
    this.CONFIG = CONFIG;
    this.moment = moment;

    return this.$onInit();
  }

  $onInit() {
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
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
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
