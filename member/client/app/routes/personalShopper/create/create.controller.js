class CreateController {
  constructor($http, Page, Session, $state, toaster, $stateParams, S3, URLS, $window) {
    this.$http = $http;
    this.Page = Page;
    this.Session = Session;
    this.toaster = toaster;
    this.$state = $state;
    this.S3 = S3;
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.URLS = URLS;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Shipment Request Create');
    this.uploadingPhotos = false;
    this.file = {};
    this.orderTypeSection = true;
    this.loading = false;
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
      'buy_if_price_changed',
      'seller_invoice',
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
      'Cancel if the cost is increased',
    ];

    if (this.$stateParams.type === 'COD') {
      this.self_purchased = true;
    } else if (this.$stateParams.type === 'PS') {
      this.assisted_purchased = true;
    }
  }

  startUpload(ctrl, file) {
    ctrl.S3.uploadCod(file, ctrl.data, ctrl);
  }

  getPackageItem() {
    this.loading = true;
    const customerId = this.Session.read('userinfo').id;
    let shopperType = '';

    if (this.self_purchased) {
      shopperType = 'cod';
    } else if (this.assisted_purchased) {
      shopperType = 'ps';
    }
    this.$http
      .get(`/packages/0/items?type=psCustomerSide&customerId=${customerId}&shopperType=${shopperType}`)
      .then(({ data }) => {
        this.packageData = data;
        this.packageOptions = data;
        this.calculateAmount(data);
        this.loading = false;
      });
  }

  orderTypeSelected() {
    if (!this.self_purchased && !this.assisted_purchased) {
      this
        .toaster
        .pop('error', 'Please select personal shopper type.', '');
      return false;
    }
    return true;
  }

  toggleOrderTypeSection(currentStatus) {
    this.orderTypeSection = currentStatus === false ? true : false;
    this.cartSection = false;
    this.optionsSection = false;
    this.summarySection = false;
  }

  toggleCartSection(currentStatus) {
    if (!this.orderTypeSelected()) {
      return false;
    }
    this.cartSection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.optionsSection = false;
    this.summarySection = false;

    if (this.cartSection) {
      this.getPackageItem();
    }
    return null;
  }

  toggleOptionsSection(currentStatus) {
    if (!this.orderTypeSelected()) {
      return false;
    }
    this.optionsSection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.summarySection = false;
    if (this.optionsSection) {
      this.getPackageItem();
    }
    return null;
  }

  toggleSummarySection(currentStatus) {
    if (!this.orderTypeSelected()) {
      return false;
    }
    this.summarySection = currentStatus === false ? true : false;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.optionsSection = false;

    if (this.summarySection) {
      this.getPackageItem();
    }
    return null;
  }

  btnToggleCartSection(currentStatus) {
    if (!this.orderTypeSelected()) {
      return false;
    }
    this.cartSection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.optionsSection = false;
    this.summarySection = false;
    if (this.cartSection) {
      this.getPackageItem();
    }
    return null;
  }
  btnToggleOptionsSection(currentStatus) {
    this.optionsSection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.summarySection = false;

    if (this.optionsSection) {
      this.getPackageItem();
    }
  }
  btnToggleSummarySection(currentStatus) {
    let price = false;
    if (this.packageOptions !== null) {
      this.packageOptions.forEach((x) => {
        if (!x.buy_if_price_changed && this.assisted_purchased) {
          price = true;

          return this
            .toaster
            .pop('error', 'Please Select Choice of Would it be OK to' +
              ' buy it if when we shop, the item cost has gone up by', '');
        }
        return null;
      });
    }

    if (price) {
      return;
    }

    this.summarySection = currentStatus === false ? true : true;
    this.orderTypeSection = false;
    this.cartSection = false;
    this.optionsSection = false;

    if (this.summarySection) {
      this.getPackageItem();
    }
  }

  create(newItemForm) {
    let shopperType = '';

    if (this.self_purchased) {
      shopperType = 'cod';
    } else if (this.assisted_purchased) {
      shopperType = 'ps';
    }
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newItemForm);

    const data = Object.assign({ }, this.data);
    Object.assign(data, { shopperType });
    if (!form) return (this.submitting = false);
    this.$http
      .post('/packages/personalShopperPackage', data)
      .then(({ data: { packageItems, personalShop, hostname, storeId } }) => {
        this.submitting = false;

        let storeExist = false;
        if (this.packageData) {
          this.packageData.map((x) => {
            if (x.Store.id === storeId) {
              storeExist = true;

              return Object.assign(x, { PackageItems: packageItems });
            }

            return null;
          });
        }

        if (storeExist === false) {
          const pkg = {
            id: personalShop.id,
            sub_total: personalShop.sub_total,
            personal_shopper_cost: personalShop.personal_shopper_cost,
            price_amount: personalShop.price_amount,
            Store: {
              id: storeId,
              name: hostname,
            },
            PackageItems: [{
              id: packageItems[0].id,
              name: data.name,
              quantity: data.quantity,
              price_amount: data.price_amount,
              total_amount: data.quantity * data.price_amount,
            }],
          };

          if (!this.packageData) {
            this.packageData = [];
          }

          this.packageData.push(pkg);
        }

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
    newItemForm.$setPristine();
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
  }

  deleteItem(item, psPackage) {
    const c = confirm;
    const ok = c('Are you sure? Deleting your item');
    if (!ok) return null;

    return this.$http
      .delete(`/packages/personalShopperPackage/${psPackage.id}/item/${item.id}`)
      .then(({ data: packageItems }) => {
        this.packageData = packageItems;
        this.packageOptions = packageItems;

        this.getPackageItem();

        this
          .toaster
          .pop('success', 'Item Deleted Successfully.', '');
      });
  }

  updatePackageOption() {
    this.clickUpload = true;
    let price = false;
    let shopperType = '';

    if (this.self_purchased) {
      shopperType = 'cod';
    } else if (this.assisted_purchased) {
      shopperType = 'ps';
    }

    if (this.packageOptions !== null) {
      this.packageOptions.forEach((x) => {
        if (!x.buy_if_price_changed && this.assisted_purchased) {
          price = true;

          return this
            .toaster
            .pop('error', 'Please Select Choice of Would it be OK to buy it if when we shop, the item cost has gone up by and save', '');
        }
        if (!x.seller_invoice && this.self_purchased) {
          price = true;

          return this
            .toaster
            .pop('error', 'Please Upload invoice of your order and save', '');
        }

        return null;
      });
    }

    if (price) {
      return;
    }

    const data = _.map(this.packageOptions, (item) =>
      _.pick(item, this.packageFields)
    );

    Object.assign(data, { seller_invoice: data.object });

    this.$http
      .put(`/packages/0?type=psCustomerSide&shopperType=${shopperType}`, data)
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

    if (data !== null) {
      data.forEach((item) => {
        const pkg = _.pick(item, this.packageFields);
        this.saleTax += pkg.sales_tax || 0;
        this.deliveryCharge += pkg.delivery_charge || 0;
        this.personalShopperCost += pkg.personal_shopper_cost || 0;
        this.itemTotalCost += pkg.price_amount || 0;
        this.totalAmount += pkg.sub_total || 0;
      });
    }
  }

  makePayment() {
    let shopperType = '';

    if (this.self_purchased) {
      shopperType = 'cod';
    } else if (this.assisted_purchased) {
      shopperType = 'ps';
    }

    if (this.loading) {
      this
        .toaster
        .pop('error', 'Loading please Wait');
    }

    const id = this.packageData.map(x => x.id);

    const customerId = this.Session.read('userinfo').id;
    const url = `${this.URLS.PAY}/access/login?id=${id}&amount=${this.totalAmount}&object_id=${id.toString()}&customer_id=${customerId}&axis_banned=false&type=${shopperType}`;
    this.$window.location.href = url;
  }
}

angular
  .module('uiGenApp')
  .controller('CreateController', CreateController);

