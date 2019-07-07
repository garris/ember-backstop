'use strict';
const backstopjs = require('backstopjs');

module.exports = {
  name: 'backstop:remote',
  // aliases: ['uc'],
  availableOptions: [
    { name: 'filter', type: String, aliases: ['f'] }
  ],
  description: 'Launch Backstop-Remote server.',
  run(commandOptions) {
    process.chdir('./ember-backstop');
    backstopjs('remote', {config: './backstop.js'});
  }
};