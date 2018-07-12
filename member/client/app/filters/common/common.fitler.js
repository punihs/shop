'use strict';

// Docs: https://jsfiddle.net/glenn_antoine/tBFvh/
angular.module('uiGenApp').filter('ucf', function () {
  return function (word) {
    return word.substring(0, 1).toUpperCase() + word.slice(1);
  };
})

  .filter('ucf_lowercase', function () {
    return function (word) {
      return word.toLowerCase();
    };
  })

  .filter('pluralize', function () {
    return function (word, items) {
      for (var i in items) {
        if (word == items[i].word) return items[i].plural;
      }
    };
  })

  .filter('ucf_sentence', function () {
    return function (sentence) {
      var word_arr = sentence.split(' ');
      var new_sentence = '';
      var wordArrLen = word_arr.length;
      for (var i in word_arr) {
        new_sentence += word_arr[i].substring(0, 1).toUpperCase() + word_arr[i].slice(1) + (i == wordArrLen - 1 ? '' : ' ');
      }
      return new_sentence;
    };
  })

  .filter('ucf_sentence_case', function () {
    return function (sentence) {
      var word_arr = sentence.split(' ');
      var new_sentence = '';
      var wordArrLen = word_arr.length;
      for (var i in word_arr) {
        new_sentence += word_arr[i].substring(0, 1).toUpperCase() + word_arr[i].slice(1).toLowerCase() + (i == wordArrLen - 1 ? '' : ' ');
      }
      return new_sentence;
    };
  })

.filter('unreadable', function () {
  return function (text) {
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var sentence_final = '';
    var middle_tmp = '';
    var sentence_arr = text.split(' ');
    var middle;
    for (var i in sentence_arr) {
      last = sentence_arr[i].substr(sentence_arr[i].length - 1, sentence_arr[i].length - 2);

      if (last == '.' || last == ',' || last == ':' || last == ';') {
        last = sentence_arr[i].substr(sentence_arr[i].length - 2, sentence_arr[i].length - 3);
        middle = sentence_arr[i].substr(1, sentence_arr[i].length - 3).split('');
      } else {
        middle = sentence_arr[i].substr(1, sentence_arr[i].length - 2).split('');
      }

      middle_tmp = '';

      for (var j in middle) {
        middle[j] = letters[Math.floor(Math.random() * letters.length)];
        middle_tmp += middle[j];
      }

      sentence_final += sentence_arr[i].substr(0, 1) + middle_tmp + last + ' ';
    }
    return sentence_final;
  };
})

.filter('almost_readable', function () {
  return function (text) {
    var sentence_final = '';
    var shuffled = '';
    var sentence_arr = text.split(' ');

    for (i in sentence_arr) {
      last = sentence_arr[i].substr(sentence_arr[i].length - 1, sentence_arr[i].length - 2);
      var middle;
      if (last == '.' || last == ',' || last == ':' || last == ';' || last == '?' || last == '!') {
        last = sentence_arr[i].substr(sentence_arr[i].length - 2, sentence_arr[i].length - 3);
        middle = sentence_arr[i].substr(1, sentence_arr[i].length - 3).split('');
      } else {
        middle = sentence_arr[i].substr(1, sentence_arr[i].length - 2).split('');
      }

      if (middle.length > 0) {
        for (var j = middle.length - 1; j > 0; j--) {
          var k = Math.floor(Math.random() * (j + 1));
          var tmp = middle[j];
          middle[j] = middle[k];
          middle[k] = tmp;
        }
        shuffled = middle.join('');
        sentence_final += sentence_arr[i].substr(0, 1) + shuffled + last + ' ';
      } else {
        sentence_final += sentence_arr[i] + ' ';
      }
    }
    return sentence_final;
  };
})

  .filter('prefixCreate', function () {
    return function (term, flag) {
      var prefix = 'Add new: ';
      // Todo: Error
      if (term) {
        if (flag) {
          return Array(prefix, term).join('');
        } else {
          if (term.indexOf(prefix) !== -1) {
            term = term.split(prefix);
            return term.length ? term[1] : term;
          }
          return term;
        }
      }
      return term;
    };
  })
  .filter('filterAlt', function () {
    return function (items, search) {
      if (!search) {
        return items;
      }

      if (typeof search[key] === 'string') {
        new Error('Try filter instead of filter-alt');
      }

      var key = Object.keys(search)[0];
      if (search[key] instanceof Array) {
        return _.filter(items, function (item) {
          return search[key].indexOf(item[key]) !== -1;
        });
      }

      return items;
    };
  })
  .filter('nameInitial', function () {
    return function (item = '') {
      const [first, last = ''] = item.split(' ');
      return (first.charAt(0) + last.charAt(0)).toUpperCase();
    }
  });
