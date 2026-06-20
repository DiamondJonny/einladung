// game/soccer-game.js
// Weltraum-Fußball: 2 Teams. Hol den Ball aus der Mitte und bring ihn ins
// gegnerische Tor. Du + 1 Bot (Blau) gegen 2 Bots (Rot). Wirst du abgeschossen,
// fällt der Ball und muss neu aufgesammelt werden.
// Du fliegst dein im Weltraum-Pilot gewähltes Schiff + Pilot. Gegner fliegen
// stärkere zufällige Schiffe. Es gibt Brocken: abschießen = schneller respawnen.
// Steuerung: Schiff folgt Maus/Finger, schießt automatisch.

import { SHIPS, PILOTS } from "./asteroids-game.js";

(function () {
  const W = 640, H = 420;
  const GOAL_TOP = 135, GOAL_BOT = 285;
  const WIN = 2;  // kuerzere Spiele: erstes Team mit 2 Toren gewinnt

  let _ac = null;
  function sfx(type) {
    try {
      if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
      if (_ac.state === "suspended") _ac.resume();
      const now = _ac.currentTime;
      const tone = (f, d, w, v, tf) => {
        const o = _ac.createOscillator(), g = _ac.createGain();
        o.type = w || "square"; o.frequency.setValueAtTime(f, now);
        if (tf) o.frequency.exponentialRampToValueAtTime(tf, now + d);
        g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(v, now + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, now + d);
        o.connect(g).connect(_ac.destination); o.start(now); o.stop(now + d + 0.03);
      };
      if (type === "shoot") tone(1400, 0.05, "square", 0.025, 520);
      else if (type === "pick") tone(700, 0.10, "square", 0.05, 1100);
      else if (type === "hit") tone(220, 0.18, "sawtooth", 0.06, 80);
      else if (type === "rock") tone(300, 0.14, "sawtooth", 0.05, 90);
      else if (type === "fast") tone(880, 0.10, "square", 0.05, 1500);
      else if (type === "goal") [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.16, "square", 0.06), i * 90));
    } catch (e) {}
  }

  const FALLBACK = { id: "default", hull: "#9fd0ff", accent: "#ffffff" };
  function shipHull(s, fb) { if (!s) return fb || "#ccc"; if (s.hull === "rainbow") return "#c86bff"; return s.hull || fb || "#ccc"; }
  function shipAccent(s) { if (!s || !s.accent || s.accent === "rainbow") return "#ffffff"; return s.accent; }
  function shopData() { try { const a = localStorage.getItem("activeAccount") || "default"; return JSON.parse(localStorage.getItem("asteroidsShop__" + a) || "null"); } catch (e) { return null; } }
  function equippedShip() { const sh = shopData(); const id = sh && sh.equipped; return (SHIPS && SHIPS.find(s => s.id === id)) || (SHIPS && SHIPS[0]) || FALLBACK; }
  function equippedPilot() { const sh = shopData(); const id = sh && sh.equippedPilot; return (PILOTS && PILOTS.find(p => p.id === id)) || (PILOTS && PILOTS[0]) || null; }
  function randomShip(excludeDefault) {
    const pool = (SHIPS || []).filter(s => excludeDefault ? s.id !== "default" : true);
    const arr = pool.length ? pool : (SHIPS || [FALLBACK]);
    return arr[Math.floor(Math.random() * arr.length)] || FALLBACK;
  }
  function randomPilot() { return (PILOTS && PILOTS.length) ? PILOTS[Math.floor(Math.random() * PILOTS.length)] : null; }

  class SoccerGame extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: "open" }); this._raf = null; this._ctrl = new AbortController(); }

    connectedCallback() {
      this.shadowRoot.innerHTML =
        '<style>' +
        ':host{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#03030c;font-family:"Segoe UI",sans-serif;color:#fff;user-select:none;}' +
        '#hud{display:flex;gap:1.4rem;font-weight:700;font-size:1.05rem;margin-bottom:6px;align-items:center;}' +
        '.blue{color:#4da3ff;}.red{color:#ff5a6e;}' +
        'canvas{display:block;max-height:84vh;max-width:97vw;aspect-ratio:' + W + '/' + H + ';border:2px solid rgba(120,150,255,0.3);border-radius:10px;touch-action:none;background:#05050f;}' +
        '#msg{position:absolute;top:42%;left:0;right:0;text-align:center;font-size:2rem;font-weight:800;text-shadow:0 0 14px rgba(0,0,0,0.8);opacity:0;transition:opacity .2s;pointer-events:none;}' +
        '#tip{font-size:.76rem;opacity:.7;margin-top:6px;text-align:center;max-width:95vw;}' +
        '</style>' +
        '<div id="hud"><span class="blue">🔵 Blau <span id="sb">0</span></span><span>Ziel ' + WIN + '</span><span class="red"><span id="sr">0</span> Rot 🔴</span></div>' +
        '<div style="position:relative;display:flex;justify-content:center;width:100%;">' +
        '<canvas id="c" width="' + W + '" height="' + H + '"></canvas>' +
        '<div id="msg"></div></div>' +
        '<div id="tip">Dein Schiff & Pilot! Maus/Finger bewegt · schießt automatisch · Ball ins <b>rechte</b> Tor · Brocken abschießen = schneller zurück</div>';

      this._cv = this.shadowRoot.getElementById("c");
      this._ctx = this._cv.getContext("2d");
      this._sb = this.shadowRoot.getElementById("sb");
      this._sr = this.shadowRoot.getElementById("sr");
      this._msg = this.shadowRoot.getElementById("msg");
      this._init(); this._bind(); this._last = performance.now(); this._loop();
    }

    disconnectedCallback() { cancelAnimationFrame(this._raf); this._ctrl.abort(); }

    _spawnRock(x, y) {
      const r = 12 + Math.random() * 11;
      const pts = []; for (let i = 0; i < 8; i++) pts.push(0.7 + Math.random() * 0.5);
      const ang = Math.random() * Math.PI * 2, sp = 8 + Math.random() * 16;
      return { x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 1.2, hp: 2, pts };
    }
    _randRockPos() {
      let x, y, tries = 0;
      do { x = 40 + Math.random() * (W - 80); y = 30 + Math.random() * (H - 60); tries++; }
      while (Math.hypot(x - W / 2, y - H / 2) < 90 && tries < 20);
      return [x, y];
    }

    _init() {
      this.scoreB = 0; this.scoreR = 0; this._over = false; this._msgT = 0;
      this.fastResp = [0, 0];
      const mine = equippedShip(), myPilot = equippedPilot();
      const defs = [
        { team: 0, human: true, x: 170, y: H / 2 },
        { team: 0, human: false, x: 120, y: H / 2 - 80 },
        { team: 1, human: false, x: W - 120, y: H / 2 - 80 },
        { team: 1, human: false, x: W - 170, y: H / 2 },
      ];
      this.players = defs.map(p => ({
        vx: 0, vy: 0, alive: true, respawn: 0, fireCd: Math.random(), angle: p.team === 0 ? 0 : Math.PI,
        baseX: p.x, baseY: p.y,
        ship: p.human ? mine : randomShip(true),
        pilot: p.human ? myPilot : randomPilot(),
        ...p
      }));
      this.bullets = [];
      this.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, carrier: null, cool: 0 };
      this.mx = 170; this.my = H / 2;
      this.stars = [];
      for (let i = 0; i < 130; i++) this.stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() < 0.85 ? 1 : 2, b: Math.random() });
      this.rocks = [];
      for (let i = 0; i < 5; i++) { const [x, y] = this._randRockPos(); this.rocks.push(this._spawnRock(x, y)); }
    }

    _bind() {
      const sig = { signal: this._ctrl.signal };
      const rect = () => this._cv.getBoundingClientRect();
      const set = (cx, cy) => { const b = rect(); this.mx = ((cx - b.left) / b.width) * W; this.my = ((cy - b.top) / b.height) * H; };
      this._cv.addEventListener("mousemove", e => set(e.clientX, e.clientY), sig);
      this._cv.addEventListener("touchmove", e => { e.preventDefault(); const t = e.touches[0]; set(t.clientX, t.clientY); }, { ...sig, passive: false });
      this._cv.addEventListener("touchstart", e => { e.preventDefault(); const t = e.touches[0]; set(t.clientX, t.clientY); }, { ...sig, passive: false });
    }

    _showMsg(t, color) { this._msg.textContent = t; this._msg.style.color = color || "#fff"; this._msg.style.opacity = "1"; this._msgT = 1.4; }

    _loop() {
      const now = performance.now(); let dt = (now - this._last) / 1000; this._last = now; if (dt > 0.05) dt = 0.05;
      if (!this._over) this._update(dt);
      this._draw();
      this._raf = requestAnimationFrame(() => this._loop());
    }

    _nearestEnemy(p, range) { let best = null, bd = range; for (const q of this.players) { if (!q.alive || q.team === p.team) continue; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } } return best; }
    _nearestMate(p) { let best = null, bd = 1e9; for (const q of this.players) { if (q === p || q.team !== p.team || !q.alive) continue; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } } return best; }
    _goalMouthX(team) { return team === 0 ? W - 12 : 12; }
    _clampGoalY(y) { return Math.max(GOAL_TOP + 18, Math.min(GOAL_BOT - 18, y)); }

    _botTarget(p) {
      const ball = this.ball;
      if (ball.carrier === p) return [this._goalMouthX(p.team), this._clampGoalY(p.y)];
      if (ball.carrier && ball.carrier.team === p.team) { const e = this._nearestEnemy(p, 320); if (e) return [e.x, e.y]; return [this._goalMouthX(p.team), H / 2]; }
      if (ball.carrier && ball.carrier.team !== p.team) return [ball.carrier.x, ball.carrier.y];
      const mate = this._nearestMate(p);
      const myD = Math.hypot(ball.x - p.x, ball.y - p.y);
      const mateD = mate ? Math.hypot(ball.x - mate.x, ball.y - mate.y) : 1e9;
      if (myD <= mateD) return [ball.x, ball.y];
      return [p.team === 0 ? W * 0.42 : W * 0.58, ball.y];
    }

    _rockDestroyed(rk, team) {
      sfx("rock");
      if (team === 0 || team === 1) {
        this.fastResp[team] = 6;
        let helped = false;
        for (const p of this.players) { if (!p.alive && p.team === team) { p.respawn = Math.max(0.3, p.respawn - 1.4); helped = true; } }
        if (helped) sfx("fast");
      }
      const [x, y] = this._randRockPos();
      this.rocks.push(this._spawnRock(x, y));
    }

    _update(dt) {
      const ball = this.ball;
      if (this._msgT > 0) { this._msgT -= dt; if (this._msgT <= 0) this._msg.style.opacity = "0"; }
      if (ball.cool > 0) ball.cool -= dt;
      for (let t = 0; t < 2; t++) if (this.fastResp[t] > 0) this.fastResp[t] -= dt;

      // Brocken bewegen
      for (const rk of this.rocks) {
        rk.x += rk.vx * dt; rk.y += rk.vy * dt; rk.rot += rk.vr * dt;
        if (rk.x < rk.r) { rk.x = rk.r; rk.vx = Math.abs(rk.vx); } if (rk.x > W - rk.r) { rk.x = W - rk.r; rk.vx = -Math.abs(rk.vx); }
        if (rk.y < rk.r) { rk.y = rk.r; rk.vy = Math.abs(rk.vy); } if (rk.y > H - rk.r) { rk.y = H - rk.r; rk.vy = -Math.abs(rk.vy); }
      }

      for (const p of this.players) {
        if (!p.alive) { p.respawn -= dt; if (p.respawn <= 0) { p.alive = true; p.x = p.baseX; p.y = p.baseY; p.vx = p.vy = 0; } continue; }
        let tx, ty;
        if (p.human) { tx = this.mx; ty = this.my; } else { const t = this._botTarget(p); tx = t[0]; ty = t[1]; }
        const ang = Math.atan2(ty - p.y, tx - p.x);
        const dist = Math.hypot(tx - p.x, ty - p.y);
        const accel = 540, maxv = (ball.carrier === p ? 165 : 205);
        if (dist > 5) { p.vx += Math.cos(ang) * accel * dt; p.vy += Math.sin(ang) * accel * dt; }
        p.vx *= 0.92; p.vy *= 0.92;
        const sp = Math.hypot(p.vx, p.vy); if (sp > maxv) { p.vx = p.vx / sp * maxv; p.vy = p.vy / sp * maxv; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.x = Math.max(14, Math.min(W - 14, p.x)); p.y = Math.max(14, Math.min(H - 14, p.y));
        if (sp > 8) p.angle = Math.atan2(p.vy, p.vx);
        p.fireCd -= dt;
        if (ball.carrier !== p && p.fireCd <= 0) {
          // Ziel: nächster Gegner; sonst (frei) auf nächsten Brocken, um schneller zurückzukommen
          const e = this._nearestEnemy(p, 235);
          let a = null;
          if (e) a = Math.atan2(e.y - p.y, e.x - p.x);
          else { let best = null, bd = 240; for (const rk of this.rocks) { const d = Math.hypot(rk.x - p.x, rk.y - p.y); if (d < bd) { bd = d; best = rk; } } if (best) a = Math.atan2(best.y - p.y, best.x - p.x); }
          if (a !== null) { this.bullets.push({ x: p.x + Math.cos(a) * 16, y: p.y + Math.sin(a) * 16, vx: Math.cos(a) * 370, vy: Math.sin(a) * 370, team: p.team, life: 1.1 }); p.fireCd = 0.55 + Math.random() * 0.3; sfx("shoot"); }
        }
      }

      if (ball.carrier && ball.carrier.alive) {
        const c = ball.carrier;
        ball.x = c.x + Math.cos(c.angle || 0) * 16; ball.y = c.y + Math.sin(c.angle || 0) * 16;
        const inGoalY = ball.y > GOAL_TOP && ball.y < GOAL_BOT;
        if (c.team === 0 && ball.x > W - 14 && inGoalY) { this._goal(0); return; }
        if (c.team === 1 && ball.x < 14 && inGoalY) { this._goal(1); return; }
      } else {
        ball.carrier = null;
        ball.vx *= 0.97; ball.vy *= 0.97; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.x < 8) { ball.x = 8; ball.vx = Math.abs(ball.vx); } if (ball.x > W - 8) { ball.x = W - 8; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < 8) { ball.y = 8; ball.vy = Math.abs(ball.vy); } if (ball.y > H - 8) { ball.y = H - 8; ball.vy = -Math.abs(ball.vy); }
        if (ball.cool <= 0) { for (const p of this.players) { if (p.alive && Math.hypot(p.x - ball.x, p.y - ball.y) < 20) { ball.carrier = p; sfx("pick"); break; } } }
      }

      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) { this.bullets.splice(i, 1); continue; }
        let hit = false;
        for (const p of this.players) { if (!p.alive || p.team === b.team) continue; if (Math.hypot(p.x - b.x, p.y - b.y) < 14) { this._destroy(p); hit = true; break; } }
        if (!hit) {
          for (let r = this.rocks.length - 1; r >= 0; r--) {
            const rk = this.rocks[r];
            if (Math.hypot(b.x - rk.x, b.y - rk.y) < rk.r) { hit = true; rk.hp--; if (rk.hp <= 0) { this.rocks.splice(r, 1); this._rockDestroyed(rk, b.team); } break; }
          }
        }
        if (hit) this.bullets.splice(i, 1);
      }
    }

    _destroy(p) {
      p.alive = false; p.respawn = (this.fastResp[p.team] > 0) ? 1.0 : 2.2; sfx("hit");
      if (this.ball.carrier === p) { this.ball.carrier = null; this.ball.cool = 0.6; this.ball.vx = (Math.random() - 0.5) * 140; this.ball.vy = (Math.random() - 0.5) * 140; }
    }

    _goal(team) {
      if (team === 0) { this.scoreB++; this._sb.textContent = this.scoreB; this._showMsg("⚽ TOR Blau!", "#4da3ff"); }
      else { this.scoreR++; this._sr.textContent = this.scoreR; this._showMsg("⚽ TOR Rot!", "#ff5a6e"); }
      sfx("goal");
      this.ball.carrier = null; this.ball.x = W / 2; this.ball.y = H / 2; this.ball.vx = this.ball.vy = 0; this.ball.cool = 0.9;
      for (const p of this.players) { p.x = p.baseX; p.y = p.baseY; p.vx = p.vy = 0; p.alive = true; p.respawn = 0; }
      if (this.scoreB >= WIN || this.scoreR >= WIN) this._end();
    }

    _end() {
      this._over = true;
      const blueWin = this.scoreB > this.scoreR;
      this._showMsg(blueWin ? "🏆 Blau gewinnt!" : "🏆 Rot gewinnt!", blueWin ? "#4da3ff" : "#ff5a6e");
      setTimeout(() => { this.dispatchEvent(new CustomEvent("game-over", { bubbles: true, detail: { score: this.scoreB, pointsEarned: 0 } })); }, 2400);
    }

    _drawShip(ctx, p) {
      const teamCol = p.team === 0 ? "#4da3ff" : "#ff5a6e";
      ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
      ctx.strokeStyle = teamCol; ctx.lineWidth = p.human ? 3 : 2;
      ctx.shadowColor = teamCol; ctx.shadowBlur = p.human ? 12 : 6; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0);
      ctx.fillStyle = shipHull(p.ship, teamCol);
      ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-9, 8); ctx.lineTo(-5, 0); ctx.lineTo(-9, -8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shipAccent(p.ship); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      // Pilot/Figur (aufrecht, nicht gedreht)
      if (p.pilot && p.pilot.emoji) { ctx.font = "13px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.pilot.emoji, p.x, p.y); ctx.textBaseline = "alphabetic"; ctx.textAlign = "start"; }
      if (p.human) { ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("DU", p.x, p.y - 19); ctx.textAlign = "start"; }
    }

    _draw() {
      const ctx = this._ctx;
      ctx.fillStyle = "#05050f"; ctx.fillRect(0, 0, W, H);
      const t = performance.now() / 1000;
      ctx.fillStyle = "#cfe3ff";
      for (const s of this.stars) { ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 1.4 + s.b * 12)); ctx.fillRect(s.x, s.y, s.s, s.s); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 46, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(77,163,255,0.16)"; ctx.fillRect(0, GOAL_TOP, 12, GOAL_BOT - GOAL_TOP);
      ctx.strokeStyle = "#4da3ff"; ctx.strokeRect(0, GOAL_TOP, 12, GOAL_BOT - GOAL_TOP);
      ctx.fillStyle = "rgba(255,90,110,0.16)"; ctx.fillRect(W - 12, GOAL_TOP, 12, GOAL_BOT - GOAL_TOP);
      ctx.strokeStyle = "#ff5a6e"; ctx.strokeRect(W - 12, GOAL_TOP, 12, GOAL_BOT - GOAL_TOP);
      // Brocken
      for (const rk of this.rocks) {
        ctx.save(); ctx.translate(rk.x, rk.y); ctx.rotate(rk.rot);
        ctx.fillStyle = "#6b6157"; ctx.strokeStyle = "#9b8d7e"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < rk.pts.length; i++) { const a = (i / rk.pts.length) * Math.PI * 2, rr = rk.r * rk.pts[i]; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      for (const b of this.bullets) { ctx.fillStyle = b.team === 0 ? "#9fd0ff" : "#ffb3bd"; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill(); }
      for (const p of this.players) { if (p.alive) this._drawShip(ctx, p); }
      ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(255,255,255,0.85)"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, 7, 0, Math.PI * 2); ctx.stroke();
    }
  }
  customElements.define("soccer-game", SoccerGame);
})();
