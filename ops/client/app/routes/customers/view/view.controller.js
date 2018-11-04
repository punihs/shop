class CustomerViewController {
  constructor($http, Page, $uibModal, toaster, $state, $stateParams, URLS, moment) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.$state = $state;
    this.moment = moment;
    this.$stateParams = $stateParams;
    this.URLS = URLS;
    this.id = this.$stateParams.id;
    this.Number = Number;
    this.submitProfile = false;
    this.submitWallet = false;
    this.submitLoyalty = false;
    this.editWallet = false;
    this.editWalletId = false;
    this.editWalletIndex = null;
    this.editLoyalty = false;
    this.editLoyaltyIdId = false;
    this.editLoyaltyIndex = null;
    this.data = {};
    this.transactions = {};
    this.loyaltyHistories = {};
    this.loyaltyPoints = {};
    this.shippingPreference = {};

    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Address Book');
    this
      .$http
      .get(`/addresses?id=${this.id}`)
      .then(({ data }) => {
        this.addresses = data;
      });
    this.Page.setTitle('Customer Profile');

    this.Country = {
      select: ($item) => {
        this.data.country_id = $item.id;
        this.Country.model = $item.name;
      },

      get: (search) => this.$http
        .get('/search', {
          params: {
            type: 'Country',
            q: search,
          },
        })
        .then(({ data: { items } }) => items),

      noResults: false,
      loadingCountry: false,
    };
    this.Page.setTitle('Shipping Preferences');

    this.getMe();
    this.getWalletTransactions();
    this.getLoyaltyRewards();
    this.getShippingPreferences();
  }

  postWallet(walletForm) {
    if (this.submitWallet) return null;
    this.submitWallet = true;
    this.clickUpload = true;

    const form = this.validateForm(walletForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitWallet = false);
    data.customer_id = this.id;
    const allowed = [
      'description',
      'amount',
      'customer_id',
    ];
    const method = this.editWallet ? 'put' : 'post';
    return this
      .$http[method](`/transactions${this.editWallet ? `/${this.editWalletId}` : ''}`,
        _.pick(data, allowed))
      .then(() => {
        if (method === 'post') {
          const walletTransaction = {
            amount: data.amount,
            created_at: Date.now(),
            description: data.description,
          };
          this.transactions.push(walletTransaction);
        } else {
          this.transactions[this.editWalletIndex].amount = data.amount;
          this.transactions[this.editWalletIndex].description = data.description;
        }
        this.submitWallet = false;
        this.editWallet = false;
        const message = method === 'post' ? 'Added' : 'Updated';
        this
          .toaster
          .pop('success', `Wallet Entry ${message} Successfully`);
      })
      .catch((err) => {
        this.submitWallet = false;

        const { field } = err.data;
        walletForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem adding wallet amount. Please contact Shoppre team.');

        this.error = err.data;
      });
  }

  postLoyalty(LoyaltyForm) {
    if (this.submitLoyalty) return null;
    this.submitLoyalty = true;
    this.clickUpload = true;

    const form = this.validateForm(LoyaltyForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitLoyalty = false);
    data.customer_id = this.id;
    const allowed = [
      'description',
      'points',
      'customer_id',
    ];
    const method = this.editLoyalty ? 'put' : 'post';
    return this
      .$http[method](`/loyaltyHistories${this.editLoyalty ? `/${this.editLoyaltyId}` : ''}`,
        _.pick(data, allowed))
      .then(() => {
        if (method === 'post') {
          const loyaltypoints = {
            points: data.points,
            created_at: Date.now(),
            description: data.description,
          };
          this.loyaltyHistories.push(loyaltypoints);
        } else {
          this.loyaltyHistories[this.editLoyaltyIndex].points = data.points;
          this.loyaltyHistories[this.editLoyaltyIndex].description = data.description;
        }
        this.submitLoyalty = false;
        this.editLoyalty = false;
        const message = method === 'post' ? 'Added' : 'Updated';
        this
          .toaster
          .pop('success', `Loyalty Rewards Entry ${message} Successfully`);
      })
      .catch((err) => {
        this.submitLoyalty = false;

        const { field } = err.data;
        LoyaltyForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem adding Loyalty Points. Please contact Shoppre team.');

        this.error = err.data;
      });
  }

  getMe() {
    this
      .$http
      .get(`/users/${this.id}`)
      .then(({ data: me }) => {
        this.data = me;
      });
  }
  getWalletTransactions() {
    // this
    //   .$http
    //   .get(`/transactions?customer_id=${this.id}`)
    //   .then(({ data }) => {
    //     this.transactions = data;
    //   });
  }
  getLoyaltyRewards() {
    // this
    //   .$http
    //   .get(`/loyaltyHistories?customer_id=${this.id}`)
    //   .then(({
    //     data: {
    //       loyaltyHistory, loyaltyPoints,
    //     },
    //   }) => {
    //     this.loyaltyHistories = loyaltyHistory;
    //     this.loyaltyPoints = loyaltyPoints;
    //   })
    //   .catch((err) => {
    //     this
    //       .toaster
    //       .pop('error', err.data.message);
    //   });
  }
  getShippingPreferences() {
    this.$http
      .get(`/shippingPreference/${this.id}`)
      .then(({ data: { preference } }) => {
        this.shippingPreference = preference[0];
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

  update(profileForm) {
    if (this.submitProfile) return null;
    this.submitProfile = true;
    this.clickUpload = true;

    const form = this.validateForm(profileForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitProfile = false);

    return this.$http
      .put(`/users/${this.id}`, data)
      .then(() => {
        this.submitProfile = false;
        this
          .toaster
          .pop('success', 'Profile Updated Successfully.', '');
      })
      .catch((err) => {
        this.submitProfile = false;

        const { field } = err.data;
        profileForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem updating profile details. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
  deleteLoyaltyPoints(customerId, loyaltyId, points, index) {
    this
      .$http
      .delete(`/loyaltyHistories/${loyaltyId}?customer_id=${customerId}&points=${points}`)
      .then(() => {
        this.toaster
          .pop('success', 'Loyalty Points Successfully Deleted');
        return this.loyaltyHistories.splice(index, 1);
      })
      .catch((err) => {
        let message = '';
        message = err.status === 403 ?
          err.data.message : 'There was problem deleting Loyalty Points';
        this.toaster
          .pop('error', message);
      });
  }
  deleteWalletTransaction(customerId, transactionId, amount, type, index) {
    this
      .$http
      .delete(`/transactions/${transactionId}?customer_id=${customerId}&amount=${amount}`)
      .then(() => {
        this.toaster
          .pop('success', 'Wallet Transaction Successfully Deleted');
        return this.transactions.splice(index, 1);
      })
      .catch((err) => {
        let message = '';
        message = err.status === 403 ?
          err.data.message : 'There was problem deleting Wallet Transaction';
        this.toaster
          .pop('error', message);
      });
  }
  editWalletTransaction(customerId, transactionId, amount, description, index) {
    this.editWalletId = transactionId;
    this.editWallet = true;
    this.editWalletIndex = index;
    this.data.description = description;
    this.data.amount = amount;
  }
  editLoyaltyPoints(customerId, loyaltyId, points, description, index) {
    this.editLoyaltyId = loyaltyId;
    this.editLoyalty = true;
    this.editLoyaltyIndex = index;
    this.data.description = description;
    this.data.points = points;
  }
}
angular
  .module('uiGenApp')
  .controller('CustomerViewController', CustomerViewController);
