class ShipmentCreateController {
  constructor(Page, $state, $stateParams, $http, toaster, customer, shipment, QCONFIG,
    Session, $httpParamSerializer) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.customer = customer;
    this.$stateParams = $stateParams;
    this.$httpParamSerializer = $httpParamSerializer;
    this.toaster = toaster;
    this.Number = Number;
    this.QCONFIG = QCONFIG;
    this.$ = $;
    this.shipment = shipment;

    this.$onInit();
  }

  $onInit() {
    this.submitting = false;
    this.submittingTracking = false;
    this.data = this.shipment || {};
    this.EDIT = !!this.$stateParams.shipmentId && this.$stateParams.shipmentId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode') || false);
    this.TITLE = `${this.EDIT ? 'Edit' : 'Add New'} Shipment`;
    this.Page.setTitle(this.TITLE);
    this.shipmentTypes = this.Session.read('shipment-types');
    this.afterShipCarriers = this.Session.read('afterShipCarriers');
    this.paymentMode(this.data);

    this.cartonBox = this.QCONFIG.CARTON_BOX;
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

    const afterShipSlug = this.afterShipCarriers
      .filter((x) => {
        if (x.carrier === this.data.shipping_carrier)
          return x;
      });

    const data = Object.assign({ }, this.data);
    Object.assign(data, { afterShip_slug: afterShipSlug[0].slug } );
    if (!form) return (this.submittingTracking = false);

    const allowed = [
      'shipping_carrier', 'number_of_packages', 'weight_by_shipping_partner', 'tracking_code',
      'tracking_url', 'afterShip_slug',
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
        this.submittingTracking = false;
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
    Object.assign(data, { other_charge_amount: this.data.ShipmentMetum.other_charge_amount });

    if (!form) return (this.submitting = false);

    const { shipmentId, id: customerId } = this.$stateParams;
    data.customer_id = customerId;

    const allowed = [
      'customer_name', 'phone', 'address', 'packages_count', 'final_weight',
      'weight', 'volumetric_weight', 'value_amount', 'sub_total_amount', 'discount_amount',
      'package_level_charges_amount', 'pick_up_charge_amount', 'liquid_charge_amount',
      'estimated_amount', 'coupon_amount', 'loyalty_amount', 'is_axis_banned_item',
      'payment_gateway_fee_amount', 'wallet_amount', 'final_amount', 'shipment_type_id',
      'other_charge_amount',
    ];

    const method = 'put';

    return this
      .$http[method](`/shipments${shipmentId ? `/${shipmentId}` : ''}`, _.pick(data, allowed))
      .then(({ data: updateShipment }) => {
        this.data.estimated_amount = updateShipment.estimated_amount;
        this.submitting = false;

        this
          .toaster
          .pop('success', `#${shipmentId} Shipment ${this.EDIT ?
            'Updated'
            : 'Created'} Successfully.`, '');
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

  cartonValue() {
    const carton = this.cartonBox.filter(x => x.kg === this.data.carton_box_used);
    this.data.carton_box_Amount = carton[0].amount;
  }

  getUpstreamPrice() {
    const docType = this.data.is_doc === true ? 'doc' : 'nondoc';
    const countryCode = this.shipment.Country.iso2;
    const params = `all=true&country=${countryCode}&weight=${this.data.final_weight}&type=${docType}`;

    this.$http.get(`%/pricing/?${params}`)
      .then(({ data: { prices }}) => {
        if (prices) {
          this.data.upstream_cost = prices[0].base_cost_from_upstream;
          this.data.fuel_sur_charge = prices[0].fuel_surcharge;
          this.data.gst_amount = prices[0].gst;
        } else {
          this.toaster
            .pop('error', 'Price not found');
        }
      });
  }
  updateUpstreamPrice() {
    const allowed = ['carton_box_Amount', 'is_doc', 'upstream_cost', 'fuel_sur_charge',
      'gst_amount', 'carton_box_used', 'carton_box_Amount', 'carton_box_weight'];

    if (this.data.carton_box_used !== 'Other') {
      this.data.carton_box_weight = null;
    } else if (this.data.carton_box_used === 'Other' && !this.data.carton_box_weight) {
      this
        .toaster
        .pop('error', 'Enter Carton Box Weight');
      this.submittingTracking = false;
      return;
    }

    const { shipmentId } = this.$stateParams;
    return this.$http.put(`/shipments/${shipmentId}/tracking`, _.pick(this.data, allowed))
      .then(() => {
        this.toaster
          .pop('success', 'Upstream price Updated');
      }).catch((e) => {
        this.toaster
          .pop('error', 'Error updating Upstream price');
      });
  }

  paymentMode(data) {
    if (data.transaction_id) {
      const params = {
        object_id: data.order_code,
        customer_id: data.customer_id,
      };

      const qs = this.$httpParamSerializer(params);
      this
        .$http
        .get(`$/transactions/${data.transaction_id}/response?${qs}`)
        .then((transaction) => {
          this.transaction = transaction;
        })
        .catch(() => {
          this.toaster
            .pop('error', 'There was problem loading data. Please contact ShoppRe team');
        });
    }
  }
}

angular.module('uiGenApp')
  .controller('ShipmentCreateController', ShipmentCreateController);

