
class OrderNewController {
  constructor(
    Page, $state, $stateParams, $http, toaster, Upload, S3, URLS
  ) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.submitting = false;
    this.Upload = Upload;
    this.data = {};
    this.S3 = S3;
    this.URLS = URLS;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Create Order');

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

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
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

  reset(newOrderForm) {
    this.data = {};
    newOrderForm.$setPristine();
    this.Stores.model = '';
    this.focus('store_id');
  }

  create(newOrderForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newOrderForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);
    return this.$http
      .post('/orders', data)
      .then(() => {
        this.submitting = false;
        this
          .toaster
          .pop('success', 'Order Created Successfully.', '');

        this.reset(newOrderForm);
      })
      .catch((err) => {
        this.submitting = false;
        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('OrderNewController', OrderNewController);
