class AllocateToController {
  constructor($uibModalInstance, $http, jobid, $uibModal, $state) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.jobid = jobid;
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.getUsers();
    this.isMultiJobAlloc = this.jobid.length > 1;
  }

  getUsers() {
    this.showPreview = false;
    this
      .$http
      .get(`/jobs/${this.jobid}/consultants?allocation=true`)
      .then(({ data: consultants }) => {
        this.consultants = consultants;
      });
  }

  allocate() {
    const userIds = _.map(_.filter(this.consultants, { allocate: true }), 'id');
    const allocations = {
      jobIds: this.jobid,
      consultantIds: userIds,
    };

    this.$http.post('/jobs/manyToManyAllocations', allocations)
      .then(({ data }) => {
        if (data.message === 'success') {
          this.consultants.forEach((consultant) => {
            if (consultant.allocate) consultant.allocated = true;
          });
          this.$uibModalInstance.close();
          this.$state.reload();
        }
      });
  }

  enableApply() {
    this.checked = false;
    this.consultants.forEach((consultant) => {
      if (consultant.allocate) this.checked = true;
    });
  }

  deallocate(consultant) {
    const deallocations = {
      consultantIds: consultant.id,
    };
    this.$http.post(`/jobs/${this.jobid}/deallocate`, deallocations)
      .then(({ data }) => {
        if (data.updated === 1) consultant.allocated = false;
      });
  }

  initials(string) {
    const initials = string.match(/\b(\w)/g);
    if (initials.length > 2) {
      initials.splice(1, initials.length - 2);
    }
    return initials.join('').toUpperCase();
  }
}

angular.module('uiGenApp')
  .controller('AllocateToController', AllocateToController);
