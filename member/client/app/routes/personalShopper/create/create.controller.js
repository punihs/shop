class CreateController {
  constructor($http, Page, Session, $state, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.Session = Session;
    this.toaster = toaster;
    this.$state = $state;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Request Create');
    this.orderTypeSection = true;
    this.cartSection = false;
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
    const customerId = this.Session.read('userinfo').id;
    this.$http
      .get(`/packages/0/items?type=psCustomerSide&customerId=${customerId}`)
      .then(({ data }) => {
        this.packageData = data;
        this.packageOptions = data;
        this.calculateAmount(data);
      });
  }

  toggleOrderTypeSection(currentStatus) {
    this.orderTypeSection = currentStatus === false ? true : false;
    this.cartSection = false;
    this.optionsSection = false;
    this.summarySection = false;
  }

  toggleCartSection(currentStatus) {
    this.cartSection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.optionsSection = false;
    this.summarySection = false;
  }

  toggleOptionsSection(currentStatus) {
    this.optionsSection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.summarySection = false;
  }

  toggleSummarySection(currentStatus) {
    this.summarySection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.optionsSection = false;
  }

  btnToggleCartSection(currentStatus) {
    this.cartSection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.optionsSection = false;
    this.summarySection = false;
  }
  btnToggleOptionsSection(currentStatus) {
    this.optionsSection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.summarySection = false;
  }
  btnToggleSummarySection(currentStatus) {
    this.summarySection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.optionsSection = false;
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
      .then(({ data: { packageItems, personalShop } }) => {
        this.submitting = false;

        const packItems = {
          id: packageItems[0].id,
          name: data.name,
          quantity: data.quantity,
          price_amount: data.price_amount,
          total_amount: data.quantity * data.price_amount,
        };

        let storeExist = false;
        this.packageData.map((x) => {
          if (x.Store.id === this.data.store_id) {
            storeExist = true;

            return x.PackageItems.push(packItems);
          }

          return null;
        });

        if (storeExist === false) {
          const pkg = {
            id: personalShop.id,
            sub_total: personalShop.sub_total,
            personal_shopper_cost: personalShop.personal_shopper_cost,
            price_amount: personalShop.price_amount,
            Store: {
              id: data.store_id,
              name: this.Stores.model,
            },
            PackageItems: [{
              id: packageItems[0].id,
              name: data.name,
              quantity: data.quantity,
              price_amount: data.price_amount,
              total_amount: data.quantity * data.price_amount,
            }],
          };
          this.packageData.push(pkg);
        }

        this.calculateAmount(this.packageData);

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
    const c = confirm;
    const ok = c('Are you sure? Deleting your item');
    if (!ok) return null;

    return this.$http
      .delete(`/packages/personalShopperPackage/${item.package_id}/item/${item.id}`)
      .then(({ data: packageItems }) => {
        this.packageData = packageItems;
        this.packageOptions = packageItems;
        this
          .toaster
          .pop('success', 'Item Deleted Successfully.', '');
      });
  }

  updatePackageOption() {
    const data = _.map(this.packageOptions, (item) =>
      _.pick(item, this.packageFields)
    );

    this.$http
      .put('/packages/0?type=psCustomerSide', data)
      .then(({ data: packageItems }) => {
        this.packageOptions = packageItems;
        this.calculateAmount(packageItems);
        this
          .toaster
          .pop('success', 'Additional Options Updated Successfully.', '');
      });
  }

  calculateAmount(data) {
    this.saleTax = 0;
    this.deliveryCharge = 0;
    this.personalShopperCost = 0;
    this.itemTotalCost = 0;
    this.totalAmount = 0;

    data.forEach((item) => {
      const pkg = _.pick(item, this.packageFields);
      this.saleTax += pkg.sales_tax || 0;
      this.deliveryCharge += pkg.delivery_charge || 0;
      this.personalShopperCost += pkg.personal_shopper_cost || 0;
      this.itemTotalCost += pkg.price_amount || 0;
      this.totalAmount += pkg.sub_total;
    });
  }

  makePayment() {
    const id = this.packageData.map(x => x.id);

    this.$state.go('transaction.create', {
      id,
      amount: this.totalAmount,
      object_id: id.toString(),
      customer_id: this.Session.read('userinfo').id,
      axis_banned: false,
      type: 'ps',
    });
  }
}

angular
  .module('uiGenApp')
  .controller('CreateController', CreateController);

