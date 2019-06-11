(() => {
  class CommentsController {
    /*  @ngInject  */
    constructor($http, $timeout, Session, socket, moment) {
      this.moment = moment;
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.socket = socket;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('adminUserinfo');
      this.states = this.Session.read(`${this.type === 'shipment' ? 'shipment-' : ''}states`);
      this.post = { comments: '' };
      this.followers = [];
      this.getList();
    }

    isToday(otherDate) {
      return ((new Date()).toDateString() === new Date(otherDate).toDateString());
    }

    getList() {
      this.ui = { loading: true, scrollToBottom: false };
      const route = `#/${this.type}s/${this.id}/comments`;
      this
        .$http
        .get(route)
        .then(({ data }) => {
          this.data.comments = data;
          this.socket.syncUpdates(route, this.data.comments, true);
          this.ui = { loading: false, scrollToBottom: true };
        });
      this.loadFollowers();
    }

    loadFollowers() {
      const route = `#/${this.type}s/${this.id}/followers`;
      this
        .$http
        .get(route)
        .then(({ data }) => {
          this.followers = data;
        });
    }

    insert(event = {}) {
      if (event.keyCode === 13) event.target.blur();
      const comments = this.post.comments;
      if (!comments) return;
      this.ui = { loading: true, scrollToBottom: false };
      const route = `#/${this.type}s/${this.id}/comments`;

      this
        .$http
        .post(route, { comments })
        .then(() => {
          this.post.comments = '';
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
      controller: CommentsController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        id: '@',
        data: '=',
        type: '=',
      },
    }));
})();
