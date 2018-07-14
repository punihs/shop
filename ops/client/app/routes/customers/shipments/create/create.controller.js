class ShipmentCreateController {
  constructor(
    Page, $state, $stateParams, $http, toaster, customer, shipment, Session
  ) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.customer = customer;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.$ = $;
    this.submitting = false;
    this.data = shipment || {};
    this.$onInit();
  }

  $onInit() {
    this.EDIT = !!this.$stateParams.shipmentId && this.$stateParams.shipmentId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode') || false);
    this.TITLE = `${this.EDIT ? 'Edit' : 'Add New'} Shipment`;
    this.Page.setTitle(this.TITLE);
    this.getPopularStores();
  }

  reset(newShipmentForm) {
    this.data = {};
    this.Store.model = '';
    newShipmentForm.$setPristine();
    this.focus('store_id');
  }

  focus(field) {
    $(`input[name="${field}"]`)[0].focus();
  }

  getPopularStores() {
    this
      .$http
      .get('/stores', { params: { type: 'popular', fl: 'id,name', limit: 5 } })
      .then(({ data: { stores } }) => {
        this.popularStores = stores;
      });
  }

  changeMode() {
    this.Session.create('quickMode', this.quickMode);
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

  create(newShipmentForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newShipmentForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    const { shipmentId, id: customerId } = this.$stateParams;
    data.customer_id = customerId;

    const allowed = [
      'customer_name', 'phone', 'address', 'packages_count', 'final_weight',
      'weight', 'volumetric_weight', 'value_amount', 'sub_total_amount', 'discount_amount',
      'package_level_charges_amount', 'pick_up_charge_amount',
      'estimated_amount', 'coupon_amount', 'loyalty_amount',
      'payment_gateway_fee_amount', 'wallet_amount', 'final_amount',

    ];

    // const method = shipmentId ? 'put' : 'post';
    const method = 'put';

    return this
      .$http[method](`/shipments${shipmentId ? `/${shipmentId}` : ''}`, _.pick(data, allowed))
      .then(({ data: shipment }) => {
        this.shipment = shipment;
        const { id, Locker = {} } = shipment;
        this.submitting = false;

        if (!this.customer.Locker) this.customer.Locker = Locker;
        this
          .toaster
          .pop('success', `#${id} Shipment ${this.EDIT
            ? 'Updated'
            : 'Created'} Successfully.`, '');
        if (this.EDIT) return this.$state.go('shipment.show', { id });
        return this.reset(newShipmentForm);
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newShipmentForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();


        this
          .toaster
          .pop('error', 'There was problem creating shipment. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('ShipmentCreateController', ShipmentCreateController);

