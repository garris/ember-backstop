const debug = require('debug')('PUPPET_ENGINE_SCRIPT');
const BACKSTOP_TEST_CSS_OVERRIDE = `#ember-testing {width: 100% !important; height: 100% !important; -webkit-transform: scale(1) !important; transform: scale(1) !important;}`;

module.exports = function(page, scenario) {
  // inject arbitrary css to override styles
  page.evaluate(() => {
    let style = document.createElement('style');
    style.type = 'text/css';
    let styleNode = document.createTextNode(`${BACKSTOP_TEST_CSS_OVERRIDE}`);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });

  debug(`BACKSTOP_TEST_CSS_OVERRIDE injected for: ${scenario.label}`);
};
