class CreateController {
  constructor($http, Page) {
    this.$http = $http;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Request Create');
    this.orderTypeSection = false;
    this.cartSection = true;
    this.optionsSection = false;
    this.summarySection = false;
    this.paymentSection = false;
    this.packageData = [];
    this.packageOptions = [];
    this.submitting = false;
    this.data = {};
    this.isEdit = false;
    this.saleTax = 0;
    this.deliveryCharge = 0;
    this.totalAmount = 0;
    this.personalShopperCost = 0;
    this.itemTotalCost = 0;
    this.packageFields = [
      'id',
      'delivery_charge',
      'if_promo_unavailable',
      'promo_code',
      'promo_info',
      'sales_tax',
      'personal_shopper_cost',
      'price_amount',
      'sub_total',
    ];

    this.if_item_unavailable = [
      { value: 'Cancel this item, purchase all other available items' },
      { value: 'Cancel all items from this site' },
    ];

    this.purchasePriceOption = [
      '250',
      '500',
      '750',
      '1000',
      '1000+',
    ];

    this.getPackageItem();

    this.Stores = {
      select: ($item) => {
        this.data.store_id = $item.id;
        this.Stores.model = $item.name;
        this.Stores.previousValue = $item.name;
      },

      setId: () => {
        const storeName = this.Stores.model.toLowerCase();
        const [region] = (this.Stores.lastSearchResults || [])
          .filter(item => (item.region.toLowerCase() === storeName));
        if (region) this.Stores.select(region);
      },

      blur: () => {
        if (!this.Stores.lastSearchResults) {
          return this.Stores.get(this.Stores.model).then(() => this.Stores.setId());
        }
        return this.Stores.setId();
      },

      get: (search) => this.$http
        .get('/search', {
          params: {
            type: 'Store',
            q: search,
          },
        })
        .then(({ data: { items } }) => items),

      noResults: false,
      loadingStores: false,
    };
  }

  getPackageItem() {
    this.$http
          .get('/packages/0/items?type=psCustomerSide')
          .then(({ data }) => {
            this.packageData = data;
            this.packageOptions = data;
            this.calculateAmount(data);
            console.log('Data', data);
          });
  }

  toggleOrderTypeSection(currentStatus) {
    this.orderTypeSection = currentStatus === false ? true : false;
    this.cartSection = true;
    this.optionsSection = false;
    this.summarySection = false;
    this.paymentSection = false;
  }

  toggleCartSection(currentStatus) {
    this.cartSection = currentStatus === false ? true : false;
  }

  toggleOptionsSection(currentStatus) {
    this.optionsSection = currentStatus === false ? true : false;
  }

  toggleSummarySection(currentStatus) {
    this.summarySection = currentStatus === false ? true : false;
  }

  togglePaymentSection(currentStatus) {
    this.paymentSection = currentStatus === false ? true : false;
  }

  btnToggleOrderType() {

  }

  create(newItemForm) {
    if (this.isEdit) {
      console.log('Editing Mode', this.data);
    } else {
      console.log('Creation Mode', this.data);
    }
    if (this.submitting) return null;
    this.submitting = true;

    // const form = this.validateForm(newItemForm);

    const data = Object.assign({ }, this.data);
    // if (!form) return (this.submitting = false);
    this.$http
      .post('/packages/personalShopperPackage', data)
      .then(({ data: packageItems }) => {
        this.submitting = false;
        this.packageData = packageItems;
        console.log('Package Items', packageItems);
        this
          .toaster
          .pop('success', 'Item Created Successfully.', '');
        return this.reset(newItemForm);
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newItemForm[err.data.field].$setValidity('required', false);

        this
          .toaster
          .pop('error', 'There was problem creating package. Please contact Shoppre team.');

        this.error = err.data;
      });
  }

  reset(newItemForm) {
    this.data = {};
    this.Store.model = '';
    newItemForm.$setPristine();
    this.focus('store_id');
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

  editItem(item, store) {
    this.isEdit = true;
    this.data = item;
    this.data.store_id = store.id;
    this.Stores.model = store.name;
    console.log('data', this.data);
  }

  deleteItem(item) {
    this.$http
      .delete(`/packages/personalShopperPackage/${item.package_id}/item/${item.id}`)
      .then(({ data: packageItems }) => {
        this.packageData = packageItems;
        this.packageOptions = packageItems;
        console.log('Remaining Items', packageItems);
      });
  }

  updatePackageOption() {
    const data = _.map(this.packageOptions, (item) =>
      _.pick(item, this.packageFields)
   );

    console.log('status', data);
    // this.$http
    //   .put('/packages/0?type=psCustomerSide', data)
    //   .then(({ data: packageItems }) => {
    //     this.packageOptions = packageItems;
    //     this.calculateAmount(packageItems);
    //     console.log('status', packageItems);
    //   });
  }

  calculateAmount(data) {
    data.forEach((item) => {
      const pkg = _.pick(item, this.packageFields);
      this.saleTax += pkg.sales_tax;
      this.deliveryCharge += pkg.delivery_charge;
      this.personalShopperCost += pkg.personal_shopper_cost;
      this.itemTotalCost += pkg.price_amount;
      this.totalAmount += (pkg.sales_tax + pkg.delivery_charge + pkg.sub_total);
    });
  }
}

angular
  .module('uiGenApp')
  .controller('CreateController', CreateController);

