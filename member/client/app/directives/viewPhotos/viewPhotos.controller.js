class ViewPhotosController {
  constructor($uibModalInstance, $http, packageDetail, $state, URLS, toaster, $window) {
    this.pkg = packageDetail;
    this.packagePhotos = '';
    this.$state = $state;
    this.$window = $window;
    this.$http = $http;
    this.URLS = URLS;
    this.toaster = toaster;
    this.standardId = '1';
    this.advancedId = '2';
    this.photoRequestLength = packageDetail.PhotoRequests.length;
    this.standardPhotoRequest = true;
    this.advancedPhotoRequest = true;
    this.photoTypeStandard = this.pkg.PhotoRequests.map(x => x.type === this.standardId);
    this.photoTypeAdvanced = this.pkg.PhotoRequests.map(x => x.type === this.advancedId);

    this.standardExits = false;
    this.advancedExits = false;
    if (this.photoTypeStandard.includes(true)) {
      this.standardExits = true;
    }
    if (this.photoTypeAdvanced.includes(true)) {
      this.advancedExits = true;
    }

    this.standardPhoto = false;
    this.advancedPhoto = false;
    this.advanceStandardRequest = false;
    this.$uibModalInstance = $uibModalInstance;
    this.slides = this.pkg.PackageItems;
    this.slidesAdvancedObject = this.pkg.PackageItems
      .filter(x => x.object_advanced);

    this.slidesStandardObject = this.pkg.PackageItems
      .filter(x => x.object);
    if (this.slidesStandardObject.length) {
      this.slidesStandard = true;
    } else {
      this.slidesStandard = false;
    }
    if (this.slidesAdvancedObject.length) {
      this.slidesAdvanced = true;
    } else {
      this.slidesAdvanced = false;
    }

    this.standardRequested = null;
    this.advancedRequested = null;

    this.$onInit();
  }

  $onInit() {
    if (this.photoRequestLength || this.slides.length) {
      if ((this.standardExits && this.advancedExits) ||
        (this.standardRequested && this.advancedRequested)) {
        this.displayBoth();
      } else if ((this.standardExits &&
        !this.advancedExits) ||
        (this.standardRequested && !this.advancedRequested)) {
        this.displayStandard();
      } else if ((!this.standardExits &&
        this.advancedExits) ||
        (!this.standardRequested && this.advancedRequested)) {
        this.displayAdvanced();
      }
    }
  }
  displayBoth() {
    if (this.slidesAdvanced && this.slidesStandard) {
      this.advanceStandardRequest = true;
      this.standardPhotoRequest = true;
      this.advancedPhotoRequest = true;
      this.standardPhoto = true;
      this.advancedPhoto = true;
    } else if (!this.slidesAdvanced && this.slidesStandard) {
      this.displayStandard(false);
      this.advancedAlreadyRequested = true;
      this.advancedPhotoRequest = false;
    } else if (this.slidesAdvanced && !this.slidesStandard) {
      this.displayAdvanced(false);
      this.standardAlreadyRequested = true;
    } else if (this.slidesAdvanced === false && this.slidesStandard === false) {
      this.standardAlreadyRequested = true;
      this.advancedAlreadyRequested = true;
      this.advancedPhotoRequest = false;
      this.standardPhotoRequest = false;
      this.advancedPhotoRequest = false;
      this.standardPhoto = false;
      this.advancedPhoto = false;
    }
  }

  displayStandard(standardAlreadyRequested) {
    if (this.slidesStandard) {
      this.advanceStandardRequest = false;
      this.standardPhotoRequest = false;
      this.advancedPhotoRequest = true;
      this.standardPhoto = true;
      this.advancedPhoto = false;
      this.standardAlreadyRequested = standardAlreadyRequested;
    } else {
      this.standardAlreadyRequested = true;
    }
  }

  displayAdvanced(advancedAlreadyRequested) {
    if (this.slidesAdvanced) {
      this.advanceStandardRequest = false;
      this.standardPhotoRequest = true;
      this.advancedPhotoRequest = false;
      this.standardPhoto = false;
      this.advancedPhoto = true;
      this.advancedAlreadyRequested = advancedAlreadyRequested;
    } else {
      this.advancedAlreadyRequested = true;
    }
  }

  showAdvancedPhoto() {
    if ((this.standardExits && this.advancedExits) ||
      (this.standardRequested && this.advancedRequested)) {
      this.advanceStandardRequest = true;
      this.advancedPhotoRequest = true;
      this.advancedPhoto = true;
      this.standardPhotoRequest = false;
      this.standardPhoto = false;
    }
  }

  showStandardPhoto() {
    if ((this.standardExits && this.advancedExits) ||
      (this.standardRequested && this.advancedRequested)) {
      this.advanceStandardRequest = true;
      this.advancedPhotoRequest = false;
      this.advancedPhoto = true;
      this.standardPhotoRequest = true;
      this.standardPhoto = true;
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
}

angular.module('uiGenApp')
  .controller('ViewPhotosController', ViewPhotosController);
