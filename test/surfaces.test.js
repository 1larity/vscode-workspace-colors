const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const sandbox = {require: () => ({}), module: {exports: {}}};
vm.runInNewContext(fs.readFileSync('extension.js', 'utf8'), sandbox);
const surfaces = sandbox.module.exports.surfaceColours;
test('all three surfaces change with the selected colour in both themes', () => {
  for (const light of [false, true]) {
    const red = surfaces('#ff0000', light), blue = surfaces('#0000ff', light);
    for (const key of ['title', 'editor', 'pane']) {
      assert.notEqual(red[key], blue[key]);
      assert.match(red[key], /^#[0-9a-f]{6}$/);
    }
    assert.equal(new Set(Object.values(red)).size, 3);
  }
});
