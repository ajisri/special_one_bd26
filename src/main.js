/**
 * AYU — ARSIP WAKTU 2026
 * 2 Sections: Sticky Hero + Finale
 * 375.studio inspired LERP Parallax & Interaction Orchid
 */

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────── */
/* NOISE CANVAS                                            */
/* ─────────────────────────────────────────────────────── */
function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let skip = 0;
  function tick() {
    skip = (skip + 1) % 2;
    if (skip === 0) {
      const { width: w, height: h } = canvas;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─────────────────────────────────────────────────────── */
/* CURSOR                                                  */
/* ─────────────────────────────────────────────────────── */
function initCursor() {
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cur || !dot) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    gsap.to(dot, { x: tx - 3, y: ty - 3, duration: 0.06, ease: 'none' });
  });

  gsap.ticker.add(() => {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    gsap.set(cur, { x: cx - 20, y: cy - 20 });
  });
}

/* ─────────────────────────────────────────────────────── */
/* MARQUEE                                                 */
/* ─────────────────────────────────────────────────────── */
function initMarquee(trackSel, speed = 80, dir = -1) {
  const track = document.querySelector(trackSel);
  if (!track) return;

  const measure = () => {
    const w = track.scrollWidth / 2;
    gsap.set(track, { x: dir > 0 ? -w : 0 });
    gsap.to(track, {
      x: dir * w,
      duration: w / speed,
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % w) },
    });
  };

  if (document.readyState === 'complete') measure();
  else window.addEventListener('load', measure, { once: true });
}

/* ─────────────────────────────────────────────────────── */
/* SCENE COUNTER                                           */
/* ─────────────────────────────────────────────────────── */
const TOTAL = 2;
function setCounter(i) {
  const num  = document.getElementById('sceneNum');
  const fill = document.getElementById('sceneBarFill');
  if (num)  num.textContent  = String(i).padStart(2, '0');
  if (fill) gsap.to(fill, { height: `${(i / TOTAL) * 100}%`, duration: 0.5, ease: 'expo.out' });
}

/* ─────────────────────────────────────────────────────── */
/* STICKY NAV                                              */
/* ─────────────────────────────────────────────────────── */
function initStickyNav() {
  const nav = document.getElementById('stickyNav');
  if (!nav) return;

  gsap.to(nav, {
    translateY: 0, opacity: 1,
    duration: 1.2, ease: 'expo.out',
    delay: 1.6,
  });

  let lastY = 0;
  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > lastY && y > 120) {
        gsap.to(nav, { yPercent: -110, duration: 0.45, ease: 'power2.inOut', overwrite: 'auto' });
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      }
      lastY = y;
    },
  });

  nav.querySelectorAll('.nav__link').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        // Find scroll position
        const st = ScrollTrigger.getAll().find(s => s.trigger === target);
        const y = st ? st.start : target.offsetTop;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────────────────── */
/* ORCHID INTERACTIVE BLOOM                                */
/* ─────────────────────────────────────────────────────── */
function initOrchid() {
  const svg = document.getElementById('orchidSvg');
  const wrap = document.getElementById('orchidWrap');
  if (!svg || !wrap) return;

  const paths = svg.querySelectorAll('.o-stem, .o-branch');
  const resetPaths = () => {
    paths.forEach(p => {
      try {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      } catch(e) {}
    });
  };
  resetPaths();

  gsap.set(svg.querySelectorAll('.o-leaf, .o-flower, .o-bud'), {
    opacity: 0, scale: 0, transformOrigin: 'center center', transformBox: 'fill-box'
  });

  let tl;
  const playBloom = () => {
    if (tl && tl.isActive()) return;
    if (tl) tl.kill();

    resetPaths();
    gsap.set(svg.querySelectorAll('.o-leaf, .o-flower, .o-bud'), { opacity: 0, scale: 0 });

    tl = gsap.timeline();
    tl.to(svg.querySelectorAll('.o-stem'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
    tl.to(svg.querySelectorAll('.o-branch'), { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 }, '-=0.4');
    tl.to(svg.querySelectorAll('.o-leaf'), { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.1 }, '-=0.3');
    tl.to(svg.querySelectorAll('#oFlowerL, #oFlowerR'), { opacity: 1, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)', stagger: 0.15 }, '-=0.2');
    tl.to(svg.querySelectorAll('#oFlowerT'), { opacity: 1, scale: 1, duration: 1.1, ease: 'elastic.out(0.9, 0.4)' }, '-=0.4');
    tl.to(svg.querySelectorAll('.o-bud'), { opacity: 1, scale: 1, transformOrigin: 'center bottom', transformBox: 'fill-box', duration: 0.6, ease: 'back.out(3)' }, '-=0.6');
  };

  // Bloom initially after a delay
  setTimeout(playBloom, 1000);

  // Bloom again on interaction (mouse enter or click)
  wrap.addEventListener('mouseenter', playBloom);
  wrap.addEventListener('click', playBloom);

  gsap.to(wrap, {
    rotate: 3.5, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: 'center bottom'
  });
}

/* ─────────────────────────────────────────────────────── */
/* HERO LERP PARALLAX (375.studio style drift)            */
/* ─────────────────────────────────────────────────────── */
function initHeroParallax() {
  const scene = document.getElementById('sc-ignition');
  if (!scene) return;

  const persp    = scene.querySelector('.ignition__perspective');
  const bg       = document.getElementById('ignitBg');
  const grid     = document.getElementById('ignitGrid');
  const ayu      = document.getElementById('ignitAyu');
  const overline = document.getElementById('ignitOverline');

  let targetX = 0, targetY = 0;
  let currX = 0, currY = 0;

  scene.addEventListener('mousemove', (e) => {
    // Normalize to -1 -> 1
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  scene.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
  });

  gsap.ticker.add(() => {
    // 0.05 is the interpolation factor (lower = more drift/liquid)
    currX += (targetX - currX) * 0.05;
    currY += (targetY - currY) * 0.05;

    // 1. Perspective tilt (the whole container tilts slightly)
    gsap.set(persp, {
      rotateX: -currY * 4,  // Tilt up/down
      rotateY: currX * 6,   // Tilt left/right
      x: currX * 15,
      y: currY * 15
    });

    // 2. Deep background moves opposite (pushing back)
    gsap.set(bg, { x: currX * -25, y: currY * -25 });
    
    // 3. Grid moves subtly
    gsap.set(grid, { x: currX * -10, y: currY * -10 });

    // 4. AYU text pops out and follows mouse heavily (foreground)
    gsap.set(ayu, { x: currX * 45, y: currY * 30 });

    // 5. Overline independent layer
    gsap.set(overline, { x: currX * -15, y: currY * -15 });
  });
}

/* ─────────────────────────────────────────────────────── */
/* HERO ORCHID GROWTH                                      */
/* ─────────────────────────────────────────────────────── */
function initHeroOrchid() {
  const backSvg = document.getElementById('heroOrchidBackSvg');
  const midSvg = document.getElementById('heroOrchidMidSvg');
  const frontSvg = document.getElementById('heroOrchidFrontSvg');
  if (!backSvg || !midSvg || !frontSvg) return null;

  const svgNS = "http://www.w3.org/2000/svg";

  function createPlant(container, type, index, forcedX = null) {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("class", "ho-plant");
    
    const isMobile = window.innerWidth < 768;
    const startX = forcedX !== null ? forcedX : Math.random() * 1000;
    const startY = 980;
    const baseHeight = isMobile ? 650 : 450;
    const height = baseHeight + Math.random() * (isMobile ? 300 : 450); 
    const endY = startY - height;
    
    let controlX;
    if (forcedX !== null && type === 'front') {
      controlX = forcedX + (index % 2 === 0 ? 120 : -120); 
    } else {
      controlX = startX + (Math.random() - 0.5) * (isMobile ? 250 : 400);
    }
    
    const endX = startX + (Math.random() - 0.5) * 150;

    // 1. Roots
    for (let i = 0; i < 2; i++) {
      const root = document.createElementNS(svgNS, "path");
      root.setAttribute("class", "ho-root");
      const rx = startX + (Math.random() - 0.5) * 120;
      root.setAttribute("d", `M ${startX} ${startY} Q ${startX + (rx-startX)/2} ${startY + 15}, ${rx} ${startY}`);
      root.setAttribute("stroke", "#283618");
      root.setAttribute("stroke-width", "3");
      group.appendChild(root);
    }

    // 2. Stem
    const stem = document.createElementNS(svgNS, "path");
    stem.setAttribute("class", "ho-stem");
    stem.setAttribute("d", `M ${startX} ${startY} C ${controlX} ${startY - height/2}, ${controlX} ${startY - height/1.2}, ${endX} ${endY}`);
    stem.setAttribute("stroke", type === 'back' ? "#1A1A18" : "#283618");
    stem.setAttribute("stroke-width", 5 + Math.random() * 3);
    group.appendChild(stem);

    // 3. Leaves
    for (let i = 0; i < 2; i++) {
      const leaf = document.createElementNS(svgNS, "path");
      leaf.setAttribute("class", "ho-leaf");
      const lx = startX + (i === 0 ? -35 : 35);
      leaf.setAttribute("d", `M ${startX} ${startY} C ${lx} ${startY-40}, ${lx + (i===0?-15:15)} ${startY-80}, ${startX} ${startY-15} Z`);
      leaf.setAttribute("fill", "#EAE6DA");
      leaf.setAttribute("fill-opacity", "0.85");
      leaf.setAttribute("stroke", "#1A1A18");
      group.appendChild(leaf);
    }

    // 4. Flowers
    const flowerId = (type === 'back' || type === 'mid') ? "#orchidFlowerBack" : "#orchidFlowerFront";
    const smallFlowerId = (type === 'back' || type === 'mid') ? "#smallOrchidBack" : "#smallOrchidFront";

    const mainFlower = document.createElementNS(svgNS, "use");
    mainFlower.setAttributeNS("http://www.w3.org/1999/xlink", "href", flowerId);
    mainFlower.setAttribute("x", endX);
    mainFlower.setAttribute("y", endY);
    mainFlower.setAttribute("class", "ho-flower");
    group.appendChild(mainFlower);

    const numBranches = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numBranches; i++) {
      const t = 0.3 + Math.random() * 0.5;
      const bx = startX + (endX - startX) * t;
      const by = startY - (startY - endY) * t;
      
      let bEndX, bEndY;
      if (forcedX !== null && type === 'front') {
        bEndX = forcedX + (Math.random() - 0.5) * 300; 
        bEndY = by - 20;
      } else {
        bEndX = bx + (Math.random() - 0.5) * 180;
        bEndY = by - 40 - Math.random() * 80;
      }

      const branch = document.createElementNS(svgNS, "path");
      branch.setAttribute("class", "ho-branch");
      branch.setAttribute("d", `M ${bx} ${by} Q ${bEndX} ${by + 30}, ${bEndX} ${bEndY}`);
      branch.setAttribute("stroke", "#283618");
      branch.setAttribute("stroke-width", "3.5");
      group.appendChild(branch);

      const flower = document.createElementNS(svgNS, "use");
      flower.setAttributeNS("http://www.w3.org/1999/xlink", "href", Math.random() > 0.4 ? flowerId : smallFlowerId);
      flower.setAttribute("x", bEndX);
      flower.setAttribute("y", bEndY);
      flower.setAttribute("class", "ho-flower");
      group.appendChild(flower);
    }

    container.appendChild(group);
  }

  // Distribution: 18 back, 15 mid, 12 front
  for (let i = 0; i < 18; i++) createPlant(backSvg, 'back', i);
  for (let i = 0; i < 15; i++) createPlant(midSvg, 'mid', i);
  
  // Front layer (The few that wrap)
  for (let i = 0; i < 9; i++) createPlant(frontSvg, 'front', i);
  createPlant(frontSvg, 'front', 10, 400); // Wrap A
  createPlant(frontSvg, 'front', 11, 500); // Wrap Y
  createPlant(frontSvg, 'front', 12, 600); // Wrap U

  // Prepare animation
  const paths = document.querySelectorAll('.hero-orchid svg path');
  paths.forEach(p => {
    try {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    } catch(e) {}
  });

  gsap.set('.ho-leaf, .ho-flower', { 
    opacity: 0, 
    scale: 0, 
    transformOrigin: 'center center', 
    transformBox: 'fill-box' 
  });

  return () => {
    const mainTl = gsap.timeline();
    const plants = document.querySelectorAll('.ho-plant');

    for (let i = 0; i < plants.length; i += 5) {
      const batch = Array.from(plants).slice(i, i + 5);
      const batchTl = gsap.timeline();

      batch.forEach((plant, j) => {
        const plantTl = gsap.timeline();
        const roots = plant.querySelectorAll('.ho-root');
        const stems = plant.querySelectorAll('.ho-stem');
        const branches = plant.querySelectorAll('.ho-branch');
        const leaves = plant.querySelectorAll('.ho-leaf');
        const flowers = plant.querySelectorAll('.ho-flower');

        plantTl.to(roots, { strokeDashoffset: 0, duration: 1.2, ease: 'none' });
        plantTl.to(stems, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, '-=0.6');
        plantTl.to(leaves, { opacity: 1, scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.5)' }, '-=1.5');
        plantTl.to(branches, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }, '-=1.0');
        plantTl.to(flowers, { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.3)', stagger: 0.1 }, '-=0.8');
        
        batchTl.add(plantTl, j * 0.15);
      });

      mainTl.add(batchTl, i * 0.1);
    }

    return mainTl;
  };
}


/* ─────────────────────────────────────────────────────── */
/* SCENE 00 — IGNITION                                    */
/* ─────────────────────────────────────────────────────── */
function initIgnition() {
  const playOrchid = initHeroOrchid();

  gsap.set('#ignitSub', { y: 20 });
  gsap.set('#ignitAyu', { opacity: 0, y: '110%' });

  const tl = gsap.timeline({ delay: 0.2 });

  tl.from('.igl', {
    scaleY: 0, scaleX: 0,
    transformOrigin: 'center',
    duration: 1.4, ease: 'expo.out',
    stagger: 0.12,
  });

  tl.from('#ignitOverline', {
    opacity: 0, x: -20,
    duration: 0.8, ease: 'power3.out',
  }, '-=0.8');

  tl.to('#ignitAyu', {
    opacity: 1, y: '0%',
    duration: 1.0, ease: 'expo.out',
  }, '-=0.4');

  if (playOrchid) {
    tl.add(playOrchid(), '-=0.6');
  }

  tl.to('#ignitSub', { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '-=0.3');
  tl.to('#scrollHint', { opacity: 1, duration: 0.4 }, '-=0.1');

  gsap.to('#ignitAyu', {
    scale: 1.015, duration: 4.5, ease: 'sine.inOut',
    repeat: -1, yoyo: true, delay: 2,
  });

  // Sticky scroll parallax: 
  // Pin hero, but pinSpacing false means the next section slides OVER it.
  ScrollTrigger.create({
    trigger: '#sc-ignition',
    start: 'top top',
    end: '+=100%',
    pin: true,
    pinSpacing: false,
    onEnter:     () => setCounter(0),
    onEnterBack: () => setCounter(0),
  });
}

/* ─────────────────────────────────────────────────────── */
/* SCENE 01 — FINALE (HBD)                                */
/* ─────────────────────────────────────────────────────── */
function initFinale() {
  const hbdSpan = document.querySelectorAll('.finale__hbd span');
  const messageLines = document.querySelectorAll('.finale__message p');
  
  gsap.set(hbdSpan, { y: '110%', rotateX: -60, opacity: 0 });
  gsap.set(messageLines, { y: 30, opacity: 0 });
  gsap.set('.finale__divider', { scaleX: 0 });

  const tl = gsap.timeline({ paused: true });

  tl.to(hbdSpan, {
    y: 0, rotateX: 0, opacity: 1, 
    duration: 1.2, ease: 'expo.out', stagger: 0.1,
  })
  .to(messageLines, {
    opacity: 1, y: 0, 
    duration: 1, ease: 'power3.out', stagger: 0.15
  }, '-=0.4');

  ScrollTrigger.create({
    trigger: '#sc-finale',
    start: 'top top',
    end: '+=100%',
    pin: true,
    pinSpacing: true,
    onEnter: () => {
      setCounter(1);
      tl.play();
      initFinaleCanvas();
    },
    onEnterBack: () => setCounter(1),
  });

  document.getElementById('sc-finale').addEventListener('mousemove', (e) => {
    const rx = (e.clientX / window.innerWidth  - 0.5);
    const ry = (e.clientY / window.innerHeight - 0.5);
    
    gsap.to(hbdSpan, {
      x: (i) => rx * (50 + i * 30),
      y: (i) => ry * (20 + i * 15),
      skewX: rx * 15,
      duration: 1, ease: 'power2.out', stagger: 0.05,
    });

    gsap.to(messageLines, {
      x: -rx * 30,
      y: -ry * 15,
      duration: 1.8, ease: 'power4.out',
      stagger: 0.02
    });
  });
}

/* ─────────────────────────────────────────────────────── */
/* FINALE PARTICLES                                        */
/* ─────────────────────────────────────────────────────── */
let finaleStarted = false;
let mouse = { x: -1000, y: -1000 };

function initFinaleCanvas() {
  if (finaleStarted) return;
  finaleStarted = true;

  const canvas = document.getElementById('finaleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('sc-finale');

  function resize() {
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  section.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const COLORS = ['#C0533B', '#4A6B7C', '#1A1A18', '#EAE6DA'];

  class Ball {
    constructor() {
      this.radius = 20 + Math.random() * 60;
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0.05 + Math.random() * 0.1;
    }

    update() {
      // Basic movement
      this.x += this.vx;
      this.y += this.vy;

      // Wall bounce
      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
      if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;

      // Mouse repulsion
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = 220;

      if (dist < minDist) {
        const force = (minDist - dist) / minDist;
        const angle = Math.atan2(dy, dx);
        const tx = this.x - Math.cos(angle) * force * 20;
        const ty = this.y - Math.sin(angle) * force * 20;
        
        this.vx += (tx - this.x) * 0.08;
        this.vy += (ty - this.y) * 0.08;
      }

      // Friction
      this.vx *= 0.98;
      this.vy *= 0.98;
    }

    draw() {
      ctx.save();
      
      // 1. Shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.05)';
      ctx.shadowBlur = 10;
      
      // 2. Radial Gradient for "Clear Glass" Effect
      const grad = ctx.createRadialGradient(
        this.x - this.radius * 0.3, 
        this.y - this.radius * 0.3, 
        this.radius * 0.1,
        this.x, 
        this.y, 
        this.radius
      );
      
      grad.addColorStop(0, 'rgba(255,255,255,0.4)');
      grad.addColorStop(0.4, 'rgba(234,230,218,0.2)'); // Aged Newsprint alpha
      grad.addColorStop(1, 'rgba(255,255,255,0.05)');

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      
      // 3. Brutalist Outline (Neutral)
      ctx.strokeStyle = 'rgba(26,26,24,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 4. Specular Highlight
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      
      // 5. Technical Label (More subtle on mobile)
      if (this.radius > 50) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#1A1A18';
        ctx.font = '900 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`ID_${Math.floor(this.radius)}`, this.x, this.y + 3);
      }

      ctx.restore();
    }
  }

  const isMobile = window.innerWidth < 768;
  const ballsCount = isMobile ? 15 : 40;
  const balls = Array.from({ length: ballsCount }, () => new Ball());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
      ball.update();
      ball.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ─────────────────────────────────────────────────────── */
/* BOOT                                                    */
/* ─────────────────────────────────────────────────────── */
async function boot() {
  await document.fonts.ready;
  document.title = 'AYU';
  window.scrollTo(0, 0);

  initNoise();
  initCursor();
  initMarquee('#gMarqueeTrack', 90);
  initStickyNav();
  
  // Interactions
  initHeroParallax();
  initOrchid();

  // Scenes
  initIgnition();
  initFinale();

  ScrollTrigger.refresh();
}

boot();
