
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('comments', {
        abstract: true,
        url: '/comments/:id',
        template: '<div ui-view=""></div>',
      })
      .state('comments.index', {
        url: '?type',
        templateUrl: 'app/routes/comments/comments.html',
        controller: 'CommentsController',
        controllerAs: '$ctrl',
      });
  });
