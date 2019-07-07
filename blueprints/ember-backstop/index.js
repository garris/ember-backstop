'use strict';

module.exports = {
  description: 'Add dependencies for BackstopJS visual regression testing addon.',

  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addPackagesToProject([
      {name : 'backstopjs'},
      {name : 'ember-cli-shims'}
    ]);
  }

};
