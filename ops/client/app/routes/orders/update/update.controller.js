class OrderUpdateController {
  constructor(Page, $state, $stateParams, $http, toaster, pkg, Session, S3, URLS) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.$ = $;
    this.S3 = S3;
    this.URLS = URLS;
    this.submitting = false;
    this.data = pkg || {};
    this.$onInit();
  }

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
  }

  $onInit() {
    this.uploadingPhotos = false;
    this.EDIT = !!this.$stateParams.id && this.$stateParams.id !== '';
    this.TITLE = 'EditOrder';
    this.Page.setTitle(this.TITLE);

    if (this.EDIT) {
      if (this.data.seller_invoice) {
        const invoicePath = `${this.URLS.CDN}/shoppre/${this.data.seller_invoice}`;
        this.data.object = invoicePath;
      }
      this.file = 'Nothing';
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

  update(orderForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(orderForm);

    const data = Object.assign({ }, this.data);

    if (!form) return (this.submitting = false);

    const allowed = [
      'is_doc',
      'store_id',
      'invoice_code',
      'virtual_address_code',
      'weight',
      'price_amount',
      'customer_id',
      'content_type',
      'seller_invoice',
      'amount_paid',
      'object',
    ];

    Object.assign(data, { seller_invoice: this.data.object });

    return this
      .$http
      .put(`/packages/${this.$stateParams.id}?type=ps`, _.pick(data, allowed))
      .then(({ data: pkg }) => {
        this.pkg = pkg;
        const { id } = pkg;
        this.submitting = false;

        this
          .toaster
          .pop('success', `#${id} Order Updated Successfully.`, '');

        if (this.EDIT) return this.$state.go('order.show', { id });

        return this.reset(orderForm);
      })
      .catch((err) => {
        this.submitting = false;

        this
          .toaster
          .pop('error', 'There was problem updating Order. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('OrderUpdateController', OrderUpdateController);

