import { useEffect, useRef, useState } from "react";

const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

/** vektör yardımcıları */
function limit(vx, vy, max) {
  const s2 = vx * vx + vy * vy;
  if (s2 > max * max) {
    const s = Math.sqrt(s2);
    const k = max / s;
    return [vx * k, vy * k];
  }
  return [vx, vy];
}
function steerTowards(curVx, curVy, dx, dy, desiredSpeed, maxAccel) {
  const d = Math.hypot(dx, dy) || 1;
  // sabit hedef hız (uzakta daha hızlı gitmesin)
  const desVx = (dx / d) * desiredSpeed;
  const desVy = (dy / d) * desiredSpeed;
  // yönlendirme kuvvetini sınırla
  let ax = desVx - curVx;
  let ay = desVy - curVy;
  [ax, ay] = limit(ax, ay, maxAccel);
  return [curVx + ax, curVy + ay];
}

export default function CoupleFollowersFX({
  imgHatice = "/hatice.png",
  imgBen = "/ben.png",

  // görsel
  size = 84,

  // (eski parametrelerin kalsa da, hız modelini sabit hız/ivmeye çektik)
  followLag = 0.05,         // (artık kullanılmıyor)
  spacing = 26,
  collideThreshold = 0.95,
  bounceDist = 140,

  // kalp
  maxHearts = 220,
  heartDecay = 0.012,
  heartScaleMin = 1.5,
  heartScaleMax = 3.9,

  // hız/ivme (px/frame)
  followSpeed = 2.8,
  followAccel = 0.20,
  followMaxSpeed = 3.4,

  idleSpeed = 1.0,
  idleAccel = 0.10,
  idleMaxSpeed = 1.4,

  // davranış
  idleWander = true,               // basılı değilken bağımsız gezin
  heartRainAfterCollision = true,  // ilk çarpışmadan sonra yağmur
  respawnOnCollide = true,         // çarpışma sonrası güvenli dağıt
  respawnMargin = 120,
  respawnMinSeparation = 240,
  mobileDisabled = true,

  // olay
  onFirstCollision,
}) {
  // sadece BASILIYKEN imleç hedef
  const [pointer, setPointer] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // takip kontrolü (yalnızca basılıyken)
  const isDownRef = useRef(false);
  const acceptInputRef = useRef(false);
  const pointerIdRef = useRef(null);

  // App.jsx'ten “overlay-closed” gelince giriş izinleri açılsın
  useEffect(() => {
    const unlock = () => {
      acceptInputRef.current = true;
      isDownRef.current = false;
      pointerIdRef.current = null;
    };
    window.addEventListener("overlay-closed", unlock);
    return () => window.removeEventListener("overlay-closed", unlock);
  }, []);

  // pointer dinleyicileri
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!acceptInputRef.current) return;
      const leftPressed = (e.buttons & 1) === 1 || e.pointerType === "touch";
      if (!leftPressed || e.isPrimary === false) return;

      isDownRef.current = true;
      pointerIdRef.current = e.pointerId ?? null;

      const x = e.clientX ?? pointer.x;
      const y = e.clientY ?? pointer.y;
      setPointer({ x, y });
    };

    const onPointerMove = (e) => {
      if (!isDownRef.current) return;
      if (e.pointerType !== "touch" && (e.buttons & 1) !== 1) {
        isDownRef.current = false;
        pointerIdRef.current = null;
        return;
      }
      if (pointerIdRef.current != null && e.pointerId != null && e.pointerId !== pointerIdRef.current) return;

      const x = e.clientX ?? pointer.x;
      const y = e.clientY ?? pointer.y;
      setPointer({ x, y });
    };

    const onPointerUp = (e) => {
      if (!acceptInputRef.current) acceptInputRef.current = true;
      if (pointerIdRef.current == null || e.pointerId == null || e.pointerId === pointerIdRef.current) {
        isDownRef.current = false;
        pointerIdRef.current = null;
      }
    };

    const onPointerCancel = () => { isDownRef.current = false; pointerIdRef.current = null; };
    const onBlurOrHide = () => { isDownRef.current = false; pointerIdRef.current = null; };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });
    window.addEventListener("blur", onBlurOrHide);
    document.addEventListener("visibilitychange", onBlurOrHide);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onBlurOrHide);
      document.removeEventListener("visibilitychange", onBlurOrHide);
    };
  }, [pointer.x, pointer.y]);

  // figür state
  const h = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const b = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // güvenli başlangıç yerleşimi (min separation garantisi + hız patlaması yok)
  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight;
    let hx, hy, bx, by, ok = false;
    for (let i = 0; i < 60 && !ok; i++) {
      hx = rand(respawnMargin, W / 2 - 40);
      hy = rand(respawnMargin, H - respawnMargin);
      bx = rand(W / 2 + 40, W - respawnMargin);
      by = rand(respawnMargin, H - respawnMargin);
      ok = Math.hypot(bx - hx, by - hy) >= respawnMinSeparation;
    }
    h.current.x = hx; h.current.y = hy; h.current.vx = 0; h.current.vy = 0;
    b.current.x = bx; b.current.y = by; b.current.vx = 0; b.current.vy = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // idle mod hedefleri (her figüre ayrı faz)
  const idleH = useRef({ t: rand(0, 10) });
  const idleB = useRef({ t: rand(0, 10) });
  const idleSep = Math.max(size * 1.5, 120); // idle’da min mesafe

  // kalpler
  const hearts = useRef([]); // {x,y,vx,vy,life,rot,vr,scale}
  const [tick, setTick] = useState(0);
  const [collidedOnce, setCollidedOnce] = useState(false);
  const rafRef = useRef(null);

  const spawnHearts = (x, y, n = 36, velMul = 1.1) => {
    for (let i = 0; i < n; i++) {
      hearts.current.push({
        x, y,
        vx: rand(-1.2, 1.2) * velMul,
        vy: rand(-2.2, -0.7) * velMul,
        life: 1,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.05, 0.05),
        scale: rand(heartScaleMin, heartScaleMax),
      });
    }
    if (hearts.current.length > maxHearts) {
      hearts.current.splice(0, hearts.current.length - maxHearts);
    }
  };

  const respawnPair = () => {
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < 40; i++) {
      const hx = rand(respawnMargin, W - respawnMargin);
      const hy = rand(respawnMargin, H - respawnMargin);
      const bx = rand(respawnMargin, W - respawnMargin);
      const by = rand(respawnMargin, H - respawnMargin);
      const d = Math.hypot(bx - hx, by - hy);
      if (d >= respawnMinSeparation) {
        h.current.x = hx; h.current.y = hy;
        b.current.x = bx; b.current.y = by;
        // aynı yöne takılmayı önlemek için küçük random hızlar
        h.current.vx = rand(-idleSpeed, idleSpeed);
        h.current.vy = rand(-idleSpeed, idleSpeed);
        b.current.vx = rand(-idleSpeed, idleSpeed);
        b.current.vy = rand(-idleSpeed, idleSpeed);
        return true;
      }
    }
    return false;
  };

  // ana döngü (sabit hızlı yönelim + ivme limiti)
  useEffect(() => {
    const isMob = /Mobi|Android/i.test(navigator.userAgent);
    if (mobileDisabled && isMob) return;

    const step = () => {
      let hx, hy, bx, by;

      if (isDownRef.current) {
        // takip: imleç etrafı
        hx = pointer.x - spacing;
        hy = pointer.y - spacing;
        bx = pointer.x + spacing;
        by = pointer.y + spacing;
      } else if (idleWander) {
        // bağımsız gezinme (ayrı hedefler + separation)
        const W = window.innerWidth, H = window.innerHeight;
        idleH.current.t += 0.0075;
        idleB.current.t += 0.0063;

        const cx = W * 0.5, cy = H * 0.52;
        const ampX = W * 0.22, ampY = H * 0.18;

        const hOffX = Math.sin(idleH.current.t) * ampX;
        const hOffY = Math.cos(idleH.current.t * 0.9) * ampY;

        const bOffX = Math.sin(idleB.current.t + 1.37) * ampX;
        const bOffY = Math.cos(idleB.current.t * 0.85 + 0.7) * ampY;

        hx = clamp(cx + hOffX, 120, W - 120);
        hy = clamp(cy + hOffY, 120, H - 120);
        bx = clamp(cx + bOffX, 120, W - 120);
        by = clamp(cy + bOffY, 120, H - 120);

        // idle separation (sadece itme)
        const dxS = b.current.x - h.current.x;
        const dyS = b.current.y - h.current.y;
        const dS = Math.hypot(dxS, dyS);
        if (dS < idleSep && dS > 0.001) {
          const push = (idleSep - dS) * 0.16;
          const nx = dxS / dS, ny = dyS / dS;
          hx -= nx * push; hy -= ny * push;
          bx += nx * push; by += ny * push;
        }
      } else {
        // olduğu yeri hedefle
        hx = h.current.x; hy = h.current.y;
        bx = b.current.x; by = b.current.y;
      }

      // hız güncelle (sabit hedef hız + ivme limiti + max speed)
      const modeFollow = isDownRef.current;

      // H
      [h.current.vx, h.current.vy] = steerTowards(
        h.current.vx, h.current.vy,
        hx - h.current.x, hy - h.current.y,
        modeFollow ? followSpeed : idleSpeed,
        modeFollow ? followAccel : idleAccel
      );
      [h.current.vx, h.current.vy] = limit(
        h.current.vx, h.current.vy,
        modeFollow ? followMaxSpeed : idleMaxSpeed
      );

      // B
      [b.current.vx, b.current.vy] = steerTowards(
        b.current.vx, b.current.vy,
        bx - b.current.x, by - b.current.y,
        modeFollow ? followSpeed : idleSpeed,
        modeFollow ? followAccel : idleAccel
      );
      [b.current.vx, b.current.vy] = limit(
        b.current.vx, b.current.vy,
        modeFollow ? followMaxSpeed : idleMaxSpeed
      );

      // pozisyon
      h.current.x += h.current.vx; h.current.y += h.current.vy;
      b.current.x += b.current.vx; b.current.y += b.current.vy;

      // ——— ÇARPIŞMA ———
      const dx = b.current.x - h.current.x;
      const dy = b.current.y - h.current.y;
      const dist = Math.hypot(dx, dy);
      const minDist = size * collideThreshold;

      if (dist > 0 && dist < minDist) {
        if (isDownRef.current) {
          // sadece takipteyken efekt
          const nx = dx / dist, ny = dy / dist;
          const mx = (h.current.x + b.current.x) / 2;
          const my = (h.current.y + b.current.y) / 2;
          spawnHearts(mx, my);

          if (!collidedOnce) {
            setCollidedOnce(true);
            onFirstCollision?.();
          }

          // hafif zıplat
          h.current.x -= nx * (bounceDist * 0.45);
          h.current.y -= ny * (bounceDist * 0.45);
          b.current.x += nx * (bounceDist * 0.45);
          b.current.y += ny * (bounceDist * 0.45);

          // aynı yöne takılmayı önlemek için respawn + random vel
          if (respawnOnCollide) respawnPair();
        } else {
          // idle'da sadece görünmez tampon → efekt yok
          const nx = dx / dist, ny = dy / dist;
          const sep = (minDist - dist) * 0.5;
          h.current.x -= nx * sep; h.current.y -= ny * sep;
          b.current.x += nx * sep; b.current.y += ny * sep;
        }
      }

      // kalp yağmuru (ilk çarpışmadan sonra)
      if (heartRainAfterCollision && collidedOnce) {
        const W = window.innerWidth, H = window.innerHeight;
        const areaFrac = 0.25;
        const areaW = Math.sqrt(areaFrac) * W;
        const areaH = Math.sqrt(areaFrac) * H;
        const cx = W / 2, cy = H / 3;
        const left = clamp(cx - areaW / 2, 0, W);
        const top  = clamp(cy - areaH / 2, 0, H);
        const count = Math.round(2 + rand(-1.5, 1.5));
        for (let i = 0; i < count; i++) {
          hearts.current.push({
            x: rand(left, left + areaW),
            y: rand(top, top + areaH),
            vx: rand(-0.4, 0.4),
            vy: rand(0.4, 1.0),
            life: 0.95,
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.02, 0.02),
            scale: rand(heartScaleMin * 0.9, heartScaleMax * 0.95),
          });
        }
      }

      // kalpler fiziği
      for (let i = hearts.current.length - 1; i >= 0; i--) {
        const p = hearts.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.01;
        p.rot += p.vr; p.life -= heartDecay;
        if (p.life <= 0) hearts.current.splice(i, 1);
      }

      setTick((n) => (n + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    pointer.x, pointer.y,
    followSpeed, followAccel, followMaxSpeed,
    idleSpeed, idleAccel, idleMaxSpeed,
    size, spacing, collideThreshold, bounceDist,
    heartDecay, maxHearts, heartScaleMin, heartScaleMax,
    respawnOnCollide, respawnMargin, respawnMinSeparation,
    heartRainAfterCollision, idleWander,
    onFirstCollision, mobileDisabled, collidedOnce
  ]);

  return (
    <>
      <div className="hearts-wrap" aria-hidden>
        {hearts.current.map((p, i) => {
          const t = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}rad) scale(${p.scale})`;
          return <span key={i} className="heart" style={{ transform: t, opacity: p.life }} />;
        })}
      </div>

      <div className="couple-wrap" aria-hidden>
        <img
          src={imgHatice}
          alt="Hatice"
          className="couple-img couple-h"
          style={{ width: size, height: size, transform: `translate(${h.current.x - size/2}px, ${h.current.y - size/2}px)` }}
        />
        <img
          src={imgBen}
          alt="Ben"
          className="couple-img couple-b"
          style={{ width: size, height: size, transform: `translate(${b.current.x - size/2}px, ${b.current.y - size/2}px)` }}
        />
      </div>
    </>
  );
}
