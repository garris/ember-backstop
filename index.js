/* eslint-env node */
"use strict";

// if using native backstop remote server
const BACKSTOP_REMOTE_HTTP_PORT = process.env.BACKSTOP_REMOTE_HTTP_PORT || 3000;
const BACKSTOP_PROXY_PATH = "/backstop";
const BACKSTOP_PROXY_TARGET = `http://localhost:${BACKSTOP_REMOTE_HTTP_PORT}`;
const BACKSTOP_ADDON_CONFIG_FILE_NAME = "ember-backstop.json";

module.exports = {
  name: "ember-backstop",

  isDevelopingAddon() {
    return true;
  },

  serverMiddleware({ app }) {
    this._configMiddleware(app);
  },

  testemMiddleware(app) {
    this._configMiddleware(app);
  },

  includedCommands() {
    return {
      "backstop:remote": require("./commands/backstop-remote"),
      "backstop:approve": require("./commands/backstop-approve"),
      "backstop:report": require("./commands/backstop-report"),
      "backstop:stop": require("./commands/backstop-stop"),
      // 'backstop:test': require('./commands/backstop-test')
    };
  },

  _configMiddleware(app) {
    const config = getConfig(this.project);
    // if using native backstop remote server
    // eslint-disable-next-line node/no-extraneous-require
    const proxy = require("http-proxy").createProxyServer({});

    proxy.on("error", function (err, req, res) {
      res.writeHead(config.skipRemoteError ? 503 : 500, {
        "Content-Type": "text/plain",
      });
      res.end(err + " Please check that backstop-remote service is running.");
    });

    // eslint-disable-next-line no-unused-vars
    app.use(BACKSTOP_PROXY_PATH, function (req, res, next) {
      proxy.web(req, res, { target: BACKSTOP_PROXY_TARGET });
    });
  },
};

function getConfig(project) {
  let configDir = "config";

  if (project.pkg["ember-addon"] && project.pkg["ember-addon"]["configPath"]) {
    configDir = project.pkg["ember-addon"]["configPath"];
  }

  const config = {};

  try {
    const configPath = `./${configDir}/${BACKSTOP_ADDON_CONFIG_FILE_NAME}`;
    Object.assign(config, project.require(configPath));
  // eslint-disable-next-line no-empty
  } catch (err) {}

  return config;
}
