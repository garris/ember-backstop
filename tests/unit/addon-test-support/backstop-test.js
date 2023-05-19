import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  prepareInputValuesForCopying,
  copyAttributesToBodyCopy,
  createNameHash,
} from 'ember-backstop/test-support/backstop';

module('Unit | Addon Test Support', (hooks) => {
  setupTest(hooks);

  module('#prepareInputValuesForCopying tests', () => {
    test('Should copy JS DOM attributes into snapshot DOM attribute', async function (assert) {
      // Given DOM node with HTML inputs
      var snapshot = document.createElement('form');
      snapshot.innerHTML = `
        <input type="radio" id="checkbox1" />
        <input type="radio" id="radio1" />
        <input type="checkbox" id="checkbox2" checked />
        <input type="text" id="text1"/>
        <input type="button" id="button1"/>
      `;

      // Given `value` and `checked` attributes are
      // changed programmatically
      snapshot['radio1'].value = 'radio value 1';
      snapshot['radio1'].checked = true;

      snapshot['checkbox1'].value = 'checkbox value 1';
      snapshot['checkbox1'].checked = true;

      snapshot['checkbox2'].value = 'checkbox value 2';
      snapshot['checkbox2'].checked = false;

      snapshot['text1'].value = 'text value';
      snapshot['button1'].value = 'button value';
      snapshot['button1'].checked = true; // unsupported "checked" attribute for a button

      // When function is called with given snapshot
      prepareInputValuesForCopying(snapshot);

      assert.equal(snapshot['radio1'].getAttribute('value'), 'radio value 1');
      assert.equal(snapshot['radio1'].hasAttribute('checked'), true);

      assert.equal(
        snapshot['checkbox1'].getAttribute('value'),
        'checkbox value 1'
      );
      assert.equal(snapshot['checkbox1'].hasAttribute('checked'), true);

      assert.equal(
        snapshot['checkbox2'].getAttribute('value'),
        'checkbox value 2'
      );
      assert.equal(snapshot['checkbox2'].hasAttribute('checked'), false);

      assert.equal(snapshot['text1'].getAttribute('value'), 'text value');

      assert.equal(snapshot['button1'].getAttribute('value'), 'button value');
      assert.equal(snapshot['button1'].hasAttribute('checked'), false);
    });
  });

  module('#copyAttributesToBodyCopy tests', () => {
    test('Should copy HTML attributes from a container element to a body', async function (assert) {
      const sourceDocument =
        document.implementation.createHTMLDocument('Testem page');
      const body = sourceDocument.body;
      body.innerHTML =
        '<div><div id="testing-container" data-custom-attribute="val1" nonstandardattribute="val2" attributewithoutvalue></div></div>';
      const testingContainer =
        sourceDocument.getElementById('testing-container');
      copyAttributesToBodyCopy(body, testingContainer);
      assert.equal(body.getAttribute('id'), 'testing-container');
      assert.equal(body.getAttribute('data-custom-attribute'), 'val1');
      assert.equal(body.getAttribute('nonstandardattribute'), 'val2');
      assert.equal(body.hasAttribute('attributewithoutvalue'), true);
    });

    test('Should append classes from a container to a body which had pre-existing classes', async function (assert) {
      const sourceDocument =
        document.implementation.createHTMLDocument('Testem page');
      const body = sourceDocument.body;
      body.setAttribute('class', 'original-class1 original-class2');
      body.innerHTML =
        '<div><div id="testing-container" class="new-class1 new-class2"></div></div>';
      const testingContainer =
        sourceDocument.getElementById('testing-container');
      copyAttributesToBodyCopy(body, testingContainer);
      assert.equal(
        body.getAttribute('class'),
        'original-class1 original-class2 new-class1 new-class2'
      );
    });

    test('Should append classes from a container to a body which had no classes', async function (assert) {
      const sourceDocument =
        document.implementation.createHTMLDocument('Testem page');
      const body = sourceDocument.body;
      body.innerHTML =
        '<div><div id="testing-container" class="new-class1 new-class2"></div></div>';
      const testingContainer =
        sourceDocument.getElementById('testing-container');
      copyAttributesToBodyCopy(body, testingContainer);
      assert.equal(body.getAttribute('class'), 'new-class1 new-class2');
    });

    test('Should not introduce classes to a body if neither body or container had classes', async function (assert) {
      const sourceDocument =
        document.implementation.createHTMLDocument('Testem page');
      const body = sourceDocument.body;
      body.innerHTML = '<div><div id="testing-container"></div></div>';
      const testingContainer =
        sourceDocument.getElementById('testing-container');
      copyAttributesToBodyCopy(body, testingContainer);
      assert.equal(body.getAttribute('class'), '');
    });
  });

  module('#createNameHash tests', () => {
    test('Should not automatically generate the testId when specified', async function (assert) {
      const obj = createNameHash(assert, { name: 'Snapshot', testId: '1337' });
      assert.deepEqual(obj, {
        name: 'Unit | Addon Test Support > #createNameHash tests | Should not automatically generate the testId when specified | Snapshot | assert0',
        testHash: {
          scenarioId: '64825016',
          testId: '1337',
        },
      });
    });

    test('Should automatically generate the testId when not specified', async function (assert) {
      window._testRunTime = '20230517-171000';
      const obj = createNameHash(assert, { name: 'Snapshot' });
      assert.deepEqual(obj, {
        name: 'Unit | Addon Test Support > #createNameHash tests | Should automatically generate the testId when not specified | Snapshot | assert0',
        testHash: {
          scenarioId: 'dc62a95c',
          testId: '20230517-171000',
        },
      });
    });
  });
});
