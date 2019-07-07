import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  click,
  currentURL,
  visit,
  fillIn,
  triggerKeyEvent
} from '@ember/test-helpers'
import backstop from 'ember-backstop/test-support/backstop'

module('Acceptance | list rentals', function(hooks) {
  setupApplicationTest(hooks);

  test('Simple tests.', async function(assert) {
    await visit('/');
    await backstop(assert);
    assert.equal(currentURL(), '/', 'URL should be at root.');
    assert.dom(this.element.querySelector('#title')).hasText('Welcome to Ember');
  });

});
