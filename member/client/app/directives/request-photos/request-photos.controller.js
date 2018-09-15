class RequestPhotosController {
  constructor($uibModalInstance, $http, packageDetail, $state, URLS) {
    this.pkg = packageDetail;
    this.packagePhotos = '';
    this.$state = $state;
    this.$http = $http;
    this.URLS = URLS;
    this.basicPhotoRequest = true;
    this.advancedPhotoRequest = true;
    this.photoType = this.pkg.PhotoRequests.map(x => x.type);
    this.basicPhoto = false;
    this.advancedPhoto = false;

    this.basicPhotoRequestSubmit = false;
    this.advancedPhotoRequestSubmit = false;
    this.advanceBasicRequest = false;
    this.photoRequestLength = packageDetail.PhotoRequests.length;
    this.$uibModalInstance = $uibModalInstance;
    this.slides = this.pkg.PackageItems;
    this.standardId = '1';
    this.advancedId = '2';
    this.$onInit();
  }

  $onInit() {
    if (this.photoRequestLength >= 1) {
      if (this.photoType.includes(this.standardId) && this.photoType.includes(this.advancedId)) {
        this.advanceBasicRequest = true;
        this.basicPhotoRequest = true;
        this.advancedPhotoRequest = true;
        this.basicPhoto = true;
        this.advancedPhoto = true;
      } else if (this.photoType.includes(this.standardId) &&
        !this.photoType.includes(this.advancedId)) {
        this.advanceBasicRequest = false;
        this.basicPhotoRequest = false;
        this.advancedPhotoRequest = true;
        this.basicPhoto = true;
        this.advancedPhoto = false;
      } else if (!this.photoType.includes(this.standardId) &&
        this.photoType.includes(this.advancedId)) {
        this.advanceBasicRequest = false;
        this.basicPhotoRequest = true;
        this.advancedPhotoRequest = false;
        this.basicPhoto = false;
        this.advancedPhoto = true;
      }
    }
  }

  showAdvancedPhoto() {
    if (this.photoType.includes(this.standardId) && this.photoType.includes(this.advancedId)) {
      this.advanceBasicRequest = true;
      this.advancedPhotoRequest = true;
      this.advancedPhoto = true;
      this.basicPhotoRequest = false;
      this.basicPhoto = false;
    }
  }

  showBasicPhoto() {
    if (this.photoType.includes(this.standardId) && this.photoType.includes(this.advancedId)) {
      this.advanceBasicRequest = true;
      this.advancedPhotoRequest = false;
      this.advancedPhoto = true;
      this.basicPhotoRequest = true;
      this.basicPhoto = true;
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }

  continueBasic() {
    this.basicPhotoRequestSubmit = true;
    this.advancedPhotoRequest = false;
  }
  continueAdditional() {
    this.advancedPhotoRequestSubmit = true;
    this.basicPhotoRequest = false;
  }
  requestBasic() {
    this.data = {
      type: 'basic_photo',
    };
    this.$http
      .put(`/packages/${this.pkg.id}/photoRequests`, this.data)
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
      .put(`/packages/${this.pkg.id}/photoRequests`, this.data)
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
  .controller('RequestPhotosController', RequestPhotosController);
