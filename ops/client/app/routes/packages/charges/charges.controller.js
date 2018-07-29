class PackageChargesController {
  constructor(
    Page, $state, $stateParams, $http, toaster, Session, charges
  ) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.$ = $;
    this.submitting = false;
    this.charges = charges;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Update Package Charges');
    this.allowed = [
      'storage_amount',
      'wrong_address_amount',
      'special_handling_amount',
      'receive_mail_amount',
      'pickup_amount',
      'basic_photo_amount',
      'advanced_photo_amount',
      'scan_document_amount',
      'split_package_amount',
    ];

    this.data = this.charges || this.allowed
      .reduce((nxt, x) => Object.assign(nxt, { [x]: 0 }), {});
  }

  focus(field) {
    $(`input[name="${field}"]`)[0].focus();
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

  updateCharges(chargesForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(chargesForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    const { id } = this.$stateParams;

    return this
      .$http
      .put(`/packages/${id}/charges`, _.pick(data, this.allowed))
      .then(() => {
        this.submitting = false;

        this
          .toaster
          .pop('success', `#${id} Package Charges Updated Successfully.`);

        return this.$state.go('package.show', { id, activeTab: 1 });
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        chargesForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();


        this
          .toaster
          .pop('error', 'There was problem updating package charges. Please contact Tech team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('PackageChargesController', PackageChargesController);

