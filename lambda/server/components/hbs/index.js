const handlebars = require('handlebars');

const hbs = {
  render(data, html) {
    return handlebars.compile(html)(data);
  },
};

module.exports = hbs;
