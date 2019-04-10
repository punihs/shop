
class PackageBulkController {
  constructor(Page, $state, $stateParams, $http, toaster, Session) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.$ = $;
    this.submitting = false;
    this.$onInit();
  }

  $onInit() {
    this.invoice = [];
    this.focus('store_id');
    this.EDIT = !!this.$stateParams.packageId && this.$stateParams.packageId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode') || true);
    this.TITLE = ' Bulk Package Upload';
    this.Page.setTitle(this.TITLE);
    this.getPopularStores();

    this.data = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];

    // this.Customer.model = 'SHPR';

    this.Customer = {
      select: ($item, $index) => {
        this.data[$index].customer_id = $item.id;
      },
      setId: () => {
        if (!this.Customer.lastSearchResults) return this.Customer.lastSearchResults;
        const [customer] = (this.Customer.lastSearchResults || [])
          .filter(item => (item.name.toLowerCase() === this.Customer.model.toLowerCase()));
        if (customer) return this.Customer.select(customer);
        return null;
      },
      blur: () => {
        if (!this.Customer.lastSearchResults) {
          return this.Customer.get(this.Customer.model).then(() => this.Customer.setId());
        }
        return this.Customer.setId();
      },
      get: search => this.$http
        .get('/search', {
          params: {
            type: 'User',
            q: search,
          },
        })
        .then(({ data: { items } }) => {
          this.Customer.lastSearchResults = items;
          return items;
        }),

      noResults: false,
      loadingUser: false,
    };

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
  }

  addItem() {
    const newItemNo = this.data.length + 1;
    this.data.push({ id: newItemNo });
  }

  removeItem($index) {
    const newItemNo = this.data.length - 1;
    if ( newItemNo !== 0 ) {
      this.data.splice($index, 1);
      console.log('Deleted', this.data);
    }
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

    const data = this.data;
    const packageData = { store_id: this.data.store_id, packages: data };
    // const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    const method = 'post';

    return this
      .$http[method]('/packages/bulkCreate', packageData)
      .then(() => {
        this.submitting = false;
        this
          .toaster
          .pop('success', `# Package Created Successfully.`, '');
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

