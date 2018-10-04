
class AddAddressController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, addressId, type, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Session = Session;
    this.addressId = addressId;
    this.type = type;
    this.$onInit();
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
    if (this.type === 'edit') {
      this.getAddress(this.addressId);
    }
  }

  getAddress() {
    this
      .$http
      .get(`/addresses/${this.addressId}`)
      .then(({ data: address }) => {
        this.data = address;
        this.Country.model = address.Country.name;
      });
  }
  create(newAddressForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(newAddressForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    const editId = this.type === 'add' ? '' : this.addressId;
    return this
      .$http[this.type === 'edit' ? 'put' : 'post'](`/addresses${editId}`, data)
      .then(({ data: { id: aid } }) => {
        this.submitting = false;
        this
          .toaster
          .pop('success', `${data.city} Shipping Address ${this.type} Successfull.`, '');
        this.$uibModalInstance.close(Object.assign(data, { id: aid }));
        // return this.$state.go('accounts.address-list');
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
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open(addressId, type) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/address/address.html',
      controller: AddAddressController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        addressId: () => addressId,
        type: () => type,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('AddAddress', AddAddress);
