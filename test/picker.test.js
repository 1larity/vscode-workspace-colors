const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
test('Apply keeps panel open; Close disposes it', async () => {
  let handler, disposed = 0;
  const panel = {webview: {onDidReceiveMessage(fn) {handler = fn;}}, dispose() {disposed++;}};
  const vscode = {
    window: {activeColorTheme: {kind: 2}, createWebviewPanel: () => panel},
    ColorThemeKind: {Light: 1, HighContrastLight: 4}, ViewColumn: {Active: 1},
    ConfigurationTarget: {Global: 1, Workspace: 2},
    workspace: {getConfiguration: () => ({get: (key, fallback) => fallback, update: async () => {}})}
  };
  const state = {get: (_, fallback) => fallback, update: async () => {}};
  const context = {workspaceState: state, globalState: state, subscriptions: []};
  const sandbox = {require: () => vscode, module: {exports: {}}};
  vm.runInNewContext(fs.readFileSync('extension.js', 'utf8') + '\nmodule.exports.openColorPicker = openColorPicker;', sandbox);
  await sandbox.module.exports.openColorPicker(context, 0, {hide() {}, show() {}});
  assert.match(panel.webview.html, /id="close"/);
  await handler({command: 'apply', hex: '#123456', intensity: 'Subdued'});
  assert.equal(disposed, 0);
  await handler({command: 'close'});
  assert.equal(disposed, 1);
});
