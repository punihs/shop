class DownloadResumeCtrl {
  constructor($uibModalInstance, offer, id, value, toaster, $http, $state, $stateParams) {
    this.$uibModalInstance = $uibModalInstance;
    this.offer = offer;
    this.toaster = toaster;
    this.value = value;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.data = [];
    this.id = id;
    this.data = {
      message1: '',
      message2: '',
      return_pickup: '',
      return_shoppre: '',
    };
    this.data.return_pickup = 1;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
  submitSpecialoffer(newOfferForm) {
    this.submitting = true;
    const form = this.validateForm(newOfferForm);
    if (!form) return (this.submitting = false);
    this.$http
      .put(`/packages/${this.id}/${this.value}`, this.data)
      .then(({ data: { message } }) => {
        this.submitting = false;
        this
          .toaster
          .pop('success', message);
        this.$uibModalInstance.close();
        this.$state.reload();
      })
      .catch((err) => {
        this.submitting = false;
        newOfferForm[err.data.field].$setValidity('required', false);
        this
          .toaster
          .pop('error', err.data.message);
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

angular.module('uiGenApp')
  .controller('DownloadResumeCtrl', DownloadResumeCtrl);
