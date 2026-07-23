/* OSRS Board Game — roll region (preparation), then slot-machine boss pick */
const G = { phase:'roll1', dice:[0,0], pos:0, region:null, boss:null, anim:false };
function rollDice(){ const a=Math.ceil(Math.random()*6),b=Math.ceil(Math.random()*6); G.dice=[a,b]; return a+b; }
function doRoll1(){
  if(G.phase!=='roll1'||G.anim)return; G.anim=true; renderAll();
  const oldPos=G.pos;
  animateDice(()=>{
    const total=rollDice(); G.pos=total===12?0:total; // roll 2→tile2 … 11→tile11, 12→start
    // Wait ~1s then walk token clockwise tile by tile
    setTimeout(()=>{
      walkToken(oldPos,G.pos,()=>{
        const sp=S[G.pos];
        if(sp.type==='start'){ G.region=R[Math.floor(Math.random()*R.length)]; }
        else G.region=getRegion(sp.regionId);
        G.boss=null; G.phase='roll2'; G.anim=false;
        highlightSpace(G.pos);
        renderAll();
      });
    },1000);
  });
}
function doRoll2(){
  if(G.phase!=='roll2'||G.anim)return; G.anim=true; renderAll();
  // Pick random boss first, then animate slot machine towards it
  G.boss=ALL_BOSSES[Math.floor(Math.random()*ALL_BOSSES.length)];
  openSlotMachine(G.boss,()=>{
    G.phase='done'; G.anim=false;
    renderAll();
  });
}
function resetGame(){ G.phase='roll1'; G.dice=[0,0]; G.pos=0; G.region=null; G.boss=null; renderAll(); }
if(typeof animateDice==='undefined') function animateDice(cb){cb();renderAll();}
