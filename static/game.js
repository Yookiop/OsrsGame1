/* OSRS Board Game — roll region (preparation), then slot-machine boss pick */
const G = { phase:'roll1', dice:[0,0], pos:0, region:null, boss:null, anim:false, points:0, completed:[] };

// Completed key format: "prepRegionId|bossRegionId|bossName"
function makeCompletedKey(prepRegionId, boss){ return prepRegionId+'|'+boss.region+'|'+boss.n; }
function isCompleted(prepRegionId, boss){ return G.completed.includes(makeCompletedKey(prepRegionId,boss)); }
function getAvailableBosses(prepRegionId){
  return ALL_BOSSES.filter(b=>!isCompleted(prepRegionId,b));
}

function rollDice(){ const a=Math.ceil(Math.random()*6),b=Math.ceil(Math.random()*6); G.dice=[a,b]; return a+b; }

function doRoll1(){
  if(G.phase!=='roll1'||G.anim)return; G.anim=true; renderAll();
  const oldPos=G.pos;
  animateDice(()=>{
    const total=rollDice();
    const targetPos=total===12?0:total;
    // Wait ~1s then walk token clockwise tile by tile
    setTimeout(()=>{
      walkToken(oldPos,targetPos,()=>{
        G.pos=targetPos;
        if(total===12){ G.region={id:'joker',name:'JOKER',color:'#ffd700',emoji:'🃏'}; G.phase='joker_choice'; }
        else{
          G.region=getRegion(S[G.pos].regionId);
          const avail=getAvailableBosses(G.region.id);
          if(avail.length===0){
            // All bosses completed for this region — treat as joker
            G.region={id:'joker',name:'JOKER',color:'#ffd700',emoji:'🃏'};
            G.phase='joker_choice';
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
  const key=makeCompletedKey(G.region.id,G.boss);
  if(!G.completed.includes(key)){
    G.completed.push(key);
    G.points++;
  }
  G.phase='roll1'; G.dice=[0,0]; G.region=null; G.boss=null;
  renderAll();
}

function giveUp(){
  if(G.phase!=='done')return;
  showGameOverPopup();
}

function confirmGiveUp(){
  G.phase='roll1'; G.dice=[0,0]; G.pos=0; G.region=null; G.boss=null;
  G.points=0; G.completed=[];
  positionToken(0,true);
  highlightSpace(0);
  renderAll();
}

const MAX_POINTS = ALL_BOSSES.length * R.length; // 11 prep regions × total unique bosses

function resetGame(){ G.phase='roll1'; G.dice=[0,0]; G.pos=0; G.region=null; G.boss=null; renderAll(); }
if(typeof animateDice==='undefined') function animateDice(cb){cb();renderAll();}
