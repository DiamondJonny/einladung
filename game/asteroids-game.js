// game/asteroids-game.js
// Weltraum Pilot: Infinite-universe asteroids with shop, upgrades & custom ships.

// ── Shop Data ─────────────────────────────────────────────────────────────────

const SHIPS = [
    { id: "default", name: "Starter", price: 0, hull: "#4dd0e1", accent: "#00838f", flame: "#FF6D00" },
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
    // ── Legendär: NUR aus dem Legendär-Pack ziehbar (nicht kaufbar) ──
    { id: "king",      name: "Kosmos-König 👑", packOnly: true, hull: "rainbow", accent: "#ffca28", flame: "rainbow", shape: "ufo", beams: 12 },
    { id: "blackhole", name: "Schwarzes Loch 🕳️", packOnly: true, hull: "#311b92", accent: "#000000", flame: "#7c4dff", shape: "ufo", beams: 14 },
    { id: "guardian",  name: "Galaxie-Wächter 🛡️", packOnly: true, hull: "#00e5ff", accent: "#006064", flame: "#18ffff", shape: "ufo", beams: 16 },
];

// Coole Maps (Weltraum-Hintergründe) – im Shop kaufbar (nicht aus Packs)
const MAPS = [
    { id: "classic", name: "Klassik 🌌", space: "#0a0a1a", star: "#ffffff", price: 0 },
    { id: "nebula",  name: "Nebel 💜",   space: "#1a0a2e", star: "#e0b3ff", price: 150 },
    { id: "matrix",  name: "Matrix 💚",  space: "#001008", star: "#5bff9d", price: 150 },
    { id: "sunset",  name: "Sonnenuntergang 🌅", space: "#2a0a1a", star: "#ffd0a0", price: 200 },
    { id: "deepsea", name: "Tiefsee 🌊", space: "#001a2e", star: "#7fd4ff", price: 200 },
    { id: "lava",    name: "Lava 🔥",    space: "#2a0d00", star: "#ff8a3d", price: 250 },
];

// Features (Spezial-Fähigkeiten im Spiel) – aus Packs ziehbar, im Spiel per Knopf aktivierbar
const FEATURES = [
    { id: "teleport", name: "Teleport ✨", icon: "✨", cooldown: 4,  desc: "Springt ein Stück nach vorne (Ausweichen)" },
    { id: "shield",   name: "Schild 🛡️", icon: "🛡️", cooldown: 12, desc: "3 Sek. unverwundbar" },
    { id: "bomb",     name: "Bombe 💥",   icon: "💥", cooldown: 16, desc: "Zerstört Brocken in der Nähe" },
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
    { id: "legend",  name: "🌟 Legendär-Pack",  cost: 700, kind: "legendary", desc: "Seltenes Schiff – nur hier!" },
];

// Repeatable upgrades: each level costs more
const UPGRADE_DEFS = [
    { id: "thrust", name: "Antrieb", icon: "🔥", basePrice: 12, priceScale: 1.4,
      desc: lvl => `Level ${lvl} → ${lvl+1}`, apply: (e, lvl) => { e.thrustPower = 200 + lvl * 40; } },
    { id: "lives", name: "Extra-Leben", icon: "❤️", basePrice: 20, priceScale: 1.6,
      desc: lvl => `${3+lvl} → ${4+lvl} Leben`, apply: (e, lvl) => { e.lives = 3 + lvl; } },
    { id: "firerate", name: "Feuerrate", icon: "💨", basePrice: 15, priceScale: 1.5,
      desc: lvl => `Level ${lvl} → ${lvl+1}`, apply: (e, lvl) => { e.fireCooldown = Math.max(0.04, e.fireCooldown - lvl * 0.02); } },
    { id: "double", name: "Doppelschuss", icon: "🔫🔫", basePrice: 50, priceScale: 1.6, maxLevel: 8,
      desc: lvl => lvl < 1 ? "Zwei Schüsse — beim UFO: Strahlen 4 → 5" : `UFO-Strahlen: ${4+lvl} → ${5+lvl}`,
      apply: (e, lvl) => { e.doubleShot = lvl >= 1; e.doubleLevel = lvl; } },
    { id: "rainbow_bullets", name: "Regenbogen-Schüsse", icon: "🌈", basePrice: 20, priceScale: 0, maxLevel: 1,
      desc: () => "Bunte Kugeln!", apply: (e) => { e.rainbowBullets = true; } },
];

const SHOP_KEY = "asteroidsShop";
// Waehrung = gemeinsame Konto-Punkte ("points"). Der Einladungs-Bonus wird beim
// korrekten Namen vergeben (in index.html), nicht hier automatisch.
const COIN_KEY = "points";
function loadShop() { try { return JSON.parse(localStorage.getItem(SHOP_KEY) || "null"); } catch { return null; } }
function defaultShop() { return { ownedShips: ["default"], upgradeLevels: {}, equipped: "default", customShip: null, ownedMaps: ["classic"], equippedMap: "classic", ownedFeatures: [], ownedPilots: ["astro"], equippedPilot: "astro" }; }
function saveShop(d) { localStorage.setItem(SHOP_KEY, JSON.stringify(d)); }
function getCoins() { return parseInt(localStorage.getItem(COIN_KEY) || "0"); }
function setCoins(n) { localStorage.setItem(COIN_KEY, String(n)); }

function getUpgradePrice(def, level) {
    if (def.maxLevel && level >= def.maxLevel) return Infinity;
    return Math.floor(def.basePrice * Math.pow(def.priceScale || 1, level));
}

// VIP: Jonathan Schwarz bekommt eine Top-Start-Feuerrate und doppelten Upgrade-Effekt.
function isVip() { return localStorage.getItem("rocketVip") === "1"; }

function getEffects(shop) {
    const vip = isVip();
    const mult = vip ? 2 : 1;   // doppelt so viel pro gekauftem Upgrade
    const e = { bulletSpeed: 300, thrustPower: 200, lives: 3, fireCooldown: vip ? 0.07 : 0.18, doubleShot: false, doubleLevel: 0, rainbowBullets: false };
    for (const def of UPGRADE_DEFS) {
        const lvl = shop.upgradeLevels[def.id] || 0;
        if (lvl > 0) def.apply(e, lvl * mult);
    }
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
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; }
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
.preview { width: 44px; height: 44px; }
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

        this.shadowRoot.innerHTML = `<style>${SHOP_CSS}</style>
      <div class="wrap">
        <div class="header">
          <span class="title">☄️ Weltraum Pilot</span>
          <div class="coins-badge">💰 ${coins}</div>
          <button class="btn-sm" id="close">Zurück</button>
        </div>
        <div class="body">
          <div>
            <button class="play-btn" id="play" ${canPlay ? "" : "disabled"}>▶ Spielen</button>
            <div class="play-cost">Immer kostenlos spielen!</div>
          </div>
          <div>
            <div class="section">📊 Dein Setup</div>
            <div class="stats-row">
              <div class="chip">Leben: <span>${effects.lives}</span></div>
              <div class="chip">Antrieb: <span>${effects.thrustPower}</span></div>
              <div class="chip">Feuerrate: <span>${Math.round(1/effects.fireCooldown)}/s</span></div>
              <div class="chip">Doppel: <span>${effects.doubleShot?"Ja":"Nein"}</span></div>
              <div class="chip">Regenbogen: <span>${effects.rainbowBullets?"Ja":"Nein"}</span></div>
            </div>
          </div>
          <div>
            <div class="section">🚀 Raumschiffe</div>
            <div class="grid" id="ship-grid"></div>
          </div>
          <div>
            <div class="section">🎨 Eigenes Schiff bauen</div>
            <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
              <div style="display:flex;flex-direction:column;gap:6px">
                <div class="custom-row"><span class="color-label">Rumpf</span><input type="color" class="color-pick" id="c-hull" value="${custom.hull === 'rainbow' ? '#4dd0e1' : custom.hull}"></div>
                <div class="custom-row"><span class="color-label">Akzent</span><input type="color" class="color-pick" id="c-accent" value="${custom.accent}"></div>
                <div class="custom-row"><span class="color-label">Flamme</span><input type="color" class="color-pick" id="c-flame" value="${custom.flame === 'rainbow' ? '#FF6D00' : custom.flame}"></div>
              </div>
              <canvas class="custom-preview" id="c-preview" width="64" height="64"></canvas>
              <button class="custom-save" id="c-save">Speichern & Auswählen</button>
            </div>
          </div>
          <div>
            <div class="section">⬆️ Upgrades</div>
            <div class="ulist" id="upgrade-list"></div>
          </div>
          <div>
            <div class="section">📦 Packs ziehen</div>
            ${this._packReveal ? `<div style="background:rgba(0,230,118,0.15);border:1px solid #00e676;border-radius:10px;padding:8px 12px;margin-bottom:8px;color:#b9f6ca;font-weight:700">${this._packReveal}</div>` : ""}
            ${PACKS.map(p => `<button class="play-btn pack-btn" data-pack="${p.id}" ${coins >= p.cost ? "" : "disabled"} style="background:linear-gradient(135deg,#ff9800,#e91e63);margin-bottom:6px">${p.name} — ${p.cost} 💰<br><small style="font-weight:400;opacity:.85">${p.desc}</small></button>`).join("")}
          </div>
          <div>
            <div class="section">🧑‍🚀 Piloten (sitzen im Raumschiff)</div>
            <div class="grid" id="pilot-grid"></div>
          </div>
          <div>
            <div class="section">🗺️ Maps</div>
            <div class="grid" id="map-grid"></div>
          </div>
        </div>
      </div>`;
        this._packReveal = null;

        const sr = this.shadowRoot;
        sr.getElementById("close").onclick = () => this.dispatchEvent(new CustomEvent("close-game", { bubbles: true }));
        sr.getElementById("play").onclick = () => this._startGame();

        // Ship grid
        const grid = sr.getElementById("ship-grid");
        const allShips = [...SHIPS];
        if (shop.customShip) allShips.push({ id: "custom", name: "Eigenes", price: 0, ...shop.customShip });
        for (const s of allShips) {
            const owned = s.id === "custom" || shop.ownedShips.includes(s.id);
            const active = shop.equipped === s.id;
            const canBuy = !owned && !s.packOnly && coins >= s.price;
            const card = document.createElement("div");
            card.className = "card" + (active ? " active" : "") + (!owned && !canBuy ? " locked" : "");
            const cvs = document.createElement("canvas"); cvs.width = 44; cvs.height = 44; cvs.className = "preview";
            this._drawPreview(cvs.getContext("2d"), s); card.appendChild(cvs);
            const nm = document.createElement("div"); nm.className = "card-name"; nm.textContent = s.name; card.appendChild(nm);
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

        // Custom ship builder
        const cHull = sr.getElementById("c-hull"), cAccent = sr.getElementById("c-accent"), cFlame = sr.getElementById("c-flame");
        const cPreview = sr.getElementById("c-preview");
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

        // Upgrades
        const ul = sr.getElementById("upgrade-list");
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

        // Packs ziehen (verschiedene Typen)
        sr.querySelectorAll(".pack-btn").forEach(b => { b.onclick = () => this._openPack(b.dataset.pack); });

        // Maps
        const mgrid = sr.getElementById("map-grid");
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
        else reward = { t: "coins", v: Math.round(pack.cost * (0.4 + Math.random() * 0.5)) };
        if (reward.t === "ship") { shop.ownedShips.push(reward.v.id); shop.equipped = reward.v.id; this._packReveal = `🎉 Schiff gezogen: <b>${reward.v.name}</b>!`; }
        else if (reward.t === "feature") { shop.ownedFeatures.push(reward.v.id); this._packReveal = `⚡ Feature gezogen: <b>${reward.v.name}</b>! (im Spiel per Knopf nutzen)`; }
        else if (reward.t === "pilot") { shop.ownedPilots.push(reward.v.id); shop.equippedPilot = reward.v.id; this._packReveal = `🧑‍🚀 Pilot gezogen: <b>${reward.v.name}</b>!`; }
        else { this._coins += reward.v; setCoins(this._coins); this._packReveal = `💰 Diesmal kein neues Teil – dafür <b>+${reward.v} Münzen</b>!`; }
        saveShop(shop); this._showShop();
    }

    _drawPreview(ctx, skin, cx, cy, scale) {
        cx = cx || 22; cy = cy || 22; scale = scale || 1;
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
canvas { display: block; max-height: 80vh; max-width: 95vw; touch-action: none;
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
  <div class="coins-d">💰 <span id="cd">${this._coins}</span></div>
  <button class="top-btn" id="quit">✕</button>
</div>
<canvas id="c" width="400" height="400"></canvas>
<div id="mc">
  <button class="cb" id="bl">↺</button>
  <button class="cb" id="bt">🔥</button>
  <button class="cb" id="br">↻</button>
  <button class="cb" id="bf">💥</button>
</div>
<div id="feat-bar">${this._shop.ownedFeatures.map(fid => { const f = FEATURES.find(x => x.id === fid); return f ? `<button class="cb feat" data-feat="${f.id}" title="${f.desc}">${f.icon}</button>` : ""; }).join("")}</div>`;

        const sr = this.shadowRoot;
        sr.getElementById("quit").onclick = () => this.dispatchEvent(new CustomEvent("close-game", { bubbles: true }));
        sr.getElementById("back").onclick = () => this._showShop();
        this._runGame(effects, skin);
    }

    _runGame(fx, skin) {
        const sr = this.shadowRoot;
        const cv = sr.getElementById("c"), ctx = cv.getContext("2d");
        const coinEl = sr.getElementById("cd");
        const curMap = MAPS.find(m => m.id === this._shop.equippedMap) || MAPS[0];
        const W = cv.width, H = cv.height;
        const ctrl = new AbortController(), sig = { signal: ctrl.signal };

        // Infinite world state
        let cam = { x: 0, y: 0 }; // camera center
        let ship = { x: 0, y: 0, angle: -Math.PI / 2, vx: 0, vy: 0 };
        let bullets = [], asteroids = [], particles = [];
        let keys = { left: false, right: false, up: false, fire: false };
        let fireCooldown = 0, score = 0, alive = true, wave = 1;
        let lives = fx.lives, invincible = 0, totalKills = 0;
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
            }
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
            // Feature-Cooldowns
            for (const id in cooldowns) {
                if (cooldowns[id] > 0) {
                    cooldowns[id] = Math.max(0, cooldowns[id] - dt);
                    if (featBtns[id]) featBtns[id].classList.toggle("cooling", cooldowns[id] > 0);
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
                const cos = Math.cos(ship.angle), sin = Math.sin(ship.angle);
                const bvx = cos * fx.bulletSpeed + ship.vx * 0.3;
                const bvy = sin * fx.bulletSpeed + ship.vy * 0.3;
                if (skin.shape === "ufo") {
                    // Rundumschuss: Basis-Strahlen je nach Schiff (teurer = mehr), +2 pro Doppelschuss-Level
                    const N = (skin.beams || 4) + (fx.doubleLevel || 0) * 2;
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
                        // Punkt direkt gutschreiben (kein Aufsammeln)
                        this._coins += Math.ceil(pts / 10); setCoins(this._coins); coinEl.textContent = this._coins;
                        totalKills++;
                        spawnParticles(a.x, a.y, 6);
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
                        lives--; spawnParticles(ship.x, ship.y, 12);
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

        };

        const draw = () => {
            ctx.fillStyle = curMap.space; ctx.fillRect(0, 0, W, H);
            const ox = W/2 - cam.x, oy = H/2 - cam.y;

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
                    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ship.angle);
                    const tt = t / 300;
                    const hullC = skin.hull === "rainbow" ? `hsl(${(tt*60)%360},80%,60%)` : skin.hull;
                    ctx.strokeStyle = hullC; ctx.lineWidth = 2.5;
                    if (skin.shape === "ufo") {
                        ctx.beginPath(); ctx.ellipse(0,3,15,5,0,0,6.2832); ctx.stroke();
                        ctx.strokeStyle = skin.accent || hullC;
                        ctx.beginPath(); ctx.arc(0,-1,7,Math.PI,0); ctx.stroke();
                        ctx.strokeStyle = hullC;
                    } else {
                        ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke();
                    }
                    if (keys.up) {
                        const flC = skin.flame === "rainbow" ? `hsl(${((tt*80)+180)%360},90%,55%)` : skin.flame;
                        ctx.strokeStyle = flC; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-16-Math.random()*6,0); ctx.lineTo(-8,4); ctx.stroke();
                    }
                    ctx.restore();
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

        const endGame = () => { setTimeout(() => { cancelAnimationFrame(raf); this._showShop(); }, 2000); };

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
