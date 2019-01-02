class PreferencesController {
  constructor(Page, $http, toaster, Session) {
    this.Page = Page;
    this.$http = $http;
    this.toaster = toaster;
    this.Session = Session;
    this.data = {};
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Preferences');
    this.$http
      .get(`/users/${this.Session.read('userinfo').id}/shippingPreference`)
      .then(({ data: { shippingPreference, userAddress } }) => {
        this.data = shippingPreference;
        if (userAddress) {
          this.userAddress = userAddress.Addresses[0];
        }
      }).catch(() => {
        this
          .toaster
          .pop('error', 'error in Loading shipping preference');
      });
  }

  updatePreference() {
    this.$http
      .put(`/users/${this.Session.read('userinfo').id}/shippingPreference`, this.data)
      .then(() => {
        this
          .toaster
          .pop('success', 'Updated Sucessfully');
      })
      .catch(() => {
        this
          .toaster
          .pop('error', 'error in updating shipping preference');
      });
  }
}
angular.module('uiGenApp')
.controller('PreferencesController', PreferencesController);
