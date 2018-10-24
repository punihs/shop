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
    this.submittingTracking = false;
    this.data = shipment || {};
    this.$onInit();
  }

  $onInit() {
    this.EDIT = !!this.$stateParams.shipmentId && this.$stateParams.shipmentId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode') || false);
    this.TITLE = `${this.EDIT ? 'Edit' : 'Add New'} Shipment`;
    this.Page.setTitle(this.TITLE);
    this.shipmentTypes = this.Session.read('shipment-types');
    this.data.shipment_type_id =
      (this.EDIT && this.data.ShipmentType) ? this.data.ShipmentType.id : this.shipmentTypes[0].id;
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

  trackingUpdate(trackingForm) {
    if (this.submittingTracking) return null;
    this.submittingTracking = true;
    this.clickUpload = true;
    const form = this.validateForm(trackingForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submittingTracking = false);

    const allowed = [
      'shipping_carrier', 'number_of_packages', 'weight_by_shipping_partner', 'tracking_code',
      'tracking_url',
    ];
    const { shipmentId, id: customerId } = this.$stateParams;
    data.customer_id = customerId;
    const method = 'put';
    return this
      .$http[method](`/shipments/${shipmentId}/tracking`, _.pick(data, allowed))
      .then(({ data: shipment }) => {
        this.shipment = shipment;
        const { Locker = {} } = shipment;
        this.submittingTracking = false;

        if (!this.customer.Locker) this.customer.Locker = Locker;
        this
          .toaster
          .pop('success', 'Shipment Tracking Updated');
      })
      .catch((err) => {
        this.submitting = false;
        this
          .toaster
          .pop('error', 'There was problem while updating Tracking');

        this.error = err.data;
      });
  }

  create(newShipmentForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newShipmentForm);

    const data = Object.assign({ }, this.data);
    Object.assign(data, { liquid_charge_amount: this.data.ShipmentMetum.liquid_charge_amount });
    if (!form) return (this.submitting = false);

    const { shipmentId, id: customerId } = this.$stateParams;
    data.customer_id = customerId;

    const allowed = [
      'customer_name', 'phone', 'address', 'packages_count', 'final_weight',
      'weight', 'volumetric_weight', 'value_amount', 'sub_total_amount', 'discount_amount',
      'package_level_charges_amount', 'pick_up_charge_amount', 'liquid_charge_amount',
      'estimated_amount', 'coupon_amount', 'loyalty_amount', 'is_axis_banned_item',
      'payment_gateway_fee_amount', 'wallet_amount', 'final_amount', 'shipment_type_id',

    ];
    const method = 'put';

    return this
      .$http[method](`/shipments${shipmentId ? `/${shipmentId}` : ''}`, _.pick(data, allowed))
      .then(({ data: shipment }) => {
        this.shipment = shipment;
        const { Locker = {} } = shipment;
        this.submitting = false;

        if (!this.customer.Locker) this.customer.Locker = Locker;
        this
          .toaster
          .pop('success', `#${shipmentId} Shipment ${this.EDIT ?
            'Updated'
            : 'Created'} Successfully.`, '');
        if (this.EDIT) return this.$state.go('shipment.show', { id: shipmentId });
        return this.reset(newShipmentForm);
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newShipmentForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();


        this
          .toaster
          .pop('error', 'There was problem updating shipment.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('ShipmentCreateController', ShipmentCreateController);

