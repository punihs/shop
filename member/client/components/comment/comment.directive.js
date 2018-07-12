(() => {
  class ApplicantCommentsController {
    /*  @ngInject  */
    constructor($http, $timeout, Session) {
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.states = this.Session.read('states');
      this.post = { comment: '' };
      this.getList();
    }

    isToday(otherDate) {
      return ((new Date()).toDateString() === new Date(otherDate).toDateString());
    }

    updateFollowup(applicantId, comment) {
      this
        .$http
        .post(`/applicants/${applicantId}/comments/${comment.id}/interviewFollowUps`, {
          followUpOptionId: comment.followUpOptionId,
        })
        .then(() => (this.getList()));
    }

    getList() {
      this.ui = { loading: true, scrollToBottom: false };
      this
        .$http
        .get(`/applicants/${this.applicantId}/comments`)
        .then(({ data }) => {
          this.applicant.comments = data;
          this.ui = { loading: false, scrollToBottom: true };
        });
    }

    insert(event = {}) {
      if (event.keyCode === 13) event.target.blur();
      const comment = this.post.comment;
      if (!comment) return;
      this.ui = { loading: true, scrollToBottom: false };
      this
        .$http
        .post(`/applicants/${this.applicantId}/comments`, { comment })
        .then(() => {
          this.post.comment = '';
          this.applicant.comments.push({
            user: { name: this.user.name },
            body: comment,
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
    .directive('comment', () => ({
      templateUrl: 'components/comment/comment.html',
      restrict: 'E',
      controller: ApplicantCommentsController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        applicantId: '@',
        applicant: '=',
      },
    }));
})();
