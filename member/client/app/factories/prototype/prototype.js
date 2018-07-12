angular.module('uiGenApp')
.factory('Prototype', ($sce) => {
  const vars = {
    hideTags(string) {
      return String(string).replace(/<[^>]+>/gm, '');
    },
    mergeHighlightText(s) {
      let string = s;
      string = string.replace(new RegExp(/\s+/, 'g'), ' ').trim();
      string = string.replace(new RegExp('</strong> <strong class="highlight">', 'g'), ' ');
      string = string.replace(new RegExp('</strong> / <strong class="highlight">', 'g'), ' / ');
      string = string.replace(new RegExp('</strong>/ <strong class="highlight">', 'g'), '/ ');
      string = string.replace(new RegExp('</strong> /<strong class="highlight">', 'g'), ' /');
      string = string.replace(new RegExp('</strong>/<strong class="highlight">', 'g'), '/');
      string = string.replace(new RegExp('</strong> - <strong class="highlight">', 'g'), ' - ');
      return string;
    },
    htmlText(string) {
      if (typeof string === 'string' && string.length > 0) {
        return $sce.trustAsHtml(this.mergeHighlightText(string));
      }
      return $sce.trustAsHtml(`${string}`);
    },
    isHighlight(string) {
      return string.split('</strong>').length > 1;
    },
    firstLetter(string) {
      if (string) {
        const initials = string.match(/\b(\w)/g);
        initials.splice(1, initials.length - 1);
        return initials.join(' ').toUpperCase();
      }
      return '';
    },
    initials(string) {
      if(!string) return ' ';
      const initials = string.match(/\b(\w)/g);
      if (initials.length > 2) {
        initials.splice(1, initials.length - 2);
      }
      return initials.join('').toUpperCase();
    },
  };
  return vars;
});
