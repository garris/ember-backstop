'use strict';
const backstopjs = require('backstopjs');

module.exports = {
  name: 'backstop:approve',
  aliases: ['backstop-approve'],
  availableOptions: [
    { name: 'filter', type: String, aliases: ['f'], default: ''},
    { name: 'config', type: String, aliases: ['c'], default: './backstop.js' }
  ],
  description: 'Approve most-recent test bitmaps to reference. Use `--filter` to filter by filename (accepts regex string).',
  run(commandOptions) {
    process.chdir('./ember-backstop');
    return backstopjs('approve', {
      config: commandOptions.config, 
      filter: commandOptions.filter
    });
  }
};