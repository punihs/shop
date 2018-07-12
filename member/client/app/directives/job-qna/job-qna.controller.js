class JobQnaController {
  constructor($document, $scope, $http, $stateParams, $state, $uibModal, ConfirmDialog,
              QuarcService, toaster, Session) {
    this.$document = $document;
    this.$scope = $scope;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.Session = Session;
    this.$uibModal = $uibModal;
    this.ConfirmDialog = ConfirmDialog;
    this.QuarcService = QuarcService;
    this.toaster = toaster;
    this.$onInit();
  }
  $onInit() {
    this.QuestionList = [];
    this.showUpvote = true;
    this.fetchQuestion();
  }


  fetchQuestion() {
    this.$http
      .get(`/jobs/${this.$stateParams.jobId}/questions`)
      .then(({ data }) => {
        const questions = data;
        const user = this.Session.read('userinfo');
        questions.forEach((val, i) => {
          questions[i].owner = val.created_by === user.id;
          questions[i].upvote_count = val.JobQuestionUpvotes.length;
          val.JobQuestionUpvotes.forEach(e => {
            if (e.user_id === user.id) {
              questions[i].upvoted = true;
            }
          });
        });
        this.QuestionList = questions;
      });
  }

  upvote(question) {
    this.showUpvote = false;
    this.$http
      .post(`/jobs/${
        this.$stateParams.jobId
      }/questions/${
        question.id
      }/upvote`, this.question)
      .then(() => {
        this.showUpvote = true; this.fetchQuestion();
      });
  }

  downvote(question) {
    this.showUpvote = false;
    this.$http
      .delete(`/jobs/${
        this.$stateParams.jobId
      }/questions/${
        question.id
      }/upvote`, this.question)
      .then(() => { this.showUpvote = true; this.fetchQuestion(); });
  }

  edit(question) {
    this.$http
            .put(`/jobs/${this.$stateParams.jobId}/questions/${question.id}`, question)
            .then(() => {
              this.fetchQuestion();
              this
                .toaster
                .pop(this.QuarcService.toast('success', 'Question edited successfully.'));
            })
            .catch(() => (
              this
                .toaster
                .pop(this.QuarcService.toast('error', 'Could not delete question.'))));
  }

  enableEdit(id) {
    this.QuestionList.forEach((v, i) => {
      if (v.id === id) {
        this.QuestionList[i].edit = true;
      } else {
        this.QuestionList[i].edit = false;
      }
    });
  }

  resetEdit(id) {
    this.QuestionList.forEach((v, i) => {
      if (v.id === id) {
        this.QuestionList[i].edit = false;
      }
    });
  }


  remove(question) {
    this.ConfirmDialog
      .open({
        size: 'md',
        title: 'Please Confirm',
        description: 'Are you sure you want to delete this question?',
      })
      .then((data) => {
        if (data) {
          this.$http
            .delete(`/jobs/${
              this.$stateParams.jobId
            }/questions/${question.id}`, question)
            .then(() => {
              this
                .toaster
                .pop(this.QuarcService.toast('success', 'question deleted successfully'));
              const index = this.QuestionList.map(x => x.id).indexOf(question.id);
              this.QuestionList.splice(index, 1);
            })
            .catch(() => (
              this
                .toaster
                .pop(this.QuarcService.toast('error', 'Could not delete question.'))));
        }
      });
  }

  showPostQueryOverlay(questionList) {
    this.$uibModal.open({
      templateUrl: 'app/directives/job-qna/post-job-question/post-job-question.html',
      controller: 'PostJobQuestionController',
      controllerAs: '$ctrl',
      windowClass: 'post-job-question',
      size: 'lg',
      resolve: { questionList: () => questionList },
    });
  }

  showAnswerQueryOverlay(question) {
    this.$uibModal.open({
      templateUrl: 'app/directives/job-qna/post-answer-question/post-answer-question.html',
      controller: 'PostAnswerQuestionController',
      controllerAs: '$ctrl',
      windowClass: 'post-answer-question',
      size: 'lg',
      resolve: { question: () => question },
    });
  }
}

angular.module('uiGenApp')
  .controller('JobQnaController', JobQnaController);
