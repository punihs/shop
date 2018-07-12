class DriveController {

  constructor($uibModalInstance, toaster, $http, QuarcService, Session) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.toaster = toaster;
    this.limit = 5;
    this.QuarcService = QuarcService;
    this.Session = Session;
  }

  upload() {
    this.$http.post('/clientFiles',
      { type: 'empanelment', file: this.data.file })
      .then(({data: file}) => {
        this.toaster.pop({
          type: 'success',
          body: 'Files uploaded successfully',
          toasterId: 2,
          onHideCallback() {
            this.Session.create('bannerClosedByUser', true)
          }});
        this.$uibModalInstance.close(file);
      })
      .catch(() => {
        this.toaster.pop(this.QuarcService.toast('error', 'Some Error Occurred While uploading files, Please contact QuezX.com'));
      });
  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

angular.module('uiGenApp')
  .controller('DriveController', DriveController);
