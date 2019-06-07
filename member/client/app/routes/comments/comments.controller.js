class CommentsController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeState,
    toaster, $scope, $timeout, socket) {
    this.Number = Number;
    this.$scope = $scope;
    this.socket = socket;
    this.URLS = URLS;
    this.$http = $http;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Page = Page;
    this.Session = Session;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.moment = moment;
    this.$window = $window;

    this.$onInit();
  }

  $onInit() {
    this.type = 'package';
    this.post = { comments: '' };
    this.id = this.$stateParams.id;
    this.user = this.Session.read('userinfo');
    this.followers = [];
    this.getList();
    this.location = this.$window.location;
  }

  // isToday(otherDate) {
  //   return ((new Date()).toDateString() === new Date(otherDate).toDateString());
  // }

  hideCommentButton() {
    this.$timeout(() => (this.showCommentBtn = false), 200);
  }

  getList() {
    this.ui = { loading: true, scrollToBottom: false };
    const route = `#/${this.type}s/${this.id}/comments`;
    this
      .$http
      .get(route)
      .then(({ data }) => {
        this.comments = data;
        console.log('Comments', this.comments);
        this.socket.syncUpdates(route, this.comments, true);
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

}

angular.module('uiGenApp')
  .controller('CommentsController', CommentsController);
