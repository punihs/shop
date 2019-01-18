class OrderShowController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeState,
    pkg, ListModal, toaster, $scope) {
    this.Number = Number;
    this.$scope = $scope;
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.ChangeState = ChangeState;
    this.pkg = pkg;
    this.ListModal = ListModal;
    this.moment = moment;
    this.$window = $window;

    this.$onInit();
  }

  $onInit() {
    this.data = this.pkg;
    this.states = this.Session.read('states');
    this.user = this.Session.read('userinfo');
    this.totalSelectedItems = 0;

    this.location = this.$window.location;
    this.customer = this.data.Customer;
    this.itemStatus = [
      { name: 'pending', id: 'pending' },
      { name: 'cancelled', id: 'cancelled' },
      { name: 'recieved', id: 'recieved' },
      { name: 'addedtopackage', id: 'addedtopackage' },
      { name: 'orderplaced', id: 'orderplaced' },
      { name: 'outofstock', id: 'outofstock' },
      { name: 'pricechanged', id: 'pricechanged' },
    ];
    this.Page.setFavicon(`${this.$stateParams.profilePhotoUrl}`);
    if (this.data.Store) this.Page.setTitle(this.data.Store.name);

    this.root = '_root_';
    this.modal = {};
    this.editAllowedStates = [42, 46, 48, 49, 65, 66, 45, 63, 43, 50, 51, 62];
    this.packageItems = [];
    this.charges = null;

    const { activeTab } = this.$stateParams;
    if (activeTab) this.$scope.activeTab = activeTab;

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/items?type=ps`)
      .then(({ data: packageItems }) => (this.packageItems.push(...packageItems)));
  }

  create() {
    const data = {
      store_id: this.data.store_id,
      customer_id: this.data.customer_id,
    };

    this
      .$http
      .post('/packages', data)
      .then((id) => {
        const itemIds = [];
        const packId = {};
        this.packageItems.map((key) => {
          if (key.isChecked) {
            packId.pack_id = id;
            itemIds.push(key.id);
          }

          return null;
        });

        // dummay package id 0 given
        this
          .$http
          .put(`/packages/${this.$stateParams.id}/items/0?type=ps`, { itemIds, packId })
          .then(() => {
            this
              .toaster
              .pop('success', 'Package Created Successfully.');
          });
      });
  }

  chatHoverText() {
    return `Initiate chat with ${this.data.name}`;
  }

  selectItems() {
    let count = 0;
    this.packageItems.forEach((packageItems) => {
      if (packageItems.isChecked) {
        count++;
      }
    });
    this.totalSelectedItems = count;
  }

  updateItem(id, status) {
    return this
      .$http
      .put(`/packages/personalShopperPackage/${id}/updateItem`, { status })
      .then(() => {
        this.toaster
          .pop('success', `#${id}Item Updated Successfully`);
        this.$state.go('order.show');
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem updationg item');
      });
  }
}

angular.module('uiGenApp')
  .controller('OrderShowController', OrderShowController);
