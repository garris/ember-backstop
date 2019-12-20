const debug = require('debug')('PUPPET_ENGINE_SCRIPT');

module.exports = async (page, scenario, vp) => {
  debug('SCENARIO > ' + scenario.label);
  await require('./overrideCSS')(page, scenario);
  await require('./clickAndHoverHelper')(page, scenario);

  // add more ready handlers here...
};
