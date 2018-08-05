
class AddAddressController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
  }

  $onInit() {
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

    // if (this.EDIT) this.getAddress();
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
      .then(({ data: { id: aid } }) => {
        this.submitting = false;
        this.$uibModalInstance.close(Object.assign(data, { id: aid }));

        this
          .toaster
          .pop('success', `${data.city} Shipping Address Created Successfully.`, '');

        return this.$state.go('accounts.address-list');
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
}

class AddAddress {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }


  open(customerId) {
    console.log({ customerId });
    return this.$uibModal.open({
      templateUrl: 'app/directives/address/address.html',
      controller: AddAddressController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        customerId: () => customerId,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('AddAddress', AddAddress);
