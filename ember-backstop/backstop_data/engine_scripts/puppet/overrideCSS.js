/* eslint-env browser, node */

module.exports = function(page, scenario) {
  // inject arbitrary css to override styles
  page.evaluate(() => {
    const BACKSTOP_TEST_CSS_OVERRIDE = `#ember-testing {width: 100% !important; height: 100% !important; -webkit-transform: scale(1) !important; transform: scale(1) !important;}`;
    let style = document.createElement('style');
    style.type = 'text/css';
    let styleNode = document.createTextNode(BACKSTOP_TEST_CSS_OVERRIDE);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });
};
