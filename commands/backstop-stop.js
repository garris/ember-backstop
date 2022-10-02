'use strict';
const debug = require('debug')('BackstopJS');
const http = require('http');
const remotePort = process.env.BACKSTOP_REMOTE_HTTP_PORT || 3000;
const stopUrl = `http://127.0.0.1:${remotePort}/stop/`;

module.exports = {
  name: 'backstop:stop',
  aliases: ['backstop-stop'],
  availableOptions: [
    { name: 'filter', type: String, aliases: ['f'], default: ''},
    { name: 'config', type: String, aliases: ['c'], default: './backstop.js' }
  ],
  description: 'Stop the backstop-remote service.',
  run(commandOptions) {
    return new Promise((resolve, reject) => {
      http.get(stopUrl, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          debug(`The backstop-remote service responded with > ${data}`);
          resolve(0);
        });

      }).on("error", (err) => {
        debug(`Error: ${err.message}`);
        // ECONNRESET is expected if the stop command worked correctly
        if (err.code === 'ECONNRESET') {
          return resolve(0);
        }
        if (err.code === 'ECONNREFUSED') {
          debug('The backstop-remote service was not found.');
        }
        reject(err);
      });
    });
  }
};