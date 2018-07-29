
class ChangeStateController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, pkg, Session, stateId, moment, customerId) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.pkg = pkg;
    this.Session = Session;
    this.stateId = stateId;
    this.moment = moment;
    this.customerId = customerId;
  }

  $onInit() {
    this.states = this.Session.read('states');
    this.today = new Date();
    this.ui = { checking: false };
    this.submitting = false;
    this.exData = {
      scheduled_on_time: this.moment()
        .startOf('day')
        .set('hour', 10),
    };
  }

  ok() {
    if (this.submitting) return;
    this.submitting = true;
    this
      .$http
      .put(`/packages/${this.pkg.id}/state`, this.data)
      .then(() => {
        this.$uibModalInstance.close(this.data);
        this.submitting = false;
        return location.reload(true);
      })
      .catch((response) => {
        this.submitting = false;
        this.changeStateError = response.error;
      });
  }
}

class ChangeStateService {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  $onInit() {
    this.states = this.Session.read('states');
  }

  open(pkg, stateId, customerId) {
    const modalInstance = this.$uibModal.open({
      templateUrl: 'app/directives/change-state/change-state.html',
      controller: ChangeStateController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        pkg: () => pkg,
        stateId: () => stateId,
        customerId: () => customerId,
      },
    });

    modalInstance
      .result
      .then((data) => {
        this.pkg.state_id = data.state_id;
        this.pkg.state_name = this.states[data.state_id].action;
      });
  }
}

angular.module('uiGenApp')
  .service('ChangeState', ChangeStateService);
