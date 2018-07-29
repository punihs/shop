(() => {
  class PackageCommentsController {
    /*  @ngInject  */
    constructor($http, $timeout, Session) {
      this.moment = moment;
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.states = this.Session.read('states');
      this.post = { comments: '' };
      this.getList();
    }

    isToday(otherDate) {
      return ((new Date()).toDateString() === new Date(otherDate).toDateString());
    }

    getList() {
      this.ui = { loading: true, scrollToBottom: false };
      this
        .$http
        .get(`/packages/${this.packageId}/comments`)
        .then(({ data }) => {
          this.pkg.comments = data;
          this.ui = { loading: false, scrollToBottom: true };
        });
    }

    insert(event = {}) {
      if (event.keyCode === 13) event.target.blur();
      const comments = this.post.comments;
      if (!comments) return;
      this.ui = { loading: true, scrollToBottom: false };
      this
        .$http
        .post(`/packages/${this.packageId}/comments`, { comments })
        .then(() => {
          this.post.comments = '';
          this.pkg.comments.push({
            User: this.user,
            comments,
            created_at: new Date().toISOString(),
          });
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
