/* eslint-disable */
/**
 * The interactive strings viewport — the supplied engine, carried over intact.
 *
 * Three adaptations for running inside React, and nothing else:
 *   · an ES module export instead of assigning to `window`
 *   · listener and rAF handles kept, so `destroy()` can undo the constructor
 *   · `destroy()` itself — without it every mount leaks a rAF loop, a window
 *     resize listener and up to three label timers, and dev's double-mount
 *     means that happens twice before the page is even interactive.
 *
 * The drawing, geometry, timing and options are the author's, untouched.
 */
class StringsViewport {
  constructor(root, options = {}) {
    if (!root) throw new Error('StringsViewport requires a root element.');

    this.root = root;
    this.canvas = root.querySelector('.strings-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.labelsLayer = root.querySelector('.labels-layer');
    this.fxCursor = root.querySelector('.fx-cursor');

    this.options = {
      color: options.color || '#1748DF',
      lines: options.lines || 190,
      dots: options.dots || 168,
      pointerStrength: options.pointerStrength || 54,
      rotationSeconds: options.rotationSeconds || 220,
      labelFadeMs: options.labelFadeMs || 2700,
      labelHoldMs: options.labelHoldMs || 5800,
      labelStaggerMs: options.labelStaggerMs || 900,
      labelGapMs: options.labelGapMs || 1150,
      centerPulsePeriod: options.centerPulsePeriod || 1.75,
      centerPulseLifetime: options.centerPulseLifetime || 1.9,
      centerPulseStrength: options.centerPulseStrength || 18
    };

    this.keywords = [
      'Data','Secure','Performance','Intelligent','Value','Cloudlink','Responsive',
      'Support','Efficiency','Reliable','Connected','Optimised','Sustainable',
      'Scalable','Automated'
    ];

    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = 1; this.h = 1; this.cx = 0; this.cy = 0; this.R = 1;
    this.t = 0;
    this.last = performance.now();
    this.rotation = 0;
    this.running = true;

    this.pointer = { active:false, x:0, y:0, tx:0, ty:0, vx:0, vy:0 };
    this.cursor = { x:0, y:0, tx:0, ty:0 };
    this.centerHover = false;
    this.lastCenterPulseAt = -999;
    this.pulses = [];

    this.strands = [];
    this.labels = [];
    this.keywordIndex = 0;
    this.labelTimers = [];
    this.connectionAlpha = [0,0,0];

    this._seedGeometry();
    this._buildLabels();
    this._bind();
    this.resize();
    this._beginLabelCycle();
    this._raf = requestAnimationFrame(this._frame.bind(this));
  }

  _rand(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
    return x - Math.floor(x);
  }

  _seedGeometry() {
    for (let i = 0; i < this.options.lines; i++) {
      this.strands.push({
        a: i / this.options.lines * Math.PI * 2,
        phase: this._rand(i + 12) * Math.PI * 2,
        bend: (this._rand(i + 61) - .5) * .15,
        opacity: .13 + this._rand(i + 110) * .25,
        width: .48 + this._rand(i + 170) * .62,
        wobble: .75 + this._rand(i + 210) * 1.25
      });
    }
  }

  _buildLabels() {
    const sides = ['left', 'right', 'right'];
    for (let i = 0; i < sides.length; i++) {
      const el = document.createElement('div');
      el.className = 'keyword-label';
      el.innerHTML = '<span class="keyword-label__text"></span><span class="keyword-label__dot"></span>';
      el.dataset.side = sides[i];
      el.addEventListener('pointerenter', () => { this.labels[i].hover = true; });
      el.addEventListener('pointerleave', () => { this.labels[i].hover = false; });
      this.labelsLayer.appendChild(el);
      this.labels.push({
        el,
        text: el.querySelector('.keyword-label__text'),
        dot: el.querySelector('.keyword-label__dot'),
        side: sides[i],
        x: 0, y: 0, angle: 0,
        hover: false,
        visible: false
      });
    }
  }

  _bind() {
    this._onResize = () => this.resize();
    this._onMove = e => this._move(e);
    this._onLeave = () => {
      this.pointer.active = false;
      this.root.classList.remove('is-pointer','is-center-hover');
      this.centerHover = false;
    };
    addEventListener('resize', this._onResize, { passive:true });
    this.root.addEventListener('pointerenter', this._onMove);
    this.root.addEventListener('pointermove', this._onMove);
    this.root.addEventListener('pointerleave', this._onLeave);
  }

  /** Undoes the constructor. Must leave nothing running. */
  destroy() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._clearLabelTimers();
    removeEventListener('resize', this._onResize);
    this.root.removeEventListener('pointerenter', this._onMove);
    this.root.removeEventListener('pointermove', this._onMove);
    this.root.removeEventListener('pointerleave', this._onLeave);
    this.labels.forEach(l => l.el.remove());
    this.labels.length = 0;
  }

  _move(e) {
    if (e.pointerType === 'touch') return;
    const r = this.root.getBoundingClientRect();
    this.pointer.tx = e.clientX - r.left;
    this.pointer.ty = e.clientY - r.top;
    this.cursor.tx = this.pointer.tx;
    this.cursor.ty = this.pointer.ty;
    this.pointer.active = true;
    this.root.classList.add('is-pointer');
  }

  resize() {
    const r = this.root.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);

    this.cx = this.w * .50;
    this.cy = this.h * .61;
    this.R = Math.min(this.w * .34, this.h * .40);

    if (!this.pointer.active) {
      this.pointer.x = this.pointer.tx = this.cx;
      this.pointer.y = this.pointer.ty = this.cy;
      this.cursor.x = this.cursor.tx = this.cx;
      this.cursor.y = this.cursor.ty = this.cy;
    }

    this._repositionLabels();
  }

  _labelSlots() {
    return [
      { side:'left',  deg: 202, extra:.25 },
      { side:'left',  deg: 214, extra:.34 },
      { side:'left',  deg: 228, extra:.30 },
      { side:'left',  deg: 242, extra:.27 },
      { side:'right', deg: 294, extra:.23 },
      { side:'right', deg: 304, extra:.26 },
      { side:'right', deg: 314, extra:.31 },
      { side:'right', deg: 324, extra:.36 },
      { side:'right', deg: 334, extra:.30 },
      { side:'right', deg: 344, extra:.24 }
    ];
  }

  _pickSlot(side, salt) {
    const slots = this._labelSlots().filter(s => s.side === side);
    return slots[((salt % slots.length) + slots.length) % slots.length];
  }

  _applySlot(label, slot) {
    const a = slot.deg * Math.PI / 180;
    const extraPx = Math.max(54, this.R * slot.extra);
    const rr = this.R + extraPx;
    const rawX = this.cx + Math.cos(a) * rr;
    const rawY = this.cy + Math.sin(a) * rr;

    // Keep labels outside the upper half of the illustration,
    // but never let them pass above the top of the string circle.
    const circleTop = this.cy - this.R;
    const labelTopPadding = 30;
    const minCenterY = circleTop + labelTopPadding;

    label.side = slot.side;
    label.angle = a;
    label.x = rawX;
    label.y = Math.max(rawY, minCenterY);
    label.el.dataset.side = slot.side;
    label.el.style.left = label.x + 'px';
    label.el.style.top = label.y + 'px';
  }

  _repositionLabels() {
    const leftLabel = this.labels[0];
    const rightLabelA = this.labels[1];
    const rightLabelB = this.labels[2];
    this._applySlot(leftLabel, this._pickSlot('left', this.keywordIndex + 1));
    const rightSlots = this._labelSlots().filter(s => s.side === 'right');
    const idxA = (this.keywordIndex + 2) % rightSlots.length;
    let idxB = (this.keywordIndex + 5) % rightSlots.length;
    if (idxB === idxA) idxB = (idxB + 2) % rightSlots.length;
    this._applySlot(rightLabelA, rightSlots[idxA]);
    this._applySlot(rightLabelB, rightSlots[idxB]);
  }

  _clearLabelTimers() {
    this.labelTimers.forEach(clearTimeout);
    this.labelTimers.length = 0;
  }

  _beginLabelCycle() {
    this._clearLabelTimers();

    const runTrio = () => {
      this.labels.forEach(l => {
        l.visible = false;
        l.hover = false;
        l.el.classList.remove('is-visible');
      });

      const words = [
        this.keywords[this.keywordIndex % this.keywords.length],
        this.keywords[(this.keywordIndex + 1) % this.keywords.length],
        this.keywords[(this.keywordIndex + 2) % this.keywords.length]
      ];
      this.keywordIndex = (this.keywordIndex + 3) % this.keywords.length;

      this.labels[0].text.textContent = words[0];
      this.labels[1].text.textContent = words[1];
      this.labels[2].text.textContent = words[2];
      this._repositionLabels();

      const fade = this.options.labelFadeMs;
      const hold = this.options.labelHoldMs;
      const stagger = this.options.labelStaggerMs;
      const gap = this.options.labelGapMs;
      const start = 250;

      this.labelTimers.push(setTimeout(() => this._showLabel(this.labels[0]), start));
      this.labelTimers.push(setTimeout(() => this._showLabel(this.labels[1]), start + stagger));
      this.labelTimers.push(setTimeout(() => this._showLabel(this.labels[2]), start + stagger * 1.8));

      const out1 = start + stagger * 1.8 + fade + hold;
      const out2 = out1 + stagger * .65;
      const out3 = out2 + stagger * .65;
      this.labelTimers.push(setTimeout(() => this._hideLabel(this.labels[0]), out1));
      this.labelTimers.push(setTimeout(() => this._hideLabel(this.labels[1]), out2));
      this.labelTimers.push(setTimeout(() => this._hideLabel(this.labels[2]), out3));

      const next = out3 + fade + gap;
      this.labelTimers.push(setTimeout(runTrio, next));
    };

    runTrio();
  }

  _showLabel(label) {
    label.visible = true;
    label.el.classList.add('is-visible');
  }

  _hideLabel(label) {
    label.visible = false;
    label.hover = false;
    label.el.classList.remove('is-visible');
  }

  _pointerInfluence(x, y) {
    if (!this.pointer.active) return {x:0,y:0};
    const dx = this.pointer.x - x;
    const dy = this.pointer.y - y;
    const d = Math.hypot(dx,dy) || 1;
    const rr = this.R * .43;
    let a = Math.max(0, 1 - d / rr);
    a *= a;
    return {
      x: dx / d * this.options.pointerStrength * a,
      y: dy / d * this.options.pointerStrength * a
    };
  }

  _updateCenterHover() {
    const d = Math.hypot(this.pointer.x - this.cx, this.pointer.y - this.cy);
    const active = this.pointer.active && d < Math.max(46, this.R * .115);

    if (active !== this.centerHover) {
      this.centerHover = active;
      this.root.classList.toggle('is-center-hover', active);
      if (active) this._spawnCenterPulse();
    }

    if (active && this.t - this.lastCenterPulseAt >= this.options.centerPulsePeriod) {
      this._spawnCenterPulse();
    }
  }

  _spawnCenterPulse() {
    this.lastCenterPulseAt = this.t;
    this.pulses.push({ start:this.t });
  }

  _pulseDisplacement(u, tangentX, tangentY) {
    let dx = 0, dy = 0;
    const lifetime = this.options.centerPulseLifetime;

    for (const pulse of this.pulses) {
      const age = this.t - pulse.start;
      const progress = age / lifetime;
      if (progress < 0 || progress > 1) continue;

      const width = .14;
      const distance = (u - progress) / width;
      const envelope = Math.exp(-distance * distance * 1.25);
      const fade = Math.sin(Math.PI * progress);
      const amount = envelope * fade * this.options.centerPulseStrength;

      dx += tangentX * amount;
      dy += tangentY * amount;
    }

    return {x:dx,y:dy};
  }

  _nearestRingDot(label) {
    const raw = Math.atan2(label.y - this.cy, label.x - this.cx);
    const step = Math.PI * 2 / this.options.dots;
    const snapped = Math.round((raw - this.rotation) / step) * step + this.rotation;
    return {
      x: this.cx + Math.cos(snapped) * this.R,
      y: this.cy + Math.sin(snapped) * this.R,
      a: snapped
    };
  }

  _drawConnections() {
    const ctx = this.ctx;
    this.labels.forEach((label, i) => {
      const target = label.visible && label.hover ? 1 : 0;
      this.connectionAlpha[i] += (target - this.connectionAlpha[i]) * .12;
      const alpha = this.connectionAlpha[i];
      if (alpha < .01) return;

      const ringDot = this._nearestRingDot(label);
      ctx.beginPath();
      ctx.moveTo(label.x, label.y);
      ctx.lineTo(ringDot.x, ringDot.y);
      ctx.strokeStyle = `rgba(23,72,223,${.76 * alpha})`;
      ctx.lineWidth = 1.15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ringDot.x, ringDot.y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(23,72,223,${.92 * alpha})`;
      ctx.fill();
    });
  }

  _drawGuideRings() {
    const ctx = this.ctx;
    ctx.lineWidth = .7;
    [0.22,0.43,0.64,0.82].forEach((q,i) => {
      ctx.beginPath();
      ctx.arc(this.cx,this.cy,this.R*q,0,Math.PI*2);
      ctx.strokeStyle = `rgba(23,72,223,${.030 + i*.007})`;
      ctx.stroke();
    });
  }

  _drawStrings() {
    const ctx = this.ctx;
    const samples = 30;

    for (const s of this.strands) {
      const a = s.a + this.rotation;
      const ex = this.cx + Math.cos(a) * this.R;
      const ey = this.cy + Math.sin(a) * this.R;
      const tangentX = -Math.sin(a);
      const tangentY = Math.cos(a);

      ctx.beginPath();
      for (let j=0; j<=samples; j++) {
        const u = j / samples;
        let x = this.cx + (ex - this.cx) * u;
        let y = this.cy + (ey - this.cy) * u;

        const endpointEnvelope = Math.sin(Math.PI*u);
        const idle = Math.sin(
          u*Math.PI*(1.55+s.wobble) + s.phase + this.t*(.55+s.wobble*.12)
        ) * this.R * .0042 * endpointEnvelope;
        const authoredBend = s.bend * this.R * endpointEnvelope * .30;

        x += tangentX * (idle + authoredBend);
        y += tangentY * (idle + authoredBend);

        const inf = this._pointerInfluence(x,y);
        const lock = Math.pow(1-u,.28) * Math.min(1,u*6);
        x += inf.x * lock;
        y += inf.y * lock;

        const pulse = this._pulseDisplacement(u, tangentX, tangentY);
        x += pulse.x * endpointEnvelope;
        y += pulse.y * endpointEnvelope;

        if (j === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }

      const breathe = .02 * (.5 + .5*Math.sin(this.t*.75+s.phase));
      ctx.strokeStyle = `rgba(23,72,223,${s.opacity+breathe})`;
      ctx.lineWidth = s.width;
      ctx.stroke();
    }
  }

  _drawOuterDots() {
    const ctx = this.ctx;
    for (let i=0; i<this.options.dots; i++) {
      const a = i / this.options.dots * Math.PI*2 + this.rotation;
      const rr = this.R + Math.sin(this.t*.48 + i*.63)*.32;
      const x = this.cx + Math.cos(a)*rr;
      const y = this.cy + Math.sin(a)*rr;
      const size = .75 + (i%7===0 ? .72 : 0);
      ctx.beginPath();
      ctx.arc(x,y,size,0,Math.PI*2);
      ctx.fillStyle = 'rgba(23,72,223,.60)';
      ctx.fill();
    }
  }

  _drawCenterPulseRings() {
    const ctx = this.ctx;
    const lifetime = this.options.centerPulseLifetime;
    for (const pulse of this.pulses) {
      const progress = (this.t - pulse.start)/lifetime;
      if (progress < 0 || progress > 1) continue;
      const r = this.R * progress;
      const alpha = Math.sin(Math.PI*progress) * .055;

      ctx.beginPath();
      ctx.arc(this.cx,this.cy,r,0,Math.PI*2);
      ctx.strokeStyle = `rgba(23,72,223,${alpha})`;
      ctx.lineWidth = 2.6 - progress * .8;
      ctx.stroke();
    }
  }

  _drawCenter() {
    const ctx = this.ctx;
    const hoverBoost = this.centerHover ? 1 : 0;
    ctx.beginPath();
    ctx.arc(this.cx,this.cy,3.2+hoverBoost*.45,0,Math.PI*2);
    ctx.fillStyle = '#1748DF';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.cx,this.cy,17+hoverBoost*3,0,Math.PI*2);
    ctx.strokeStyle = `rgba(23,72,223,${.17 + hoverBoost*.08})`;
    ctx.lineWidth = .8;
    ctx.stroke();
  }

  _updateCursor() {
    this.fxCursor.style.setProperty('--cursor-x', this.cursor.x + 'px');
    this.fxCursor.style.setProperty('--cursor-y', this.cursor.y + 'px');
  }

  _frame(now) {
    if (!this.running) return;
    const dt = Math.min(40, now-this.last);
    this.last = now;
    this.t += dt/1000;

    const follow = 1 - Math.pow(.002, dt/1000);
    const oldX = this.pointer.x, oldY = this.pointer.y;
    const targetX = this.pointer.active ? this.pointer.tx : this.cx;
    const targetY = this.pointer.active ? this.pointer.ty : this.cy;
    this.pointer.x += (targetX-this.pointer.x)*follow;
    this.pointer.y += (targetY-this.pointer.y)*follow;
    this.pointer.vx = this.pointer.x-oldX;
    this.pointer.vy = this.pointer.y-oldY;

    const cf = 1 - Math.pow(.0004, dt/1000);
    this.cursor.x += (this.cursor.tx-this.cursor.x)*cf;
    this.cursor.y += (this.cursor.ty-this.cursor.y)*cf;

    this.rotation = this.t * (Math.PI*2 / this.options.rotationSeconds);
    this._updateCenterHover();
    this.pulses = this.pulses.filter(p => this.t-p.start <= this.options.centerPulseLifetime);

    this.ctx.clearRect(0,0,this.w,this.h);
    this._drawGuideRings();
    this._drawStrings();
    this._drawOuterDots();
    this._drawCenterPulseRings();
    this._drawConnections();
    this._drawCenter();
    this._updateCursor();

    this._raf = requestAnimationFrame(this._frame.bind(this));
  }
}

export default StringsViewport
