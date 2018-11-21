class AddCommentController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, toaster, id, index) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Session = Session;
    this.id = id;
    this.index = index;
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

  open(index, id) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/add-comments/add-comments.html',
      controller: AddCommentController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        index: () => index,
        id: () => id,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('AddComment', AddComment);
