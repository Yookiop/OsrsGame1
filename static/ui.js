/* OSRS Board Game — UI: numbered spaces, slot machine boss pick, center boss display */
let tok=null;
let completedSort={col:0,asc:true};
function buildBoard(){
  const b=document.getElementById('board'); b.innerHTML='';
  for(let i=0;i<12;i++){
    const sp=S[i], lo=LAYOUT[i];
    const el=document.createElement('div'); el.className='space'; el.id='sp'+i;
    el.style.gridRow=lo.r; el.style.gridColumn=lo.c;
    el.innerHTML+= '<div class="space-char"></div>';
    if(sp.type==='start'){
      el.classList.add('start');
      el.innerHTML+= '<img class="start-pole" src="static/images/start pole animated new.png" alt="START">';
      el.innerHTML+= '<div class="sn"><span class="roll-text"></span></div>';
    }else{
      const r=getRegion(sp.regionId);
      el.innerHTML+= '<div class="bar" style="background:'+r.color+'"></div><div class="sn">'+r.emoji+'<br>'+r.name+'<br><span class="roll-text"></span></div>';
    }
    b.appendChild(el);
  }
  // Center area — black box for boss display
  const ct=document.createElement('div'); ct.id='centerArea';
  ct.style.cssText='grid-row:2/4;grid-column:2/4;background:#1e180c;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;overflow:hidden;position:relative';
  ct.innerHTML='<div style="color:#c9a64e;font-size:7rem;line-height:1;">🃏</div><div style="color:#ffd700;font-size:2rem;font-weight:900;text-align:center;margin-top:-30px;">Land on START = JOKER</div>';
  b.appendChild(ct);
  // Build slot machine overlay
  buildSlotOverlay();
}

function walkToken(fromIdx,toIdx,done){
  if(fromIdx===toIdx){done();return;}
  // Build path: clockwise from fromIdx to toIdx (wrap if needed)
  const path=[];
  let i=fromIdx;
  while(i!==toIdx){
    i=(i+1)%12;
    path.push(i);
  }
  // Hide character face on starting tile (it will walk step by step)
  const startEl=document.getElementById('sp'+fromIdx);
  if(startEl){const sc=startEl.querySelector('.space-char');if(sc){sc.className='space-char';sc.innerHTML='';}}
  let step=0;
  function next(){
    if(step>=path.length){done();return;}
    // Show character face on current walk step tile
    const el=document.getElementById('sp'+path[step]);
    if(el){const sc=el.querySelector('.space-char');if(sc){sc.className='space-char visible';sc.innerHTML='<img src="static/images/default%20character%20-%20cropped.png" alt="character">';}}
    // Hide character on previous walk step
    if(step>0){
      const p=document.getElementById('sp'+path[step-1]);
      if(p){const sc=p.querySelector('.space-char');if(sc){sc.className='space-char';sc.innerHTML='';}}
    }
    step++;
    setTimeout(next,180);
  }
  next();
}
function highlightSpace(i){
  for(let j=0;j<12;j++){const el=document.getElementById('sp'+j);if(el)el.classList.remove('active');}
  const el=document.getElementById('sp'+i); if(el)el.classList.add('active');
}

// ==================== DICE ====================
function drawDice(el,v){
  const dots=el.querySelectorAll('.dot'); dots.forEach(d=>d.style.visibility='hidden');
  const m={1:[4],2:[2,6],3:[2,4,6],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  (m[v]||[]).forEach(i=>{if(dots[i])dots[i].style.visibility='visible';});
}
function animateDice(cb){
  const d1=document.getElementById('d1'),d2=document.getElementById('d2');
  if(!d1||!d2){cb();return;}
  d1.classList.add('rolling'); d2.classList.add('rolling');
  d1.style.boxShadow='0 0 20px rgba(201,166,78,0.6)'; d2.style.boxShadow='0 0 20px rgba(201,166,78,0.6)';
  let n=0;
  function tick(){
    drawDice(d1,Math.ceil(Math.random()*6)); drawDice(d2,Math.ceil(Math.random()*6));
    const speed=n<6?120:150+(n-6)*40;
    n++;
    if(n<10){setTimeout(tick,speed);}
    else{
      d1.classList.remove('rolling'); d2.classList.remove('rolling');
      d1.classList.add('landed'); d2.classList.add('landed');
      d1.style.boxShadow=''; d2.style.boxShadow='';
      cb();
      drawDice(d1,G.dice[0]); drawDice(d2,G.dice[1]);
      renderAll();
      setTimeout(()=>{d1.classList.remove('landed');d2.classList.remove('landed');},400);
    }
  }
  tick();
}

// ==================== SLOT MACHINE OVERLAY ====================
let slotRunning=false;
function buildSlotOverlay(){
  // Remove existing if any
  const old=document.getElementById('slotOverlay'); if(old)old.remove();
  const ov=document.createElement('div'); ov.id='slotOverlay';
  ov.innerHTML='\
    <div class="slot-bg"></div>\
    <div class="slot-window">\
      <div class="slot-title"><span style="color:#c9a64e;-webkit-text-fill-color:#c9a64e;">🎰</span> ROLLING BOSS...</div>\
      <div class="slot-track-wrap"><div class="slot-track" id="slotTrack"></div></div>\
      <div class="slot-frame"><div class="slot-frame-arrow">▲</div></div>\
    </div>';
  document.body.appendChild(ov);
  // populate track with all boss images
  const track=document.getElementById('slotTrack');
  const bossesWithImg=ALL_BOSSES.filter(b=>b.img); // skip bosses without image
  // Duplicate 5x for seamless scrolling
  for(let r=0;r<5;r++){
    bossesWithImg.forEach(b=>{
      const card=document.createElement('div'); card.className='slot-card';
      card.dataset.n=b.n; card.dataset.region=b.region;
      card.innerHTML='<img src="static/boss_images/'+b.img+'" alt="'+b.n+'" onerror="this.parentElement.style.display=\'none\'">';
      track.appendChild(card);
    });
  }
}

function openSlotMachine(targetBoss, done){
  if(slotRunning)return; slotRunning=true;
  const ov=document.getElementById('slotOverlay'); if(!ov){done();return;}
  ov.style.display='flex';
  const track=document.getElementById('slotTrack');
  // Rebuild track with only available bosses for current region
  track.innerHTML='';
  track.style.justifyContent='';
  track.style.transform='';
  track.style.transition='';
  const avail=getAvailableBosses(G.region.id);
  let bossesWithImg=avail.filter(b=>b.img);
  if(bossesWithImg.length===0){ov.style.display='none';slotRunning=false;done();return;}
  // Reorder according to globally shuffled bossOrder (random per game)
  const availKeys=new Set(bossesWithImg.map(b=>bossKey(b)));
  bossesWithImg=G.bossOrder.filter(b=>b.img && availKeys.has(bossKey(b)));
  const totalUnique=bossesWithImg.length;

  // === Only 1 boss left: static centered display with glow landing ===
  if(totalUnique===1){
    const b = bossesWithImg[0];
    const card = document.createElement('div');
    card.className = 'slot-card slot-single';
    card.innerHTML = '<img src="static/boss_images/' + b.img + '" alt="' + b.n + '">';
    track.appendChild(card);
    track.style.justifyContent = 'center';

    setTimeout(() => {
      ov.style.display = 'none';
      track.style.justifyContent = '';
      track.style.transform = '';
      track.style.transition = '';
      slotRunning = false;
      showBossInCenter(targetBoss);
      done();
    }, 1500);
    return;
  }

  // Duplicate 5x for seamless scrolling
  for(let r=0;r<5;r++){
    bossesWithImg.forEach(b=>{
      const card=document.createElement('div'); card.className='slot-card';
      card.dataset.n=b.n; card.dataset.region=b.region;
      card.innerHTML='<img src="static/boss_images/'+b.img+'" alt="'+b.n+'" onerror="this.parentElement.style.display=\'none\'">';
      track.appendChild(card);
    });
  }
  // Find the target card (in the middle copy for natural stop)
  const targetIdx=bossesWithImg.findIndex(b=>b.n===targetBoss.n&&b.region===targetBoss.region);
  if(targetIdx<0){ov.style.display='none';slotRunning=false;done();return;}

  // Position target in the middle copy (copy index 2): 2*totalUnique + targetIdx
  const targetCardIdx=2*totalUnique+targetIdx;
  const cards=track.querySelectorAll('.slot-card');
  const cardW=cards[0]?cards[0].offsetWidth+8:133; // card width + gap

  // Calculate final scroll: center the target card in the window
  const winW=ov.querySelector('.slot-window').offsetWidth;
  const finalScroll=targetCardIdx*cardW - winW/2 + cardW/2;

  // Spin 1 extra cycle then decelerate smoothly to target
  const spinCycles = 1;
  const totalSpin = cardW * totalUnique * spinCycles + finalScroll;
  const duration = 3200;

  // Wait for browser to layout the now-visible overlay, then reset & animate
  requestAnimationFrame(()=>{
    track.style.transition='none';
    track.style.transform='translateX(0px)';
    requestAnimationFrame(()=>{
      track.style.transition='transform '+duration+'ms cubic-bezier(0.10, 0.90, 0.25, 1)';
      track.style.transform='translateX(-'+totalSpin+'px)';
    });
  });

  setTimeout(()=>{
    ov.style.display='none'; slotRunning=false;
    showBossInCenter(targetBoss);
    done();
  },duration+200);
}

// ==================== CENTER BOSS DISPLAY ====================
function showBossInCenter(boss){
  const ct=document.getElementById('centerArea'); if(!ct)return;
  const imgPath=boss.img?'static/boss_images/'+boss.img:'';
  const prepRegion=G.region?G.region.name:'Unknown';
  ct.innerHTML='\
    <div style="color:#ffd700;font-weight:900;font-size:1.5rem;text-align:center;margin-bottom:4px;line-height:1.2;">Prepare in <span style="color:#fff;">'+prepRegion+'</span> and then defeat <span style="color:#fff;">'+boss.n+'</span> in <span style="color:#fff;">'+boss.regionName+'</span>!</div>\
    '+(imgPath?'<img src="'+imgPath+'" alt="'+boss.n+'" style="flex:1;min-height:0;width:90%;max-width:90%;object-fit:contain;image-rendering:pixelated;border-radius:6px;margin:4px 0;" onerror="this.style.display=\'none\'">':'<div style="color:#aaa;font-size:2.5rem;">👤</div>');
}

function updateCenterDefault(){
  const ct=document.getElementById('centerArea'); if(!ct)return;
  if(G.pos!==0 && isRegionCompleted(S[G.pos].regionId) && (G.freePass || (G.anim && G.phase==='roll1' && !G.region && G.freePassStreak>0))){
    // Landed on completed region → free pass
    ct.classList.remove('center-joker');
    ct.style.justifyContent='center';
    const r=getRegion(S[G.pos].regionId);
    ct.innerHTML='<div style="position:relative;z-index:2;color:#4caf50;font-size:3rem;line-height:1;">✅</div><div style="position:relative;z-index:2;color:#4caf50;font-size:1.5rem;font-weight:900;text-align:center;">'+r.name+' already completed!<br><span style="font-size:1.4rem;opacity:0.9;">Auto-rolling... ('+G.freePassStreak+'/10)</span></div>';
  }else if(G.phase==='joker_choice'){
    ct.classList.add('center-joker');
    ct.style.justifyContent='flex-start';
    ct.style.padding='4px 10px 4px 10px';
    ct.innerHTML='\
      <div style="position:relative;z-index:1;color:#ffd700;font-size:2.2rem;font-weight:900;text-align:center;text-shadow:0 0 12px rgba(0,0,0,0.9),0 2px 4px rgba(0,0,0,0.8);">JOKER!</div>\
      <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#4a3860 0%,#2a2014 70%);margin:0 8px;border-radius:6px;align-self:stretch;min-height:0;">\
        <div style="font-size:140px;line-height:1;">🃏</div>\
      </div>\
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding-bottom:4px;margin-top:auto;">\
        <div style="color:#ffd700;font-size:1.3rem;font-weight:900;text-align:center;text-shadow:0 0 10px rgba(0,0,0,0.9),0 1px 3px rgba(0,0,0,0.8);">Choose:</div>\
        <button onclick="showRegionPicker()" style="font-size:1.2rem;padding:10px 24px;background:#c9a64e;color:#1a1208;border:none;border-radius:8px;cursor:pointer;font-weight:800;">🎯 Pick Region</button>\
        <button onclick="showBossPicker()" style="font-size:1.2rem;padding:10px 24px;background:#4a2820;color:#ff6b6b;border:none;border-radius:8px;cursor:pointer;font-weight:800;">👹 Pick Boss</button>\
      </div>';
  }else if(G.region){
    ct.classList.remove('center-joker');
    ct.style.justifyContent='center';
    ct.innerHTML='<div class="rb-border" style="color:#ffd700;font-size:2rem;font-weight:900;text-align:center;cursor:pointer;" onclick="doRoll2()">🎰 Now roll the boss!</div>';
  }else{
    ct.classList.remove('center-joker');
    ct.style.justifyContent='center';
    ct.innerHTML='<button class="btn btn-roll" id="btnRoll" onclick="doRoll1()"><img src="static/images/dice%20icon.png" alt="🎲" style="width:34px;height:34px;vertical-align:middle;margin-right:3px;"> ROLL</button><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:9rem;line-height:1;background:radial-gradient(ellipse at center,#4a3860 0%,transparent 70%);margin:4px 0;align-self:stretch;">🃏</div><div style="color:#ffd700;font-size:1.5rem;font-weight:900;text-align:center;margin-top:-70px;">Land on START = JOKER</div>';
  }
}

// ==================== JOKER PICKERS ====================
function showRegionPicker(){
  const ct=document.getElementById('centerArea'); if(!ct)return;
  let html='<div style="color:#ffd700;font-size:1.3rem;font-weight:900;text-align:center;margin-bottom:6px;">Pick preparation region:</div>';
  html+='<div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:4px;width:100%;min-height:0;">';
  R.forEach(r=>{
    const avail=getAvailableBosses(r.id);
    const hasAvail=avail.length>0;
    const style=hasAvail
      ?'font-size:0.95rem;padding:4px;background:#3a2e1e;color:#f0e6d2;border:1px solid #4a3828;border-radius:5px;cursor:pointer;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;'
      :'font-size:0.95rem;padding:4px;background:#1a1208;color:#555;border:1px solid #2a2014;border-radius:5px;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:0.5;';
    const onclick=hasAvail?'onclick="selectJokerRegion(\''+r.id+'\')"':'';
    html+='<button '+onclick+' style="'+style+'"><span>'+r.emoji+'</span><span>'+r.name+'</span>'+(hasAvail?'':'<span style="font-size:0.65rem;color:#4caf50;">✓ Completed</span>')+'</button>';
  });
  html+='</div>';
  ct.innerHTML=html;
}
function selectJokerRegion(regionId){
  G.region=getRegion(regionId);
  G.boss=null; G.phase='roll2';
  renderAll();
}
function showBossPicker(){
  const ct=document.getElementById('centerArea'); if(!ct)return;
  let html='<div style="color:#ffd700;font-size:1.5rem;font-weight:900;text-align:center;margin-bottom:4px;">Pick boss to defeat:</div>';
  html+='<div style="color:#aaa;font-size:1rem;text-align:center;margin-bottom:6px;">(will auto-assign available region)</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;overflow-y:auto;max-height:calc(100% - 65px);width:100%;">';
  // Group bosses by name — show one entry per unique boss if it has ANY available region
  const seen={};
  ALL_BOSSES.forEach((b,i)=>{
    const key=b.n+'|'+b.region;
    if(seen[key])return; seen[key]=true;
    // Check if this boss is available: depends on toggle setting
    const hasAvail=G.allowBossRepeats?true:!G.defeatedBosses.includes(bossKey(b));
    const imgTag=b.img?'<img src="static/boss_images/'+b.img+'" style="max-width:80%;max-height:55px;object-fit:contain;image-rendering:pixelated;" onerror="this.style.display=\'none\'">':'<span style="font-size:2rem;">👤</span>';
    const btnStyle=hasAvail
      ?'font-size:0.85rem;padding:16px 3px 4px 3px;background:#2a2014;color:#ccc;border:1px solid #3a2e1e;border-radius:5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-height:102px;'
      :'font-size:0.85rem;padding:16px 3px 4px 3px;background:#1a1208;color:#555;border:1px solid #2a2014;border-radius:5px;display:flex;flex-direction:column;align-items:center;min-height:102px;opacity:0.5;';
    const onclick=hasAvail?'onclick="selectJokerBoss('+i+')"':'';
    const nameHtml='<div style="min-height:2.6em;line-height:1.3;display:flex;align-items:center;justify-content:center;text-align:center;width:100%;margin-top:auto;padding-bottom:0px;"><span style="color:#ffd700;font-weight:900;">'+b.n+'</span></div>';
    const imgHtml='<div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:0;width:100%;position:relative;">'+imgTag+(hasAvail?'':'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#f44336;opacity:0.85;">🚫</div>')+'</div>';
    html+='<button '+onclick+' style="'+btnStyle+'">'+imgHtml+nameHtml+'</button>';
  });
  html+='</div>';
  ct.innerHTML=html;
}
function selectJokerBoss(idx){
  const b=ALL_BOSSES[idx];
  G.boss=b;
  // Pick a non-completed region for this boss
  const availRegions=R.filter(r=>!isRegionCompleted(r.id));
  G.region=availRegions.length>0?availRegions[Math.floor(Math.random()*availRegions.length)]:R[0];
  G.phase='done';
  renderAll();
}

// ==================== BUTTONS ====================
function updateBtns(){
  const cmp=document.getElementById('btnComplete'),gup=document.getElementById('btnGiveUp');
  const doneVisible=(G.phase==='done' && !G.anim);
  if(cmp)cmp.style.display=doneVisible?'':'none';
  if(gup)gup.style.display=doneVisible?'':'none';

  const roll=document.getElementById('btnRoll');
  if(roll)roll.disabled=G.anim||G.won;

  const dr=document.getElementById('diceResult');
  if(dr)dr.textContent=G.dice[0]?('= '+String(G.dice[0]+G.dice[1])):'';

  // Update points display
  const pts=document.getElementById('pointsDisplay');
  if(pts)pts.innerHTML='Current<br>points:<br>'+G.points+' / '+MAX_POINTS;

  // Update completed count
  const cc=document.getElementById('completedCount');
  if(cc)cc.textContent=G.completed.length;

  // Update completed table
  const tb=document.getElementById('completedBody');
  if(tb){
    if(G.completed.length===0){
      tb.innerHTML='<tr><td colspan="2" style="color:#666;font-style:italic;padding:4px 6px;text-align:center;">No tasks completed yet</td></tr>';
    }else{
      // Build rows from completed region IDs — show which boss was defeated
      let rows=G.completed.map(regionId=>{
        const reg=getRegion(regionId);
        const bossName=G.completedBosses[regionId]||'✅ Completed';
        return {prepName:reg?reg.name:'?', prepEmoji:reg?reg.emoji:'', bossName:bossName};
      });
      // Sort
      const col=completedSort.col, asc=completedSort.asc;
      rows.sort((a,b)=>{
        const va=col===0?a.prepName:a.bossName;
        const vb=col===0?b.prepName:b.bossName;
        return asc?va.localeCompare(vb):vb.localeCompare(va);
      });
      tb.innerHTML=rows.map(r=>
        '<tr><td style="padding:2px 6px;border-bottom:1px solid #2a2014;border-right:1px solid #4a3828;">'+r.prepEmoji+' '+r.prepName+'</td>'+
        '<td style="padding:2px 6px;border-bottom:1px solid #2a2014;color:#ffd700;">'+r.bossName+'</td></tr>'
      ).join('');
    }
  }
  // Update sort arrows
  for(let c=0;c<2;c++){
    const arrow=document.getElementById('sortArrow'+c);
    if(arrow){
      arrow.style.visibility=completedSort.col===c?'visible':'hidden';
      arrow.textContent=completedSort.asc?'▲':'▼';
    }
  }
}

function updateCompletedTiles(){
  for(let i=1;i<12;i++){
    const sp=S[i]; if(sp.type!=='region')continue;
    const el=document.getElementById('sp'+i); if(!el)continue;
    const r=getRegion(sp.regionId);
    if(isRegionCompleted(sp.regionId)){
      // Region completed — show checkmark, NOT joker
      el.classList.add('completed');
      const bar=el.querySelector('.bar'); if(bar)bar.style.background='#4caf50';
      const sn=el.querySelector('.sn'); if(sn)sn.innerHTML='✅<br>'+r.name+'<br><span class="roll-text"></span>';
    }else{
      el.classList.remove('completed');
      const bar=el.querySelector('.bar'); if(bar)bar.style.background=r.color;
      const sn=el.querySelector('.sn'); if(sn)sn.innerHTML=r.emoji+'<br>'+r.name+'<br><span class="roll-text"></span>';
    }
  }
}

function updateRollIndicators(){
  // Only show during roll1 and joker_choice — hide during roll2 and done
  if(G.pos===undefined||G.phase==='roll2'||G.phase==='done'){
    // Clear all roll-text when hiding
    for(let i=0;i<12;i++){const rt=document.getElementById('sp'+i);if(rt){const t=rt.querySelector('.roll-text');if(t)t.textContent='';}}
    return;
  }
  for(let i=0;i<12;i++){
    const el=document.getElementById('sp'+i); if(!el)continue;
    const rt=el.querySelector('.roll-text'); if(!rt)continue;
    // Calculate required roll from current position
    let req=(i-G.pos+12)%12;
    if(req===0)req=12; // staying on same spot = need to roll 12
    if(req>=2&&req<=12){
      rt.textContent='(roll '+req+')';
    }else{
      rt.textContent='';
    }
  }
}

function updateCharFaces(){
  if(G.pos===undefined)return;
  for(let i=0;i<12;i++){
    const el=document.getElementById('sp'+i); if(!el)continue;
    const ch=el.querySelector('.space-char'); if(!ch)continue;
    if(i===G.pos){
      ch.className='space-char visible';
      ch.innerHTML='<img src="static/images/default%20character%20-%20cropped.png" alt="character">';
    }else{
      ch.className='space-char';
      ch.innerHTML='';
    }
  }
}

function renderAll(){
  if(G.pos!==undefined){highlightSpace(G.pos);}
  if(G.boss){showBossInCenter(G.boss);}
  else{updateCenterDefault();}
  updateBtns();
  updateCompletedTiles();
  updateRollIndicators();
  updateCharFaces();
}

// ==================== CONFIRM GIVE UP POPUP ====================
function showConfirmGiveUpPopup(){
  const ov=document.createElement('div'); ov.id='confirmGiveUpOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2000;display:flex;align-items:center;justify-content:center;flex-direction:column';
  ov.innerHTML='\
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);"></div>\
    <div style="position:relative;z-index:1;text-align:center;">\
      <div style="font-size:2rem;color:#ff6b6b;font-weight:900;margin-bottom:20px;">ARE YOU SURE YOU WANT TO GIVE UP?</div>\
      <div style="font-size:1.1rem;color:#aaa;margin-bottom:24px;">All progress will be lost! Points reset to 0.</div>\
      <div style="display:flex;gap:16px;justify-content:center;">\
        <button onclick="dismissConfirmGiveUp()" style="font-size:1.2rem;padding:10px 24px;background:#c9a64e;color:#1a1208;border:none;border-radius:8px;cursor:pointer;font-weight:800;">✓ Yes, give up</button>\
        <button onclick="cancelConfirmGiveUp()" style="font-size:1.2rem;padding:10px 24px;background:#4a2820;color:#ff6b6b;border:none;border-radius:8px;cursor:pointer;font-weight:800;">✗ Cancel</button>\
      </div>\
    </div>';
  document.body.appendChild(ov);
}
function dismissConfirmGiveUp(){
  const ov=document.getElementById('confirmGiveUpOverlay'); if(ov)ov.remove();
  showGameOverPopup();
}
function cancelConfirmGiveUp(){
  const ov=document.getElementById('confirmGiveUpOverlay'); if(ov)ov.remove();
}

// ==================== GAME OVER POPUP ====================
function showGameOverPopup(){
  const ov=document.createElement('div'); ov.id='gameOverOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2000;display:flex;align-items:center;justify-content:center;flex-direction:column';
  ov.innerHTML='\
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);"></div>\
    <div style="position:relative;z-index:1;text-align:center;">\
      <div style="font-size:5rem;color:#ff0000;font-weight:900;text-shadow:0 0 30px rgba(255,0,0,0.8);animation:gameOverPulse 1s ease-in-out infinite alternate;">GAME OVER</div>\
      <button onclick="dismissGameOver()" style="font-size:1.3rem;padding:12px 28px;background:#c9a64e;color:#1a1208;border:none;border-radius:8px;cursor:pointer;font-weight:800;margin-top:10px;">🔄 Try Again</button>\
    </div>';
  document.body.appendChild(ov);
  // Add keyframe dynamically
  if(!document.getElementById('gameOverStyle')){
    const style=document.createElement('style'); style.id='gameOverStyle';
    style.textContent='@keyframes gameOverPulse{from{transform:scale(1)}to{transform:scale(1.05)}}';
    document.head.appendChild(style);
  }
}
function dismissGameOver(){
  const ov=document.getElementById('gameOverOverlay'); if(ov)ov.remove();
  confirmGiveUp(); // from game.js — resets state
}

// ==================== VICTORY POPUP ====================
function showVictoryPopup(){
  const ov=document.createElement('div'); ov.id='victoryOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2000;display:flex;align-items:center;justify-content:center;flex-direction:column';
  ov.innerHTML='\
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);"></div>\
    <div style="position:relative;z-index:1;text-align:center;">\
      <div style="font-size:4rem;color:#4caf50;font-weight:900;text-shadow:0 0 30px rgba(76,175,80,0.8);animation:victoryPulse 1s ease-in-out infinite alternate;">CONGRATULATIONS<br>YOU\'VE WON!</div>\
      <button onclick="dismissVictory()" style="font-size:1.3rem;padding:12px 28px;background:#c9a64e;color:#1a1208;border:none;border-radius:8px;cursor:pointer;font-weight:800;margin-top:10px;">🔄 Play Again</button>\
    </div>';
  document.body.appendChild(ov);
  if(!document.getElementById('victoryStyle')){
    const style=document.createElement('style'); style.id='victoryStyle';
    style.textContent='@keyframes victoryPulse{from{transform:scale(1)}to{transform:scale(1.05)}}';
    document.head.appendChild(style);
  }
}
function dismissVictory(){
  const ov=document.getElementById('victoryOverlay'); if(ov)ov.remove();
  confirmGiveUp();
}

function toggleSort(col){
  if(completedSort.col===col){ completedSort.asc=!completedSort.asc; }
  else{ completedSort.col=col; completedSort.asc=true; }
  renderAll();
}

// ==================== COLUMN RESIZE ====================
function initColumnResize(){
  // Header title resize — drag to make pad cell (B1) wider, pushing title left
  const hdrTable=document.getElementById('completedHeader');
  const handlePad=document.getElementById('resizePad');
  if(hdrTable&&handlePad){
    const cols=hdrTable.querySelectorAll('col');
    const colTitle=cols[0], colPad=cols[1];
    let dragging=false, startX, padStartW;
    handlePad.addEventListener('mousedown',e=>{
      dragging=true;
      startX=e.clientX;
      padStartW=colPad.offsetWidth||0;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove',e=>{
      if(!dragging)return;
      const dx=e.clientX-startX;
      const tw=hdrTable.getBoundingClientRect().width;
      const newPadW=Math.max(0,Math.min(tw-80,padStartW-dx));
      // Negative dx = dragging left = pad gets wider, title shrinks
      colPad.style.width=newPadW+'px';
      colTitle.style.width=(tw-newPadW)+'px';
    });
    document.addEventListener('mouseup',()=>{dragging=false;});
  }
  // Prep column resize (data table header)
  const handlePrep=document.getElementById('resizePrep');
  const colPrep=document.getElementById('colPrep');
  const colPrepShadow=document.getElementById('colPrepShadow');
  if(handlePrep&&colPrep){
    let dragging=false, startX, startW;
    handlePrep.addEventListener('mousedown',e=>{
      dragging=true; startX=e.clientX; startW=colPrep.offsetWidth;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove',e=>{
      if(!dragging)return;
      const tw=colPrep.parentElement.parentElement.parentElement.getBoundingClientRect().width;
      const dx=e.clientX-startX;
      const newW=Math.max(80,Math.min(tw-120,startW+dx));
      colPrep.style.width=newW+'px';
      if(colPrepShadow)colPrepShadow.style.width=newW+'px';
    });
    document.addEventListener('mouseup',()=>{dragging=false;});
  }
}

function updateToggleUI(){
  const tog=document.getElementById('bossRepeatToggle');
  if(!tog)return;
  tog.className='toggle-switch '+(G.allowBossRepeats?'on':'off');
}

document.addEventListener('DOMContentLoaded',()=>{initBossOrder();buildBoard();updateToggleUI();renderAll();initColumnResize();});
