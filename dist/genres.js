(() => {
  const names={original:'原譜',baroque:'Baroque 巴洛克',classical:'Classical 古典',romantic:'Romantic 浪漫',jazz:'Jazz／Blues 爵士／藍調'};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const hash=s=>[...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
  const note=(degree,octave)=>{const letters='CDEFGAB';return letters[((degree%7)+7)%7]+(octave+Math.floor(degree/7));};
  function fill(total,pattern){const result=[];let pos=0,i=0;while(pos<total){const d=Math.min(pattern[i++%pattern.length],total-pos);result.push(d);pos+=d;}return result;}
  function generate(source,genre){
    if(genre==='original')return clone(source);
    const e=clone(source),m=window.SRMeter.info(e),g=e.grade,seed=hash(source.id),v=seed%12;
    e.key='C';e.hands={right:[],left:[]};e.title=names[genre]+' · '+({baroque:'動機對答',classical:'問句與答句',romantic:'旋律與流動伴奏',jazz:'直拍短句'}[genre])+' '+(v+1);e.genre=genre;e.seed=seed;e.handBalance={right:1,left:genre==='romantic'?.6:genre==='classical'?.7:genre==='jazz'?.8:1};
    const bounds=g===2?[0,4]:g<=4?[-1,7]:[-2,9];
    const fit=degree=>{while(degree<bounds[0])degree+=7;while(degree>bounds[1])degree-=7;return Math.max(bounds[0],Math.min(bounds[1],degree));};
    const motifs=[[0,1,2,1],[2,1,0,1],[0,2,1,2],[2,0,1,0],[0,1,2,3],[3,2,1,0]];
    const roots=v<6?[0,3,4,0]:[0,1,4,0],progression=genre==='jazz'?[0,3,4,0]:roots;
    const put=(hand,bar,durations,degrees,restFirst=false)=>{
      if(hand==='left'&&g>2&&Math.max(...degrees)>4)degrees=degrees.map(d=>d-7);
      let beat=bar*m.length;durations.forEach((duration,i)=>{let degree=degrees[i%degrees.length];const notes=restFirst&&i===0?[]:[note(fit(degree),hand==='right'?4:3)];
        e.hands[hand].push({beat,duration,notes});beat+=duration;
      });
    };
    for(let bar=0;bar<4;bar++){
      const root=progression[bar],motif=motifs[(v+Math.floor(bar/2))%motifs.length];
      if(genre==='baroque'){
        const rd=m.groups.flatMap((group,i)=>g===2&&(i+bar+v)%3===0?[group]:fill(group,[.5]));
        const ld=m.groups.flatMap((group,i)=>g>=5&&(i+bar)%2?fill(group,[.5]):[group]);
        put('right',bar,rd,motif.map(n=>root+n));
        // Delayed lower-voice entries, with the same motive in the answering bars.
        put('left',bar,ld,(bar%2?motif:motif.map(n=>2-n)).map(n=>root+n),bar===1);
      }else if(genre==='classical'){
        const rd=fill(m.length,bar%2?[1,1,2]:v%2?[.5,.5,1,2]:[1,.5,.5,2]);
        const ld=g>=3?fill(m.length,[.5]):fill(m.length,[1]);
        put('right',bar,rd,motif.map(n=>root+n).concat([root+4,root+2]));
        put('left',bar,ld,g===2?[root,root+2]:[root,root+4,root+2,root+4]);
      }else if(genre==='romantic'){
        const rd=fill(m.length,g>=3?[1.5,.5,2]:[2,1,1]);
        const ld=m.groups.flatMap(group=>fill(group,g>=4?[.5]:[1]));
        put('right',bar,rd,[root+motif[0],root+motif[1],root+motif[2],root+motif[3]]);
        put('left',bar,ld,[root,root+2,root+4,root+2]);
      }else{
        // Straight eighths: no implicit swing. Syncopation only from Grade 5.
        const rd=fill(m.length,g>=5?[.5,1,.5,1,1]:[1,.5,.5,1,1]);
        const ld=fill(m.length,g>=5?[1,.5,.5,1,1]:[1]);
        put('right',bar,rd,[root+([0,2,4][v%3]),root+2,root+([4,3,1][Math.floor(v/3)%3]),root+2,root+1],g>=5&&bar%2===0);
        put('left',bar,ld,[root,root+4,root+2,root+4],g>=5&&bar===1);
        // Occasional blues inflection is written explicitly, from Grade 4.
        if(g>=4&&bar<3){const event=e.hands.right.filter(n=>n.beat>=bar*m.length&&n.beat<(bar+1)*m.length&&n.notes.length)[1];if(event&&event.notes[0].startsWith('E'))event.notes[0]=event.notes[0].replace('E','Eb');}
      }
    }
    e.hands.right.at(-1).notes=['C4'];e.hands.left.at(-1).notes=['C3'];
    // Cadence uses a longer final sound where the meter permits it.
    if(genre==='classical'||genre==='romantic')for(const hand of ['right','left']){
      const events=e.hands[hand],last=events.at(-1),prev=events.at(-2);
      if(prev&&prev.beat>=3*m.length&&[1,1.5,2,3,4].includes(prev.duration+last.duration)){
        prev.duration+=last.duration;prev.notes=last.notes;events.pop();
      }
    }
    if(g>=3&&genre!=='baroque'){e.hands.right.at(-1).notes=['G3','C4'];if(g>=5)e.hands.left.at(-1).notes=['C3','G3'];}
    const x=e.expression={marks:[{beat:0,text:genre==='jazz'?'mf':'p',level:genre==='jazz'?.8:.5},{beat:2*m.length,text:'mf',level:.8},{beat:3*m.length,text:'p',level:.5}],hairpins:[],slurs:[],staccato:[],symbols:[],cues:[]};
    const rh=e.hands.right.filter(n=>n.notes.length);
    if(genre==='classical'||genre==='romantic')for(let bar=0;bar<4;bar++){
      const events=rh.filter(n=>Math.floor(n.beat/m.length)===bar);if(events.length>1)x.slurs.push({start:events[0].beat,end:events.at(-1).beat});
    }
    if(genre==='romantic'){
      x.hairpins=[{start:m.length,end:2*m.length,from:.5,to:.8}];
      if(g>=5){x.slowing={start:3*m.length,end:4*m.length};x.symbols.push({beat:3*m.length,key:'rit.',text:'rit.',y:49});}
      if(g>=6){x.pedals=Array.from({length:4},(_,bar)=>({start:bar*m.length,end:(bar+1)*m.length-.125}));x.symbols.push(...x.pedals.flatMap(p=>[{beat:p.start,key:'pedal',text:'Ped.',y:286},{beat:p.end,key:'release',text:'✱',y:286}]));}
    }
    if(genre==='jazz'){
      x.accent=rh.filter(n=>g>=5?n.beat%1===.5:n.beat%m.length===0).map(n=>n.beat);
      x.symbols=x.accent.map(beat=>({beat,key:'accent',text:'>',y:49}));
      x.staccato=rh.filter(n=>n.duration<=.5).map(n=>n.beat);
    }
    x.cues=[...x.marks.map(n=>({beat:n.beat,text:n.text})),...x.symbols.map(n=>({beat:n.beat,text:window.SRSymbols[n.key][0]}))].sort((a,b)=>a.beat-b.beat);
    e.preparation={baroque:'先找兩手的短動機與接力入口，聽見低音線。',classical:'先找旋律的問答與左手分解伴奏，結尾收束。',romantic:'旋律連貫，左手分解音輕聲支持；先看力度曲線。',jazz:g>=5?'直拍八分音符；先拍切分與休止，再加入低音。':'直拍八分音符；先保持低音脈搏，再加入短句回應。'}[genre];
    e.tip=e.preparation;e.genreDescription=e.preparation;
    return e;
  }
  window.SRGenres={names,generate};
})();
