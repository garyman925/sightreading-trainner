(() => {
  const definitions={
    '2/4':{n:2,d:4,groups:[1,1],unit:1},'3/4':{n:3,d:4,groups:[1,1,1],unit:1},'4/4':{n:4,d:4,groups:[1,1,1,1],unit:1},
    '3/8':{n:3,d:8,groups:[1.5],unit:.5},'6/8':{n:6,d:8,groups:[1.5,1.5],unit:1.5},'9/8':{n:9,d:8,groups:[1.5,1.5,1.5],unit:1.5},
    '5/8':{n:5,d:8,groups:[1,1.5],unit:.5},'5/4':{n:5,d:4,groups:[1,1,1,1,1],unit:1}
  };
  const allowed=grade=>['2/4','3/4','4/4',...(grade>=3?['3/8']:[]),...(grade>=4?['6/8']:[]),...(grade>=6?['9/8','5/8','5/4']:[])];
  const info=ex=>{
    const key=(ex.meter||[4,4]).join('/'),d=definitions[key],length=d.n*4/d.d,groups=ex.grouping||d.groups;
    let sum=0;const starts=groups.map(g=>{const b=sum;sum+=g;return b;});
    return {...d,key,length,total:length*ex.bars,groups,starts,label:d.unit===1.5?'附點♩':d.unit===.5?'♪':'♩'};
  };
  window.SRMeter={definitions,allowed,info};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const oldBank=window.SR_EXERCISES.slice();
  for(const grade of [2,3,4,5,6])for(const focus of ['rhythm','vertical','ladder','expression'])for(const key of allowed(grade)){
    if(grade>=4&&key==='4/4')continue;
    for(let index=0;index<12;index++){
      const d=definitions[key],length=d.n*4/d.d,groups=key==='5/8'&&index%2?[1.5,1]:d.groups;
      const item={id:`meter-${grade}-${focus}-${key.replace('/','-')}-${index}`,grade,focus,title:`${key} · ${['同拍同行','穩定低音','旋律接力','輕巧步伐'][index%4]} ${Math.floor(index/4)+1}`,key:'C',bars:4,meter:[d.n,d.d],grouping:groups,hands:{right:[],left:[]},preparation:'先找連桿分組，再預讀雙手起音。',tip:'跟隨小節重音，長音數足時值。'};
      const pitches=[['C4','E4','G4','E4'],['F4','A4','C5','A4'],['G4','B4','D5','B4'],['C4','E4','G4','C4']],bass=['C3','F3','G2','C3'];
      for(let bar=0;bar<4;bar++){
        let pos=bar*length;
        groups.forEach((g,gi)=>{
          const short=focus!=='vertical'&&(index+gi+bar)%3!==0;
          const durations=short?Array(g*2).fill(.5):[g];
          durations.forEach((duration,j)=>{
            const note=pitches[bar][(index+gi+j+(bar%2?Math.floor(index/4):0))%4];
            const notes=focus==='vertical'&&grade>=4?[pitches[bar][index%2],pitches[bar][index%2+1]]:[note];
            item.hands.right.push({beat:pos,duration,notes});pos+=duration;
          });
        });
        pos=bar*length;
        groups.forEach((g,gi)=>{
          const durations=focus==='rhythm'&&grade>=3&&index%3===1?Array(g*2).fill(.5):[g];
          durations.forEach(duration=>{item.hands.left.push({beat:pos,duration,notes:[[['C3','E3'],['F3','C3'],['G3','D3'],['C3','E3']][bar][(index>>bar)&1]]});pos+=duration;});
        });
      }
      // Close the melody on tonic, without changing bar duration.
      item.hands.right.at(-1).notes=['C4'];
      const templates=oldBank.filter(e=>e.grade===Math.max(grade,4)&&e.focus===focus);
      const source=templates[index%templates.length];const x=item.expression=clone(source.expression);
      const map=b=>Math.min(length*4-.5,Math.round(b/4*length*2)/2);
      x.marks=x.marks.map(m=>({...m,beat:map(m.beat)}));
      x.hairpins=x.hairpins.map(h=>({...h,start:map(h.start),end:map(h.end)})).filter(h=>h.end>h.start);
      x.slurs=[];x.staccato=[];
      x.symbols=(x.symbols||[]).map(m=>({...m,beat:map(m.beat)}));
      if(grade<4){x.marks=x.marks.map(m=>m.text==='ff'?{...m,text:'f',level:1.15}:m);delete x.fermata;delete x.slowing;delete x.pedals;x.symbols=[];delete x.tenuto;delete x.accent;}
      for(const kind of ['accent','tenuto'])if(x[kind]){x[kind]=Array.from({length:4},(_,b)=>b*length);x.symbols=x[kind].map(beat=>({beat,key:kind,text:kind==='accent'?'>':'—',y:49}));}
      if(x.fermata){x.fermata={start:Math.max(item.hands.right.at(-1).beat,item.hands.left.at(-1).beat),end:length*4,factor:1.5};x.symbols=[{beat:item.hands.right.at(-1).beat,key:'fermata',text:'𝄐',y:49}];}
      if(x.slowing)x.slowing={start:3*length,end:4*length};
      if(x.pedals){x.pedals=Array.from({length:4},(_,b)=>({start:b*length,end:(b+1)*length-.125}));x.symbols=x.pedals.flatMap(p=>[{beat:p.start,key:'pedal',text:'Ped.',y:286},{beat:p.end,key:'release',text:'✱',y:286}]);}
      x.cues=[...x.marks.map(m=>({beat:m.beat,text:m.text})),...x.symbols.map(m=>({beat:m.beat,text:window.SRSymbols[m.key][0]}))].sort((a,b)=>a.beat-b.beat);
      window.SR_EXERCISES.push(item);
    }
  }
  const oldVary=window.SRVariation;
  window.SRVariation=(source,seed)=>{
    if(source.meter.join('/')==='4/4'&&!source.id.startsWith('meter-'))return oldVary(source,seed);
    const item=clone(source),m=info(item);item.id+='-v'+seed;item.title+=' · 變奏';
    for(let bar=0;bar<3;bar++){
      const events=item.hands.right.filter(e=>e.beat>=bar*m.length&&e.beat<(bar+1)*m.length);
      const notes=events.map(e=>e.notes);events.forEach((e,i)=>e.notes=clone(notes[(i+1+seed%Math.max(1,notes.length-1))%notes.length]));
    }
    return item;
  };
  window.SRTiming=(ex,bpm)=>{
    const m=info(ex),x=ex.expression||{},base=60/bpm/m.unit,times=[0];
    for(let i=0;i<m.total*2;i++){
      const b=i/2,slow=x.slowing&&b>=x.slowing.start?1+.5*(b+.25-x.slowing.start)/(x.slowing.end-x.slowing.start):1;
      const hold=x.fermata&&b>=x.fermata.start&&b<x.fermata.end?x.fermata.factor:1;
      times.push(times.at(-1)+base*.5*slow*hold);
    }
    const time=b=>{if(b<0)return b*base;if(b>=m.total)return times.at(-1)+(b-m.total)*base;const i=Math.floor(b*2);return times[i]+(times[i+1]-times[i])*(b*2-i);};
    const beat=t=>{if(t<0)return t/base;if(t>=times.at(-1))return m.total;let i=0;while(times[i+1]<=t)i++;return (i+(t-times[i])/(times[i+1]-times[i]))/2;};
    return {time,beat,duration:times.at(-1)};
  };
  window.validateExercises=()=>{
    const errors=[],ids=new Set();for(const ex of window.SR_EXERCISES){const m=info(ex);if(ids.has(ex.id))errors.push('duplicate '+ex.id);ids.add(ex.id);
      for(const hand of ['left','right']){let end=0;for(const e of ex.hands[hand]){if(e.beat!==end||!e.duration||Math.floor(e.beat/m.length)!==Math.floor((e.beat+e.duration-.001)/m.length))errors.push('timing '+ex.id);end=e.beat+e.duration;}if(end!==m.total)errors.push('total '+ex.id);}
    }return errors;
  };
})();
