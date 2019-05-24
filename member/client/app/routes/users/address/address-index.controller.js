class AddressesIndexController {
  constructor(Page, Session, URLS, $http, $state, $stateParams, toaster, FaqService, AddAddress) {
    this.Page = Page;
    this.Session = Session;
    this.URLS = URLS;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.FaqService = FaqService;
    this.AddAddress = AddAddress;

    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Address Book');
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.addresses = [];
    this.addressCount = 0;
    this.addressLimit = 0;
    this.data = {};
    this.defaultAddress_id = null;

    this.user = this.Session.read('userinfo');

    if (this.user.phone !== null) {
      this.verifyPhone = true;
    } else {
      this.verifyPhone = false;
    }

    this.$http
      .get('/addresses')
      .then(({ data: { addresses, count, addressLimit } }) => {
        this.addressCount = count;
        this.addressLimit = addressLimit;
        this.addresses.push(...addresses);
        this.addresses.forEach((x) => {
          if (x.is_default === true) {
            this.defaultAddressId = x.id;
          }
        });
      });
  }

  open() {
    const modal = this.AddAddress.open(0, 'add');
    modal
      .result
      .then((data) => {
        if (data.is_default === true) {
          this.addresses.map((x) => {
            if (x.id === this.defaultAddressId) {
              x.is_default = false;
              this.defaultAddressId = x.id;
            }
          });
        }
        this.addresses.push(data);
      });
  }

  editAddress(addressId, index) {
    const modal = this.AddAddress.open(addressId, 'edit');
    modal
      .result
      .then((data) => {
        if (data.is_default === true) {
          this.addresses.map((x) => {
            if (x.id === this.defaultAddressId) {
              x.is_default = false;
              this.defaultAddressId = x.id;
            }
          });
        }
        Object.assign(this.addresses[index], data);
      });
  }

  destroy(address, index) {
    const c = confirm;
    const ok = c(`Are you sure? Deleting ${address.city} Shipping Address`);
    if (!ok) return null;
    return this
      .$http
      .delete(`/addresses/${address.id}`)
      .then(() => {
        this.addresses.splice(index, 1);
        this.addressCount = this.addressCount - 1;
      });
  }

  faq() {
    this.FaqService.open();
  }

  updatePhoneNumber(newPhoneForm) {
    const user = this.Session.read('userinfo');
    const flag = this.update(newPhoneForm);
    if (flag) {
      user.phone = this.data.phone;
      this.user.phone = this.data.phone;
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

angular.module('uiGenApp')
  .controller('AddressesIndexController', AddressesIndexController);
