'use strict';
const backstopjs = require('backstopjs');
const http = require('http');

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
      http.get('http://127.0.0.1:3000/stop/', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log('The backstop-remote service responded with > ' + data);
          resolve(0);
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
        if (err.code === 'ECONNREFUSED') {
          console.log('The backstop-remote service was not found.');
        }
        reject(err);
      });
    });
  }
};