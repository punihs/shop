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
        if (!string) return ' ';
        const initials = string.match(/\b(\w)/g);
        if (initials.length > 2) {
          initials.splice(1, initials.length - 2);
        }
        return initials.join('').toUpperCase();
      },

      titleCase: function replaceAll() {
        const firstLetterRx = /(^|\s)[a-z]/g;
        return this.replace(firstLetterRx, (str) => str.toUpperCase());
      },

      replaceAll: function replaceAll(search, replacement) {
        const target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
      },

      /* eslint max-len:0 */
      validateEmail: (email) => {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(String(email).toLowerCase());
      },
    };
    return vars;
  });
