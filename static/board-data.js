/* OSRS Board Game — Regions & Bosses from BossRegion Map1.csv */
const R = Object.freeze([
  { id:'misthalin', name:'Misthalin', color:'#8B4513', emoji:'🏰',
    bosses:[{n:'Brutus',t:'intro',d:2,img:'Brutus.png'},{n:'Obor',t:'intro',d:3,img:'Obor.png'},{n:'Bryophyta',t:'intro',d:4,img:'Bryophyta.png'},{n:'Scurrius',t:'intro',d:5,img:'Scurrius.png'},{n:'Deranged Arch.',t:'mid',d:6,img:'Deranged_archaeologist.png'},{n:'Leviathan',t:'late',d:8,img:'The_Leviathan.png'}]},
  { id:'asgarnia', name:'Asgarnia', color:'#FF8C00', emoji:'🪓',
    bosses:[{n:'Giant Mole',t:'early',d:3,img:'Giant_Mole.png'},{n:'Royal Titans',t:'early',d:4,img:'Royal_titans.png'},{n:'Commander Zilyana',t:'late',d:7,img:'Commander_Zilyana.png'},{n:'General Graardor',t:'late',d:8,img:'General_Graardor.png'},{n:"K'ril Tsutsaroth",t:'late',d:8,img:'Kril_Tsutsaroth.png'},{n:"Kree'arra",t:'late',d:7,img:'Kree_arra.png'},{n:'Whisperer',t:'late',d:9,img:'The_Whisperer.png'}]},
  { id:'fremennik', name:'Fremennik', color:'#FFD700', emoji:'⚔️',
    bosses:[{n:'Dagannoth Kings',t:'early',d:5,img:'Dagannoth_Kings.png'},{n:'Vorkath',t:'mid',d:6,img:'Vorkath.png'},{n:'Phantom Muspah',t:'late',d:8,img:'Phantom_Muspah.png'},{n:'Duke Sucellus',t:'late',d:9,img:'Duke_Sucellus.png'}]},
  { id:'wilderness', name:'Wilderness', color:'#DC143C', emoji:'💀',
    bosses:[{n:'Crazy Arch.',t:'early',d:4,img:'Crazy_archaeologist.png'},{n:'Chaos Fanatic',t:'early',d:4,img:'Chaos_Fanatic.png'},{n:'Scorpia',t:'mid',d:5,img:'Scorpia.png'},{n:'Chaos Elemental',t:'mid',d:6,img:'Chaos_Elemental.png'},{n:'King Black Dragon',t:'mid',d:6,img:'King_Black_Dragon.png'},{n:'Venenatis',t:'mid',d:7,img:'Venenatis.png'},{n:"Vet'ion",t:'mid',d:7,img:'Vetion.png'},{n:'Callisto',t:'mid',d:7,img:'Callisto.png'},{n:'Corporeal Beast',t:'late',d:9,img:'Corporeal_Beast.png'}]},
  { id:'morytania', name:'Morytania', color:'#228B22', emoji:'🦇',
    bosses:[{n:'Barrows',t:'early',d:4,img:'Barrows.png'},{n:'Verzik Vitur',t:'late',d:8,img:'Theatre_of_Blood.png'},{n:'The Nightmare',t:'end',d:10,img:'The_Nightmare.png'}]},
  { id:'tirannwn', name:'Tirannwn', color:'#1E3A8A', emoji:'🧝',
    bosses:[{n:'Zalcano',t:'mid',d:5,img:'Zalcano.png'},{n:'Zulrah',t:'mid',d:7,img:'Zulrah.png'},{n:'Crystalline Hunllef',t:'late',d:8,img:'Crystalline_Hunllef.png'},{n:'Corrupted Hunllef',t:'late',d:9,img:'Corrupted_Hunllef.png'}]},
  { id:'kourend', name:'Kourend', color:'#9C27B0', emoji:'🏛️',
    bosses:[{n:'Wintertodt',t:'intro',d:3,img:'Wintertodt.png'},{n:'Hespori',t:'mid',d:5,img:'Hespori.png'},{n:'Sarachnis',t:'mid',d:6,img:'Sarachnis.png'},{n:'Skotizo',t:'mid',d:6,img:'Skotizo.png'},{n:'Great Olm',t:'late',d:9,img:'Chambers_of_Xeric.png'},{n:'Yama',t:'end',d:10,img:'Yama.png'}]},
  { id:'karamja', name:'Karamja', color:'#FF5722', emoji:'🌋',
    bosses:[{n:'TzTok-Jad',t:'mid',d:7,img:'TzTok-Jad.png'},{n:'TzKal-Zuk',t:'end',d:10,img:'TzKal-Zuk.png'}]},
  { id:'desert', name:'Desert', color:'#F5DEB3', emoji:'🏜️',
    bosses:[{n:'Tempoross',t:'intro',d:3,img:'Tempoross.png'},{n:'Kalphite Queen',t:'mid',d:6,img:'Kalphite_Queen.png'},{n:'Warden',t:'late',d:9,img:'Tombs_of_Amascut.png'}]},
  { id:'varlamore', name:'Varlamore', color:'#E91E63', emoji:'🏟️',
    bosses:[{n:'Amoxliatl',t:'mid',d:5,img:'Amoxliatl.png'},{n:'The Hueycoatl',t:'mid',d:6,img:'The_Hueycoatl.png'},{n:'Moons of Peril',t:'mid',d:7,img:'Moons_of_peril.png'},{n:'Vardorvis',t:'late',d:8,img:'Vardorvis.png'},{n:'Doom of Mokhaiotl',t:'end',d:10,img:'Doom_of_Mokhaiotl.png'},{n:'Sol Heredit',t:'end',d:10,img:'Fortis_Colosseum.png'}]},
  { id:'kandarin', name:'Kandarin', color:'#607D8B', emoji:'🏔️',
    bosses:[]},
]);

// Flat list of ALL bosses across all regions
const ALL_BOSSES = [];
R.forEach(r=>r.bosses.forEach(b=>ALL_BOSSES.push({...b,region:r.id,regionName:r.name,regionColor:r.color,regionEmoji:r.emoji})));

// 12 perimeter spaces — clockwise from top-left. Tile 0=start, tiles 1-11=regions
const S = Object.freeze([
  {id:0,  type:'start',  name:'START',           label:'🏁'},
  {id:1,  type:'region', regionId:'misthalin',    label:'1'},
  {id:2,  type:'region', regionId:'asgarnia',     label:'2'},
  {id:3,  type:'region', regionId:'fremennik',    label:'3'},
  {id:4,  type:'region', regionId:'wilderness',   label:'4'},
  {id:5,  type:'region', regionId:'morytania',    label:'5'},
  {id:6,  type:'region', regionId:'tirannwn',     label:'6'},
  {id:7,  type:'region', regionId:'kourend',      label:'7'},
  {id:8,  type:'region', regionId:'karamja',      label:'8'},
  {id:9,  type:'region', regionId:'desert',       label:'9'},
  {id:10, type:'region', regionId:'varlamore',    label:'10'},
  {id:11, type:'region', regionId:'kandarin',     label:'11'},
]);

// clockwise from top‑left → top row → right col → bottom row (right‑to‑left) → left col (bottom‑to‑top)
const LAYOUT = [{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:2,c:4},{r:3,c:4},{r:4,c:4},{r:4,c:3},{r:4,c:2},{r:4,c:1},{r:3,c:1},{r:2,c:1}];
function getRegion(id){return R.find(r=>r.id===id);}
const TIERS={intro:'#4caf50',early:'#8bc34a',mid:'#ff9800',late:'#f44336','end':'#9c27b0'};
