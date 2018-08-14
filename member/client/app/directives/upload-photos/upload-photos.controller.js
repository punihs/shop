class UploadphotosCtrl {
  constructor($uibModalInstance, $http, id, $state, $scope) {
    this.id = id;
    this.$state = $state;
    this.$http = $http;
    this.$uibModalInstance = $uibModalInstance;
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;
    this.slides = [
      { id: 1, image: 'assets/images/item-2.jpg' },
      { id: 2, image: 'assets/images/item-2.jpg' },
      { id: 3, image: 'assets/images/item-2.jpg' },
      { id: 4, image: 'assets/images/item-2.jpg' },
      { id: 5, image: 'assets/images/item-2.jpg' },
      { id: 6, image: 'assets/images/item-2.jpg' },
    ];
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
  checkPhotos() {
    this.showAdditional = false;
    this.photoExist = false;
  }
  requestBasic() {
    this.data = {
      type: 'basic_photo',
    };
    this.$http
      .put(`/packages/${this.id}/photoRequests`, this.data)
      .then(({ data: { message } }) => {
        this.showAdditional = true;
        this.showBasic = true;
        this.success = true;
        this.basicRequest = false;
        this.additionalRequest = false;
        this.photoList = true;
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
    this.showBasic = true;
    this.success = true;
    this.basicRequest = false;
    this.additionalRequest = false;
    this.photoList = true;
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
