class DownloadResumeCtrl {
  constructor($uibModalInstance, offer, id, value, toaster, $http, $state) {
    this.$uibModalInstance = $uibModalInstance;
    this.offer = offer;
    this.toaster = toaster;
    this.value = value;
    this.$http = $http;
    this.$state = $state;
    this.data = [];
    this.id = id;
    console.log(value);
    this.data = {
      message1: '',
      message2: '',
      return_pickup: '',
      return_shoppre: '',
    };
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
  submitRequest() {
    this.submitting = true;
    this.$http
      .put(`/packages/${this.id}/${this.value}`, this.data)
      .then(({ data: { message } }) => {
        console.log(this.data);
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
  .controller('DownloadResumeCtrl', DownloadResumeCtrl);
