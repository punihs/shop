class AddcommentCtrl {
  constructor($uibModalInstance) {
    this.$uibModalInstance = $uibModalInstance;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
}

angular.module('uiGenApp')
  .controller('AddcommentCtrl', AddcommentCtrl);
