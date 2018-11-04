class AddressesCreateController {
  constructor(
    Page, $state, $stateParams, $http, toaster
  ) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.submitting = false;
    this.data = {};
    this.$onInit();
  }

  $onInit() {
    this.EDIT = this.$stateParams.id;
    this.TITLE = `${this.EDIT ? 'Edit' : 'Add New'} Shipping Address`;
    this.Page.setTitle(this.TITLE);

    this.Country = {
      select: ($item) => {
        this.data.country_id = $item.id;
        this.Country.model = $item.name;
      },

      setId: () => {
        const [country] = (this.Country.lastSearchResults || [])
          .filter(item => (item.name.toLowerCase() === this.Country.model.toLowerCase()));
        if (country) this.Country.select(country);
      },

      blur: () => {
        if (!this.Country.lastSearchResults) {
          return this.Country.get(this.Country.model).then(() => this.Country.setId());
        }
        return this.Country.setId();
      },

      get: (search) => this.$http
        .get('/search', {
          params: {
            type: 'Country',
            q: search,
          },
        })
        .then(({ data: { items } }) => {
          this.Country.lastSearchResults = items;
          return items;
        }),

      noResults: false,
      loadingCountry: false,
    };

    if (this.EDIT) this.getAddress();
  }

  getAddress() {
    this
      .$http
      .get(`/addresses/${this.$stateParams.id}`)
      .then(({ data: address }) => {
        this.data = address;
        this.Country.model = address.Country.name;
      });
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

  create(newAddressForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newAddressForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    const { id } = this.$stateParams;
    return this.$http[id ? 'put' : 'post'](`/addresses${id ? `/${id}` : ''}`, data)
      .then(() => {
        this.submitting = false;

        this
          .toaster
          .pop('success', `${data.city} Shipping Address Created Successfully.`, '');

        return this.$state.go('users.address-list');
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newAddressForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();


        this
          .toaster
          .pop('error', 'There was problem creating address. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('AddressesCreateController', AddressesCreateController);
