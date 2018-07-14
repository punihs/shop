(() => {
  class DirectiveJobHeaderController {
    /*  @ngInject  */
    constructor($http, $log, Session) {
      this.$http = $http;
      this.$log = $log;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
    }
  }

  angular.module('uiGenApp')
    .directive('jobDetail', () => ({
      templateUrl: 'app/directives/job-detail/job-detail.html',
      restrict: 'E',
      scope: { job: '=' },
      controller: DirectiveJobHeaderController,
      controllerAs: '$ctrl',
      bindToController: true,
    }));
})();
