/* Original SVG grand-staff renderer. Pitch is diatonic; spacing is shared by both hands. */
(() => {
  const W = 950, H = 335, start = 137, barWidth = 198, beatWidth = 44;
  const letters = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const xy = (pitch,hand) => {
    const m=pitch.match(/^([A-G])([#b]*)(\d)$/);
    return (hand==='right'?110:250) - (Number(m[3])*7+letters[m[1]]-(hand==='right'?30:18))*5;
  };
  const bx = (beat,length=4) => start + Math.floor(beat/length)*barWidth + (beat%length)*(176/length);
  function beamGroups(events,groups,length){
    const result=[];let current=[],lastKey='';
    const flush=()=>{if(current.length>1)result.push(current);current=[];};
    events.forEach((e,i)=>{
      const local=e.beat%length;let sum=0,group=0;for(let j=0;j<groups.length;j++){if(local>=sum)group=j;sum+=groups[j];}
      const key=Math.floor(e.beat/length)+':'+group;
      if(e.duration!==.5||!e.notes.length){flush();lastKey='';return;}
      if(key!==lastKey||(current.length&&events[current.at(-1)].beat+.5!==e.beat))flush();
      current.push(i);lastKey=key;
    });flush();return result;
  }
  function rest(x,y,d) {
    if(d>=2) return `<rect x="${x-5}" y="${y+(d===4?0:-4)}" width="11" height="4" fill="currentColor"/>${d===3?`<circle cx="${x+11}" cy="${y-3}" r="1.8"/>`:''}`;
    if(d===.5) return `<circle cx="${x-3}" cy="${y-5}" r="3.1" fill="currentColor"/><path d="M${x-5},${y-4} Q${x+1},${y+1} ${x+6},${y-9} L${x},${y+13}" fill="none" stroke="currentColor" stroke-width="1.9"/>`;
    return `<path d="M${x-3},${y-14} l7,9 -6,8 6,8 q-10,-7 -8,5 q-8,-9 2,-12 l-7,-8 8,-7 z" fill="currentColor"/>${d===1.5?`<circle cx="${x+11}" cy="${y-1}" r="1.8"/>`:''}`;
  }
  function render(ex,{labels=false,guide=true,selected=null,compact=false}={}) {
    const m=window.SRMeter?window.SRMeter.info(ex):{length:4,total:16,groups:[1,1,1,1],starts:[0,1,2,3],n:4,d:4};
    const B=m.length,bx=beat=>start+Math.floor(beat/B)*barWidth+(beat%B)*(176/B);
    const out=[`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ex.title)}，四小節大譜表，上方右手、下方左手，${esc(ex.key)} 調" xmlns="http://www.w3.org/2000/svg">`];
    out.push(`<title>${esc(ex.title)} — 雙手對齊的大譜表</title><rect width="${W}" height="${H}" fill="#fff"/>`);
    out.push('<defs><filter id="read-glow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#e5a52c" flood-opacity=".85"/></filter></defs><g id="read-ahead" visibility="hidden" pointer-events="none"><rect x="314" y="36" width="198" height="262" rx="9" fill="#fff0bd" fill-opacity=".55" stroke="#d8a03d" stroke-width="1.5" filter="url(#read-glow)"/><text x="413" y="20" text-anchor="middle" font-size="12" fill="#8a5a12" font-family="sans-serif">預讀第 2 小節</text></g>');
    // Behind notation: a quiet beat grid can be disabled for unaided reading.
    if(guide) for(let b=0;b<m.total;b+=.5) out.push(`<line x1="${bx(b)}" y1="56" x2="${bx(b)}" y2="270" stroke="#dce9e8" stroke-dasharray="2 5" stroke-width="1"/>`);
    out.push(`<g id="score-cursor" visibility="hidden"><rect id="cursor-band" x="${bx(0)-11}" y="50" width="22" height="220" rx="5" fill="#216b68" opacity=".10"/><line id="cursor-line" x1="${bx(0)}" y1="50" x2="${bx(0)}" y2="270" stroke="#438e88" stroke-width="1.5" opacity=".65"/></g>`);
    for(const y of [70,210]){
      for(let i=0;i<5;i++)out.push(`<line x1="28" y1="${y+i*10}" x2="925" y2="${y+i*10}" stroke="#83959c" stroke-width=".8"/>`);
      for(let b=0;b<=4;b++){const x=b===0?116:b===4?925:116+b*barWidth;out.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+40}" stroke="#84979e" stroke-width="${b===4?2:1}"/>`);}
    }
    out.push(`<path d="M21 70 C5 78 25 139 13 157 C25 175 5 241 21 250 M28 70 V250" stroke="#536b77" stroke-width="1.7" fill="none"/>`);
    // Clefs drawn as paths to remain legible offline without a music font.
    out.push(`<g transform="translate(52 100)" stroke="#425c69" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M-3 29 C16 36 15 12 -3 -9 C-16 -25 10 -53 7 -35 C5 -18 -20 -9 -14 8 C-9 22 17 17 13 3 C9 -10 -10 -7 -8 5 C-7 10 -3 12 1 11 M7 -35 L-1 32 C-3 43 -13 37 -10 32" stroke-width="2.6"/><circle cx="-10" cy="32" r="3" fill="#425c69" stroke="none"/></g>`);
    out.push(`<g transform="translate(47 220)" fill="#425c69"><path d="M-8 -1 C-7 -16 15 -14 13 0 C12 11 -1 19 -12 22 C0 15 6 8 6 0 C6 -10 -3 -12 -6 -4 Z"/><circle cx="-6" cy="-1" r="3.5"/><circle cx="20" cy="-5" r="1.9"/><circle cx="20" cy="5" r="1.9"/></g>`);
    for(const y of [70,210]){
      out.push(`<text x="108" y="${y+17}" fill="#425c69" font-family="Georgia,serif" font-size="20" font-weight="bold" text-anchor="middle">${m.n}</text><text x="108" y="${y+36}" fill="#425c69" font-family="Georgia,serif" font-size="20" font-weight="bold" text-anchor="middle">${m.d}</text>`);
      const signature=window.SRArrangement?window.SRArrangement.signature(ex.key):(ex.key==='G'?{F:'#'}:ex.key==='F'?{B:'b'}:{});
      const entries=Object.entries(signature),sharp=entries[0]?.[1]==='#';
      const positions=sharp?(y===70?[70,85,65,80,95,75,90]:[220,235,215,230,245,225,240]):(y===70?[90,75,95,80,100,85,105]:[240,225,245,230,250,235,255]);
      entries.forEach(([letter,acc],i)=>out.push('<text class="key-signature" x="'+(72+i*6)+'" y="'+(positions[i]+6)+'" font-size="18" fill="#425c69">'+(acc==='#'?'♯':'♭')+'</text>'));
    }
    for(let b=0;b<4;b++){
      out.push(`<text x="${bx(b*B)-1}" y="31" fill="#74878d" font-size="12" font-family="sans-serif">${b+1}</text>`);
      for(let beat=0;beat<m.n;beat++)out.push(`<text x="${bx(b*B+beat*4/m.d)}" y="314" text-anchor="middle" fill="#91a3a9" font-family="sans-serif" font-size="10">${beat+1}</text>`);
    }
    for(const hand of ['right','left']){
      const middle=hand==='right'?90:230;
      const bottom=hand==='right'?110:250, top=bottom-40;
      const events=ex.hands[hand];
      const beams=beamGroups(events,m.groups,B),beamFor=new Map();
      for(const indices of beams){const ys=indices.flatMap(i=>events[i].notes.map(n=>xy(n,hand)));const up=ys.reduce((a,b)=>a+b,0)/ys.length>=middle;const data={indices,up,end:up?Math.min(...ys)-31:Math.max(...ys)+31};indices.forEach(i=>beamFor.set(i,data));}
      // Accidentals last for a bar; initialize with the key signature.
      let lastBar=-1, accidentals={};
      events.forEach((event,index)=>{
        const bar=Math.floor(event.beat/B);
        if(bar!==lastBar){accidentals={};lastBar=bar;}
        const x=bx(event.beat), color=hand==='right'?'#255a91':'#98602c', dur=event.duration;
        out.push(`<g data-read-start="${event.beat}" data-read-end="${event.beat+event.duration}" data-note-hand="${hand}" data-note-beat="${event.beat}" style="color:${color}" fill="${color}">`);
        if(!event.notes.length){out.push(rest(x,middle,dur));out.push('</g>');return;}
        const ys=event.notes.map(p=>xy(p,hand));
        const beam=beamFor.get(index),stemUp=beam?beam.up:(Math.min(...ys)+Math.max(...ys))/2>=middle;
        const sign=stemUp?-1:1;
        // Second intervals use alternating notehead sides while preserving a common stem.
        const sorted=event.notes.map((p,i)=>({p,y:ys[i]})).sort((a,b)=>stemUp?b.y-a.y:a.y-b.y);
        let prevY=null, shifted=false;
        sorted.forEach(({p,y})=>{
          shifted=prevY!==null&&Math.abs(y-prevY)===5?!shifted:false;prevY=y;
          const nx=x+(shifted?(stemUp?10:-10):0);
          for(let ly=bottom+10;ly<=y;ly+=10)out.push(`<line x1="${nx-9}" y1="${ly}" x2="${nx+9}" y2="${ly}" stroke="${color}" stroke-width="1"/>`);
          for(let ly=top-10;ly>=y;ly-=10)out.push(`<line x1="${nx-9}" y1="${ly}" x2="${nx+9}" y2="${ly}" stroke="${color}" stroke-width="1"/>`);
          out.push(`<ellipse cx="${nx}" cy="${y}" rx="${dur===4?7:6}" ry="4.1" transform="rotate(-19 ${nx} ${y})" fill="${dur>=2?'white':color}" stroke="${color}" stroke-width="${dur>=2?1.7:1}"/>`);
          const m=p.match(/^([A-G])([#b]*)(\d)$/), pitchId=m[1]+m[3], expected=window.SRArrangement?.signature(ex.key)[m[1]]??((ex.key==='G'&&m[1]==='F')?'#':(ex.key==='F'&&m[1]==='B')?'b':'');
          const previous=accidentals[pitchId]??expected;
          if(m[2]!==previous)out.push(`<text x="${x-19}" y="${y+6}" fill="${color}" font-size="19">${m[2]==='##'?'×':m[2]==='bb'?'♭♭':m[2]==='#'?'♯':m[2]==='b'?'♭':'♮'}</text>`);
          accidentals[pitchId]=m[2];
          if(dur===1.5||dur===3)out.push(`<circle cx="${nx+12}" cy="${(y-bottom)%10===0?y-5:y}" r="1.7" fill="${color}"/>`);
        });
        if(dur!==4){
          const stemX=x+(stemUp?5:-5), from=stemUp?Math.max(...ys):Math.min(...ys), end=beam?beam.end:(stemUp?Math.min(...ys):Math.max(...ys))+sign*31;
          out.push(`<line x1="${stemX}" y1="${from}" x2="${stemX}" y2="${end}" stroke="${color}" stroke-width="1.2"/>`);
          if(dur===.5&&!beam)out.push(`<path d="M${stemX} ${end} q15 ${-sign*9} 0 ${-sign*22} q8 ${sign*12} 0 ${sign*16}" fill="${color}"/>`);
        }
        if(hand==='right'&&ex.expression?.staccato?.includes(event.beat))out.push(`<circle data-symbol="staccato" style="cursor:pointer" cx="${x}" cy="${Math.max(...ys)+12}" r="2" fill="${color}"/>`);
        if(labels)out.push(`<text x="${x}" y="${hand==='right'?151:289}" text-anchor="middle" font-family="sans-serif" font-size="${event.notes.length>1?8:10}" fill="${color}">${esc(event.notes.map(p=>p.replaceAll('#','♯').replaceAll('b','♭')).join('·'))}</text>`);
        out.push('</g>');
      });
      for(const indices of beams){const beam=beamFor.get(indices[0]),first=events[indices[0]],last=events[indices.at(-1)],color=hand==='right'?'#255a91':'#98602c';out.push('<line class="note-beam" data-read-start="'+first.beat+'" data-read-end="'+(last.beat+last.duration)+'" x1="'+(bx(first.beat)+(beam.up?5:-5))+'" x2="'+(bx(last.beat)+(beam.up?5:-5))+'" y1="'+beam.end+'" y2="'+beam.end+'" stroke="'+color+'" stroke-width="4"/>');}
    }
    if(ex.expression){
      for(const m of ex.expression.marks)out.push(`<text data-symbol="${esc(m.text)}" style="cursor:pointer" data-read-start="${m.beat}" data-read-end="${m.beat+.01}" x="${bx(m.beat)}" y="181" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="21" fill="#203846">${esc(m.text)}</text>`);
      for(const h of ex.expression.hairpins){
        if(h.textOnly)continue;
        const a=bx(h.start)+13,z=bx(h.end)-17,opening=h.to>h.from;
        out.push(`<path data-symbol="${opening?'crescendo':'diminuendo'}" style="cursor:pointer;pointer-events:stroke" data-read-start="${h.start}" data-read-end="${h.end}" d="M${a} ${opening?176:170} L${z} ${opening?170:176} M${a} ${opening?176:182} L${z} ${opening?182:176}" fill="none" stroke="#203846" stroke-width="1.4"/>`);
      }
      for(const slur of ex.expression.slurs||[]){
        const a=bx(slur.start),z=bx(slur.end);
        out.push(`<path data-symbol="legato" style="cursor:pointer;pointer-events:stroke" data-read-start="${slur.start}" data-read-end="${slur.end+.01}" d="M${a} 55 Q${(a+z)/2} 33 ${z} 55" stroke="#255a91" stroke-width="1.5" fill="none"/>`);
      }
    }
    for(const m of ex.expression?.symbols||[]){
      const x=bx(m.beat),y=m.y||49;
      if(m.key==='fermata')out.push('<g data-read-start="'+m.beat+'" data-read-end="'+(m.beat+.01)+'" fill="#203846"><path d="M'+(x-11)+' '+(y-2)+' Q'+x+' '+(y-24)+' '+(x+11)+' '+(y-2)+'" fill="none" stroke="#203846" stroke-width="1.8"/><circle cx="'+x+'" cy="'+(y-4)+'" r="2"/></g>');
      else out.push('<text data-read-start="'+m.beat+'" data-read-end="'+(m.beat+.01)+'" x="'+x+'" y="'+y+'" text-anchor="'+(m.key==='release'?'end':'middle')+'" font-family="Georgia,serif" font-size="16" font-style="italic" fill="#203846">'+esc(m.text)+'</text>');
    }
    out.push('</svg>');
    const full=out.join('');
    // Real SVG hit targets: <use> instances can retarget clicks to the use node.
    const areas=[];
    if(ex.expression){
      for(const h of ex.expression.hairpins)for(let bar=Math.floor(h.start/B);bar<=Math.floor((h.end-.001)/B);bar++){
        const a=Math.max(h.start,bar*B),z=Math.min(h.end,bar*B+B-.2);
        areas.push({key:h.to>h.from?'crescendo':'diminuendo',x:bx(a)+12,y:162,w:Math.max(20,bx(z)-bx(a)-24),h:28});
      }
      for(const sl of ex.expression.slurs||[])areas.push({key:'legato',x:bx(sl.start)-5,y:34,w:Math.max(24,bx(sl.end)-bx(sl.start)+10),h:28});
      for(const e of ex.hands.right.filter(e=>ex.expression.staccato?.includes(e.beat)&&e.notes.length))areas.push({key:'staccato',x:bx(e.beat)-12,y:Math.max(...e.notes.map(n=>xy(n,'right')))+2,w:24,h:24});
      for(const m of ex.expression.marks)areas.push({key:m.text,x:bx(m.beat)-23,y:156,w:46,h:38});
    }
    for(const m of ex.expression?.symbols||[])areas.push({key:m.key,x:bx(m.beat)-22,y:(m.y||49)-22,w:44,h:30});
    const hitTargets=compactLayout=>'<g class="symbol-hit-targets">'+areas.map(a=>{
      const second=compactLayout&&a.x+a.w/2>=512;
      return '<rect data-symbol="'+esc(a.key)+'" role="button" tabindex="0" aria-label="解釋 '+esc(a.key)+'" x="'+(a.x-(second?396:0))+'" y="'+(a.y+(second?325:0))+'" width="'+a.w+'" height="'+a.h+'" fill="transparent" pointer-events="all" style="cursor:pointer"/>';
    }).join('')+'</g>';
    if(!compact)return full.replace('</svg>',hitTargets(false)+'</svg>');
    const body=full.slice(full.indexOf('>')+1,full.lastIndexOf('</svg>'));
    return '<svg class="compact-score" viewBox="0 0 530 650" role="img" aria-label="'+esc(ex.title)+'，每行兩小節，上下兩行大譜表" xmlns="http://www.w3.org/2000/svg"><defs><g id="compact-source">'+body+'</g></defs><svg x="0" y="0" width="512" height="325" viewBox="0 0 512 325" overflow="hidden"><use href="#compact-source"/></svg><line x1="512" y1="70" x2="512" y2="250" stroke="#83959c" stroke-width="1"/><svg x="0" y="325" width="116" height="325" viewBox="0 0 116 325" overflow="hidden"><use href="#compact-source"/></svg><svg x="116" y="325" width="414" height="325" viewBox="512 0 414 325" overflow="hidden"><use href="#compact-source"/></svg>'+hitTargets(true)+'</svg>';

  }
  function cursor(container,beat,visible=true,B=4){
    const g=container.querySelector('#score-cursor');
    if(!g)return;
    g.setAttribute('visibility',visible?'visible':'hidden');
    if(!visible)return;
    const x=bx(Math.max(0,Math.min(4*B-.01,beat)),B);
    g.querySelector('rect').setAttribute('x',x-11);
    g.querySelector('line').setAttribute('x1',x);
    g.querySelector('line').setAttribute('x2',x);
  }
  function preview(container,beat,enabled=true,B=4){
    const g=container.querySelector('#read-ahead');if(!g)return;
    const bar=enabled&&beat>=0&&beat<3*B?Math.floor(beat/B)+1:-1;
    if(g.getAttribute('data-active-bar')===String(bar))return;
    g.setAttribute('data-active-bar',String(bar));g.setAttribute('visibility',bar<0?'hidden':'visible');
    for(const el of container.querySelectorAll('[data-read-start]')){
      const active=bar>=0&&Number(el.getAttribute('data-read-start'))<(bar+1)*B&&Number(el.getAttribute('data-read-end'))>bar*B;
      if(active)el.setAttribute('filter','url(#read-glow)');else el.removeAttribute('filter');
    }
    if(bar<0)return;
    const x=116+bar*barWidth;
    g.querySelector('rect').setAttribute('x',x);
    g.querySelector('text').setAttribute('x',x+barWidth/2);
    g.querySelector('text').textContent='預讀第 '+(bar+1)+' 小節';
  }
  window.SRNotation={beamGroups,render,cursor,preview,beatX:bx,pitchY:xy,width:W};
})();
