'use strict';
const backstopjs = require('backstopjs');

module.exports = {
  name: 'backstop:remote',

  aliases: ['backstop-remote'],

  availableOptions: [
    { name: 'filter', type: String, aliases: ['f'], default: '' },
    { name: 'config', type: String, aliases: ['c'], default: './backstop.js' },
  ],

  description: 'Launch Backstop-Remote server.',

  run({ config, filter }) {
    process.chdir('./ember-backstop');
    return backstopjs('remote', { config, filter });
  },
};
