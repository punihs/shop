class AddcommentCtrl {
  constructor($uibModalInstance, toaster, $http, $state, id, index) {
    this.$uibModalInstance = $uibModalInstance;
    this.toaster = toaster;
    this.$http = $http;
    this.$state = $state;
    this.index = index;
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
        this.$uibModalInstance.close(Object.assign(this.data.notes));
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
class AddComment {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open(id, index) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/add-comments/add-comments.html',
      controller: AddcommentCtrl,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        id: () => id,
        index: () => index,
      },

    });
  }
}

angular.module('uiGenApp')
  .service('AddComment', AddComment);
