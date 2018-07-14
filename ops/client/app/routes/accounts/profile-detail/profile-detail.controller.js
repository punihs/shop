class ProfileDetailController {
  constructor($http, $stateParams, URLS, $sce, $state, Page, Session, Auth, toaster) {
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.showLink = 0;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.showConfirm = false;
    this.Auth = Auth;
    this.data = {};
    this.onInit();
  }

  update() {
    this
      .$http.post('/users/firstLogin', this.data)
      .then(() => this
        .Auth
        .setSessionData()
        .then(() => {
          this.showConfirm = true;
          this.toaster.pop('success', 'Email for verification is sent to your work email id.');
        })
      )
      .catch(() => this.toaster.pop('error', 'Error occurred while updating record'));
  }

  verifyNumber(otpCode) {
    if (!otpCode) {
      return this
        .toaster
        .pop('error', 'Please provide the OTP code received on registered mobile number.');
    }
    return this
      .$http
      .get(`/userNumbers/${otpCode}/verify`)
      .then(() => {
        this.toaster.pop('success', 'OTP verified successfully');
        this.$state.go('customers.list', { status: 'New' });
      })
      .catch(() => this.toaster.pop('error', 'Invalid OTP provided'));
  }

  resentOtp(number) {
    this
      .$http.post('/users/verifyNumber', { number })
      .then(() => (this.message = `Sms will be sent to ${number} containing OTP.`))
      .catch(() => this.toaster.pop('error', 'Error occurred while sending OTP.'));
  }

  onInit() {
    return this
      .$http.get('/clients/profile')
      .then(({ data }) => {
        this.data = data;
      })
      .catch(() => this.toaster.pop('error', 'Error occurred while fetching record'));
  }
}

angular.module('uiGenApp')
  .controller('ProfileDetailController', ProfileDetailController);
