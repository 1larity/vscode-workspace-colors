const test = require("node:test");
const assert = require("node:assert/strict");

test("project exposes the expected extension entry point", () => {
  const pkg = require("../package.json");
  assert.equal(pkg.main, "./extension.js");
  assert.equal(pkg.contributes.commands.length, 5);
});

test("palette has eight distinct colours for dark and light themes", () => {
  const source = require("node:fs").readFileSync("extension.js", "utf8");
  const colours = [...source.matchAll(/base: \"(#[0-9a-f]{6})\"/g)].map((m) => m[1]);
  assert.equal(colours.length, 16);
  assert.equal(new Set(colours).size, colours.length);
});

test("supports empty windows without a workspace settings target", () => {
  const source = require("node:fs").readFileSync("extension.js", "utf8");
  assert.match(source, /ConfigurationTarget\.Global/);
});

test("defines five named intensity levels", () => {
  const source = require("node:fs").readFileSync("extension.js", "utf8");
  for (const name of ["Bright", "Shaded", "Umbra", "Subdued", "Dim"]) assert.match(source, new RegExp(name));
});

test("provides a webview colour wheel picker", () => {
  const source = require("node:fs").readFileSync("extension.js", "utf8");
  assert.match(source, /createWebviewPanel\("workspaceColorsPicker"/);
  assert.match(source, /canvas/);
  assert.match(source, /type="range"/);
  assert.match(source, /Random colour in selected scheme/);
  assert.match(source, /Title bar/);
  assert.match(source, /Window background/);
  assert.match(source, /Pane title bar/);
  assert.match(source, /levels\.indexOf/);
  assert.match(source, /function cssHex/);
});
