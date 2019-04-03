class PackageBulkController {
  constructor(Page, $state, $stateParams, $http, toaster, customer, pkg, Session) {
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
    this.data = pkg || {};
    this.$onInit();
  }

  $onInit() {
    this.customer.create = this.$stateParams.create;
    this.invoice = [];
    this.focus('store_id');
    this.EDIT = !!this.$stateParams.packageId && this.$stateParams.packageId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode') || true);
    this.TITLE = ' Bulk Package Upload';
    this.Page.setTitle(this.TITLE);
    this.getPopularStores();

    this.Store = {
      select: ($item) => {
        this.data.store_id = $item.id;
        this.Store.model = $item.name;
      },

      setId: () => {
        if (!this.Store.lastSearchResults) return this.Store.lastSearchResults;
        const [store] = (this.Store.lastSearchResults || [])
          .filter(item => (item.name.toLowerCase() === this.Store.model.toLowerCase()));
        if (store) return this.Store.select(store);
        return null;
      },

      blur: () => {
        if (!this.Store.lastSearchResults) {
          return this.Store.get(this.Store.model).then(() => this.Store.setId());
        }
        return this.Store.setId();
      },

      get: search => this.$http
        .get('/search', {
          params: {
            type: 'Store',
            q: search,
          },
        })
        .then(({ data: { items } }) => {
          this.Store.lastSearchResults = items;
          return items;
        }),

      noResults: false,
      loadingStore: false,
    };

    this.getPackages();
  }

  reset(newPackageForm) {
    this.data = {};
    this.Store.model = '';
    newPackageForm.$setPristine();
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

  addNewPackage(newPackageForm) {
    this.create(newPackageForm);
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

  getPackages() {
    this.$http
      .get('/packages/bulkIndex', { params: { customer_id: this.$stateParams.id } })
      .then(({ data: { packagesList } }) => {
        this.invoice = packagesList;
      });
  }

  create(newPackageForm) {
    if (!this.data.store_id) {
      return this
        .toaster
        .pop('error', 'Store not found');
    }
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newPackageForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);


    const { packageId, id: customerId } = this.$stateParams;
    data.customer_id = customerId;

    const allowed = [
      'is_doc',
      'store_id',
      'invoice_code',
      'virtual_address_code',
      'weight',
      'price_amount',
      'customer_id',
      'content_type',
      'is_restricted_item',
    ];

    const method = packageId ? 'put' : 'post';

    return this
      .$http[method](`/packages${packageId ? `/${packageId}` : ''}`, _.pick(data, allowed))
      .then(({ data: pkg }) => {
        this.pkg = pkg;
        const { id, Locker = {} } = pkg;
        this.submitting = false;
        this.invoice.push({ invoice_code: this.data.invoice_code, id });

        if (!this.customer.Locker) this.customer.Locker = Locker;
        this
          .toaster
          .pop('success', `#${id} Package Created Successfully.`, '');
        this.data.invoice_code = '';
      })
      .catch((err) => {
        if (err.status === 403) {
          this
            .toaster
            .pop('error', 'You can not add Packages to Admin Accounts');
        } else {
          this
            .toaster
            .pop('error', 'There was problem creating package. Please contact Shoppre team.');
        }

        this.submitting = false;

        const { field } = err.data;
        newPackageForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('PackageBulkController', PackageBulkController);

