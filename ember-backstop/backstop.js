const path = require('path');

module.exports = {
  id: `ember-backstop test`,
  viewports: [
    {
      label: 'webview',
      width: 1440,
      height: 900,
    },
  ],
  onBeforeScript: `puppet/onBefore.js`,
  onReadyScript: `puppet/onReady.js`,
  scenarios: [
    {
      label: '{testName}',
      cookiePath: 'backstop_data/engine_scripts/cookies.json',
      url: '{origin}/backstop/dview/{testId}/{scenarioId}',
      delay: 500,
    },
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report',
  },
  report: [],
  engine: 'puppet',
  engineOptions: {
    args: ['--no-sandbox'],
  },
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
};
