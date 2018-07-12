angular.module('uiGenApp')
  .directive('cometChat', () =>
    ({
      restrict: 'E',
      templateUrl: 'components/comet-chat/comet-chat.html',
      controller: 'CometChatController',
      controllerAs: '$ctrl',
      scope: {},
    }));
