const path = require('path');
const prebuilt = require('@linkedin/chrome-prebuilt/config');

const PREBUILT_SYMLINK = prebuilt.SYMLINK_PATH;
const MACOS_NIAVE_PATH = `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`;
const EXECUTABLE_PATH = process.platform === 'darwin' ? MACOS_NIAVE_PATH : PREBUILT_SYMLINK;
console.log('BackstopJS will launch Chrome from: ', EXECUTABLE_PATH);

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
    executablePath: EXECUTABLE_PATH,
    args: ['--no-sandbox'],
  },
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
};
