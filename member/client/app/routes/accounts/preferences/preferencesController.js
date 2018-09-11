class preferencesController {
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
      .get(`/shippingPreference/${this.Session.read('userinfo').id}`, this.data)
      .then(({ data: { preference } }) => {
        this.data = preference[0];
      });
  }

  updatePreference() {
    this.$http
      .put(`/shippingPreference/${this.Session.read('userinfo').id}`, this.data)
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
.controller('preferencesController', preferencesController);
