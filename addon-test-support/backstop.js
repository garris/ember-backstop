import { later } from '@ember/runloop';

const ORIGIN = window.location.origin;
const BACKSTOP_DYNAMIC_TEST_URL = 'backstop/dtest';
const BACKSTOP_REPORT_URL = 'backstop/backstop_data/html_report/';

// Copy attributes from Ember's rootElement to the DOM snapshot <body> tag. Some applications rely
// on setting attributes on the Ember rootElement (for example, to drive dynamic per-route
// styling). In tests these attributes are added to the #ember-testing container and would be lost
// in the DOM hoisting, so we copy them to the to the snapshot's <body> tag to
// make sure that they persist in the DOM snapshot.
function copyAttributesToBodyCopy(bodyCopy, testingContainer) {
  let attributesToCopy = testingContainer.attributes;
  const copyAttr = function(thisAttr) {
    // Special case for the class attribute - append new classes onto existing body classes
    if (thisAttr.name === 'class') {
      bodyCopy[thisAttr.name] = bodyCopy[thisAttr.name] + ' ' + thisAttr.value;
    } else {
      bodyCopy[thisAttr.name] = thisAttr.value;
    }
  };
  Object.keys(attributesToCopy).forEach(key => copyAttr(attributesToCopy[key]));
}

function prepareInputValuesForCopying(snapshotRoot) {
  snapshotRoot.querySelectorAll('input')
    .forEach(function (item) {
      item.setAttribute('value', item.value);
    });
}

function getDoctype() {
  let doctypeNode = document.doctype;
  if (!doctypeNode || !doctypeNode.name) {
    return '<!DOCTYPE html>';
  }
  let doctype =
    '<!DOCTYPE ' +
    doctypeNode.name +
    (doctypeNode.publicId ? ' PUBLIC "' + doctypeNode.publicId + '"' : '') +
    (!doctypeNode.publicId && doctypeNode.systemId ? ' SYSTEM' : '') +
    (doctypeNode.systemId ? ' "' + doctypeNode.systemId + '"' : '') +
    '>';
  return doctype;
}

//backstop-remote helpers
const dateTime = new Date();
const testRunTime =
  dateTime.getFullYear() +
  pad(dateTime.getMonth() + 1) +
  pad(dateTime.getDate()) +
  '-' +
  pad(dateTime.getHours()) +
  pad(dateTime.getMinutes()) +
  pad(dateTime.getSeconds());
window._testRunTime = testRunTime;

function pad(number) {
  let r = String(number);
  if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    const e = new Error(
      `Proxy returned "${response.status} ${response.statusText}". Please check that backstop-remote is running. ${ORIGIN}/backstop/version`
    );
    e.silentlyFailOnError = response.status === 503;
    return Promise.reject(e);
  }
}

function json(response) {
  return response.json();
}

//I'm in your webapps -- checkin ur screenz.
function backstopHelper(name, testHash, options, res, err) {
  if (!name) {
    throw new Error("Backstop helper requires an unique name.");
  }

  if (!testHash) {
    throw new Error("Backstop helper requires an unique id for the testHash.");
  }

  let snapshotRoot;
  options = options || {};
  let scope = options.scope;

  // Create a full-page DOM snapshot from the current testing page.
  let e = document.querySelector('html');
  let domCopy = e.cloneNode(true);
  let bodyCopy = domCopy.getElementsByTagName('body')[0];
  let testingContainer = domCopy.querySelector('#ember-testing');

  copyAttributesToBodyCopy(bodyCopy, testingContainer);

  if (scope) {
    snapshotRoot = testingContainer.querySelector(scope);
  } else {
    snapshotRoot = testingContainer;
  }

  prepareInputValuesForCopying(snapshotRoot);

  let snapshotHtml = snapshotRoot.innerHTML;

  // Hoist the testing container contents up to the body.
  // We need to use the original DOM to keep the head stylesheet around.
  bodyCopy.innerHTML = snapshotHtml;
  const content = getDoctype() + domCopy.outerHTML;
  const payload = JSON.stringify({
    content,
    name: name,
    widths: options.widths,
    breakpoints: options.breakpoints,
    enableJavaScript: options.enableJavaScript,
    testHash: testHash,
    origin: ORIGIN,
    scenario: options.scenario
  });

  later(function() {
    fetch(`/${BACKSTOP_DYNAMIC_TEST_URL}/${testHash.testId}/${testHash.scenarioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: payload,
    })
      .then(status)
      .then(json)
      .then(function(data) {
        if (data.ok) {
          res({ok: true, message: `BackstopJS passed. See: ${ORIGIN}/${BACKSTOP_REPORT_URL}`});
        } else {
          res({ok: false, message: `BackstopJS found differences. See: ${ORIGIN}/${BACKSTOP_REPORT_URL}`});
        }
      })
      .catch(function(error) {
        if (error.silentlyFailOnError) {
          const message = `WARNING: BackstopJS has been set to silently fail on error. ${error}`;
          console.warn(message);
          res({ok: true, message});
        }
        err(error);
      });
  }, 0);
}

function createNameHash(assert, options) {
  if (!assert) {
    throw new Error("Backstop helper requires an assert object");
  }

  let name = options && options.name ? options.name : ""; //optional name to append to the assertion
  let assertionName;
  let testHash = {};

  //namespace our steps to not conflict with qunit steps functionality
  if (!assert.test.backstop) assert.test.backstop = {};

  //Record assertion count
  assert.test.backstop.assertCount = assert.test.backstop.assertCount + 1 || 0;

  if (name && name.length !== 0) {
    name = ` | ${name}`;
  }

  // Generate base names to extend
  if (
    assert.test &&
    assert.test.module &&
    assert.test.module.name &&
    assert.test.testName
  ) {
    testHash.testId = window._testRunTime;
    testHash.scenarioId = assert.test.testId;
    assertionName = `${assert.test.module.name} | ${assert.test.testName}`;
  }

  const assertCount = assert.test.backstop.assertCount;

  // Name generation based on assert count and optional name for the step
  assertionName = `${assertionName}${name} | assert${assertCount}`;

  validateName(assertionName);

  return { name: assertionName, testHash: testHash };
}

function validateName(name) {
  //Catch ENAMETOOLONG when backstop generates filename
  const maxLength = 205;
  if (name.length > maxLength) {
    throw new Error(
      `Backstop test name or assertion name too long. Maximum combined length of ${maxLength} characters`
    );
  }
}

/**
 * Reads environment.js config from the meta tag in test page, and returns the config object related to this addon.
 */
function getAddonCfgFromParentApp() {
  const appEnvConfig = document.querySelector('meta[name*="config/environment"]').getAttribute('content');
  return JSON.parse(decodeURIComponent(appEnvConfig))['ember-backstop'] || {};
}

/**
 * I'm in your webapps -- checkin your screenz. -schooch
 */
export default async function (assert, options) {
  const { disableBackstop } = getAddonCfgFromParentApp();

  if (disableBackstop) {
    assert.ok(
      true,
      `Backstop assertion was not run since it's currently disabled.`
    );
    return Promise.resolve(true);
  }

  const hash = createNameHash(assert, options);
  return new Promise((res, err) => {
    backstopHelper(hash.name, hash.testHash, options, res, err);
  }).then(backstopResult => {
    assert.ok(backstopResult.ok, backstopResult.message);
  });
}
