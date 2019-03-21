class DashboardIndexController {
  constructor(Page, Session, URLS, $http, $stateParams, toaster) {
    this.Page = Page;
    this.Session = Session;
    this.URLS = URLS;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.toaster = toaster;

    return this.$onInit();
  }

  $onInit() {
    this.store = 'Amazon';
    this.user = this.Session.read('userinfo');

    if (this.user.phone !== null) {
      this.verifyPhone = true;
    } else {
      this.verifyPhone = false;
    }
    this.currentOffer = {};
    this.submitting = false;
    this.data = {};

    this.Page.setTitle('Dashboard');

    this.$http
      .get(`$/api/phpApi/getWalletAndLoyalty?customer_id=${this.user.id}`)
      .then(({ data: { walletAmount } }) => {
        if (walletAmount) {
          this.walletBalanceAmount = walletAmount;
        } else {
          this.walletBalanceAmount = 0.00;
        }
      }).catch = () => {
        this.walletBalanceAmount = 0.00;
      };

    this.$http
      .get('https://cp.shoppre.com/offers/current.json/')
      .then((offer) => {
        this.currentOffer = offer.data;
      });
  }

  updatePhoneNumber(newPhoneForm) {
    const user = this.Session.read('userinfo');
    const flag = this.update(newPhoneForm);
    if (flag) {
      user.phone = this.data.phone;
      this.Session.create('userinfo', user);
      this.verifyPhone = true;
    }
  }

  validateForm(form) {
    this.$stateParams.autofocus = '';
    Object.keys(form).filter(x => !x.startsWith('$')).forEach((f) => {
      if (form[f] && form[f].$invalid) {
        if (!this.$stateParams.autofocus) this.$stateParams.autofocus = f;
        form[f].$setDirty();
      }
    });
    return form.$valid;
  }

  update(newPhoneForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newPhoneForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    return this.$http
      .put('/users/me', data)
      .then(() => {
        this.submitting = false;
        this
          .toaster
          .pop('success', 'Phone Number Updated Successfully.', '');
        return true;
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newPhoneForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem Updating Phone Number. Please contact Shoppre team.');

        this.error = err.data;
        return false;
      });
  }
}

angular
  .module('uiGenApp')
  .controller('DashboardIndexController', DashboardIndexController);
