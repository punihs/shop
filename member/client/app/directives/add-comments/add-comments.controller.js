class AddcommentCtrl {
  constructor($uibModalInstance, toaster, $http, $state, id) {
    this.$uibModalInstance = $uibModalInstance;
    this.toaster = toaster;
    this.$http = $http;
    this.$state = $state;
    this.id = id;
    this.data = {};
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
  saveNote() {
    this.submitting = true;
    this.$http
      .put(`/packages/${this.id}/addNote`, this.data)
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
  .controller('AddcommentCtrl', AddcommentCtrl);
