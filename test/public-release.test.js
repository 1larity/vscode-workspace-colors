const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pkg = require('../package.json');
test('public metadata uses required licence and no runtime dependencies', () => {
  assert.equal(pkg.license, 'CC-BY-NC-SA-4.0');
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
  assert.match(pkg.repository.url, /^https:\/\/github\.com\/1larity\//);
});
test('sensitive settings cannot be supplied by a workspace', () => {
  const props = pkg.contributes.configuration.properties;
  for (const key of ['codexQuota.codexPath', 'claudeQuota.credentialsPath', 'zaiQuota.host']) {
    if (props[key]) assert.equal(props[key].scope, 'machine');
  }
  if (props['codexQuota.codexPath'] || props['claudeQuota.credentialsPath']) {
    assert.equal(pkg.capabilities.untrustedWorkspaces.supported, false);
  }
});
test('invalid saved palette indices are rejected before palette lookup', () => {
  const vm = require('node:vm');
  const box = {module: {exports: {}}, require: () => ({})};
  vm.runInNewContext(fs.readFileSync('extension.js', 'utf8') + '\nmodule.exports.valid = validPaletteIndex;', box);
  for (const value of [-1, 8, 100, null, undefined, '2', 1.5]) assert.equal(box.module.exports.valid(value), false);
  for (const value of [0, 7]) assert.equal(box.module.exports.valid(value), true);
});
