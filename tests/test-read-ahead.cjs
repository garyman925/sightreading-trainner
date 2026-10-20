const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/notation.js'),'utf8'),c);
const el=(attrs={})=>({attrs,setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k]}});
const rect=el(),text=el(),g=el();g.querySelector=s=>s==='rect'?rect:text;
const notes=[el({'data-read-start':'0','data-read-end':'1'}),el({'data-read-start':'4','data-read-end':'5'}),el({'data-read-start':'4','data-read-end':'8'}),el({'data-read-start':'8','data-read-end':'8.01'})];
const container={querySelector:()=>g,querySelectorAll:()=>notes};const preview=c.window.SRNotation.preview;
preview(container,-1);assert.equal(g.attrs.visibility,'hidden');preview(container,0);assert.equal(text.textContent,'預讀第 2 小節');assert.equal(rect.attrs.x,'314');assert.ok(notes[1].attrs.filter&&notes[2].attrs.filter);assert.ok(!notes[0].attrs.filter);
preview(container,4);assert.equal(text.textContent,'預讀第 3 小節');assert.ok(notes[3].attrs.filter);assert.ok(!notes[1].attrs.filter);
preview(container,8);assert.equal(text.textContent,'預讀第 4 小節');preview(container,12);assert.equal(g.attrs.visibility,'hidden');assert.ok(notes.every(n=>!n.attrs.filter));preview(container,0,false);assert.equal(g.attrs.visibility,'hidden');
console.log('PASS: next-bar boundaries, note and expression glow, count-in/final-bar/off cleanup.');
