class AnnouncementModalController {
  constructor($uibModalInstance, announcement) {
    this.$uibModalInstance = $uibModalInstance;
    this.data = announcement;
  }
}

angular.module('uiGenApp')
  .controller('AnnouncementModalController', AnnouncementModalController);
