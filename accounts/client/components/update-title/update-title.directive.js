import angular from 'angular';

/* @ngInject */
function updateTitle($rootScope, $timeout, $state) {
  return function link(scope, element) {
    /* eslint angular/on-watch: 0 */
    const defaultTitle = 'Hire';

    $rootScope.$on('$stateChangeSuccess', (event, toState) => {
      const title = (toState.data && toState.data.pageTitle) || defaultTitle;

      $timeout(() => element.text(`${title} | QuezX Hire`), 0, false);
    });

    $rootScope.$on('UpdateTitle', (event, data) => {
      const pageTitle = $state.current.data && $state.current.data.pageTitle;
      const title = data || defaultTitle;
      const subtitle = (pageTitle && ` – ${pageTitle} `) || ' ';
      $timeout(() => element.text(`${title}${subtitle}| QuezX Hire`), 0, false);
    });
  };
}

export default angular.module('directives.footer', [])
  .component('updateTitle', {
    controller: updateTitle,
  })
  .name;

