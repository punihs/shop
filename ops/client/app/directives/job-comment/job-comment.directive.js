(() => {
  class JobCommentsController {
    /*  @ngInject  */
    constructor($http, $timeout, Session) {
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('adminUserinfo');
      this.states = this.Session.read('states');
      this.getList();
    }


    getList() {
      this.ui = { loading: true, scrollToBottom: false };
      this
        .$http
        .get(`/jobs/${this.jobId}/comments`)
        .then(({ data }) => {
          this.data = data;
          this.ui = { loading: false, scrollToBottom: true };
        });
    }
  }

  angular.module('uiGenApp')
    .directive('jobComment', () => ({
      templateUrl: 'app/directives/job-comment/job-comment.html',
      restrict: 'E',
      controller: JobCommentsController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        jobId: '@',
      },
    }));
})();
