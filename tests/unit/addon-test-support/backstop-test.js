import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { prepareInputValuesForCopying } from 'ember-backstop/test-support/backstop';

module('Unit | Addon Test Support', hooks => {
  setupTest(hooks);

  module('#prepareInputValuesForCopying tests', () => {

    test('Should copy JS DOM attributes into snapshot DOM attribute', async function(assert) {

      // Given DOM node with HTML inputs without
      // default attribute values provided
      var snapshot = document.createElement('form');
      snapshot.innerHTML = `
        <input type="radio" id="checkbox1" />
        <input type="radio" id="radio1" />
        <input type="checkbox" id="checkbox2"/>
        <input type="checkbox" id="radio2"/>
        <input type="text" id="text1"/>
        <input type="button" id="button1"/>
      `;

      // Given `value` and `checked` attributes are
      // set programmatically as JS props
      snapshot['radio1'].value = 'radio value 1';
      snapshot['radio1'].checked = true;

      snapshot['checkbox1'].value = 'checkbox value 1';
      snapshot['checkbox1'].checked = true;

      snapshot['radio2'].value = 'radio value 2';
      snapshot['checkbox2'].value = 'checkbox value 2';

      snapshot['text1'].value = 'text value';
      snapshot['button1'].value = 'button value';
      snapshot['button1'].checked = true; // unsupported "checked" attribute for a button

      // When function is called with given snapshot
      prepareInputValuesForCopying(snapshot);

      assert.equal(snapshot['radio1'].getAttribute('value'), 'radio value 1');
      assert.equal(snapshot['radio1'].hasAttribute('checked'), true);

      assert.equal(snapshot['checkbox1'].getAttribute('value'), 'checkbox value 1');
      assert.equal(snapshot['checkbox1'].hasAttribute('checked'), true);

      assert.equal(snapshot['radio2'].getAttribute('value'), 'radio value 2');
      assert.equal(snapshot['checkbox2'].getAttribute('value'), 'checkbox value 2');
      assert.equal(snapshot['text1'].getAttribute('value'), 'text value');
      assert.equal(snapshot['button1'].getAttribute('value'), 'button value');
      assert.equal(snapshot['button1'].hasAttribute('checked'), false);
    });

  });

});
