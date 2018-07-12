class PostAnswerQuestionController {
  constructor($http, $state, $stateParams, $scope, $uibModalInstance, question) {
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.Question = question;
  }
}

angular.module('uiGenApp')
  .controller('PostAnswerQuestionController', PostAnswerQuestionController);
