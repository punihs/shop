angular.module('qui.core')
  .factory('Page', (Session) => {
    let title = '';
    let favicon = (Session.read('userinfo') ?
      Session.read('userinfo').profile_photo_url : '/assets/images/logo.png');
    return {
      favicon: () => (favicon || 'https://www.shoppre.com/img/favicon.png'),

      setFavicon: function setTitle(newFavicon) {
        console.log({ newFavicon });
        favicon = newFavicon;
      },

      title: function getTitle() {
        return (Session.read('userinfo') ? `${Session.read('userinfo').name} - ${title}` : '');
      },

      setTitle: function setTitle(newTitle) {
        title = newTitle;
      },
    };
  });
