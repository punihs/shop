(() => {
  class UploadExcelController {
    /* @ngInject  */
    constructor($uibModalInstance, $http, $window, moment, job) {
      this.$uibModalInstance = $uibModalInstance;
      this.$http = $http;
      this.$window = $window;
      this.moment = moment;
      this.job = job;
    }

    $onInit() {
      this.data = {};
      this.today = new Date();
      this.uploading = false;
      this.exData = {
        scheduled_on_time: moment()
          .startOf('day')
          .set('hour', 10),
      };
    }

    setScheduledOn() {
      this.data.scheduled_on = moment(this.exData.scheduled_on_date)
        .set('hour', 10)
        .set('minute', 0)
        .set('second', 0);
    }

    upload() {
      if (this.uploading) return null;
      this.uploading = true;

      return this
        .$http
        .post(`/jobs/${this.job.id}/applicants/driveCreate`, this.data)
        .then(({ data: { url, failed, total } }) => {
          this.uploading = false;
          if (failed) return (this.ui = { url, failed, total });

          this.$uibModalInstance.close(this.data);
          return this.$window.location.reload(true);
        })
        .catch(({ data }) => {
          this.uploading = false;
          this.error = data.message || 'Something went wrong, please contact Quezx.com.';
        });
    }
  }

  class UploadExcel {
    /* @ngInject  */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(job) {
      this.$uibModal.open({
        templateUrl: 'app/directives/upload-excel/upload-excel.html',
        controller: UploadExcelController,
        controllerAs: '$ctrl',
        resolve: {
          job: () => job,
        },
      });
    }
  }

  angular
    .module('uiGenApp')
    .service('UploadExcel', UploadExcel);
})();
