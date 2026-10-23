const vscode = require("vscode");

const PALETTE = [
  { name: "Rose", dark: { base: "#633b45", foreground: "#f8eef0" }, light: { base: "#edcbd2", foreground: "#3f2028" } },
  { name: "Ochre", dark: { base: "#695331", foreground: "#faf4e7" }, light: { base: "#ead9ad", foreground: "#3f3219" } },
  { name: "Sage", dark: { base: "#3e6252", foreground: "#edf7f1" }, light: { base: "#c9e0d2", foreground: "#1f3b2d" } },
  { name: "Teal", dark: { base: "#315f60", foreground: "#eaf7f7" }, light: { base: "#c2dfe0", foreground: "#1e3b3c" } },
  { name: "Slate", dark: { base: "#3d5d72", foreground: "#edf5fa" }, light: { base: "#c9dce8", foreground: "#203646" } },
  { name: "Denim", dark: { base: "#465a78", foreground: "#eef2fb" }, light: { base: "#cbd6e9", foreground: "#25334b" } },
  { name: "Mauve", dark: { base: "#584b70", foreground: "#f2eff9" }, light: { base: "#d9d0e8", foreground: "#302842" } },
  { name: "Plum", dark: { base: "#653f61", foreground: "#f8eef7" }, light: { base: "#e3c9df", foreground: "#40273d" } }
];

const INTENSITIES = ["Bright", "Shaded", "Umbra", "Subdued", "Dim"];

const COLOR_KEYS = [
  "titleBar.activeBackground", "titleBar.activeForeground",
  "titleBar.inactiveBackground", "titleBar.inactiveForeground",
  "sideBar.background", "sideBar.foreground", "sideBarStickyScroll.background",
  "editor.background", "editorGroupHeader.tabsBackground", "editorGroupHeader.noTabsBackground",
  "activityBar.background", "activityBar.foreground",
  "statusBar.background", "statusBar.foreground",
  "statusBarItem.hoverBackground"
];

function workspaceKey() {
  const folder = vscode.workspace.workspaceFile || vscode.workspace.workspaceFolders?.[0]?.uri;
  return folder ? folder.toString() : "untitled";
}

function isLightTheme() {
  const kind = vscode.window.activeColorTheme.kind;
  return kind === vscode.ColorThemeKind.Light || kind === vscode.ColorThemeKind.HighContrastLight;
}

function mix(hex, target, amount) {
  const channels = (value) => [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const source = channels(hex);
  const destination = channels(target);
  return "#" + source.map((channel, i) => Math.round(channel + (destination[i] - channel) * amount).toString(16).padStart(2, "0")).join("");
}

function contrastForeground(hex) {
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.52 ? "#202124" : "#f8f8f8";
}

function intensityIndex() {
  const configured = vscode.workspace.getConfiguration("workspaceColors").get("intensity", "Subdued");
  const index = INTENSITIES.findIndex((name) => name.toLowerCase() === String(configured).toLowerCase());
  return index < 0 ? 3 : index;
}

function validPaletteIndex(index) {
  return Number.isInteger(index) && index >= 0 && index < PALETTE.length;
}

function colourFor(index) {
  return colourForTheme(PALETTE[index][isLightTheme() ? "light" : "dark"]);
}

function colourForCustom(hex) {
  const theme = isLightTheme() ? { base: mix(hex, "#ffffff", 0.42) } : { base: mix(hex, "#111827", 0.15) };
  return colourForTheme(theme);
}

function colourForTheme(theme) {
  const level = intensityIndex();
  if (level === 3) return { ...theme, foreground: theme.foreground || contrastForeground(theme.base) };
  const lightTheme = isLightTheme();
  const target = level === 4 ? "#111827" : "#ffffff";
  const amount = [0.42, 0.24, 0.10, 0, 0.58][level];
  const base = mix(theme.base, target, amount);
  return { base, foreground: contrastForeground(base) };
}

function surfaceColours(base, light) {
  const neutral = light ? "#f5f5f5" : "#202020";
  return { title: base, editor: mix(base, neutral, 0.78), pane: mix(base, neutral, 0.58) };
}

function colourCustomizations(palette) {
  const surfaces = surfaceColours(palette.base, isLightTheme());
  return {
    "titleBar.activeBackground": palette.base,
    "titleBar.activeForeground": palette.foreground,
    "titleBar.inactiveBackground": palette.base + "aa",
    "titleBar.inactiveForeground": palette.foreground,
    "sideBar.background": palette.base + "14",
    "sideBarStickyScroll.background": palette.base,
    "sideBar.foreground": palette.foreground,
    "editor.background": surfaces.editor,
    "editorGroupHeader.tabsBackground": surfaces.pane,
    "editorGroupHeader.noTabsBackground": surfaces.pane,
    "activityBar.background": palette.base,
    "activityBar.foreground": palette.foreground,
    "statusBar.background": palette.base,
    "statusBar.foreground": palette.foreground,
    "statusBarItem.hoverBackground": palette.base + "cc"
  };
}

function hasWorkspace() {
  return Boolean(vscode.workspace.workspaceFile || vscode.workspace.workspaceFolders?.length);
}

function configurationTarget() {
  return hasWorkspace() ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
}

async function setPalette(index, context) {
  const customColor = context.workspaceState.get("customColor");
  const palette = customColor ? colourForCustom(customColor) : colourFor(index);
  const workbench = vscode.workspace.getConfiguration("workbench");
  const current = workbench.get("colorCustomizations", {});
  await workbench.update("colorCustomizations", { ...current, ...colourCustomizations(palette) }, configurationTarget());
  await context.workspaceState.update("paletteIndex", index);
  await context.workspaceState.update("cleared", false);
  const assignments = { ...context.globalState.get("assignments", {}), [workspaceKey()]: index };
  await context.globalState.update("assignments", assignments);
  return PALETTE[index];
}

async function randomIndex(context) {
  const assignments = context.globalState.get("assignments", {});
  const used = new Set(Object.values(assignments).filter((value) => Number.isInteger(value)));
  const available = PALETTE.map((_, index) => index).filter((index) => !used.has(index));
  const choices = available.length ? available : PALETTE.map((_, index) => index);
  return choices[Math.floor(Math.random() * choices.length)];
}

async function clearPalette(context) {
  const workbench = vscode.workspace.getConfiguration("workbench");
  const current = { ...workbench.get("colorCustomizations", {}) };
  for (const key of COLOR_KEYS) delete current[key];
  await workbench.update("colorCustomizations", current, configurationTarget());
  await context.workspaceState.update("paletteIndex", undefined);
  await context.workspaceState.update("cleared", true);
  await context.workspaceState.update("customColor", undefined);
}

function pickerHtml(webview, initial, initialIntensity) {
  const nonce = String(Date.now());
  const safeInitial = JSON.stringify(initial);
  const safeIntensity = JSON.stringify(initialIntensity);
  return `<!doctype html>
<html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"><style>
body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:18px;max-width:900px;margin:auto}h1{font-size:18px;margin:0 0 10px}.row{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}canvas{width:280px;height:280px;cursor:crosshair;border-radius:50%}#swatch{width:48px;height:48px;border-radius:6px;border:1px solid var(--vscode-panel-border)}button{padding:6px 10px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;border-radius:3px;margin:3px 3px 3px 0}button:hover{background:var(--vscode-button-hoverBackground)}code{font-size:12px}.controls{min-width:280px}.control{display:grid;grid-template-columns:68px 1fr 38px;gap:6px;align-items:center;margin:3px 0}.control input{width:100%}.controls h3{font-size:12px;margin:8px 0 2px}.schemes{margin-top:16px}.schemes h2{font-size:15px;margin:0}.schemes p{font-size:12px;margin:4px 0 10px}.scheme{margin:9px 0}.scheme-label{font-weight:600;font-size:12px;margin-bottom:3px}.swatches{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.scheme-swatch{padding:8px 5px;border-radius:3px;text-align:center;font-size:11px;color:var(--vscode-foreground);border:1px solid var(--vscode-panel-border)}.selected{outline:2px solid var(--vscode-focusBorder)}.scale{font-size:10px;color:var(--vscode-descriptionForeground);display:flex;justify-content:space-between}
</style></head><body><h1>Choose workspace colour</h1><div class="row"><canvas id="wheel" width="300" height="300"></canvas><div class="controls"><div id="swatch"></div><p><code id="hex"></code></p><button id="random">Random colour in selected scheme</button><button id="apply">Apply colour and scheme</button><button id="close">Close</button><div class="scale"><span>black</span><span>brightness / white</span></div><div class="control"><label>Value</label><input id="v" type="range" min="0" max="100"><output id="vo"></output></div><h3>RGB</h3><div class="control"><label>Red</label><input id="r" type="range" min="0" max="255"><output id="ro"></output></div><div class="control"><label>Green</label><input id="g" type="range" min="0" max="255"><output id="go"></output></div><div class="control"><label>Blue</label><input id="b" type="range" min="0" max="255"><output id="bo"></output></div><h3>HSV</h3><div class="control"><label>Hue</label><input id="h" type="range" min="0" max="360"><output id="ho"></output></div><div class="control"><label>Saturation</label><input id="s" type="range" min="0" max="100"><output id="so"></output></div></div></div><section class="schemes"><h2>Colour schemes</h2><p>Samples use the VS Code foreground colour. Choose a scheme, then adjust the colour above.</p><div id="schemeList"></div></section>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi(),canvas=document.getElementById('wheel'),ctx=canvas.getContext('2d'),swatch=document.getElementById('swatch'),hexText=document.getElementById('hex'),levels=['Bright','Shaded','Umbra','Subdued','Dim'];let selected=${safeInitial},scheme=Math.max(0,levels.indexOf(${safeIntensity}));
function hsv(h,s,v){let f=(n,k=(n+h*6)%6)=>v-v*s*Math.max(Math.min(k,4-k,1),0);return [f(5),f(3),f(1)].map(x=>Math.round(x*255))}function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;let max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return [h,max?d/max:0,max]}function hexToRgb(x){return [1,3,5].map(o=>parseInt(x.slice(o,o+2),16))}function toHex(a){return '#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}function mix(a,b,t){let x=hexToRgb(a),y=hexToRgb(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t))}
function draw(){const image=ctx.createImageData(300,300),c=150,radius=146;for(let y=0;y<300;y++)for(let x=0;x<300;x++){const dx=x-c,dy=y-c,r=Math.sqrt(dx*dx+dy*dy),p=(y*300+x)*4;if(r<=radius){const rgb=hsv((Math.atan2(dy,dx)/(Math.PI*2)+.5)%1,Math.min(r/radius,1),1);image.data[p]=rgb[0];image.data[p+1]=rgb[1];image.data[p+2]=rgb[2];image.data[p+3]=255}}ctx.putImageData(image,0,0)}
${surfaceColours.toString()}
function schemeColour(level){const light=${isLightTheme()},amounts=[.42,.24,.10,0,.58],target=level===4?'#111827':'#ffffff';const base=mix(selected,light?'#ffffff':'#111827',light?.42:.15);return mix(base,target,amounts[level])}function cssHex(){const match=getComputedStyle(document.body).backgroundColor.match(/\\d+(?:\\.\\d+)?/g);return match?toHex(match.slice(0,3).map(Number)):(matchMedia('(prefers-color-scheme: light)').matches?'#ffffff':'#111827')}function updateTop(){swatch.style.background=schemeColour(scheme);hexText.textContent=selected+' · '+levels[scheme]}function renderSchemes(){const list=document.getElementById('schemeList');list.innerHTML='';const lightMode=${isLightTheme()};levels.forEach((name,i)=>{const row=document.createElement('div');row.className='scheme';const label=document.createElement('div');label.className='scheme-label';label.textContent=name;row.appendChild(label);const swatches=document.createElement('div');swatches.className='swatches';[['Title bar',surfaceColours(schemeColour(i),lightMode).title],['Window background',surfaceColours(schemeColour(i),lightMode).editor],['Pane title bar',surfaceColours(schemeColour(i),lightMode).pane]].forEach(([text,color])=>{const cell=document.createElement('div');cell.className='scheme-swatch'+(i===scheme?' selected':'');cell.style.background=color;cell.textContent=text;swatches.appendChild(cell)});row.appendChild(swatches);row.addEventListener('click',()=>{scheme=i;updateTop();renderSchemes()});list.appendChild(row)})}
let hsvState=rgbToHsv(...hexToRgb(selected));
function show(preserve=false){const rgb=hexToRgb(selected);if(!preserve) hsvState=rgbToHsv(...rgb);const [h,s,v]=hsvState;updateTop();[['r',rgb[0]],['g',rgb[1]],['b',rgb[2]],['h',h],['s',s*100],['v',v*100]].forEach(([id,value])=>{document.getElementById(id).value=value;document.getElementById(id+'o').textContent=Math.round(value)});renderSchemes()}
function fromHsv(){const h=+document.getElementById('h').value,s=+document.getElementById('s').value/100,v=+document.getElementById('v').value/100;hsvState=[h,s,v];selected=toHex(hsv(h/360,s,v));show(true)}function fromRgb(){selected=toHex(['r','g','b'].map(id=>+document.getElementById(id).value));show()}
draw();show();canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*300/r.width-150,y=(e.clientY-r.top)*300/r.height-150,rad=Math.sqrt(x*x+y*y);if(rad<=146){const [,,v]=rgbToHsv(...hexToRgb(selected)),[rr,gg,bb]=hsv((Math.atan2(y,x)/(Math.PI*2)+.5)%1,Math.min(rad/146,1),v);selected=toHex([rr,gg,bb]);show()}});['h','s','v'].forEach(id=>document.getElementById(id).addEventListener('input',fromHsv));['r','g','b'].forEach(id=>document.getElementById(id).addEventListener('input',fromRgb));document.getElementById('random').addEventListener('click',()=>{selected=toHex(hsv(Math.random(),.65+.3*Math.random(),.7+.3*Math.random()));show()});document.getElementById('close').addEventListener('click',()=>vscode.postMessage({command:'close'}));document.getElementById('apply').addEventListener('click',()=>vscode.postMessage({command:'apply',hex:selected,intensity:levels[scheme]}));
</script></body></html>`;
}

async function openColorPicker(context, index, status) {
  const current = context.workspaceState.get("customColor") || colourFor(index).base;
  const configuredIntensity = vscode.workspace.getConfiguration("workspaceColors").get("intensity", "Subdued");
  const currentIntensity = configuredIntensity === "Super subdued" ? "Dim" : (INTENSITIES.includes(configuredIntensity) ? configuredIntensity : "Subdued");
  const panel = vscode.window.createWebviewPanel("workspaceColorsPicker", "Workspace Colour", vscode.ViewColumn.Active, { enableScripts: true, retainContextWhenHidden: true });
  panel.webview.html = pickerHtml(panel.webview, current, currentIntensity);
  panel.webview.onDidReceiveMessage(async (message) => {
    if (!message || typeof message !== "object") return;
    if (message.command === "close") { panel.dispose(); return; }
    if (message.command !== "apply" || !/^#[0-9a-f]{6}$/i.test(message.hex)) return;
    if (INTENSITIES.includes(message.intensity)) await vscode.workspace.getConfiguration("workspaceColors").update("intensity", message.intensity, configurationTarget());
    await context.workspaceState.update("customColor", message.hex.toLowerCase());
    await setPalette(index, context);
    refreshStatus(status, index);
  }, undefined, context.subscriptions);
}

function refreshStatus(item, index) {
  if (!vscode.workspace.getConfiguration("workspaceColors").get("showStatusLabel")) {
    item.hide();
    return;
  }
  item.text = `$(symbol-color) ${PALETTE[index].name} · ${INTENSITIES[intensityIndex()]}`;
  item.tooltip = "Workspace Colors: choose a different colour or intensity";
  item.show();
}

async function activate(context) {
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.command = "workspaceColors.choose";
  context.subscriptions.push(status);
  const savedAssignments = context.globalState.get("assignments", {});
  const stored = context.workspaceState.get("paletteIndex", savedAssignments[workspaceKey()]);
  let index = validPaletteIndex(stored) ? stored : await randomIndex(context);
  let applied = !context.workspaceState.get("cleared", false) && (vscode.workspace.getConfiguration("workspaceColors").get("autoAssign") || validPaletteIndex(stored));
  if (applied) {
    await setPalette(index, context);
    refreshStatus(status, index);
    if (!hasWorkspace()) {
      status.tooltip = "Workspace Colors: this empty window uses the global colour. Open a folder to get a project-specific colour.";
    }
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(async () => {
      if (applied) await setPalette(index, context);
    }),
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (applied && event.affectsConfiguration("workspaceColors.intensity")) {
        await setPalette(index, context);
        refreshStatus(status, index);
      }
    }),
    vscode.commands.registerCommand("workspaceColors.choose", async () => {
      await openColorPicker(context, index, status);
    }),
    vscode.commands.registerCommand("workspaceColors.choosePalette", async () => {
      const choice = await vscode.window.showQuickPick(PALETTE.map((palette, i) => ({ label: palette.name, description: `dark ${palette.dark.base} · light ${palette.light.base}`, index: i })), { placeHolder: "Choose a named palette" });
      if (!choice) return;
      index = choice.index;
      await context.workspaceState.update("customColor", undefined);
      applied = true;
      await setPalette(index, context);
      refreshStatus(status, index);
    }),
    vscode.commands.registerCommand("workspaceColors.chooseIntensity", async () => {
      const choice = await vscode.window.showQuickPick(INTENSITIES.map((label, i) => ({ label, description: i === 3 ? "current subdued scheme" : "", index: i })), { placeHolder: "Choose colour intensity" });
      if (!choice) return;
      await vscode.workspace.getConfiguration("workspaceColors").update("intensity", INTENSITIES[choice.index], configurationTarget());
      applied = true;
      await setPalette(index, context);
      refreshStatus(status, index);
    }),
    vscode.commands.registerCommand("workspaceColors.cycle", async () => {
      index = (index + 1) % PALETTE.length;
      await context.workspaceState.update("customColor", undefined);
      applied = true;
      await setPalette(index, context);
      refreshStatus(status, index);
    }),
    vscode.commands.registerCommand("workspaceColors.clear", async () => {
      await clearPalette(context);
      applied = false;
      status.hide();
    })
  );
}

function deactivate() {}
module.exports = { activate, deactivate };

module.exports.surfaceColours = surfaceColours;
