/* OSRS Board Game — UI: numbered spaces, slot machine boss pick, center boss display */
let tok=null;
function buildBoard(){
  const b=document.getElementById('board'); b.innerHTML='';
  for(let i=0;i<12;i++){
    const sp=S[i], lo=LAYOUT[i];
    const el=document.createElement('div'); el.className='space'; el.id='sp'+i;
    el.style.gridRow=lo.r; el.style.gridColumn=lo.c;
    // BIG number always visible
    const num=document.createElement('div'); num.className='space-num';
    num.textContent=sp.label; el.appendChild(num);
    if(sp.type==='start'){
      el.classList.add('start');
      el.innerHTML+= '<div class="sn start-label">'+sp.name+'</div>';
    }else{
      const r=getRegion(sp.regionId);
      el.innerHTML+= '<div class="bar" style="background:'+r.color+'"></div><div class="sn">'+r.emoji+'<br>'+r.name+'</div>';
    }
    b.appendChild(el);
  }
  // Center area — black box for boss display
  const ct=document.createElement('div'); ct.id='centerArea';
  ct.style.cssText='grid-row:2/4;grid-column:2/4;background:#1e180c;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;overflow:hidden';
  ct.innerHTML='<div style="color:#c9a64e;font-size:1.6rem;font-weight:900;text-align:center;">OSRS Board Game</div><div style="color:#8a7a60;font-size:1.3rem;margin-top:4px;line-height:1.3;text-align:center;">Roll region to prepare in and roll the boss you have to defeat!</div>';
  b.appendChild(ct);
  // Token
  tok=document.createElement('div'); tok.className='token'; tok.id='token';
  tok.innerHTML='<img src="static/images/default%20character%20-%20cropped.png" alt="character" style="width:53px;height:53px;image-rendering:pixelated;display:block">';
  document.getElementById('boardWrap').appendChild(tok);
  positionToken(0);
  // Build slot machine overlay
  buildSlotOverlay();
}

function positionToken(i,instant){
  const sp=document.getElementById('sp'+i); const bw=document.getElementById('boardWrap');
  if(!sp||!bw||!tok)return;
  const br=bw.getBoundingClientRect(), sr=sp.getBoundingClientRect();
  if(instant){tok.style.transition='none';}
  tok.style.left=(sr.left-br.left+sr.width/2)+'px'; tok.style.top=(sr.top-br.top+sr.height-26)+'px';
  if(instant){tok.offsetHeight;tok.style.transition='';}
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
  let step=0;
  function next(){
    if(step>=path.length){done();return;}
    positionToken(path[step]);
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
    const speed=n<8?120:150+(n-8)*40;
    n++;
    if(n<14){setTimeout(tick,speed);}
    else{
      d1.classList.remove('rolling'); d2.classList.remove('rolling');
      d1.classList.add('landed'); d2.classList.add('landed');
      d1.style.boxShadow=''; d2.style.boxShadow='';
      cb();
      drawDice(d1,G.dice[0]); drawDice(d2,G.dice[1]);
      setTimeout(()=>{d1.classList.remove('landed');d2.classList.remove('landed');renderAll();},400);
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
      <div class="slot-title">🎰 ROLLING BOSS...</div>\
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
  // Find the target card (in the middle copy for natural stop)
  const bossesWithImg=ALL_BOSSES.filter(b=>b.img);
  const totalUnique=bossesWithImg.length;
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
    <div style="color:#ffd700;font-weight:900;font-size:2rem;text-align:center;margin-bottom:4px;line-height:1.2;">Prepare in <span style="color:#fff;">'+prepRegion+'</span> and then defeat <span style="color:#fff;">'+boss.n+'</span></div>\
    '+(imgPath?'<img src="'+imgPath+'" alt="'+boss.n+'" style="flex:1;min-height:0;width:90%;max-width:90%;object-fit:contain;image-rendering:pixelated;border-radius:6px;margin:4px 0;" onerror="this.style.display=\'none\'">':'<div style="color:#aaa;font-size:2.5rem;">👤</div>');
}

function updateCenterDefault(){
  const ct=document.getElementById('centerArea'); if(!ct)return;
  if(G.region){
    ct.innerHTML='<div class="rb-border" style="color:#ffd700;font-size:2rem;font-weight:900;text-align:center;cursor:pointer;" onclick="doRoll2()">🎰 Now roll the boss!</div>';
  }else{
    ct.innerHTML='<div style="color:#c9a64e;font-size:1.6rem;font-weight:900;text-align:center;">OSRS Board Game</div><div style="color:#8a7a60;font-size:1.3rem;margin-top:6px;line-height:1.3;text-align:center;">Roll region to prepare in and roll the boss you have to defeat!</div>';
  }
}

// ==================== BUTTONS ====================
function updateBtns(){
  const b1=document.getElementById('btn1'),rst=document.getElementById('btnReset');
  if(b1)b1.style.visibility=(G.phase==='roll1' && !G.anim)?'':'hidden';
  if(rst)rst.style.visibility=G.phase==='done'?'':'hidden';
  if(b1)b1.disabled=G.anim;
  const dr=document.getElementById('diceResult');
  if(dr)dr.textContent=G.dice[0]?('= '+String(G.dice[0]+G.dice[1])):'';
  // Hide old boss result text
  const br=document.getElementById('bossResult');
  if(br)br.style.display='none';
}

function renderAll(){
  if(G.pos!==undefined){if(!G.anim)positionToken(G.pos);highlightSpace(G.pos);}
  if(G.boss){showBossInCenter(G.boss);}
  else{updateCenterDefault();}
  updateBtns();
}
document.addEventListener('DOMContentLoaded',()=>{buildBoard();renderAll();});
