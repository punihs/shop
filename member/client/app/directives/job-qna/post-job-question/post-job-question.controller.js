class PostJobQuestionController {
  constructor($http, $state, $stateParams, $scope, $uibModalInstance, questionList) {
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.QuestionList = questionList;
  }

  createQuestion() {
    if (!this.question || this.question.posted_text.length === 0) return;
    this.$http
    .post(`/jobs/${this.$stateParams.jobId}/questions`, this.question)
    .then(({ data: question }) => {
      question.posted_text = '';
      question.owner = true;
      question.upvote_count = 0;
      this.QuestionList.push(question);
      this.cancel();
    });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

}

angular.module('uiGenApp')
  .controller('PostJobQuestionController', PostJobQuestionController);
