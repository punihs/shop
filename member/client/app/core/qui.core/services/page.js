angular.module('qui.core')
  .factory('Page', function Page(Session) {
    let title = '';
    return {
      title: function getTitle() {
        return (Session.read('userinfo') ? (title) + ' - ' + Session.read('userinfo').name : '');
      },

      setTitle: function setTitle(newTitle) {
        title = newTitle;
      },
    };
  });
