import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import backstop from 'ember-backstop/test-support/backstop';

module('Acceptance | list rentals', function(hooks) {
  setupApplicationTest(hooks);

  test('Should load the app and should match previously approved reference.', async function(assert) {
    await visit('/');
    await backstop(assert);
    assert.equal(currentURL(), '/', 'URL should be at root.');
    assert.dom(this.element.querySelector('#title')).hasText('Welcome to Ember');
  });

});
