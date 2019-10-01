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
    const config = getConfig(this.project);
    // if using native backstop remote server
    const proxy = require('http-proxy').createProxyServer({});

    proxy.on('error', function(err, req, res) {
      res.writeHead(config.skipRemoteError ? 503 : 500, {
        'Content-Type': 'text/plain',
      });
      res.end(err + ' Please check that backstop-remote service is running.');
    });

    app.use(BACKSTOP_PROXY_PATH, function(req, res, next) {
      proxy.web(req, res, { target: BACKSTOP_PROXY_TARGET });
    });
  },

  includedCommands() {
    return {
      'backstop:remote': require('./commands/backstop-remote'),
      'backstop:approve': require('./commands/backstop-approve'),
      'backstop:report': require('./commands/backstop-report'),
      'backstop:stop': require('./commands/backstop-stop'),
      // 'backstop:test': require('./commands/backstop-test')
    };
  }
};

function getConfig(project) {
  let configDir = 'config';

  if (project.pkg['ember-addon'] && project.pkg['ember-addon']['configPath']) {
    configDir = project.pkg['ember-addon']['configPath'];
  }

  const config = {};

  try {
    const configPath = `./${configDir}/${BACKSTOP_ADDON_CONFIG_FILE_NAME}`;
    Object.assign(config, project.require(configPath));
  } catch(err) {}

  return config;
}
