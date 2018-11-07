
class PhotosController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, packageDetail, index, toaster, URLS,
    $window, CONFIG) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.$window = $window;
    this.URLS = URLS;
    this.CONFIG = CONFIG;
    this.Session = Session;
    this.pkg = packageDetail;
    this.index = index;
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

    this.standardPhotoRequestSubmit = false;
    this.advancedPhotoRequestSubmit = false;
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
    this.PACKAGE_STATE_IDS = this.CONFIG.PACKAGE_STATE_IDS;
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

  continueStandard() {
    this.standardPhotoRequestSubmit = true;
    this.advancedPhotoRequest = false;
  }

  continueAdditional() {
    this.advancedPhotoRequestSubmit = true;
    this.standardPhotoRequest = false;
  }

  requestStandard() {
    this.data = {
      type: 'standard_photo',
      state_id: this.PACKAGE_STATE_IDS.STANDARD_PHOTO_REQUEST,
      comments: 'Standard Photo Requested',
    };
    this.$http
      .put(`/packages/${this.pkg.id}/state`, this.data)
      .then(() => {
        this.showAdditional = true;
        this.showStandard = true;
        this.success = true;
        this.standardRequest = false;
        this.additionalRequest = false;
        this.photoList = true;
        this
          .toaster
          .pop('success', 'Standard Photo Requested');
        this.submitting = false;
        this.standardPhotoRequestSubmit = false;
        this.standardRequested = true;
        const data = '';
        if ((this.standardRequested && this.advancedRequested) &&
          (this.slidesAdvanced && this.slidesStandard)) {
          this.displayBoth();
        } else if (this.standardRequested && !this.advancedRequested && (this.slidesStandard)) {
          this.displayStandard();
        } else if (!this.standardRequested && this.advancedRequested && (this.slidesAdvanced)) {
          this.displayAdvanced();
        } else {
          this.$window.location.reload(true);
        }
        this.standardPhotoRequestSubmit = false;
        this.$uibModalInstance.close(Object.assign(data, { id: this.pkg.id, type: 'standard' }));
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
    this.showStandard = true;
    this.success = true;
    this.standardRequest = false;
    this.additionalRequest = false;
    this.photoList = true;
    this.data = {
      type: 'advanced_photo',
      state_id: this.PACKAGE_STATE_IDS.ADVANCED_PHOTO_REQUEST,
      comments: 'Advanced Photo Requested',
    };
    this.$http
      .put(`/packages/${this.pkg.id}/state`, this.data)
      .then(() => {
        this
          .toaster
          .pop('success', 'Advanced Photo Requested');
        this.submitting = false;
        this.advancedRequested = true;
        const data = '';
        this.$uibModalInstance.close(Object.assign(data, { id: this.pkg.id, type: 'advanced' }));
        if ((this.standardRequested && this.advancedRequested) &&
          (this.slidesAdvanced && this.slidesStandard)) {
          this.displayBoth();
        } else if (this.standardRequested && !this.advancedRequested && (this.slidesStandard)) {
          this.displayStandard();
        } else if (!this.standardRequested && this.advancedRequested && (this.slidesAdvanced)) {
          this.displayAdvanced();
        } else {
          this.$window.location.reload(true);
        }
        this.advancedPhotoRequestSubmit = false;
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

class PhotoService {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open(index, packageDetail) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/photos/photos.html',
      controller: PhotosController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        index: () => index,
        packageDetail: () => packageDetail,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('PhotoService', PhotoService);
