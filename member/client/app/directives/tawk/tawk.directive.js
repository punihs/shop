angular
  .module('uiGenApp')
  .directive('tawk', ($location, Session) => ({
    templateUrl: 'app/directives/tawk/tawk.html',
    restrict: 'EA',
    link() {
      // don't show on chrome extension page
      const qxView = $location.path() === '/extension/chrome/applicants/new';
      const user = Session.read('userinfo');
      if (!qxView && user && user.tawk_token && !user.isBlocked) {
        const s1 = document.createElement('script');
        const s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = `https://embed.tawk.to/${user.tawk_token}/default`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
      }
    },
  }));
