const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/notation.js'),'utf8'),c);
const el=(a={})=>({a,setAttribute(k,v){this.a[k]=String(v)},getAttribute(k){return this.a[k]??null},removeAttribute(k){delete this.a[k]}});
for(const B of [1.5,2,2.5,3,4,4.5,5]){
 const g=el(),r=el(),txt=el();g.querySelector=s=>s==='rect'?r:txt;
 const notes=Array.from({length:4},(_,i)=>el({'data-read-start':i*B,'data-read-end':(i+1)*B}));
 const container={querySelector:()=>g,querySelectorAll:()=>notes};
 for(let bar=0;bar<4;bar++){c.window.SRNotation.preview(container,bar*B,true,B);notes.forEach((n,i)=>assert.equal(!!n.a.filter,bar<3&&i===bar+1,'B='+B));}
}
console.log('PASS: next-bar note glow boundaries for every supported bar length.');
