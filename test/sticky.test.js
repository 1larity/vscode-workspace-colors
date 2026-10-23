const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function load(light){const box={require:()=>({window:{activeColorTheme:{kind:light?1:2}},ColorThemeKind:{Light:1,HighContrastLight:4}}),module:{exports:{}}};vm.runInNewContext(fs.readFileSync('extension.js','utf8')+'\nmodule.exports.colours=colourCustomizations;module.exports.keys=COLOR_KEYS;',box);return box.module.exports;}
test('pinned sidebar rows are opaque and follow palette in either theme; Clear owns the token',()=>{
 for(const light of [false,true]){const api=load(light);for(const base of ['#233547','#adbeef']){const colours=api.colours({base,foreground:'#ffffff'});assert.equal(colours['sideBarStickyScroll.background'],base);assert.equal(colours['sideBar.background'],base+'14');}assert.ok(api.keys.includes('sideBarStickyScroll.background'));}
});
