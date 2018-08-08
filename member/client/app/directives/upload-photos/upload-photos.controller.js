class UploadphotosCtrl {
  constructor($uibModalInstance, $http, id, $state) {
    this.id = id;
    this.$state = $state;
    this.$http = $http;
    this.$uibModalInstance = $uibModalInstance;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }

  continueBasic() {
    this.showAdditional = false;
    this.showBasic = true;
    this.success = false;
    this.basicRequest = true;
    this.additionalRequest = false;
  }
  continueAdditional() {
    this.showAdditional = true;
    this.showBasic = false;
    this.success = false;
    this.basicRequest = false;
    this.additionalRequest = true;
  }
  requestBasic() {
    this.data = {
      type: 'basic_photo',
    };
    this.$http
      .put(`/packages/${this.id}/photoRequests`, this.data)
      .then(({ data: { message } }) => {
        this.showAdditional = false;
        this.showBasic = true;
        this.success = true;
        this.basicRequest = false;
        this.additionalRequest = false;
        this
          .toaster
          .pop('success', message);
        this.submitting = false;
        this.$state.reload();
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
        this.submitting = false;
        this.error = err.data;
      });
  }
  requestAdvanced() {
    this.showAdditional = true;
    this.showBasic = false;
    this.success = true;
    this.basicRequest = false;
    this.additionalRequest = false;
    this.data = {
      type: 'advanced_photo',
    };
    this.$http
      .put(`/packages/${this.id}/photoRequests`, this.data)
      .then(({ data: { message } }) => {
        this
          .toaster
          .pop('success', message);
        this.submitting = false;
        this.$state.reload();
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
        this.submitting = false;
        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('UploadphotosCtrl', UploadphotosCtrl);
