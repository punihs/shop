class NotifyCountController {
  /* @ngInject */
  constructor($http, $scope, Session, URLS) {
    this.$http = $http;
    this.$scope = $scope;
    this.Session = Session;
    this.URLS = URLS;
    this.$onInit();
  }

  $onInit() {
    if (this.Session.isAuthenticated()) {
      this.fetchNotificationCount();
      this // listen for notify count updates
        .$scope
        .$on('UpdateNotify', (ev, data) => (this.counts = data));
    }
  }

  fetchNotificationCount() {
    const user = this.Session.read('userinfo');
    if (!user) return setTimeout(this.fetchNotificationCount, 1000);
    return this
      .$http
      .get(
        `${this.URLS.QNOTIFY_SERVER}/users/${user.id}/notifications/count`,
        { ignoreAuthModule: true }
      )
      .then(({ data }) => (this.counts = data));
  }
}

angular.module('uiGenApp')
  .directive('notifyCount', () => ({
    templateUrl: 'app/directives/notify-count/notify-count.html',
    restrict: 'E',
    scope: {},
    controller: NotifyCountController,
    controllerAs: '$ctrl',
  }));
