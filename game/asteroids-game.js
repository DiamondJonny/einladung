let _ac=null;
function _audioCtx(){ if(!_ac){ try{ _ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return _ac; }
function sfx(type){
  const ac=_audioCtx(); if(!ac) return;
  if(ac.state==="suspended"){ try{ ac.resume(); }catch(e){} }
  const now=ac.currentTime;
  const tone=(fr,dur,wave,vol,toF)=>{ const o=ac.createOscillator(),g=ac.createGain(); o.type=wave||"square"; o.frequency.setValueAtTime(fr,now); if(toF) o.frequency.exponentialRampToValueAtTime(toF,now+dur); g.gain.setValueAtTime(0.0001,now); g.gain.linearRampToValueAtTime(vol,now+0.005); g.gain.exponentialRampToValueAtTime(0.0001,now+dur); o.connect(g).connect(ac.destination); o.start(now); o.stop(now+dur+0.03); };
  const noise=(dur,vol)=>{ const n=Math.floor(ac.sampleRate*dur); const buf=ac.createBuffer(1,n,ac.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n); const sc=ac.createBufferSource(); sc.buffer=buf; const g=ac.createGain(); g.gain.value=vol; sc.connect(g).connect(ac.destination); sc.start(now); };
  switch(type){
    case "shoot": tone(1500,0.08,"square",0.05,520); tone(820,0.07,"sawtooth",0.04,300); noise(0.05,0.03); break;
    case "hit": tone(360,0.10,"square",0.05,130); noise(0.10,0.05); break;
    case "explode": tone(200,0.28,"sawtooth",0.07,55); noise(0.30,0.10); break;
    case "enemy": tone(520,0.09,"square",0.05,200); noise(0.05,0.04); break;
    case "hurt": tone(150,0.28,"sawtooth",0.09,65); noise(0.16,0.07); break;
    case "wave": [523,659,784,1047].forEach((fr,i)=>setTimeout(()=>tone(fr,0.14,"square",0.05),i*70)); break;
  }
}
// game/asteroids-game.js
// Weltraum Pilot: Infinite-universe asteroids with shop, upgrades & custom ships.

// ── Shop Data ─────────────────────────────────────────────────────────────────

export const SHIPS = [
    { id: "default", name: "Rakete 🚀", price: 0, hull: "#4dd0e1", accent: "#00838f", flame: "#FF6D00" },
    { id: "fire", name: "Feuerfalke", price: 20, hull: "#ef5350", accent: "#b71c1c", flame: "#ffeb3b" },
    { id: "ice", name: "Eispfeil", price: 20, hull: "#81d4fa", accent: "#0277bd", flame: "#4fc3f7" },
    { id: "gold", name: "Goldadler", price: 40, hull: "#ffd54f", accent: "#f9a825", flame: "#ff6f00" },
    { id: "neon", name: "Neon-Jäger", price: 40, hull: "#76ff03", accent: "#00c853", flame: "#00e5ff" },
    { id: "galaxy", name: "Galaxie", price: 60, hull: "#7c4dff", accent: "#311b92", flame: "#e040fb" },
    { id: "rainbow", name: "Regenbogen", price: 80, hull: "rainbow", accent: "#9c27b0", flame: "rainbow" },
    { id: "stealth", name: "Stealth", price: 50, hull: "#546e7a", accent: "#263238", flame: "#ff5722" },
    { id: "candy", name: "Candy", price: 30, hull: "#f48fb1", accent: "#ec407a", flame: "#ff80ab" },
    { id: "plasma", name: "Plasma", price: 70, hull: "#00e5ff", accent: "#006064", flame: "#18ffff" },
    { id: "ufo", name: "UFO 🛸 Rundumschuss", price: 1200, hull: "#b388ff", accent: "#7c4dff", flame: "#00e5ff", shape: "ufo", beams: 4 },
    // ── Premium-Flotte: sehr gut & sehr teuer (je teurer, desto mehr Strahlen) ──
    { id: "comet", name: "Komet ☄️", price: 800, hull: "#ffd54f", accent: "#ff6f00", flame: "#ffffff" },
    { id: "phantom", name: "Phantom 👻", price: 1000, hull: "#b0bec5", accent: "#37474f", flame: "#eceff1" },
    { id: "dragon", name: "Sternendrache 🐉", price: 1800, hull: "#ff5252", accent: "#b71c1c", flame: "#ffca28", shape: "ufo", beams: 6 },
    { id: "void", name: "Leeren-Jäger 🌌", price: 2400, hull: "#7c4dff", accent: "#1a0a4a", flame: "#e040fb", shape: "ufo", beams: 8 },
    { id: "phoenix", name: "Phönix 🌈🔥", price: 3200, hull: "rainbow", accent: "#dd2c00", flame: "rainbow", shape: "ufo", beams: 10 },
    // ── Space Shuttles (günstig) ──
    { id: "shuttle",  name: "Space Shuttle 🚀", price: 30, hull: "#eceff1", accent: "#90a4ae", flame: "#ff7043" },
    { id: "shuttle2", name: "Mini-Shuttle 🛰️", price: 45, hull: "#b3e5fc", accent: "#0288d1", flame: "#ffd54f" },
    // ── Riesen-Raumschiffe (groß & teuer) ──
    { id: "freighter",  name: "Frachter 🚛 (Riesig)", price: 1500, hull: "#a1887f", accent: "#4e342e", flame: "#ffab40", scale: 1.5 },
    { id: "battleship", name: "Schlachtschiff ⚓ (Riesig)", price: 3000, hull: "#607d8b", accent: "#263238", flame: "#ff5252", shape: "ufo", beams: 8, scale: 1.7 },
    { id: "titan",      name: "Titan-Kreuzer 🛡️ (Riesig)", price: 5000, hull: "#9fa8da", accent: "#1a237e", flame: "#7c4dff", shape: "ufo", beams: 12, scale: 1.9 },
    { id: "mothership", name: "Mutterschiff 🛸👑 (MEGA)", price: 8000, hull: "rainbow", accent: "#311b92", flame: "rainbow", shape: "ufo", beams: 16, scale: 2.3 },
    // ── Große Auswahl: viele weitere Schiffe ──
    { id: "wasp",    name: "Wespe 🐝",     price: 15,  hull: "#ffeb3b", accent: "#f57f17", flame: "#fff" },
    { id: "beetle",  name: "Käfer 🪲",     price: 25,  hull: "#66bb6a", accent: "#1b5e20", flame: "#b9f6ca" },
    { id: "arrow",   name: "Pfeil ➤",      price: 35,  hull: "#4fc3f7", accent: "#01579b", flame: "#e1f5fe" },
    { id: "emerald", name: "Smaragd 💚",   price: 120, hull: "#00e676", accent: "#00695c", flame: "#69f0ae" },
    { id: "ruby",    name: "Rubin ❤️",     price: 140, hull: "#ff1744", accent: "#b71c1c", flame: "#ff8a80" },
    { id: "sapphire",name: "Saphir 💙",    price: 140, hull: "#2979ff", accent: "#0d47a1", flame: "#82b1ff" },
    { id: "storm",   name: "Sturmjäger ⛈️", price: 280, hull: "#78909c", accent: "#37474f", flame: "#b3e5fc" },
    { id: "thunder", name: "Donner ⚡",    price: 320, hull: "#ffd600", accent: "#ff6f00", flame: "#fff59d" },
    { id: "frost",   name: "Frost ❄️",     price: 420, hull: "#80deea", accent: "#006064", flame: "#e0f7fa" },
    { id: "inferno", name: "Inferno 🔥",   price: 480, hull: "#ff7043", accent: "#bf360c", flame: "#ffccbc" },
    { id: "vortex",  name: "Vortex 🌀",    price: 900, hull: "#7e57c2", accent: "#311b92", flame: "#b388ff", shape: "ufo", beams: 4 },
    { id: "tornado", name: "Tornado 🌪️",   price: 1100, hull: "#90a4ae", accent: "#263238", flame: "#cfd8dc", shape: "ufo", beams: 5 },
    { id: "nova",    name: "Nova-Blitz 💫", price: 2200, hull: "#ffca28", accent: "#ff6f00", flame: "#fff8e1", shape: "ufo", beams: 9 },
    { id: "quasar",  name: "Quasar 🌟",    price: 4000, hull: "#18ffff", accent: "#006064", flame: "#84ffff", shape: "ufo", beams: 11, scale: 1.4 },
    { id: "eclipse", name: "Eklipse 🌑",   price: 4500, hull: "#455a64", accent: "#000000", flame: "#b0bec5", shape: "ufo", beams: 11, scale: 1.5 },
    { id: "aurora",  name: "Aurora 🌈",    price: 6000, hull: "rainbow", accent: "#1de9b6", flame: "rainbow", shape: "ufo", beams: 13, scale: 1.6 },
    // ── Legendär: NUR aus dem Legendär-Pack ziehbar (nicht kaufbar) ──
    { id: "king",      name: "Kosmos-König 👑", packOnly: true, hull: "rainbow", accent: "#ffca28", flame: "rainbow", shape: "ufo", beams: 12 },
    { id: "blackhole", name: "Schwarzes Loch 🕳️", packOnly: true, hull: "#311b92", accent: "#000000", flame: "#7c4dff", shape: "ufo", beams: 14 },
    { id: "guardian",  name: "Galaxie-Wächter 🛡️", packOnly: true, hull: "#00e5ff", accent: "#006064", flame: "#18ffff", shape: "ufo", beams: 16 },
    // ── Superlegendär: die allerbesten – nur aus dem Mega-Pack ──
    { id: "omega",    name: "Omega 🛸 (Superlegendär)", packOnly: true, hull: "rainbow", accent: "#ffd700", flame: "rainbow", shape: "ufo", beams: 18, scale: 1.5 },
    { id: "infinity", name: "Unendlichkeit ♾️ (Superlegendär)", packOnly: true, hull: "rainbow", accent: "#00e5ff", flame: "rainbow", shape: "ufo", beams: 22, scale: 1.8 },
];

// Coole Maps (Weltraum-Hintergründe) – im Shop kaufbar (nicht aus Packs)
const MAPS = [
    { id: "classic", name: "Klassik 🌌 (Lvl 1)", space: "#0a0a1a", star: "#ffffff", price: 0,   diff: 1 },
    { id: "nebula",  name: "Nebel 💜 (Lvl 2)",   space: "#1a0a2e", star: "#e0b3ff", price: 150, diff: 2 },
    { id: "matrix",  name: "Matrix 💚 (Lvl 2)",  space: "#001008", star: "#5bff9d", price: 150, diff: 2 },
    { id: "sunset",  name: "Sonnenuntergang 🌅 (Lvl 3)", space: "#2a0a1a", star: "#ffd0a0", price: 200, diff: 3 },
    { id: "deepsea", name: "Tiefsee 🌊 (Lvl 3)", space: "#001a2e", star: "#7fd4ff", price: 200, diff: 3 },
    { id: "lava",    name: "Lava 🔥 (Lvl 4)",    space: "#2a0d00", star: "#ff8a3d", price: 250, diff: 4 },
    { id: "kampfzone", name: "Kampfzone ⚔️ (Lvl 5 – Top-Geld!)", space: "#1a0008", star: "#ff6b6b", price: 300, diff: 5 },
];

// Features (Spezial-Fähigkeiten im Spiel) – aus Packs ziehbar, im Spiel per Knopf aktivierbar
const FEATURES = [
    { id: "teleport", name: "Teleport ✨", icon: "✨", cooldown: 4,  desc: "Springt ein Stück nach vorne (Ausweichen)" },
    { id: "shield",   name: "Schild 🛡️", icon: "🛡️", cooldown: 12, desc: "3 Sek. unverwundbar" },
    { id: "bomb",     name: "Bombe 💥",   icon: "💥", cooldown: 16, desc: "Zerstört Brocken in der Nähe" },
    { id: "drones",   name: "Begleit-Drohnen 🤖", icon: "🤖", cooldown: 0, passive: true, desc: "2 Bots fliegen mit und schießen für dich" },
];

// Piloten (sitzen im Raumschiff) – im Shop kaufbar oder aus dem Piloten-Pack
const PILOTS = [
    { id: "astro",   name: "Astronaut 👨‍🚀", emoji: "👨‍🚀", price: 0 },
    { id: "astro2",  name: "Astronautin 👩‍🚀", emoji: "👩‍🚀", price: 60 },
    { id: "alien",   name: "Alien 👽",        emoji: "👽", price: 80 },
    { id: "robot",   name: "Roboter 🤖",      emoji: "🤖", price: 80 },
    { id: "cat",     name: "Weltraum-Katze 🐱", emoji: "🐱", price: 100 },
    { id: "dog",     name: "Astro-Hund 🐶",   emoji: "🐶", price: 100 },
    { id: "fox",     name: "Fuchs 🦊",        emoji: "🦊", price: 120 },
    { id: "frog",    name: "Frosch 🐸",       emoji: "🐸", price: 120 },
    { id: "monkey",  name: "Affe 🐵",         emoji: "🐵", price: 120 },
    { id: "dino",    name: "Dino 🦖",         emoji: "🦖", price: 150 },
    { id: "panda",   name: "Panda 🐼",        emoji: "🐼", price: 150 },
    { id: "alien2",  name: "Mini-Alien 👾",   emoji: "👾", price: 180 },
    { id: "lion",    name: "Löwe 🦁",         emoji: "🦁", price: 200 },
    { id: "penguin", name: "Pinguin 🐧",      emoji: "🐧", price: 200 },
    { id: "clown",   name: "Clown 🤡",        emoji: "🤡", price: 220 },
    { id: "ghost",   name: "Geist 👻",        emoji: "👻", price: 250 },
];

// Verschiedene Packs für verschiedene Sachen
const PACKS = [
    { id: "ship",    name: "🚀 Schiff-Pack",    cost: 250, kind: "ship",      desc: "Zufälliges normales Schiff" },
    { id: "feature", name: "⚡ Feature-Pack",   cost: 250, kind: "feature",   desc: "Zufälliges Feature (Teleport …)" },
    { id: "pilot",   name: "🧑‍🚀 Piloten-Pack", cost: 200, kind: "pilot",     desc: "Zufälliger Pilot fürs Cockpit" },
    { id: "legend",  name: "👑 Mega-Pack",       cost: 2500, kind: "legendary", desc: "Nur Top-Schiffe! Sehr teuer, aber nur Gutes." },
];

// Repeatable upgrades: each level costs more
const UPGRADE_DEFS = [
    { id: "thrust", name: "Antrieb", icon: "🔥", basePrice: 6, priceScale: 1.25, maxLevel: 12,
      desc: lvl => `Level ${lvl} → ${lvl+1}`, apply: (e, lvl) => { e.thrustPower = 200 + lvl * 40; } },
    { id: "lives", name: "Extra-Leben", icon: "❤️", basePrice: 10, priceScale: 1.3, maxLevel: 10,
      desc: lvl => `${3+lvl} → ${4+lvl} Leben`, apply: (e, lvl) => { e.lives = 3 + lvl; } },
    { id: "firerate", name: "Feuerrate", icon: "💨", basePrice: 7, priceScale: 1.3, maxLevel: 12,
      desc: lvl => `Level ${lvl} → ${lvl+1}`, apply: (e, lvl) => { e.fireCooldown = Math.max(0.04, e.fireCooldown - lvl * 0.02); } },
    { id: "double", name: "Doppelschuss", icon: "🔫🔫", basePrice: 22, priceScale: 1.4, maxLevel: 10,
      desc: lvl => lvl < 1 ? "Zwei Schüsse — beim UFO: Strahlen 4 → 5" : `UFO-Strahlen: ${4+lvl} → ${5+lvl}`,
      apply: (e, lvl) => { e.doubleShot = lvl >= 1; e.doubleLevel = lvl; } },
    { id: "rainbow_bullets", name: "Regenbogen-Schüsse", icon: "🌈", basePrice: 20, priceScale: 0, maxLevel: 1,
      desc: () => "Bunte Kugeln!", apply: (e) => { e.rainbowBullets = true; } },
    { id: "drones", name: "Begleit-Bots", icon: "🤖", basePrice: 18, priceScale: 1.5, maxLevel: 5,
      desc: lvl => `${lvl} → ${lvl+1} Bots (fliegen mit & schießen auf Brocken)`, apply: (e, lvl) => { e.droneCount = lvl; } },
];

// Mehrere Konten pro iPad: alle Daten werden pro aktivem Konto getrennt gespeichert.
function acct() { return localStorage.getItem("activeAccount") || "default"; }
function loadShop() { try { return JSON.parse(localStorage.getItem("asteroidsShop__" + acct()) || "null"); } catch { return null; } }
function defaultShop() { return { ownedShips: ["default"], upgradeLevels: {}, equipped: "default", customShip: null, ownedMaps: ["classic"], equippedMap: "classic", ownedFeatures: [], ownedPilots: ["astro"], equippedPilot: "astro" }; }
function saveShop(d) { localStorage.setItem("asteroidsShop__" + acct(), JSON.stringify(d)); }
function getCoins() { return parseInt(localStorage.getItem("points__" + acct()) || "0"); }
function setCoins(n) { localStorage.setItem("points__" + acct(), String(n)); }
function getRecords() { try { return JSON.parse(localStorage.getItem("records__" + acct()) || "{}"); } catch (e) { return {}; } }
function saveRecords(r) { localStorage.setItem("records__" + acct(), JSON.stringify(r)); }

function getUpgradePrice(def, level) {
    if (def.maxLevel && level >= def.maxLevel) return Infinity;
    return Math.floor(def.basePrice * Math.pow(def.priceScale || 1, level));
}

// VIP: Jonathan Schwarz bekommt eine Top-Start-Feuerrate und doppelten Upgrade-Effekt.
function isVip() { return localStorage.getItem("rocketVip__" + acct()) === "1"; }

// Jedes Raumschiff hat eine eigene Spezial-Fähigkeit (nicht nur Farbe)
const PERKS = {
    default: { type: "thrust", val: 30, desc: "Wendiger Allrounder" },
    fire: { type: "fire", val: 0.03, desc: "Schnellfeuer" },
    ice: { type: "bspeed", val: 120, desc: "Schnelle Schüsse" },
    gold: { type: "coin", val: 1.5, desc: "+50% Münzen" },
    neon: { type: "fire", val: 0.04, desc: "Sehr schnelles Feuer" },
    galaxy: { type: "life", val: 1, desc: "+1 Leben" },
    rainbow: { type: "coin", val: 1.4, desc: "+40% Münzen" },
    stealth: { type: "shield", val: 3, desc: "Start-Schild 3s" },
    candy: { type: "thrust", val: 60, desc: "Sehr flink" },
    plasma: { type: "bspeed", val: 160, desc: "Plasma-Tempo" },
    ufo: { type: "beam", val: 1, desc: "+1 Strahl" },
    comet: { type: "bspeed", val: 140, desc: "Kometen-Tempo" },
    phantom: { type: "shield", val: 4, desc: "Start-Schild 4s" },
    dragon: { type: "beam", val: 2, desc: "+2 Strahlen" },
    void: { type: "beam", val: 3, desc: "+3 Strahlen" },
    phoenix: { type: "life", val: 2, desc: "+2 Leben" },
    shuttle: { type: "life", val: 1, desc: "+1 Leben" },
    shuttle2: { type: "thrust", val: 50, desc: "Wendig" },
    freighter: { type: "life", val: 3, desc: "+3 Leben (robust)" },
    battleship: { type: "beam", val: 2, desc: "+2 Strahlen" },
    titan: { type: "life", val: 2, desc: "Gepanzert: +2 Leben" },
    mothership: { type: "coin", val: 2, desc: "Doppelte Münzen" },
    wasp: { type: "fire", val: 0.05, desc: "Wespen-Schnellfeuer" },
    beetle: { type: "life", val: 1, desc: "+1 Leben" },
    arrow: { type: "bspeed", val: 190, desc: "Pfeilschnell" },
    emerald: { type: "coin", val: 1.3, desc: "+30% Münzen" },
    ruby: { type: "fire", val: 0.04, desc: "Feuerrate+" },
    sapphire: { type: "bspeed", val: 150, desc: "Schnelle Schüsse" },
    storm: { type: "thrust", val: 80, desc: "Sturm-Antrieb" },
    thunder: { type: "fire", val: 0.05, desc: "Donner-Feuer" },
    frost: { type: "shield", val: 3, desc: "Start-Schild 3s" },
    inferno: { type: "bspeed", val: 175, desc: "Heiße Schüsse" },
    vortex: { type: "beam", val: 2, desc: "+2 Strahlen" },
    tornado: { type: "beam", val: 3, desc: "+3 Strahlen" },
    nova: { type: "beam", val: 4, desc: "+4 Strahlen" },
    quasar: { type: "coin", val: 1.8, desc: "+80% Münzen" },
    eclipse: { type: "shield", val: 5, desc: "Start-Schild 5s" },
    aurora: { type: "coin", val: 2, desc: "Doppelte Münzen" },
    king: { type: "beam", val: 4, desc: "+4 Strahlen" },
    blackhole: { type: "coin", val: 2.5, desc: "+150% Münzen" },
    guardian: { type: "shield", val: 6, desc: "Start-Schild 6s" },
    omega: { type: "beam", val: 6, desc: "+6 Strahlen" },
    infinity: { type: "beam", val: 8, desc: "+8 Strahlen" },
};
function applyPerk(e, p) {
    if (!p) return;
    if (p.type === "fire") e.fireCooldown = Math.max(0.03, e.fireCooldown - p.val);
    else if (p.type === "life") e.lives += p.val;
    else if (p.type === "bspeed") e.bulletSpeed += p.val;
    else if (p.type === "thrust") e.thrustPower += p.val;
    else if (p.type === "beam") e.extraBeams = (e.extraBeams || 0) + p.val;
    else if (p.type === "coin") e.coinMult = Math.max(e.coinMult || 1, p.val);
    else if (p.type === "shield") e.startShield = Math.max(e.startShield || 0, p.val);
}

function getEffects(shop) {
    const vip = isVip();
    const mult = vip ? 2 : 1;   // doppelt so viel pro gekauftem Upgrade
    const e = { bulletSpeed: 300, thrustPower: 200, lives: 3, fireCooldown: vip ? 0.07 : 0.18, doubleShot: false, doubleLevel: 0, rainbowBullets: false, extraBeams: 0, coinMult: 1, startShield: 0, droneCount: 0 };
    for (const def of UPGRADE_DEFS) {
        const lvl = shop.upgradeLevels[def.id] || 0;
        if (lvl > 0) def.apply(e, lvl * mult);
    }
    applyPerk(e, PERKS[shop.equipped]);   // Schiff-Spezialfähigkeit
    return e;
}

const PLAY_COST = 3;

// ── Shared CSS ────────────────────────────────────────────────────────────────

const SHOP_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:host { display: flex; width: 100%; height: 100%; }
.wrap {
  display: flex; flex-direction: column; width: 100%; height: 100%;
  background: radial-gradient(ellipse at top, #0a0a1a, #111, #1a1a2e);
  color: #e0e0e0; font-family: "Segoe UI", system-ui, sans-serif; overflow-y: auto;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: rgba(0,0,0,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.title { font-size: 1.3rem; font-weight: 800; }
.coins-badge {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.3);
  border-radius: 20px; padding: 4px 14px; font-weight: 700; color: #ffd700;
}
.btn-sm {
  background: none; border: 1px solid rgba(255,255,255,0.2);
  color: #e0e0e0; border-radius: 8px; padding: 6px 14px;
  cursor: pointer; font-size: 0.9rem; font-weight: 600;
}
.btn-sm:hover { background: rgba(255,255,255,0.1); }
.body { padding: 12px 16px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
.section { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.play-btn {
  width: 100%; padding: 14px; border: none; border-radius: 12px;
  font-size: 1.1rem; font-weight: 800; cursor: pointer;
  background: linear-gradient(135deg, #00e676, #00c853);
  color: #1b5e20; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,230,118,0.3);
}
.play-btn:active { transform: scale(0.97); }
.play-btn:disabled { opacity: 0.5; cursor: default; background: #555; color: #999; }
.play-cost { font-size: 0.85rem; font-weight: 600; margin-top: 4px; text-align: center; color: #ffd700; }
.stats-row { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { background: rgba(255,255,255,0.08); border-radius: 8px; padding: 5px 10px; font-size: 0.78rem; font-weight: 600; }
.chip span { color: #4fc3f7; }
.tabbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 0; }
.tab { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cfd3ff; border-radius: 999px; padding: 7px 13px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
.tab:hover { border-color: rgba(255,255,255,0.4); }
.tab.on { background: linear-gradient(135deg, #7c5cff, #ff4f9a); color: #fff; border-color: transparent; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.card {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 4px; border-radius: 10px; cursor: pointer;
  border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
  position: relative; transition: border-color 0.15s;
}
.card:hover { transform: scale(1.03); }
.card.active { border-color: #00e676; background: rgba(0,230,118,0.1); }
.card.locked { opacity: 0.45; }
.card-name { font-size: 0.72rem; font-weight: 700; text-align: center; }
.card-price { font-size: 0.68rem; color: #ffd700; font-weight: 600; }
.card-price.owned { color: #00e676; }
.badge { position: absolute; top: 3px; right: 3px; font-size: 0.55rem; background: #00e676; color: #1b5e20; border-radius: 3px; padding: 1px 3px; font-weight: 700; }
.preview { width: 54px; height: 54px; }
.card-name { font-size: 0.78rem; }
.card-perk { font-size: 0.62rem; color: #80d8ff; font-weight: 600; text-align: center; line-height: 1.1; }
.ulist { display: flex; flex-direction: column; gap: 6px; }
.ucard {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
  cursor: pointer;
}
.ucard:hover { border-color: rgba(255,255,255,0.25); }
.ucard.maxed { border-color: #00e676; background: rgba(0,230,118,0.06); cursor: default; }
.ucard.locked { opacity: 0.4; cursor: default; }
.uicon { font-size: 1.2rem; min-width: 32px; text-align: center; }
.uinfo { flex: 1; }
.uname { font-size: 0.85rem; font-weight: 700; }
.udesc { font-size: 0.72rem; color: #a0a0a0; }
.uprice { font-size: 0.82rem; font-weight: 700; color: #ffd700; white-space: nowrap; }
.uprice.maxed { color: #00e676; }
/* Custom ship builder */
.custom-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.color-label { font-size: 0.8rem; font-weight: 600; min-width: 60px; }
.color-pick { width: 36px; height: 36px; border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; padding: 0; background: none; }
.color-pick::-webkit-color-swatch-wrapper { padding: 0; }
.color-pick::-webkit-color-swatch { border: none; border-radius: 6px; }
.custom-preview { width: 64px; height: 64px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; }
.custom-save {
  padding: 8px 16px; border: none; border-radius: 8px;
  background: #00e676; color: #1b5e20; font-weight: 700; cursor: pointer; font-size: 0.85rem;
}
.custom-save:active { transform: scale(0.97); }
`;

// ── Component ─────────────────────────────────────────────────────────────────

class AsteroidsGame extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: "open" }); }

    connectedCallback() {
        this._shop = loadShop() || defaultShop();
        if (!this._shop.ownedMaps) { this._shop.ownedMaps = ["classic"]; this._shop.equippedMap = "classic"; }
        if (!this._shop.ownedFeatures) { this._shop.ownedFeatures = []; }
        if (!this._shop.ownedPilots) { this._shop.ownedPilots = ["astro"]; this._shop.equippedPilot = "astro"; }
        this._coins = getCoins();
        this._showShop();
    }
    disconnectedCallback() { if (this._cleanup) { this._cleanup(); this._cleanup = null; } }

    _getSkin() {
        if (this._shop.equipped === "custom" && this._shop.customShip) return this._shop.customShip;
        return SHIPS.find(s => s.id === this._shop.equipped) || SHIPS[0];
    }

    // ── Shop ──────────────────────────────────────────────────────────────────

    _showShop() {
        if (this._cleanup) { this._cleanup(); this._cleanup = null; }
        const shop = this._shop, coins = this._coins, effects = getEffects(shop);
        const canPlay = true; // always free to play
        const custom = shop.customShip || { hull: "#4dd0e1", accent: "#00838f", flame: "#FF6D00" };

        const tab = this._tab || "play";
        const recs = getRecords();
        const TABS = [
            { id: "play", label: "▶ Spielen" }, { id: "ships", label: "🚀 Schiffe" },
            { id: "pilots", label: "🧑‍🚀 Piloten" }, { id: "maps", label: "🗺️ Maps" },
            { id: "upgrades", label: "⬆️ Upgrades" }, { id: "packs", label: "📦 Packs" },
            { id: "records", label: "🏆 Erfolge" },
        ];
        let content = "";
        if (tab === "play") {
            content = `<button class="play-btn" id="play">▶ Spielen</button>
              <div class="play-cost">Münzen verdienst du beim Spielen 💰</div>
              <div class="section">📊 Dein Setup</div>
              <div class="stats-row">
                <div class="chip">Leben: <span>${effects.lives}</span></div>
                <div class="chip">Antrieb: <span>${effects.thrustPower}</span></div>
                <div class="chip">Feuerrate: <span>${Math.round(1/effects.fireCooldown)}/s</span></div>
                <div class="chip">Doppel: <span>${effects.doubleShot?"Ja":"Nein"}</span></div>
              </div>`;
        } else if (tab === "ships") {
            content = `<div class="section">🚀 Raumschiffe</div><div class="grid" id="ship-grid"></div>
              <div class="section">🎨 Eigenes Schiff bauen</div>
              <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
                <div style="display:flex;flex-direction:column;gap:6px">
                  <div class="custom-row"><span class="color-label">Rumpf</span><input type="color" class="color-pick" id="c-hull" value="${custom.hull === 'rainbow' ? '#4dd0e1' : custom.hull}"></div>
                  <div class="custom-row"><span class="color-label">Akzent</span><input type="color" class="color-pick" id="c-accent" value="${custom.accent}"></div>
                  <div class="custom-row"><span class="color-label">Flamme</span><input type="color" class="color-pick" id="c-flame" value="${custom.flame === 'rainbow' ? '#FF6D00' : custom.flame}"></div>
                </div>
                <canvas class="custom-preview" id="c-preview" width="64" height="64"></canvas>
                <button class="custom-save" id="c-save">Speichern & Auswählen</button>
              </div>`;
        } else if (tab === "pilots") {
            content = `<div class="section">🧑‍🚀 Piloten (sitzen im Raumschiff)</div><div class="grid" id="pilot-grid"></div>`;
        } else if (tab === "maps") {
            content = `<div class="section">🗺️ Maps (Level & Hintergrund)</div><div class="grid" id="map-grid"></div>`;
        } else if (tab === "upgrades") {
            content = `<div class="section">⬆️ Upgrades</div><div class="ulist" id="upgrade-list"></div>`;
        } else if (tab === "packs") {
            content = `<div class="section">📦 Packs ziehen</div>
              ${this._packReveal ? `<div style="background:rgba(0,230,118,0.15);border:1px solid #00e676;border-radius:10px;padding:8px 12px;margin-bottom:8px;color:#b9f6ca;font-weight:700">${this._packReveal}</div>` : ""}
              ${PACKS.map(p => `<button class="play-btn pack-btn" data-pack="${p.id}" ${coins >= p.cost ? "" : "disabled"} style="background:linear-gradient(135deg,#ff9800,#e91e63);margin-bottom:6px">${p.name} — ${p.cost} 💰<br><small style="font-weight:400;opacity:.85">${p.desc}</small></button>`).join("")}`;
        } else if (tab === "records") {
            const ach = [
                { ok: shop.ownedShips.length > 1, t: "🚀 Erstes Schiff gekauft" },
                { ok: SHIPS.some(s => s.shape === "ufo" && shop.ownedShips.includes(s.id)), t: "🛸 Rundumschuss-Schiff besessen" },
                { ok: SHIPS.some(s => s.packOnly && shop.ownedShips.includes(s.id)), t: "👑 Legendäres Schiff gezogen" },
                { ok: shop.ownedMaps.length >= MAPS.length, t: "🗺️ Alle Maps freigeschaltet" },
                { ok: shop.ownedFeatures.length > 0, t: "⚡ Erstes Feature freigeschaltet" },
                { ok: shop.ownedPilots.length > 1, t: "🧑‍🚀 Neuen Piloten geholt" },
                { ok: (recs.bestKills || 0) >= 50, t: "💥 50 Abschüsse in einer Runde" },
                { ok: (recs.bestScore || 0) >= 500, t: "⭐ Highscore 500+" },
            ];
            content = `<div class="section">🏆 Rekorde</div>
              <div class="stats-row">
                <div class="chip">Highscore: <span>${recs.bestScore || 0}</span></div>
                <div class="chip">Meiste Abschüsse: <span>${recs.bestKills || 0}</span></div>
                <div class="chip">Höchste Welle: <span>${recs.bestWave || 0}</span></div>
                <div class="chip">Spiele: <span>${recs.games || 0}</span></div>
              </div>
              <div class="section">🎖️ Erfolge (${ach.filter(a => a.ok).length}/${ach.length})</div>
              <div class="ulist">${ach.map(a => `<div class="ucard ${a.ok ? "" : "locked"}"><div class="uicon">${a.ok ? "✅" : "🔒"}</div><div class="uinfo"><div class="uname">${a.t}</div></div></div>`).join("")}</div>`;
        }

        this.shadowRoot.innerHTML = `<style>${SHOP_CSS}</style>
      <div class="wrap">
        <div class="header">
          <span class="title">☄️ Weltraum Pilot</span>
          <div class="coins-badge">💰 ${coins}</div>
          <button class="btn-sm" id="close">Zurück</button>
        </div>
        <div class="tabbar">${TABS.map(tb => `<button class="tab${tb.id === tab ? " on" : ""}" data-tab="${tb.id}">${tb.label}</button>`).join("")}</div>
        <div class="body">${content}</div>
      </div>`;
        this._packReveal = null;

        const sr = this.shadowRoot;
        sr.getElementById("close").onclick = () => this.dispatchEvent(new CustomEvent("close-game", { bubbles: true }));
        sr.querySelectorAll(".tab").forEach(b => { b.onclick = () => { this._tab = b.dataset.tab; this._showShop(); }; });
        const playBtn = sr.getElementById("play"); if (playBtn) playBtn.onclick = () => this._startGame();

        // Ship grid
        const grid = sr.getElementById("ship-grid");
        if (grid) {
        // Nur kaufbare Schiffe + bereits besessene Pack-Schiffe; nach Wert sortiert
        const allShips = SHIPS.filter(s => !s.packOnly || shop.ownedShips.includes(s.id));
        if (shop.customShip) allShips.push({ id: "custom", name: "Eigenes", price: 0, ...shop.customShip });
        allShips.sort((a, b) => (a.price == null ? 100000 : a.price) - (b.price == null ? 100000 : b.price));
        for (const s of allShips) {
            const owned = s.id === "custom" || shop.ownedShips.includes(s.id);
            const active = shop.equipped === s.id;
            const canBuy = !owned && !s.packOnly && coins >= s.price;
            const card = document.createElement("div");
            card.className = "card" + (active ? " active" : "") + (!owned && !canBuy ? " locked" : "");
            const cvs = document.createElement("canvas"); cvs.width = 44; cvs.height = 44; cvs.className = "preview";
            this._drawPreview(cvs.getContext("2d"), s); card.appendChild(cvs);
            const nm = document.createElement("div"); nm.className = "card-name"; nm.textContent = s.name; card.appendChild(nm);
            if (PERKS[s.id]) { const pk = document.createElement("div"); pk.className = "card-perk"; pk.textContent = "✨ " + PERKS[s.id].desc; card.appendChild(pk); }
            const pr = document.createElement("div"); pr.className = "card-price" + (owned ? " owned" : "");
            pr.textContent = owned ? "✓" : (s.packOnly ? "🌟 nur Pack" : `💰 ${s.price}`); card.appendChild(pr);
            if (active) { const b = document.createElement("div"); b.className = "badge"; b.textContent = "AKTIV"; card.appendChild(b); }
            card.onclick = () => {
                if (owned && !active) { shop.equipped = s.id; saveShop(shop); this._showShop(); }
                else if (!owned && !s.packOnly && coins >= s.price) {
                    this._coins -= s.price; setCoins(this._coins);
                    shop.ownedShips.push(s.id); shop.equipped = s.id; saveShop(shop); this._showShop();
                }
            };
            grid.appendChild(card);
        }
        }

        // Custom ship builder
        const cHull = sr.getElementById("c-hull"), cAccent = sr.getElementById("c-accent"), cFlame = sr.getElementById("c-flame");
        const cPreview = sr.getElementById("c-preview");
        if (cHull) {
        const updatePreview = () => {
            const s = { hull: cHull.value, accent: cAccent.value, flame: cFlame.value };
            const ctx = cPreview.getContext("2d"); ctx.clearRect(0, 0, 64, 64);
            this._drawPreview(ctx, s, 32, 32, 1.3);
        };
        cHull.oninput = cAccent.oninput = cFlame.oninput = updatePreview;
        updatePreview();
        sr.getElementById("c-save").onclick = () => {
            shop.customShip = { hull: cHull.value, accent: cAccent.value, flame: cFlame.value };
            shop.equipped = "custom"; saveShop(shop); this._showShop();
        };
        }

        // Upgrades
        const ul = sr.getElementById("upgrade-list");
        if (ul) {
        for (const def of UPGRADE_DEFS) {
            const lvl = shop.upgradeLevels[def.id] || 0;
            const maxed = def.maxLevel && lvl >= def.maxLevel;
            const price = maxed ? Infinity : getUpgradePrice(def, lvl);
            // Doppelschuss über Level 1 hinaus nur mit gekauftem UND ausgerüstetem Rundumschuss-Schiff
            const eqDef = SHIPS.find(s => s.id === shop.equipped);
            const ufoReady = !!(eqDef && eqDef.shape === "ufo") && shop.ownedShips.includes(shop.equipped);
            const ufoGate = def.id === "double" && lvl >= 1 && !ufoReady;
            const canBuy = !maxed && !ufoGate && coins >= price;
            const card = document.createElement("div");
            card.className = "ucard" + (maxed ? " maxed" : "") + ((!maxed && !canBuy) || ufoGate ? " locked" : "");
            card.innerHTML = `
              <div class="uicon">${def.icon}</div>
              <div class="uinfo">
                <div class="uname">${def.name} ${maxed ? "" : "(Lv " + lvl + ")"}</div>
                <div class="udesc">${maxed ? "Max erreicht!" : (ufoGate ? "Nur mit ausgerüstetem UFO 🛸" : def.desc(lvl))}</div>
              </div>
              <div class="uprice ${maxed?"maxed":""}">${maxed ? "✓ Max" : (ufoGate ? "🛸 nötig" : "💰 " + price)}</div>`;
            if (!maxed && !ufoGate && canBuy) {
                card.onclick = () => {
                    this._coins -= price; setCoins(this._coins);
                    shop.upgradeLevels[def.id] = lvl + 1; saveShop(shop); this._showShop();
                };
            }
            ul.appendChild(card);
        }
        }

        // Packs ziehen (verschiedene Typen)
        sr.querySelectorAll(".pack-btn").forEach(b => { b.onclick = () => this._openPack(b.dataset.pack); });

        // Piloten
        const pgrid = sr.getElementById("pilot-grid");
        if (pgrid) {
        for (const p of PILOTS) {
            const owned = shop.ownedPilots.includes(p.id);
            const active = shop.equippedPilot === p.id;
            const card = document.createElement("div");
            card.className = "card" + (active ? " active" : "") + (!owned && coins < p.price ? " locked" : "");
            const ico = document.createElement("div"); ico.style.fontSize = "30px"; ico.style.height = "44px"; ico.style.display = "flex"; ico.style.alignItems = "center"; ico.style.justifyContent = "center"; ico.textContent = p.emoji; card.appendChild(ico);
            const nm = document.createElement("div"); nm.className = "card-name"; nm.textContent = p.name; card.appendChild(nm);
            const pr = document.createElement("div"); pr.className = "card-price" + (owned ? " owned" : "");
            pr.textContent = owned ? "✓" : `💰 ${p.price}`; card.appendChild(pr);
            if (active) { const b = document.createElement("div"); b.className = "badge"; b.textContent = "AKTIV"; card.appendChild(b); }
            card.onclick = () => {
                if (owned) { shop.equippedPilot = p.id; saveShop(shop); this._showShop(); }
                else if (coins >= p.price) {
                    this._coins -= p.price; setCoins(this._coins);
                    shop.ownedPilots.push(p.id); shop.equippedPilot = p.id; saveShop(shop); this._showShop();
                }
            };
            pgrid.appendChild(card);
        }
        }

        // Maps
        const mgrid = sr.getElementById("map-grid");
        if (mgrid) {
        for (const m of MAPS) {
            const owned = shop.ownedMaps.includes(m.id);
            const active = shop.equippedMap === m.id;
            const card = document.createElement("div");
            card.className = "card" + (active ? " active" : "") + (!owned ? " locked" : "");
            const sw = document.createElement("canvas"); sw.width = 44; sw.height = 44; sw.className = "preview";
            const c = sw.getContext("2d"); c.fillStyle = m.space; c.fillRect(0, 0, 44, 44);
            c.fillStyle = m.star; for (let k = 0; k < 12; k++) c.fillRect((k * 17) % 44, (k * 11) % 44, 2, 2);
            card.appendChild(sw);
            const nm = document.createElement("div"); nm.className = "card-name"; nm.textContent = m.name; card.appendChild(nm);
            const pr = document.createElement("div"); pr.className = "card-price" + (owned ? " owned" : "");
            pr.textContent = owned ? "✓" : `💰 ${m.price}`; card.appendChild(pr);
            if (active) { const b = document.createElement("div"); b.className = "badge"; b.textContent = "AKTIV"; card.appendChild(b); }
            card.className = "card" + (active ? " active" : "") + (!owned && coins < m.price ? " locked" : "");
            card.onclick = () => {
                if (owned) { shop.equippedMap = m.id; saveShop(shop); this._showShop(); }
                else if (coins >= m.price) {
                    this._coins -= m.price; setCoins(this._coins);
                    shop.ownedMaps.push(m.id); shop.equippedMap = m.id; saveShop(shop); this._showShop();
                }
            };
            mgrid.appendChild(card);
        }
        }
    }

    // Brawl-Stars-Style Packs: je nach Typ Schiff / Feature / legendäres Schiff – sonst Münzen
    _openPack(packId) {
        const pack = PACKS.find(p => p.id === packId);
        if (!pack || this._coins < pack.cost) return;
        const shop = this._shop;
        this._coins -= pack.cost; setCoins(this._coins);
        let pool = [];
        if (pack.kind === "ship") pool = SHIPS.filter(s => !s.packOnly && !shop.ownedShips.includes(s.id)).map(s => ({ t: "ship", v: s }));
        else if (pack.kind === "legendary") pool = SHIPS.filter(s => s.packOnly && !shop.ownedShips.includes(s.id)).map(s => ({ t: "ship", v: s }));
        else if (pack.kind === "feature") pool = FEATURES.filter(f => !shop.ownedFeatures.includes(f.id)).map(f => ({ t: "feature", v: f }));
        else if (pack.kind === "pilot") pool = PILOTS.filter(p => !shop.ownedPilots.includes(p.id)).map(p => ({ t: "pilot", v: p }));
        // Meistens etwas Neues, sonst Münzen (mehr bei teureren Packs)
        let reward;
        if (pool.length && Math.random() < 0.82) reward = pool[Math.floor(Math.random() * pool.length)];
        else if (Math.random() < 0.15) reward = { t: "coins", v: 1000, jackpot: true };  // seltener Jackpot
        else reward = { t: "coins", v: Math.round(pack.cost * (0.4 + Math.random() * 0.5)) };
        if (reward.t === "ship") { shop.ownedShips.push(reward.v.id); shop.equipped = reward.v.id; this._packReveal = `🎉 Schiff gezogen: <b>${reward.v.name}</b>!`; }
        else if (reward.t === "feature") { shop.ownedFeatures.push(reward.v.id); this._packReveal = `⚡ Feature gezogen: <b>${reward.v.name}</b>! (im Spiel per Knopf nutzen)`; }
        else if (reward.t === "pilot") { shop.ownedPilots.push(reward.v.id); shop.equippedPilot = reward.v.id; this._packReveal = `🧑‍🚀 Pilot gezogen: <b>${reward.v.name}</b>!`; }
        else { this._coins += reward.v; setCoins(this._coins); this._packReveal = reward.jackpot ? `🎰 <b>JACKPOT! +${reward.v} Taler!</b> 🤑` : `💰 Diesmal kein neues Teil – dafür <b>+${reward.v} Münzen</b>!`; }
        saveShop(shop);
        // Greifarm-Automat-Animation, danach Shop mit Gewinn-Anzeige
        const icon = reward.t === "coins" ? (reward.jackpot ? "🎰" : "💰") : reward.t === "feature" ? reward.v.icon : reward.t === "pilot" ? reward.v.emoji : "🚀";
        const label = reward.t === "coins" ? (reward.jackpot ? `JACKPOT! +${reward.v}` : `+${reward.v} Münzen`) : reward.v.name;
        // Rarity-Farbe für den Glow
        this._glowFor = reward.t === "coins" ? (reward.jackpot ? "#ff4f9a" : "#ffd54f")
            : reward.t === "ship" ? (reward.v.packOnly ? "#ffd700" : (reward.v.price >= 1500 ? "#b388ff" : reward.v.price >= 300 ? "#4fc3f7" : "#b0bec5"))
            : reward.t === "pilot" ? "#5be3a0" : "#18ffff";
        this._playPackAnim(icon, label, () => this._showShop());
    }

    // Lootbox-Reveal: Kiste lädt mit rotierenden Lichtstrahlen auf, platzt mit Konfetti, Gewinn ploppt heraus
    _playPackAnim(icon, label, done) {
        const ov = document.createElement("div");
        ov.innerHTML = `<style>
          .pa{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:'Segoe UI',sans-serif;
              background:radial-gradient(circle at 50% 45%, rgba(70,35,140,.96), rgba(5,5,20,.98))}
          .pa-stage{position:relative;width:320px;height:320px;display:flex;align-items:center;justify-content:center}
          .pa-rays{position:absolute;width:560px;height:560px;border-radius:50%;opacity:0;
              background:repeating-conic-gradient(rgba(255,255,255,.16) 0deg 10deg, rgba(255,255,255,0) 10deg 26deg);
              animation:pa-spin 7s linear infinite, pa-rayin .6s ease forwards}
          @keyframes pa-spin{to{transform:rotate(360deg)}}
          @keyframes pa-rayin{to{opacity:1}}
          .pa-box{position:absolute;font-size:130px;animation:pa-build 1.3s ease-in-out forwards;filter:drop-shadow(0 0 18px rgba(255,255,255,.4))}
          @keyframes pa-build{0%{transform:scale(.6) rotate(0)}20%{transform:scale(1) rotate(-7deg)}40%{transform:scale(1.06) rotate(7deg)}60%{transform:scale(1) rotate(-9deg)}80%{transform:scale(1.12) rotate(9deg)}100%{transform:scale(0) rotate(0);opacity:0}}
          .pa-prize{position:absolute;text-align:center;opacity:0;transform:scale(.2)}
          .pa-prize.show{animation:pa-pop .65s cubic-bezier(.2,1.6,.35,1) forwards}
          @keyframes pa-pop{to{opacity:1;transform:scale(1)}}
          .pa-prize .em{font-size:120px;filter:drop-shadow(0 0 30px var(--glow,#ffd54f))}
          .pa-prize .lbl{display:block;color:#fff;font-weight:800;font-size:26px;margin-top:12px;text-shadow:0 2px 12px #000}
          .pa-tap{position:absolute;bottom:34px;color:#cfd3ff;font-weight:700;opacity:0;animation:pa-fade .4s ease 2.1s forwards}
          @keyframes pa-fade{to{opacity:1}}
          .pa-conf{position:absolute;width:13px;height:13px;border-radius:3px}
        </style>
        <div class="pa">
          <div class="pa-stage" id="pa-stage">
            <div class="pa-rays"></div>
            <div class="pa-box">📦</div>
            <div class="pa-prize" id="pa-prize" style="--glow:${this._glowFor ? this._glowFor : '#ffd54f'}"><div class="em">${icon}</div><span class="lbl">${label}</span></div>
          </div>
          <div class="pa-tap">Tippen zum Schließen</div>
        </div>`;
        this.shadowRoot.appendChild(ov);
        const stage = ov.querySelector("#pa-stage");
        const prize = ov.querySelector("#pa-prize");
        const colors = ['#ff4f9a', '#7c5cff', '#ffb23e', '#5be3a0', '#48c6ff', '#ff7b7b'];
        const burst = setTimeout(() => {
            prize.classList.add("show");
            for (let i = 0; i < 28; i++) {
                const c = document.createElement("div"); c.className = "pa-conf";
                c.style.background = colors[i % colors.length];
                stage.appendChild(c);
                const ang = (i / 28) * Math.PI * 2, dist = 130 + Math.random() * 130;
                c.animate(
                    [{ transform: 'translate(0,0) scale(1)', opacity: 1 },
                     { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.3) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
                    { duration: 950, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }
                );
            }
        }, 1300);
        let closed = false;
        const finish = () => { if (closed) return; closed = true; clearTimeout(tm); clearTimeout(burst); ov.remove(); done(); };
        const tm = setTimeout(finish, 3600);
        ov.querySelector(".pa").addEventListener("click", finish);
    }

    _drawPreview(ctx, skin, cx, cy, scale) {
        cx = cx || 22; cy = cy || 22; scale = scale || 1;
        scale *= Math.min(skin.scale || 1, 1.25);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
        const t = performance.now() / 300;
        const hull = skin.hull === "rainbow" ? `hsl(${(t*60)%360},80%,60%)` : skin.hull;
        ctx.strokeStyle = hull; ctx.lineWidth = 2.5;
        if (skin.shape === "ufo") {
            ctx.beginPath(); ctx.ellipse(0,3,15,5,0,0,6.2832); ctx.stroke();
            ctx.strokeStyle = skin.accent || hull;
            ctx.beginPath(); ctx.arc(0,-1,7,Math.PI,0); ctx.stroke();
            ctx.strokeStyle = hull;
        } else {
            ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke();
        }
        const fl = skin.flame === "rainbow" ? `hsl(${((t*80)+180)%360},90%,55%)` : skin.flame;
        ctx.strokeStyle = fl; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-16,0); ctx.lineTo(-8,4); ctx.stroke();
        ctx.restore();
    }

    // ── Game ──────────────────────────────────────────────────────────────────

    _startGame() {
        const effects = getEffects(this._shop);
        const skin = this._getSkin();

        this.shadowRoot.innerHTML = `<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:host { display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 100%; height: 100%; background: #000; font-family: "Segoe UI", sans-serif; user-select: none; }
.top-bar { width: min(95vw, 400px); display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.top-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #e0e0e0; border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.coins-d { color: #ffd700; font-weight: 700; font-size: 0.95rem; }
canvas { display: block; max-height: 92vh; max-width: 98vw; touch-action: none;
  border: 2px solid rgba(0,255,255,0.2); border-radius: 10px; box-shadow: 0 0 20px rgba(0,255,255,0.08); }
#mc { display: none; margin-top: 0.4rem; gap: 0.5rem; }
@media (pointer: coarse) { #mc { display: flex; } }
#feat-bar { display: flex; gap: 0.5rem; margin-top: 0.4rem; justify-content: center; }
.cb.feat { background: rgba(124,92,255,0.25); border-color: rgba(124,92,255,0.6); position: relative; }
.cb.feat.cooling { opacity: 0.4; }
.cb { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2); color: white; font-size: 1.2rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; }
.cb:active { background: rgba(255,255,255,0.25); }
</style>
<div class="top-bar">
  <button class="top-btn" id="back">🛒 Shop</button>
  <button class="top-btn" id="soccer">⚽ Fußball</button>
  <div class="coins-d">💰 <span id="cd">${this._coins}</span></div>
  <button class="top-btn" id="quit">✕</button>
</div>
<canvas id="c" width="720" height="720"></canvas>
<div id="mc">
  <button class="cb" id="bl">↺</button>
  <button class="cb" id="bt">🔥</button>
  <button class="cb" id="br">↻</button>
  <button class="cb" id="bf">💥</button>
</div>
<div id="feat-bar">${this._shop.ownedFeatures.map(fid => { const f = FEATURES.find(x => x.id === fid); return f && !f.passive ? `<button class="cb feat" data-feat="${f.id}" title="${f.desc}">${f.icon}</button>` : ""; }).join("")}</div>`;

        const sr = this.shadowRoot;
        sr.getElementById("quit").onclick = () => this.dispatchEvent(new CustomEvent("close-game", { bubbles: true }));
        sr.getElementById("back").onclick = () => this._showShop();
        { const _sb = sr.getElementById("soccer"); if (_sb) _sb.onclick = () => this.dispatchEvent(new CustomEvent("play-game", { bubbles: true, detail: { id: "soccer" } })); }
        this._runGame(effects, skin);
    }

    _runGame(fx, skin) {
        const sr = this.shadowRoot;
        const cv = sr.getElementById("c"), ctx = cv.getContext("2d");
        const coinEl = sr.getElementById("cd");
        const curMap = MAPS.find(m => m.id === this._shop.equippedMap) || MAPS[0];
        const curPilot = PILOTS.find(p => p.id === this._shop.equippedPilot) || PILOTS[0];
        const W = cv.width, H = cv.height;
        const ctrl = new AbortController(), sig = { signal: ctrl.signal };

        // Infinite world state
        let cam = { x: 0, y: 0 }; // camera center
        let ship = { x: 0, y: 0, angle: -Math.PI / 2, vx: 0, vy: 0 };
        let bullets = [], asteroids = [], particles = [];
        let keys = { left: false, right: false, up: false, fire: false };
        let fireCooldown = 0, score = 0, alive = true, wave = 1;
        let lives = fx.lives, invincible = fx.startShield || 0, totalKills = 0, shake = 0;
        let bulletHue = 0, raf;

        // Generate star field (fixed positions spread over a large area, tiled)
        const STAR_COUNT = 200;
        const stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({ x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000,
                size: Math.random() * 1.5 + 0.5, bright: Math.random() });
        }

        const spawnAsteroid = (size, x, y) => {
            const r = size * 14;
            if (x === undefined) {
                // Spawn around the ship but not too close, in a ring
                const angle = Math.random() * Math.PI * 2;
                const dist = 150 + Math.random() * 150;
                x = ship.x + Math.cos(angle) * dist;
                y = ship.y + Math.sin(angle) * dist;
            }
            const speed = (1.5 + Math.random() * 1.5) * (4 - size);
            const a = Math.random() * Math.PI * 2;
            const verts = [], n = 7 + Math.floor(Math.random() * 4);
            for (let i = 0; i < n; i++) {
                const va = (i / n) * Math.PI * 2;
                verts.push({ x: Math.cos(va) * r * (0.7 + Math.random() * 0.3),
                             y: Math.sin(va) * r * (0.7 + Math.random() * 0.3) });
            }
            asteroids.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r, size, verts });
        };

        const spawnWave = () => {
            // Number of asteroids based on kills + wave number
            const count = Math.min(10 + Math.floor(totalKills / 3), 20);
            for (let i = 0; i < count; i++) spawnAsteroid(3);
            wave++;
            if (wave > 2) sfx("wave");
        };
        spawnWave();

        const spawnParticles = (x, y, n) => {
            for (let i = 0; i < n; i++)
                particles.push({ x, y, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 1, hue: Math.random()*360 });
        };

        // Input
        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
            if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
            if (e.key === "ArrowUp" || e.key === "w") keys.up = true;
            if (e.key === " " || e.key === "Enter") { e.preventDefault(); keys.fire = true; }
        }, sig);
        document.addEventListener("keyup", e => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
            if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
            if (e.key === "ArrowUp" || e.key === "w") keys.up = false;
            if (e.key === " " || e.key === "Enter") keys.fire = false;
        }, sig);
        const wire = (id, key) => {
            const b = sr.getElementById(id);
            b.addEventListener("touchstart", e => { e.preventDefault(); keys[key] = true; }, { ...sig, passive: false });
            b.addEventListener("touchend", e => { e.preventDefault(); keys[key] = false; }, { ...sig, passive: false });
        };
        wire("bl","left"); wire("br","right"); wire("bt","up"); wire("bf","fire");

        // Features (Spezial-Fähigkeiten aus Packs)
        const ownedFeats = this._shop.ownedFeatures || [];
        // Begleit-Drohnen (passiv): fliegen mit und schießen für dich
        const droneCount = Math.min(6, (fx.droneCount || 0) + (ownedFeats.includes("drones") ? 2 : 0));
        const drones = [];
        for (let di = 0; di < droneCount; di++) drones.push({ ang: (di / Math.max(1, droneCount)) * Math.PI * 2, cd: (di * 0.3) % 1, x: null, y: null });

        // Böse Gegner überall – Stärke aus Map-Level + eigenem Schiff; höheres Level = mehr Geld
        const battle = true;
        const shipVal = skin.price != null ? skin.price : (skin.beams ? skin.beams * 250 : 50);
        const enemyLevel = Math.min(8, (curMap.diff || 1) + Math.floor(shipVal / 1200));
        const enemyReward = Math.round((2 + enemyLevel * 2) * (fx.coinMult || 1));   // schwerere Gegner + Schiff-Bonus = mehr Münzen
        let enemies = [], enemyBullets = [], enemySpawnCd = 1.5;
        const cooldowns = {};
        const featBtns = {};
        const activateFeature = (id) => {
            if (!ownedFeats.includes(id) || (cooldowns[id] || 0) > 0) return;
            const def = FEATURES.find(f => f.id === id); if (!def) return;
            cooldowns[id] = def.cooldown;
            if (id === "teleport") {
                ship.x += Math.cos(ship.angle) * 240; ship.y += Math.sin(ship.angle) * 240;
                invincible = Math.max(invincible, 0.6); spawnParticles(ship.x, ship.y, 12);
            } else if (id === "shield") {
                invincible = 3; spawnParticles(ship.x, ship.y, 16);
            } else if (id === "bomb") {
                let hit = 0;
                asteroids = asteroids.filter(a => {
                    if (Math.hypot(a.x - ship.x, a.y - ship.y) < 220) { spawnParticles(a.x, a.y, 8); hit++; return false; }
                    return true;
                });
                if (hit) { this._coins += hit; setCoins(this._coins); coinEl.textContent = this._coins; }
                shake = 14;
            } else if (id === "teleport") { shake = Math.max(shake, 5); }
        };
        ownedFeats.forEach(id => {
            cooldowns[id] = 0;
            const b = sr.querySelector(`.feat[data-feat="${id}"]`);
            if (b) { featBtns[id] = b;
                b.addEventListener("click", () => activateFeature(id), sig);
                b.addEventListener("touchstart", e => { e.preventDefault(); activateFeature(id); }, { ...sig, passive: false });
            }
        });
        const featKey = { t: "teleport", q: "shield", b: "bomb" };
        document.addEventListener("keydown", e => { const id = featKey[e.key]; if (id) activateFeature(id); }, sig);

        this._cleanup = () => { ctrl.abort(); cancelAnimationFrame(raf); };
        let lastFrame = performance.now();

        const update = (dt) => {
            invincible -= dt;
            if (shake > 0) shake = Math.max(0, shake - dt * 55);
            // Feature-Cooldowns
            for (const id in cooldowns) {
                if (cooldowns[id] > 0) {
                    cooldowns[id] = Math.max(0, cooldowns[id] - dt);
                    if (featBtns[id]) featBtns[id].classList.toggle("cooling", cooldowns[id] > 0);
                }
            }
            // Begleit-Drohnen: umkreisen das Schiff und schießen auf nahe Brocken
            for (const dr of drones) {
                dr.ang += dt * 1.6;
                dr.x = ship.x + Math.cos(dr.ang) * 55;
                dr.y = ship.y + Math.sin(dr.ang) * 55;
                dr.cd -= dt;
                if (dr.cd <= 0) {
                    let best = null, bd = 340;
                    for (const a of asteroids) { const d = Math.hypot(a.x - dr.x, a.y - dr.y); if (d < bd) { bd = d; best = a; } }
                    if (best) {
                        const ang = Math.atan2(best.y - dr.y, best.x - dr.x);
                        bullets.push({ x: dr.x, y: dr.y, vx: Math.cos(ang) * fx.bulletSpeed, vy: Math.sin(ang) * fx.bulletSpeed, life: 1.6, hue: 190 });
                        dr.cd = 0.9;
                    }
                }
            }
            if (keys.left) ship.angle -= 4 * dt;
            if (keys.right) ship.angle += 4 * dt;
            if (keys.up) {
                ship.vx += Math.cos(ship.angle) * fx.thrustPower * dt;
                ship.vy += Math.sin(ship.angle) * fx.thrustPower * dt;
            }
            ship.vx *= 0.995; ship.vy *= 0.995;
            ship.x += ship.vx * dt; ship.y += ship.vy * dt;

            // Camera follows ship smoothly
            cam.x += (ship.x - cam.x) * 0.1;
            cam.y += (ship.y - cam.y) * 0.1;

            // Fire
            fireCooldown -= dt;
            if (keys.fire && fireCooldown <= 0) {
                fireCooldown = fx.fireCooldown;
                sfx("shoot"); shake = Math.max(shake, 2.5);
                const cos = Math.cos(ship.angle), sin = Math.sin(ship.angle);
                const bvx = cos * fx.bulletSpeed + ship.vx * 0.3;
                const bvy = sin * fx.bulletSpeed + ship.vy * 0.3;
                if (skin.shape === "ufo") {
                    // Rundumschuss: Basis-Strahlen je nach Schiff (teurer = mehr), +2 pro Doppelschuss-Level
                    const N = (skin.beams || 4) + (fx.doubleLevel || 0) * 2 + (fx.extraBeams || 0);
                    for (let k = 0; k < N; k++) {
                        const a = ship.angle + (k * 2 * Math.PI / N);
                        const c = Math.cos(a), s = Math.sin(a);
                        bullets.push({ x: ship.x + c*14, y: ship.y + s*14, vx: c*fx.bulletSpeed + ship.vx*0.3, vy: s*fx.bulletSpeed + ship.vy*0.3, life: 2, hue: (bulletHue + k*(360/N)) % 360 });
                    }
                } else if (fx.doubleShot) {
                    const ox = Math.cos(ship.angle + Math.PI/2) * 5, oy = Math.sin(ship.angle + Math.PI/2) * 5;
                    bullets.push({ x: ship.x+cos*14+ox, y: ship.y+sin*14+oy, vx: bvx, vy: bvy, life: 2, hue: bulletHue });
                    bullets.push({ x: ship.x+cos*14-ox, y: ship.y+sin*14-oy, vx: bvx, vy: bvy, life: 2, hue: bulletHue+30 });
                } else {
                    bullets.push({ x: ship.x+cos*14, y: ship.y+sin*14, vx: bvx, vy: bvy, life: 2, hue: bulletHue });
                }
                bulletHue = (bulletHue + 15) % 360;
            }

            // Bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.hue = (b.hue+3)%360;
                if (b.life <= 0) { bullets.splice(i, 1); continue; }
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const a = asteroids[j];
                    if (Math.hypot(b.x-a.x, b.y-a.y) < a.r) {
                        bullets.splice(i, 1);
                        const pts = (4 - a.size) * 10;
                        score += pts;
                        // Punkt direkt gutschreiben (mit Münz-Bonus mancher Schiffe)
                        this._coins += Math.round(fx.coinMult || 1); setCoins(this._coins); coinEl.textContent = this._coins;
                        totalKills++;
                        spawnParticles(a.x, a.y, 6);
                        shake = Math.max(shake, 4); sfx("hit");
                        // Zwei neue Brocken spawnen – irgendwo, aber NICHT auf dem Spieler
                        if (asteroids.length < 16) {
                            for (let q = 0; q < 2; q++) {
                                const ang = Math.random() * Math.PI * 2, dist = 280 + Math.random() * 260;
                                spawnAsteroid(1 + Math.floor(Math.random() * 3), ship.x + Math.cos(ang) * dist, ship.y + Math.sin(ang) * dist);
                            }
                        }
                        asteroids.splice(j, 1);
                        break;
                    }
                }
            }

            // Asteroid movement (no wrapping - infinite world)
            for (const a of asteroids) { a.x += a.vx * dt; a.y += a.vy * dt; }

            // Remove asteroids too far away (> 800 from ship)
            asteroids = asteroids.filter(a => Math.hypot(a.x-ship.x, a.y-ship.y) < 800);

            // Ship collision
            if (invincible <= 0) {
                for (const a of asteroids) {
                    if (Math.hypot(ship.x-a.x, ship.y-a.y) < a.r + 10) {
                        lives--; spawnParticles(ship.x, ship.y, 12); shake = 11; sfx("hurt");
                        if (lives <= 0) { alive = false; endGame(); return; }
                        invincible = 2; ship.vx = 0; ship.vy = 0;
                        break;
                    }
                }
            }

            // Spawn new wave when few asteroids left
            if (asteroids.length < 3) spawnWave();

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
                if (p.life <= 0) particles.splice(i, 1);
            }

            // Böse Gegner (Kampfzone)
            if (battle && alive) {
                enemySpawnCd -= dt;
                if (enemySpawnCd <= 0 && enemies.length < 2 + enemyLevel) {
                    const ea = Math.random() * Math.PI * 2, ed = 300 + Math.random() * 140;
                    enemies.push({ x: ship.x + Math.cos(ea) * ed, y: ship.y + Math.sin(ea) * ed, hp: 1 + Math.floor(enemyLevel / 2), cd: 1 + Math.random() });
                    enemySpawnCd = Math.max(1.0, 3 - enemyLevel * 0.25);
                }
                const espeed = 30 + enemyLevel * 9;
                for (const en of enemies) {
                    const a = Math.atan2(ship.y - en.y, ship.x - en.x);
                    en.x += Math.cos(a) * espeed * dt; en.y += Math.sin(a) * espeed * dt;
                    en.cd -= dt;
                    if (en.cd <= 0) {
                        const bs = 200 + enemyLevel * 15;
                        enemyBullets.push({ x: en.x, y: en.y, vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, life: 3 });
                        en.cd = Math.max(0.8, 2 - enemyLevel * 0.18);
                    }
                    if (invincible <= 0 && Math.hypot(en.x - ship.x, en.y - ship.y) < 18) {
                        lives--; spawnParticles(ship.x, ship.y, 12);
                        if (lives <= 0) { alive = false; endGame(); return; }
                        invincible = 2; ship.vx = 0; ship.vy = 0;
                    }
                }
                for (let i = bullets.length - 1; i >= 0; i--) {
                    const b = bullets[i];
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        const en = enemies[j];
                        if (Math.hypot(b.x - en.x, b.y - en.y) < 14) {
                            bullets.splice(i, 1); en.hp--; spawnParticles(en.x, en.y, 5); sfx("enemy");
                            if (en.hp <= 0) { enemies.splice(j, 1); this._coins += enemyReward; setCoins(this._coins); coinEl.textContent = this._coins; score += 50; totalKills++; shake = Math.max(shake, 6); sfx("explode"); }
                            break;
                        }
                    }
                }
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    const eb = enemyBullets[i];
                    eb.x += eb.vx * dt; eb.y += eb.vy * dt; eb.life -= dt;
                    if (eb.life <= 0) { enemyBullets.splice(i, 1); continue; }
                    if (invincible <= 0 && Math.hypot(eb.x - ship.x, eb.y - ship.y) < 13) {
                        enemyBullets.splice(i, 1); lives--; spawnParticles(ship.x, ship.y, 12); shake = 11; sfx("hurt");
                        if (lives <= 0) { alive = false; endGame(); return; }
                        invincible = 2; ship.vx = 0; ship.vy = 0;
                    }
                }
                enemies = enemies.filter(en => Math.hypot(en.x - ship.x, en.y - ship.y) < 950);
            }
        };

        const draw = () => {
            ctx.fillStyle = curMap.space; ctx.fillRect(0, 0, W, H);
            const shx = shake > 0 ? (Math.random() * 2 - 1) * shake : 0;
            const shy = shake > 0 ? (Math.random() * 2 - 1) * shake : 0;
            const ox = W/2 - cam.x + shx, oy = H/2 - cam.y + shy;

            // Stars (tile them) – Farbe je nach Map
            const t = performance.now();
            ctx.fillStyle = curMap.star;
            for (const s of stars) {
                // Parallax: stars move slower than world
                const sx = ((s.x * 0.3 - cam.x * 0.3 + ox) % W + W) % W;
                const sy = ((s.y * 0.3 - cam.y * 0.3 + oy) % H + H) % H;
                const a = 0.3 + 0.4 * Math.sin(t/1000 + s.bright * 10);
                ctx.globalAlpha = a;
                ctx.fillRect(sx, sy, s.size, s.size);
            }
            ctx.globalAlpha = 1;

            // Asteroids
            ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1.5;
            for (const a of asteroids) {
                const ax = a.x + ox, ay = a.y + oy;
                if (ax < -60 || ax > W+60 || ay < -60 || ay > H+60) continue;
                ctx.beginPath();
                ctx.moveTo(ax + a.verts[0].x, ay + a.verts[0].y);
                for (let i = 1; i < a.verts.length; i++) ctx.lineTo(ax + a.verts[i].x, ay + a.verts[i].y);
                ctx.closePath(); ctx.stroke();
            }

            // Begleit-Drohnen
            if (drones.length) {
                ctx.font = "16px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                for (const dr of drones) { if (dr.x == null) continue; ctx.fillText("🤖", dr.x + ox, dr.y + oy); }
            }

            // Böse Gegner + ihre Schüsse
            for (const en of enemies) {
                const ex = en.x + ox, ey = en.y + oy;
                if (ex < -40 || ex > W + 40 || ey < -40 || ey > H + 40) continue;
                ctx.save(); ctx.translate(ex, ey);
                ctx.strokeStyle = "#ff5252"; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.ellipse(0, 2, 13, 5, 0, 0, 6.2832); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, -1, 6, Math.PI, 0); ctx.stroke();
                ctx.restore();
            }
            for (const eb of enemyBullets) {
                const bx = eb.x + ox, by = eb.y + oy;
                ctx.fillStyle = "#ff1744"; ctx.shadowColor = "rgba(255,23,68,.5)"; ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
            }

            // Bullets
            for (const b of bullets) {
                const bx = b.x + ox, by = b.y + oy;
                if (bx < -10 || bx > W+10 || by < -10 || by > H+10) continue;
                if (fx.rainbowBullets) {
                    ctx.fillStyle = `hsl(${b.hue},100%,65%)`; ctx.shadowColor = `hsl(${b.hue},100%,50%)`; ctx.shadowBlur = 6;
                } else {
                    ctx.fillStyle = "#FFD600"; ctx.shadowColor = "rgba(255,214,0,0.4)"; ctx.shadowBlur = 4;
                }
                ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            }


            // Ship
            if (alive) {
                const blink = invincible > 0 && Math.floor(t/100) % 2;
                if (!blink) {
                    const sx = ship.x + ox, sy = ship.y + oy;
                    const isUfo = skin.shape === "ufo";
                    // UFO bleibt aufrecht (dreht sich nicht), normale Schiffe drehen mit
                    ctx.save(); ctx.translate(sx, sy); ctx.rotate(isUfo ? 0 : ship.angle); ctx.scale(skin.scale || 1, skin.scale || 1);
                    const tt = t / 300;
                    const hullC = skin.hull === "rainbow" ? `hsl(${(tt*60)%360},80%,60%)` : skin.hull;
                    ctx.strokeStyle = hullC; ctx.lineWidth = 2.5;
                    if (isUfo) {
                        ctx.beginPath(); ctx.ellipse(0,3,15,5,0,0,6.2832); ctx.stroke();
                        ctx.strokeStyle = skin.accent || hullC;
                        ctx.beginPath(); ctx.arc(0,-1,7,Math.PI,0); ctx.stroke();
                        // kleine rotierende Cockpit-Lichter (statt das UFO zu drehen)
                        ctx.fillStyle = skin.flame === "rainbow" ? `hsl(${(tt*120)%360},90%,60%)` : (skin.flame || "#fff");
                        for (let li = 0; li < 4; li++) { const la = tt * 2 + li * Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(la) * 11, 3 + Math.sin(la) * 3.5, 1.6, 0, 6.2832); ctx.fill(); }
                        ctx.strokeStyle = hullC;
                    } else {
                        ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke();
                    }
                    if (keys.up && !isUfo) {
                        const flC = skin.flame === "rainbow" ? `hsl(${((tt*80)+180)%360},90%,55%)` : skin.flame;
                        ctx.strokeStyle = flC; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-16-Math.random()*6,0); ctx.lineTo(-8,4); ctx.stroke();
                    }
                    ctx.restore();
                    // Pilot sitzt im Cockpit (aufrecht, nicht mitgedreht)
                    ctx.font = "13px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(curPilot.emoji, sx, sy - 1);
                }
            }

            // Particles
            for (const p of particles) {
                const px = p.x + ox, py = p.y + oy;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
                ctx.fillRect(px-2, py-2, 4, 4);
            }
            ctx.globalAlpha = 1;

            // HUD
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(4, 4, 220, 26);
            ctx.fillStyle = "white"; ctx.font = "bold 12px 'Segoe UI',sans-serif";
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
            ctx.fillText(`⭐ ${score}  ❤️ ${lives}  🌊 Welle ${wave}  💀 ${totalKills}`, 10, 22);

            if (!alive) {
                ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.font = "bold 22px 'Segoe UI',sans-serif";
                ctx.fillText("💀 Game Over", W/2, H/2 - 20);
                ctx.font = "15px 'Segoe UI',sans-serif";
                ctx.fillText(`Punkte: ${score}  |  Kills: ${totalKills}  |  Wellen: ${wave}`, W/2, H/2 + 8);
                ctx.fillText("Zurück zum Shop...", W/2, H/2 + 30);
            }
        };

        const endGame = () => {
            const r = getRecords();
            r.bestScore = Math.max(r.bestScore || 0, score);
            r.bestKills = Math.max(r.bestKills || 0, totalKills);
            r.bestWave = Math.max(r.bestWave || 0, wave);
            r.games = (r.games || 0) + 1;
            saveRecords(r);
            setTimeout(() => { cancelAnimationFrame(raf); this._showShop(); }, 2000);
        };

        const loop = () => {
            const now = performance.now();
            const dt = Math.min((now - lastFrame) / 1000, 0.04);
            lastFrame = now;
            if (alive) update(dt);
            draw();
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
    }
}

customElements.define("asteroids-game", AsteroidsGame);
