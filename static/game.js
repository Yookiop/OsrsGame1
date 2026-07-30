/* OSRS Board Game — roll region (preparation), then slot-machine boss pick */
const G = { phase:'roll1', dice:[0,0], pos:0, region:null, boss:null, anim:false, points:0, completed:[], completedBosses:{}, won:false, freePass:false, allowBossRepeats:false, defeatedBosses:[] };

function bossKey(b){ return b.region+'|'+b.n; }

// Completed: array of region IDs. One boss per region completes the whole region.
function isRegionCompleted(regionId){ return G.completed.includes(regionId); }
function getAvailableBosses(regionId){
  if(isRegionCompleted(regionId)) return [];
  // Include ALL bosses from ALL regions (even from "completed" regions),
  // then exclude only the SPECIFIC bosses that have been defeated individually.
  let pool=[...ALL_BOSSES];
  // If boss repeats are disabled, exclude previously defeated bosses
  if(!G.allowBossRepeats){
    pool=pool.filter(b=>!G.defeatedBosses.includes(bossKey(b)));
  }
  return pool;
}

function rollDice(){ const a=Math.ceil(Math.random()*6),b=Math.ceil(Math.random()*6); G.dice=[a,b]; return a+b; }

function doRoll1(){
  if(G.phase!=='roll1'||G.anim)return; G.anim=true; G.freePass=false; G.dice=[0,0]; renderAll();
  const oldPos=G.pos;
  animateDice(()=>{
    const total=rollDice();
    // Move forward from current position, looping around the board (like Monopoly)
    const targetPos=(G.pos+total)%12;
    // Wait ~1s then walk token clockwise tile by tile
    setTimeout(()=>{
      walkToken(oldPos,targetPos,()=>{
        G.pos=targetPos;
        if(targetPos===0){
          // Landed on START → JOKER (only START has joker)
          G.region={id:'joker',name:'JOKER',color:'#ffd700',emoji:'🃏'}; G.phase='joker_choice';
        }else{
          G.region=getRegion(S[G.pos].regionId);
          if(isRegionCompleted(G.region.id)){
            // Region already completed → free pass, back to roll1
            G.phase='roll1'; G.region=null; G.freePass=true;
            // Auto-reroll after a brief pause so the player sees the message
            setTimeout(()=>{if(G.phase==='roll1'&&G.freePass&&!G.anim)doRoll1();},4000);
          }else{
            G.phase='roll2';
          }
        }
        G.boss=null; G.anim=false;
        highlightSpace(G.pos);
        renderAll();
      });
    },1000);
  });
}

function doRoll2(){
  if(G.phase!=='roll2'||G.anim)return; G.anim=true; renderAll();
  // Pick random boss from available (uncompleted) bosses for this region
  const avail=getAvailableBosses(G.region.id);
  if(avail.length===0){ G.phase='roll1'; G.anim=false; renderAll(); return; }
  G.boss=avail[Math.floor(Math.random()*avail.length)];
  openSlotMachine(G.boss,()=>{
    G.phase='done'; G.anim=false;
    renderAll();
  });
}

function completeTask(){
  if(G.phase!=='done'||!G.region||!G.boss)return;
  const regionId=G.region.id;
  if(!G.completed.includes(regionId)){
    G.completed.push(regionId);
    G.completedBosses[regionId]=G.boss.n;
    G.points++;
  }
  // Always track which boss was defeated (used when repeats are disabled)
  if(G.boss){
    const key=bossKey(G.boss);
    if(!G.defeatedBosses.includes(key)) G.defeatedBosses.push(key);
  }
  G.phase='roll1'; G.dice=[0,0]; G.region=null; G.boss=null;
  if(G.points>=MAX_POINTS){
    G.won=true;
    renderAll();
    setTimeout(()=>showVictoryPopup(),300);
    return;
  }
  renderAll();
}

function giveUp(){
  if(G.phase!=='done')return;
  showConfirmGiveUpPopup();
}

function confirmGiveUp(){
  G.phase='roll1'; G.dice=[0,0]; G.pos=0; G.region=null; G.boss=null;
  G.points=0; G.completed=[]; G.completedBosses={}; G.won=false; G.freePass=false; G.defeatedBosses=[];
  highlightSpace(0);
  renderAll();
}

function forceStart(){
  G.phase='joker_choice'; G.pos=0; G.dice=[0,0];
  G.region={id:'joker',name:'JOKER',color:'#ffd700',emoji:'🃏'};
  G.boss=null; G.anim=false; G.freePass=false;
  highlightSpace(0);
  renderAll();
}

const MAX_POINTS = R.length; // 11 regions total (one boss per region, incl. Kandarin)

function resetGame(){ G.phase='roll1'; G.dice=[0,0]; G.pos=0; G.region=null; G.boss=null; G.freePass=false; G.defeatedBosses=[]; G.completedBosses={}; renderAll(); }

function toggleBossRepeats(){
  G.allowBossRepeats=!G.allowBossRepeats;
  updateToggleUI();
}
