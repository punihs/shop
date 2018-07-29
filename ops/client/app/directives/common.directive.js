angular
  .module('uiGenApp')
  .directive('tableOffset', () => ({
    link: () => {
      $('.scrollableContainer')
        .height($(window).height() - ($('.scrollableContainer').position().top + 85));
    },
  }));

