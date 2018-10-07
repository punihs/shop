class AddressListController {
  constructor($http, Page, socket, $state) {
    this.$http = $http;
    this.socket = socket;
    this.Page = Page;
    this.$state = $state;

    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Address Book');

    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.addresses = [];

    this
      .$http
      .get('/addresses')
      .then(({ data: addresses }) => {
        this.addresses.push(...addresses);
        this.socket.syncUpdates('address', this.addresses);
      });
  }

  destroy(address, index) {
    const c = confirm;
    const ok = c(`Are you sure? Deleting ${address.city} Shipping Address`);
    if (!ok) return null;
    return this
      .$http
      .delete(`/addresses/${address.id}`)
      .then(() => this.addresses.splice(index, 1));
  }
}

angular.module('uiGenApp')
  .controller('AddressListController', AddressListController);
