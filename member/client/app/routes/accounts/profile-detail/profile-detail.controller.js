class ProfileDetailController {
  constructor($http, $stateParams, URLS, $sce, $state, Page, Session, Auth, toaster, QuarcService) {
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
    this.QuarcService = QuarcService;
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
          this.toaster.pop(this.QuarcService.toast('success', 'Email for verification is sent to your work email id.'));
        })
      )
      .catch((err) => this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while updating record')));
  }

  verifyNumber(otpCode) {
    if(!otpCode) {
      this.toaster.pop(this.QuarcService.toast('error', 'Please provide the OTP code received on registered mobile number.'));
      return;
    }
    this
      .$http
      .get(`/userNumbers/${otpCode}/verify`)
      .then(() => {
        this.toaster.pop(this.QuarcService.toast('success', 'OTP verified successfully'));
        this.$state.go("jobs.list",{status: 'New'});
      })
      .catch((err) => this.toaster.pop(this.QuarcService.toast('error', 'Invalid OTP provided')));
  }

  resentOtp(number) {

    this
      .$http.post('/users/verifyNumber', { number })
       .then(() => (this.message = `Sms will be sent to ${number} containing OTP.`))
       .catch((err) => this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while sending OTP.')));
    }

  onInit() {
   return this
      .$http.get('/clients/profile')
      .then(({ data }) => this.data = data)
      .catch((err) => this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while fetching record')));
  }
}

angular.module('uiGenApp')
  .controller('ProfileDetailController', ProfileDetailController);
