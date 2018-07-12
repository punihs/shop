angular.module('uiGenApp')
  .controller('AddFollowerController', function AddFollowerCtrl($uibModalInstance, FollowerData, ApplicantId, Restangular) {
    const vm = this;
    vm.FollowerData = FollowerData;
    vm.ApplicantId = ApplicantId;
    vm.newEmails = [];
    vm.addNewFollower = function addNewFollower() {
      const curVal = vm.emailTobeAdded;

      const found = vm.FollowerData.some(el => el.email_id === curVal);

      const foundNew = vm.newEmails.some(el => el === curVal);

      if (!found || !foundNew) vm.newEmails.push(curVal);
    };

    vm.ok = function ok() {
      Restangular
        .one('applicants', vm.ApplicantId)
        .all('followers')
        .post(vm.newEmails)
        .then(() => $uibModalInstance.close(true));
    };

    vm.cancel = () => $uibModalInstance.dismiss('cancel');
  });
