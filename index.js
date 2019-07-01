/* eslint-env node */
'use strict';

let bodyParser = require('body-parser');

// if using native backstop remote server
const BACKSTOP_PROXY_PATH = '/backstop';
const BACKSTOP_PROXY_TARGET = 'http://localhost:3000';

module.exports = {
  name: 'ember-backstop',

  isDevelopingAddon() {
    return true;
  },

  serverMiddleware({ app }) {
    // if using native backstop remote server
    let proxy = require('http-proxy').createProxyServer({});
    proxy.on('error', function(err, req) {
      console.error(err, req.url);
    });
    app.use(BACKSTOP_PROXY_PATH, function(req, res, next) {
      proxy.web(req, res, { target: BACKSTOP_PROXY_TARGET });
    });
  },
};
