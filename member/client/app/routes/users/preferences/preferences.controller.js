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
    this.defaultAddress = {};
    this.$http
      .get(`/users/${this.Session.read('userinfo').id}/shippingPreference`)
      .then(({ data: { shippingPreference } }) => {
        this.defaultAddress = shippingPreference.User.Addresses[0];
        this.data = shippingPreference;
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
