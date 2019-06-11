angular.module('qui.core')
  .factory('Page', (Session) => {
    let title = '';
    let favicon = (Session.read('adminUserinfo') ?
      Session.read('adminUserinfo').profile_photo_url : '/assets/images/logo.png');
    return {
      favicon: () => (favicon || 'https://www.shoppre.com/img/favicon.png'),

      setFavicon: function setTitle(newFavicon) {
        favicon = newFavicon;
      },

      title: function getTitle() {
        return (Session.read('adminUserinfo') ? `${Session.read('adminUserinfo').name} - ${title}` : '');
      },

      setTitle: function setTitle(newTitle) {
        title = newTitle;
      },
    };
  });
