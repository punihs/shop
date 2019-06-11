angular.module('uiGenApp')
  .factory('Page', (Session) => {
    let title = '';
    let favicon = '/assets/images/logo.png';
    return {
      favicon: () => (favicon || 'https://www.shoppre.com/img/favicon.png'),

      setFavicon: function setTitle(newFavicon) {
        favicon = newFavicon;
      },

      title: function getTitle() {
        return (Session.read('userinfo') ? `${title} - ${Session.read('userinfo').name}` : '');
      },

      setTitle: function setTitle(newTitle) {
        title = newTitle;
      },
    };
  });
