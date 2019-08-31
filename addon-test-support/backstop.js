import { later } from '@ember/runloop';

// If backstop-remote service is not found and silentlyFailOnError === true then 
// the backstop test will pass with a warning message.
const silentlyFailOnError = false;

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
    return Promise.reject(
      new Error(`Proxy returned "${response.status} ${response.statusText}". Please check that backstop-remote is running. ${ORIGIN}/backstop/version`)
    );
  }
}

function json(response) {
  return response.json();
}

//I'm in your webapps -- checkin ur screenz.
function backstopHelper(name, options, res, err) {
  let testHash = {};
  if (!name) {
    throw new Error('Backstop helper requires an unique name or an assert obj.');
  }

  // Automatic name generation for QUnit tests by passing in the `assert` object.
  if (name.test && name.test.module && name.test.module.name && name.test.testName) {
    testHash.testId = window._testRunTime;
    testHash.scenarioId = name.test.testId;
    name = `${name.test.module.name} | ${name.test.testName}`;
  } else if (name.fullTitle) {
    // Automatic name generation for Mocha tests by passing in the `this.test` object.
    name = name.fullTitle();
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
        console.log('Request succeeded with JSON response', data);
        if (data.ok) {
          res({ok: true, message: `BackstopJS passed. See: ${ORIGIN}/${BACKSTOP_REPORT_URL}`});
        } else {
          res({ok: false, message: `BackstopJS found differences. See: ${ORIGIN}/${BACKSTOP_REPORT_URL}`});
        }
      })
      .catch(function(error) {
        if (silentlyFailOnError) {
          const message = `WARNING: BackstopJS has been set to silently fail on error. ${error}`;
          console.warn(message);
          res({ok: true, message});
        }
        err(error);
      });
  }, 0);
}

/**
 * I'm in your webapps -- checkin your screenz. -schooch
 */
export default async function(assert, options) {
  return new Promise((res, err) => {
    backstopHelper(assert, options, res, err);
  }).then((backstopResult) => {
    assert.ok(backstopResult.ok, backstopResult.message);
  });
}
