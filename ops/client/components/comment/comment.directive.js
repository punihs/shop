(() => {
  class PackageCommentsController {
    /*  @ngInject  */
    constructor($http, $timeout, Session, socket) {
      this.moment = moment;
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.socket = socket;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.states = this.Session.read('states');
      this.post = { comments: '' };
      this.followers = [];
      this.getList();
    }

    isToday(otherDate) {
      return ((new Date()).toDateString() === new Date(otherDate).toDateString());
    }

    getList() {
      this.ui = { loading: true, scrollToBottom: false };
      const route = `/packages/${this.packageId}/comments`;
      this
        .$http
        .get(route)
        .then(({ data }) => {
          this.pkg.comments = data;
          this.socket.syncUpdates(route, this.pkg.comments, true);

          this.ui = { loading: false, scrollToBottom: true };
        });
      this.loadFollowers();
    }

    loadFollowers() {
      this
        .$http
        .get(`/packages/${this.packageId}/followers`)
        .then(({ data }) => {
          this.followers = data;
        });
    }

    insert(event = {}) {
      if (event.keyCode === 13) event.target.blur();
      const comments = this.post.comments;
      if (!comments) return;
      this.ui = { loading: true, scrollToBottom: false };

      const route = `/packages/${this.packageId}/comments`;
      this
        .$http
        .post(route, { comments })
        .then(() => {
          this.post.comments = '';
          // this.pkg.comments.push({
          //   User: this.user,
          //   comments,
          //   created_at: new Date().toISOString(),
          // });
          this.ui = { loading: false, scrollToBottom: true };
        });
    }

    hideCommentButton() {
      this.$timeout(() => (this.showCommentBtn = false), 200);
    }
  }

  angular.module('uiGenApp')
    .directive('comments', () => ({
      templateUrl: 'components/comment/comment.html',
      restrict: 'E',
      controller: PackageCommentsController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        packageId: '@',
        pkg: '=',
      },
    }));
})();
