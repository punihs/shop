class ProfileController {
  constructor(
    Page, $state, $stateParams, $http, toaster, URLS
  ) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.URLS = URLS;

    this.Number = Number;
    this.submitting = false;
    this.data = {};
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Membership Profile');

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

    this.getMe();
  }

  getMe() {
    this
      .$http
      .get('/users/me')
      .then(({ data: me }) => {
        this.data = me;
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

  create(profileForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(profileForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    return this.$http
      .put('/users/me', data)
      .then(() => {
        this.submitting = false;
        this
          .toaster
          .pop('success', 'Profile Updated Successfully.', '');
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        profileForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem creating address. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('ProfileController', ProfileController);

