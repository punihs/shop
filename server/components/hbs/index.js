
const path = require('path');
const handlebars = require('handlebars');
const fs = require('fs');

const config = require('../../config/environment');

const hbs = {
  render(view, data) {
    const template = fs.readFileSync(`${path
      .join(config.root, 'server/components/hbs/templates')}/${view}.hbs`, 'utf8');
    return handlebars.compile(template)(Object.assign(hbs.defaults[template] || {}, data));
  },
  defaults: {
    action: {
      messageBgColor: '#FF9F00',
    },
  },
  colors: {
    primary: '#4173A9',
    info: '#5585B9',
    success: '#27c24c',
    warning: '#ff7905',
    danger: '#ed2424',
    light: '#edf1f2',
    dark: '#0c4055',
    black: '#1c2b36',
  },
  textPrimary: text => `<span style="color:${hbs.colors.primary}">${text}</span>`,
  text: (type, text) => `<span style="color:${hbs.colors[type]}">${text}</span>`,
};

hbs.fields = (view) => {
  const template = fs.readFileSync(`${path
    .join(config.root, 'server/components/hbs/templates')}/${view}.hbs`, 'utf8');
  return template.match(/{([^{}]+)}/g).map(x => x.slice(1, -1)).filter(x => !x.includes(' '));
};

module.exports = hbs;
