# 🏰 Gielinor Empire — OSRS Monopoly

Een **Old School RuneScape** themed Monopoly-achtige custom game, ontworpen voor een video-serie. Verover Gielinor, koop steden, versla bosses en word de ultieme heerser!

---

## 🎲 Snel starten

```powershell
cd c:\administratie\git\OsrsGame1
python -m http.server 8080
```

Open `http://localhost:8080/index.html` in je browser.

---

## 🗺️ Het Bord

40 vakken rondom een klassiek Monopoly-bord, maar volledig OSRS-themed:

| Positie | Type | Naam | Groep |
|---------|------|------|-------|
| 0 | 🟢 GO | **Lumbridge Spawn** | — |
| 1-2 | 🟤 Bruin | Lumbridge, Al Kharid | Misthalin |
| 3 | 🔴 Boss | **Giant Mole Prison** | — |
| 4-6 | 🔵 Lichtblauw | Draynor, Port Sarim, Rimmington | Asgarnia Coast |
| 7 | 🎲 Kans | Random Event | — |
| 8-10 | 🩷 Roze | Varrock, Edgeville, Barb. Village | N. Misthalin |
| 11 | 🔒 Jail | Just Visiting / Jail | — |
| 12-14 | 🟠 Oranje | Falador, Taverley, Burthorpe | Asgarnia |
| 15 | 📜 Schatkist | Treasure Trail | — |
| 16-18 | 🔴 Rood | Ardougne, Yanille, Gnome Strong. | Kandarin |
| 19 | 🚂 Transport | **Fairy Ring Network** | — |
| 20 | 🔴 Boss | **King Black Dragon Prison** | — |
| 21-23 | 🟡 Geel | Rellekka, Miscellania, Etceteria | Fremennik |
| 24 | 🎲 Kans | Random Event | — |
| 25-27 | 🟢 Groen | Canifis, Port Phasmatys, Darkmeyer | Morytania |
| 28 | 🚂 Transport | **Spirit Tree Network** | — |
| 29 | 🔴 Boss | **Zulrah Prison** | — |
| 30 | 📜 Schatkist | Treasure Trail | — |
| 31-32 | 🔵 Donkerblauw | Prifddinas, Lletya | Tirannwn |
| 33 | ⚡ Utility | **Runecrafting Guild** | — |
| 34 | 🎲 Kans | Random Event | — |
| 35 | 🚂 Transport | **Gnome Glider Network** | — |
| 36 | 📜 Schatkist | Treasure Trail | — |
| 37 | ⚡ Utility | **Farming Guild** | — |
| 38 | 💀 Tax | Death's Coffer | — |
| 39 | ⛔ Go Jail | **Wilderness** | — |

---

## ⚔️ Unieke Mechanics

### Boss Prison Systeem (jouw idee!)

Als je op een **Boss Prison** vak landt, zit je VAST totdat je:
1. **De boss verslaat** — dobbelsteen-minigame: je moet ≥ de boss difficulty rollen (2D6)
2. **Bail betaalt** — GP betalen om vrij te komen
3. **Ring of Life** gebruikt — speciale kaart uit Treasure Trails

| Boss Prison | Boss | Difficulty | Bail |
|-------------|------|-----------|------|
| Giant Mole Prison | Giant Mole | 2 | 50 GP |
| KBD Prison | King Black Dragon | 4 | 100 GP |
| Zulrah Prison | Zulrah | 6 | 150 GP |

> 💡 **Video-idee:** Elke Boss Prison is een cliffhanger! "Zal ik Zulrah verslaan of failliet gaan?!"

### Upgrades: Schildwachten → Vestingen

In plaats van huizen/hotels:
- Level 1-4: **Schildwachten** (🟢 groene stippen)
- Level 5 (max): **Vesting** (🟡 gouden stip)

Kost: per level betaal je de upgrade cost. Je moet een volledige kleurgroep bezitten om te upgraden, en evenwichtig bouwen (geen property meer dan 1 level achter).

### Transport Netwerken

4 "railroads" worden OSRS transportmethodes:
- Fairy Ring Network
- Spirit Tree Network
- Gnome Glider Network
- (Charter Ships — op plek van 4e railroad)

Huur: 25/50/100/200 GP afhankelijk van hoeveel je er hebt.

### Utilities → Gilden

- **Runecrafting Guild**
- **Farming Guild**

Huur: 4× dobbelsteenworp (1 gilde) of 10× dobbelsteenworp (beide gildes).

---

## 🃏 Kaarten Systeem

### Random Events (Kans kaarten)

16 unieke OSRS random events als kanskaarten:
- Sandwich Lady, Genie, Evil Chicken, Dr. Jekyll, Strange Plant, Drunken Dwarf, Mysterious Old Man, Swarm, Rick Turpentine, Cap'n Arnav, Frog Prince, Tribesman, Beginner Clue, Abyss teleport, Shooting Star

### Treasure Trails (Schatkist kaarten)

16 clue scroll beloningen:
- Elite/Medium/Beginner caskets, Bank error, 3rd Age loot, Goblin raid, Ring of Life, Birthday event, GE flip, Karamja rum, en meer!

---

## 🎬 Video Content Ideeën

Het spel is ontworpen voor een video-serie. Hier zijn content-ideeën:

### Afleveringsstructuur

| Aflevering | Focus |
|------------|-------|
| **Ep 1:** | Game intro, spelers kiezen, eerste rondes, uitleg mechanics |
| **Ep 2:** | Eerste Boss Prison cliffhanger, property wars |
| **Ep 3:** | Upgrades bouwen, transport-netwerk strategie |
| **Ep 4:** | Zulrah Prison drama, eerste faillissement? |
| **Ep 5:** | Eindspel: wie verovert Prifddinas en wint? |

### Thematische Segmenten

- **"Boss Fight Cam"** — elke boss fight krijgt een dramatische edit
- **"Grand Exchange Corner"** — marktanalyse van de property markt
- **"Wilderness Betrayal"** — momenten waarop spelers naar jail worden gestuurd
- **"99/99 Stats"** — speler-statistieken en net worth leaderboard

### Community Input

- Laat kijkers stemmen op welke Random Events toegevoegd moeten worden
- Kijkers kunnen property-namen suggesten
- "Viewer's Choice" kaarten toevoegen

---

## 🔧 Uitbreidingsideeën

Het systeem is modulair opgezet. Makkelijk uit te breiden:

### Extra Boss Prisons
Voeg toe in `board-data.js`:
```js
{ id: 99, type: 'bossPrison', name: 'Vorkath Prison', boss: 'Vorkath', bossDifficulty: 8, bailAmount: 200 }
```

### Nieuwe Kaarten
Voeg toe in `cards.js` bij `RANDOM_EVENT_CARDS` of `TREASURE_TRAIL_CARDS`.

### Custom Spelers
Pas `PLAYER_NAMES` en `PLAYER_COLORS` aan in `board-data.js`.

### Skill Mechanic
Idee: voeg Woodcutting/Fishing/etc als extra inkomstenbron toe op bepaalde vakken.

### Quest Systeem
Idee: bepaalde vakken triggeren "quests" die meerdere beurten duren voor een grote GP-beloning.

---

## 📁 Projectstructuur

```
OsrsGame1/
├── index.html              # Hoofd-app met monopoly bord
├── static/
│   ├── board-data.js       # Bordconfiguratie (40 vakken)
│   ├── cards.js            # Kans- & schatkistkaarten
│   ├── game.js             # Spel-logica engine
│   ├── ui.js               # DOM rendering & UI updates
│   └── images/             # (toekomstige boss/icoon afbeeldingen)
└── README.md               # Deze file
```

---

## 🎮 Game Commands (ontwikkelaar)

In de browser console (F12):

```js
// Huidige game state bekijken
console.log(GAME_STATE)

// Speler GP aanpassen
GAME_STATE.players[0].gp += 10000

// Alle achievements/unlocks
GAME_STATE.players[0].properties = [31, 32] // Prif + Lletya
```

---

*Gielinor Empire — May the best scaper win!* 🏆
